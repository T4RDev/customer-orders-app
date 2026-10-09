import db from './database';
import { Customer } from '../types/customer';
import { Order } from '../types/order';

// Center point: มหาวิทยาลัยมหาสารคาม วิทยาเขตขามเรียง (MSU Khamriang Campus)
export const MSU_CENTER = {
  name: 'มหาวิทยาลัยมหาสารคาม (มมส. ขามเรียง)',
  latitude: 16.2458,
  longitude: 103.2508,
};

// 15 Realistic Customers located around Mahasarakham University (MSU)
export const initialCustomers = [
  {
    first_name: 'กิตติศักดิ์',
    last_name: 'เจริญผล',
    phone: '083-456-7890',
    email: 'kittisak.c@msu.ac.th',
    address: 'คณะวิทยาการสารสนเทศ มหาวิทยาลัยมหาสารคาม (ม.ใหม่)',
    latitude: 16.2455,
    longitude: 103.2512, // ~70m from MSU center
  },
  {
    first_name: 'วิภาดา',
    last_name: 'มงคลสุข',
    phone: '084-567-8901',
    email: 'wiphada.m@msu.ac.th',
    address: 'หอพักนักศึกษา ตลาดน้อย มมส. ต.ขามเรียง อ.กันทรวิชัย จ.มหาสารคาม',
    latitude: 16.2435,
    longitude: 103.2498, // ~280m from MSU center
  },
  {
    first_name: 'สมชาย',
    last_name: 'ใจดี',
    phone: '081-234-5678',
    email: 'somchai.jai@gmail.com',
    address: 'อาคารบรมราชกุมารี (กองกิจการนิสิต) มหาวิทยาลัยมหาสารคาม',
    latitude: 16.2468,
    longitude: 103.2525, // ~210m from MSU center
  },
  {
    first_name: 'สมศรี',
    last_name: 'รักสงบ',
    phone: '082-345-6789',
    email: 'somsri.rak@hotmail.com',
    address: 'คณะการบัญชีและการจัดการ (MBS) มหาวิทยาลัยมหาสารคาม',
    latitude: 16.2480,
    longitude: 103.2500, // ~260m from MSU center
  },
  {
    first_name: 'ณัฐพงษ์',
    last_name: 'แสงสุวรรณ',
    phone: '085-678-9012',
    email: 'nattapong.s@gmail.com',
    address: 'หน้าป้าย มหาวิทยาลัยมหาสารคาม ต.ขามเรียง อ.กันทรวิชัย',
    latitude: 16.2420,
    longitude: 103.2540, // ~550m from MSU center
  },
  {
    first_name: 'ชลธิชา',
    last_name: 'พัฒนกุล',
    phone: '086-789-0123',
    email: 'cholticha.p@gmail.com',
    address: 'ตลาดคลองถมขามเรียง ต.ขามเรียง อ.กันทรวิชัย จ.มหาสารคาม',
    latitude: 16.2495,
    longitude: 103.2462, // ~640m from MSU center
  },
  {
    first_name: 'ธนากร',
    last_name: 'ตั้งมั่น',
    phone: '087-890-1234',
    email: 'thanakorn.t@hotmail.com',
    address: 'หอพักบ้านเกียรติยศ ซอยเกิ้ง ต.ท่าขอนยาง อ.กันทรวิชัย',
    latitude: 16.2395,
    longitude: 103.2570, // ~970m from MSU center (within 1 km)
  },
  {
    first_name: 'ปิยะมาศ',
    last_name: 'สิริวัฒน์',
    phone: '088-901-2345',
    email: 'piyamas.s@gmail.com',
    address: 'สี่แยกท่าขอนยาง ต.ท่าขอนยาง อ.กันทรวิชัย จ.มหาสารคาม',
    latitude: 16.2360,
    longitude: 103.2610, // ~1.5 km from MSU center (within 2 km)
  },
  {
    first_name: 'อนุรักษ์',
    last_name: 'ยอดเยี่ยม',
    phone: '089-012-3456',
    email: 'anurak.y@gmail.com',
    address: 'สะพานไม้แกดำ อ.แกดำ จ.มหาสารคาม',
    latitude: 16.2330,
    longitude: 103.2645, // ~1.9 km from MSU center (within 2 km)
  },
  {
    first_name: 'ศิริพร',
    last_name: 'บุญมี',
    phone: '090-123-4567',
    email: 'siriporn.b@yahoo.com',
    address: 'หอพักชื่นใจ ต.ท่าขอนยาง อ.กันทรวิชัย จ.มหาสารคาม',
    latitude: 16.2345,
    longitude: 103.2590, // ~1.5 km from MSU center (within 2 km)
  },
  {
    first_name: 'พงศกร',
    last_name: 'คงทน',
    phone: '091-234-5678',
    email: 'pongsakorn.k@gmail.com',
    address: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยมหาสารคาม (ม.ใหม่)',
    latitude: 16.2440,
    longitude: 103.2530, // ~310m from MSU center
  },
  {
    first_name: 'วรรณภา',
    last_name: 'ใจสะอาด',
    phone: '092-345-6789',
    email: 'wannapa.j@gmail.com',
    address: 'หอประชุม 80 พรรษา มหาวิทยาลัยมหาสารคาม (ม.เก่า) ต.ตลาด',
    latitude: 16.1950,
    longitude: 103.2950, // ~7.3 km from MSU center
  },
  {
    first_name: 'รพีพร',
    last_name: 'แก้วมณี',
    phone: '093-456-7890',
    email: 'rapeeporn.k@hotmail.com',
    address: 'ห้างเสริมไทยคอมเพล็กซ์ ถ.นครสวรรค์ ต.ตลาด อ.เมืองมหาสารคาม',
    latitude: 16.2045,
    longitude: 103.2790, // ~5.4 km from MSU center
  },
  {
    first_name: 'เอกชัย',
    last_name: 'สมบูรณ์ผล',
    phone: '094-567-8901',
    email: 'ekkachai.s@gmail.com',
    address: 'หอนาฬิกาเมืองมหาสารคาม ต.ตลาด อ.เมืองมหาสารคาม',
    latitude: 16.1850,
    longitude: 103.3000, // ~8.5 km from MSU center
  },
  {
    first_name: 'อรทัย',
    last_name: 'เจริญสุข',
    phone: '095-678-9012',
    email: 'orathai.c@gmail.com',
    address: 'โรงพยาบาลสุทธาเวช คณะแพทยศาสตร์ มหาวิทยาลัยมหาสารคาม',
    latitude: 16.2475,
    longitude: 103.2450, // ~650m from MSU center (within 1 km)
  },
];

/**
 * Seeds customers if table is empty
 */
export function seedCustomersIfEmpty(): void {
  const row = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  if (row.count === 0) {
    const insertCustomer = db.prepare(`
      INSERT INTO customers (first_name, last_name, phone, email, address, latitude, longitude)
      VALUES (@first_name, @last_name, @phone, @email, @address, @latitude, @longitude)
    `);

    const insertMany = db.transaction((customers: typeof initialCustomers) => {
      for (const c of customers) insertCustomer.run(c);
    });

    insertMany(initialCustomers);
    console.log(`[Seed] Seeded ${initialCustomers.length} initial customers around Mahasarakham University.`);
  }
}

/**
 * Reseeds customers around Mahasarakham University
 */
export function reseedMsuCustomers(): void {
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM customers').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('customers', 'orders')").run();

  const insertCustomer = db.prepare(`
    INSERT INTO customers (first_name, last_name, phone, email, address, latitude, longitude)
    VALUES (@first_name, @last_name, @phone, @email, @address, @latitude, @longitude)
  `);

  const insertMany = db.transaction((customers: typeof initialCustomers) => {
    for (const c of customers) insertCustomer.run(c);
  });

  insertMany(initialCustomers);
  console.log(`[Seed] Reseeded ${initialCustomers.length} customers at Mahasarakham University.`);
}

/**
 * Generates 20 to 30 realistic simulated orders linked to existing customers around MSU.
 * @param count Number of orders to generate (default 25)
 */
export function seedOrders(count: number = 25): Order[] {
  seedCustomersIfEmpty();

  const customers = db.prepare('SELECT id, latitude, longitude, first_name, last_name, address FROM customers').all() as Customer[];
  if (customers.length === 0) {
    throw new Error('No customers found to associate with orders.');
  }

  const statuses = ['Pending', 'Confirmed', 'Processing', 'In Transit', 'Delivered'];
  const notesPool = [
    'ส่งที่หน้าตึกคณะวิทยาการสารสนเทศ มมส.',
    'โทรแจ้งก่อนส่ง 10 นาที (อยู่หอพัก)',
    'ฝากไว้กับป้อมยามหน้าประตู มมส.',
    'ส่งที่ร้านกาแฟตลาดน้อย มมส.',
    'ขอใบเสร็จรับเงินด้วยครับ',
    'ส่งช่วงพักเที่ยง 12:00 - 13:00 น.',
    'ติดต่อเบอร์โทรสำรอง 089-111-2222',
    'ระวังสินค้าแตกง่าย',
    'จัดส่งด่วนพิเศษ หอพักท่าขอนยาง',
    'โอนเงินเรียบร้อยแล้ว'
  ];

  const now = Date.now();
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_code, customer_id, box_count, price_per_box,
      delivery_latitude, delivery_longitude, status, notes, order_date
    )
    VALUES (
      @order_code, @customer_id, @box_count, @price_per_box,
      @delivery_latitude, @delivery_longitude, @status, @notes, @order_date
    )
  `);

  const createdOrders: Order[] = [];
  const runTransaction = db.transaction(() => {
    for (let i = 1; i <= count; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      // Jitter delivery coordinates around MSU area (~200m to 1km)
      const jitterLat = (Math.random() - 0.5) * 0.008;
      const jitterLng = (Math.random() - 0.5) * 0.008;
      const deliveryLat = parseFloat((customer.latitude + jitterLat).toFixed(6));
      const deliveryLng = parseFloat((customer.longitude + jitterLng).toFixed(6));

      const boxCount = Math.floor(Math.random() * 30) + 1;
      const pricePerBox = 150.00;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const notes = notesPool[Math.floor(Math.random() * notesPool.length)];

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const dateStr = new Date(now - i * 3600 * 1000 * 4).toISOString().slice(0, 10).replace(/-/g, '');
      const orderCode = `ORD-${dateStr}-${randomSuffix}-${i.toString().padStart(2, '0')}`;
      const orderDate = new Date(now - i * 3600 * 1000 * 2).toISOString();

      const orderData = {
        order_code: orderCode,
        customer_id: customer.id,
        box_count: boxCount,
        price_per_box: pricePerBox,
        delivery_latitude: deliveryLat,
        delivery_longitude: deliveryLng,
        status: status,
        notes: notes,
        order_date: orderDate
      };

      const result = insertOrder.run(orderData);
      createdOrders.push({
        id: Number(result.lastInsertRowid),
        ...orderData,
        total_price: boxCount * pricePerBox,
        customer_name: `${customer.first_name} ${customer.last_name}`
      });
    }
  });

  runTransaction();
  console.log(`[Seed] Successfully seeded ${createdOrders.length} orders around Mahasarakham University.`);
  return createdOrders;
}

/**
 * Clears all orders from the database
 */
export function clearAllOrders(): number {
  const result = db.prepare('DELETE FROM orders').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name = 'orders'").run();
  console.log(`[Clear] Deleted all ${result.changes} orders.`);
  return result.changes;
}

if (require.main === module) {
  reseedMsuCustomers();
  seedOrders(25);
  console.log('MSU seed completed successfully.');
}
