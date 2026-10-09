import db from '../src/db/database';
import { filterWithinRadius } from '../src/utils/distance';
import { seedCustomersIfEmpty, seedOrders, clearAllOrders } from '../src/db/seedData';
import { Customer } from '../src/types/customer';
import { Order } from '../src/types/order';

async function runTests() {
  console.log('--- STARTING BACKEND TYPESCRIPT UNIT & LOGIC VERIFICATION ---');

  // Test 1: Seed customers
  console.log('\n[TEST 1] Seeding Customers...');
  seedCustomersIfEmpty();
  const customerCount = (db.prepare('SELECT COUNT(*) as c FROM customers').get() as { c: number }).c;
  console.log(`✓ Total customers in DB: ${customerCount} (Expected >= 15)`);
  if (customerCount < 15) throw new Error('Customer seeding failed!');

  // Test 2: Search Customer by partial name
  console.log('\n[TEST 2] Search Customer by partial name "สม"...');
  const searchResults = db.prepare(`
    SELECT * FROM customers WHERE first_name LIKE '%สม%' OR last_name LIKE '%สม%'
  `).all() as Customer[];
  console.log(`✓ Found ${searchResults.length} customers with name matching "สม":`);
  searchResults.slice(0, 3).forEach(c => console.log(`   - ${c.first_name} ${c.last_name} (${c.phone})`));
  if (searchResults.length === 0) throw new Error('Name search returned 0 results!');

  // Test 3: Customer Distance Calculation & 1km Radius around MSU
  console.log('\n[TEST 3] Customer Geospatial Search (1 km from Mahasarakham University 16.2458, 103.2508)...');
  const msuLat = 16.2458;
  const msuLng = 103.2508;
  const allCustomers = db.prepare('SELECT * FROM customers').all() as Customer[];
  const customers1km = filterWithinRadius(allCustomers, msuLat, msuLng, 1.0, 'latitude', 'longitude');
  console.log(`✓ Found ${customers1km.length} customers within 1.0 km radius of MSU:`);
  customers1km.forEach(c => {
    console.log(`   - ${c.first_name} ${c.last_name} (${c.address}): ${c.distance_km} km (${c.distance_meters} m)`);
  });
  if (customers1km.length === 0) throw new Error('No customers found within 1km of MSU!');

  // Test 4: Seed 25 Orders
  console.log('\n[TEST 4] Simulating 25 Orders...');
  const simulated = seedOrders(25);
  console.log(`✓ Successfully created ${simulated.length} simulated orders.`);
  if (simulated.length !== 25) throw new Error('Expected 25 orders!');

  // Test 5: Verify Order box count modification
  console.log('\n[TEST 5] Modify Box Count for an order...');
  const sampleOrder = db.prepare('SELECT * FROM orders LIMIT 1').get() as Order;
  console.log(`   - Before: Order #${sampleOrder.id} has box_count = ${sampleOrder.box_count}, total_price = ${sampleOrder.total_price}`);
  const newBoxCount = sampleOrder.box_count + 10;
  db.prepare('UPDATE orders SET box_count = ? WHERE id = ?').run(newBoxCount, sampleOrder.id);
  const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(sampleOrder.id) as Order;
  console.log(`   - After: Order #${updatedOrder.id} has box_count = ${updatedOrder.box_count}, total_price = ${updatedOrder.total_price}`);
  if (updatedOrder.box_count !== newBoxCount) throw new Error('Box count update failed!');

  // Test 6: Order Geospatial Search (2 km from MSU 16.2458, 103.2508)
  console.log('\n[TEST 6] Order Geospatial Search (2 km from MSU 16.2458, 103.2508)...');
  const allOrders = db.prepare(`
    SELECT o.*, c.first_name, c.last_name, (c.first_name || ' ' || c.last_name) as customer_name
    FROM orders o JOIN customers c ON o.customer_id = c.id
  `).all() as Order[];
  const orders2km = filterWithinRadius(allOrders, msuLat, msuLng, 2.0, 'delivery_latitude', 'delivery_longitude');
  console.log(`✓ Found ${orders2km.length} orders within 2.0 km radius of MSU:`);
  orders2km.slice(0, 5).forEach(o => {
    console.log(`   - Order ${o.order_code} (${o.customer_name}): ${o.box_count} boxes, distance: ${o.distance_km} km (${o.distance_meters} m)`);
  });
  if (orders2km.length === 0) throw new Error('No orders found within 2km of MSU!');

  // Test 7: Clear All Orders
  console.log('\n[TEST 7] Clear (Delete all) simulated orders...');
  const deletedCount = clearAllOrders();
  console.log(`✓ Deleted ${deletedCount} orders.`);
  const remainingOrders = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as { c: number }).c;
  console.log(`✓ Remaining orders in DB: ${remainingOrders} (Expected 0)`);
  if (remainingOrders !== 0) throw new Error('Orders not cleared completely!');

  // Re-seed 25 orders
  console.log('\n[Re-seeding 25 orders for ready demo...]');
  seedOrders(25);

  console.log('\n🎉 ALL TYPESCRIPT BACKEND TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
