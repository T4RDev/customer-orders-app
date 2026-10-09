import { Request, Response } from 'express';
import db from '../db/database';
import { filterWithinRadius, calculateDistanceKm } from '../utils/distance';
import { seedOrders, clearAllOrders, MSU_CENTER } from '../db/seedData';
import { Order, CreateOrderDTO, UpdateOrderDTO } from '../types/order';

export const orderController = {
  /**
   * 3.1 Get all orders with joined customer details (with distance in KM from MSU)
   * GET /api/orders
   */
  getAllOrders: (req: Request, res: Response) => {
    try {
      const orders = db.prepare(`
        SELECT 
          o.id,
          o.order_code,
          o.customer_id,
          o.box_count,
          o.price_per_box,
          o.total_price,
          o.delivery_latitude,
          o.delivery_longitude,
          o.status,
          o.notes,
          o.order_date,
          c.first_name,
          c.last_name,
          (c.first_name || ' ' || c.last_name) AS customer_name,
          c.phone AS customer_phone,
          c.email AS customer_email,
          c.address AS customer_address,
          c.latitude AS customer_latitude,
          c.longitude AS customer_longitude
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        ORDER BY o.order_date DESC, o.id DESC
      `).all() as Order[];

      const ordersWithDistance = orders.map(o => {
        const d = calculateDistanceKm(MSU_CENTER.latitude, MSU_CENTER.longitude, o.delivery_latitude, o.delivery_longitude);
        return {
          ...o,
          distance_km: Math.round(d * 1000) / 1000,
          distance_meters: Math.round(d * 1000),
        };
      });

      return res.status(200).json({
        success: true,
        center: MSU_CENTER,
        count: ordersWithDistance.length,
        data: ordersWithDistance,
      });
    } catch (err: any) {
      console.error('[getAllOrders] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.1 Get single order by ID with customer details
   * GET /api/orders/:id
   */
  getOrderById: (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid order ID' });
      }

      const order = db.prepare(`
        SELECT 
          o.*,
          c.first_name,
          c.last_name,
          (c.first_name || ' ' || c.last_name) AS customer_name,
          c.phone AS customer_phone,
          c.email AS customer_email,
          c.address AS customer_address,
          c.latitude AS customer_latitude,
          c.longitude AS customer_longitude
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `).get(id) as Order | undefined;

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err: any) {
      console.error('[getOrderById] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.1.3 Add new order
   * POST /api/orders
   */
  createOrder: (req: Request, res: Response) => {
    try {
      const {
        customer_id,
        box_count,
        price_per_box = 150.0,
        delivery_latitude,
        delivery_longitude,
        status = 'Pending',
        notes = '',
      }: CreateOrderDTO = req.body;

      if (!customer_id || box_count === undefined) {
        return res.status(400).json({
          success: false,
          error: 'customer_id and box_count are required.',
        });
      }

      const parsedBoxCount = parseInt(String(box_count), 10);
      if (isNaN(parsedBoxCount) || parsedBoxCount < 1) {
        return res.status(400).json({
          success: false,
          error: 'box_count must be an integer >= 1.',
        });
      }

      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id) as any;
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: `Customer with ID ${customer_id} does not exist.`,
        });
      }

      const dLat = delivery_latitude !== undefined ? parseFloat(String(delivery_latitude)) : customer.latitude;
      const dLng = delivery_longitude !== undefined ? parseFloat(String(delivery_longitude)) : customer.longitude;

      if (isNaN(dLat) || isNaN(dLng)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid delivery coordinates.',
        });
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `ORD-${dateStr}-${rand}`;

      const stmt = db.prepare(`
        INSERT INTO orders (
          order_code, customer_id, box_count, price_per_box,
          delivery_latitude, delivery_longitude, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        orderCode,
        customer.id,
        parsedBoxCount,
        parseFloat(String(price_per_box)) || 150.0,
        dLat,
        dLng,
        status,
        notes
      );

      const createdOrder = db.prepare(`
        SELECT o.*, c.first_name, c.last_name, (c.first_name || ' ' || c.last_name) AS customer_name
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `).get(result.lastInsertRowid) as Order;

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: createdOrder,
      });
    } catch (err: any) {
      console.error('[createOrder] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.1.3 Edit order details
   * PUT /api/orders/:id
   */
  updateOrder: (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid order ID' });
      }

      const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const {
        customer_id,
        box_count,
        price_per_box,
        delivery_latitude,
        delivery_longitude,
        status,
        notes,
      }: UpdateOrderDTO = req.body;

      let newCustomerId = existing.customer_id;
      if (customer_id !== undefined) {
        const custCheck = db.prepare('SELECT id FROM customers WHERE id = ?').get(customer_id);
        if (!custCheck) {
          return res.status(404).json({ success: false, error: 'Target customer ID does not exist' });
        }
        newCustomerId = customer_id;
      }

      let newBoxCount = existing.box_count;
      if (box_count !== undefined) {
        const parsed = parseInt(String(box_count), 10);
        if (isNaN(parsed) || parsed < 1) {
          return res.status(400).json({ success: false, error: 'box_count must be >= 1' });
        }
        newBoxCount = parsed;
      }

      const newPrice = price_per_box !== undefined ? parseFloat(String(price_per_box)) : existing.price_per_box;
      const newLat = delivery_latitude !== undefined ? parseFloat(String(delivery_latitude)) : existing.delivery_latitude;
      const newLng = delivery_longitude !== undefined ? parseFloat(String(delivery_longitude)) : existing.delivery_longitude;
      const newStatus = status !== undefined ? status : existing.status;
      const newNotes = notes !== undefined ? notes : existing.notes;

      db.prepare(`
        UPDATE orders
        SET customer_id = ?, box_count = ?, price_per_box = ?,
            delivery_latitude = ?, delivery_longitude = ?, status = ?, notes = ?
        WHERE id = ?
      `).run(newCustomerId, newBoxCount, newPrice, newLat, newLng, newStatus, newNotes, id);

      const updated = db.prepare(`
        SELECT o.*, c.first_name, c.last_name, (c.first_name || ' ' || c.last_name) AS customer_name
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `).get(id) as Order;

      return res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: updated,
      });
    } catch (err: any) {
      console.error('[updateOrder] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.1.3 Dedicated endpoint to edit box count
   * PATCH /api/orders/:id/box-count
   */
  updateBoxCount: (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid order ID' });
      }

      const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const { box_count } = req.body;
      const newCount = parseInt(String(box_count), 10);
      if (isNaN(newCount) || newCount < 1) {
        return res.status(400).json({
          success: false,
          error: 'box_count must be an integer greater than or equal to 1.',
        });
      }

      db.prepare('UPDATE orders SET box_count = ? WHERE id = ?').run(newCount, id);

      const updated = db.prepare(`
        SELECT o.*, (c.first_name || ' ' || c.last_name) AS customer_name
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `).get(id) as Order;

      return res.status(200).json({
        success: true,
        message: `Order #${id} box count updated to ${newCount}`,
        data: updated,
      });
    } catch (err: any) {
      console.error('[updateBoxCount] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.1.3 Delete an order
   * DELETE /api/orders/:id
   */
  deleteOrder: (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid order ID' });
      }

      const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order | undefined;
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      db.prepare('DELETE FROM orders WHERE id = ?').run(id);

      return res.status(200).json({
        success: true,
        message: `Order #${id} (${existing.order_code}) deleted successfully.`,
      });
    } catch (err: any) {
      console.error('[deleteOrder] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.1 Simulate 20-30 orders with complete information
   * POST /api/orders/seed?count=25
   */
  seedOrdersSimulation: (req: Request, res: Response) => {
    try {
      const countParam = req.query.count || req.body?.count;
      let count = parseInt(String(countParam), 10);
      if (isNaN(count) || count < 1 || count > 100) {
        count = 25; // default 25 orders
      }

      const orders = seedOrders(count);

      return res.status(201).json({
        success: true,
        message: `Successfully simulated ${orders.length} orders.`,
        count: orders.length,
        data: orders,
      });
    } catch (err: any) {
      console.error('[seedOrdersSimulation] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.2 Clear (delete all) simulated orders
   * DELETE /api/orders/clear or POST /api/orders/clear
   */
  clearAllOrders: (req: Request, res: Response) => {
    try {
      const deletedCount = clearAllOrders();

      return res.status(200).json({
        success: true,
        message: `All orders have been cleared successfully. (${deletedCount} orders deleted)`,
        deleted_count: deletedCount,
      });
    } catch (err: any) {
      console.error('[clearAllOrders] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 3.3 Show all orders within 2 km (or custom radius) from given coordinates
   * GET /api/orders/nearby?radius=2 (Defaults to มหาวิทยาลัยมหาสารคาม)
   */
  getNearbyOrders: (req: Request, res: Response) => {
    try {
      const lat = req.query.lat as string | undefined;
      const lng = req.query.lng as string | undefined;
      const radius = req.query.radius as string | undefined;

      // Default to Mahasarakham University (MSU) center
      const centerLat = lat ? parseFloat(lat) : MSU_CENTER.latitude;
      const centerLng = lng ? parseFloat(lng) : MSU_CENTER.longitude;
      const maxRadiusKm = radius !== undefined ? parseFloat(radius) : 2.0;

      if (isNaN(centerLat) || isNaN(centerLng) || isNaN(maxRadiusKm) || maxRadiusKm <= 0) {
        return res.status(400).json({
          success: false,
          error: 'lat, lng, and radius must be valid numbers (> 0).',
        });
      }

      const allOrders = db.prepare(`
        SELECT 
          o.id,
          o.order_code,
          o.customer_id,
          o.box_count,
          o.price_per_box,
          o.total_price,
          o.delivery_latitude,
          o.delivery_longitude,
          o.status,
          o.notes,
          o.order_date,
          c.first_name,
          c.last_name,
          (c.first_name || ' ' || c.last_name) AS customer_name,
          c.phone AS customer_phone,
          c.email AS customer_email,
          c.address AS customer_address
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
      `).all() as Order[];

      const nearbyOrders = filterWithinRadius(
        allOrders,
        centerLat,
        centerLng,
        maxRadiusKm,
        'delivery_latitude',
        'delivery_longitude'
      );

      return res.status(200).json({
        success: true,
        center: { latitude: centerLat, longitude: centerLng },
        radius_km: maxRadiusKm,
        count: nearbyOrders.length,
        data: nearbyOrders,
      });
    } catch (err: any) {
      console.error('[getNearbyOrders] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};
