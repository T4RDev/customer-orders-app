import { Request, Response } from 'express';
import db from '../db/database';
import { filterWithinRadius, calculateDistanceKm } from '../utils/distance';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../types/customer';
import { MSU_CENTER } from '../db/seedData';

export const customerController = {
  /**
   * 2.1 Get all customers (with distance in KM from MSU)
   * GET /api/customers
   */
  getAllCustomers: (req: Request, res: Response) => {
    try {
      const customers = db.prepare(`
        SELECT c.*, COUNT(o.id) AS total_orders
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id
        GROUP BY c.id
        ORDER BY c.id DESC
      `).all() as Customer[];

      const dataWithDistance = customers.map(c => {
        const d = calculateDistanceKm(MSU_CENTER.latitude, MSU_CENTER.longitude, c.latitude, c.longitude);
        return {
          ...c,
          distance_km: Math.round(d * 1000) / 1000,
          distance_meters: Math.round(d * 1000),
        };
      });

      return res.status(200).json({
        success: true,
        center: MSU_CENTER,
        count: dataWithDistance.length,
        data: dataWithDistance,
      });
    } catch (err: any) {
      console.error('[getAllCustomers] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2.1 Get customer by ID with their orders
   * GET /api/customers/:id
   */
  getCustomerById: (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid customer ID' });
      }

      const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer | undefined;
      if (!customer) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC').all(id);

      return res.status(200).json({
        success: true,
        data: {
          ...customer,
          orders,
        },
      });
    } catch (err: any) {
      console.error('[getCustomerById] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2.1 Add new customer
   * POST /api/customers
   */
  createCustomer: (req: Request, res: Response) => {
    try {
      const { first_name, last_name, phone, email, address, latitude, longitude }: CreateCustomerDTO = req.body;

      if (!first_name || !last_name) {
        return res.status(400).json({
          success: false,
          error: 'first_name and last_name are required fields.',
        });
      }

      if (latitude === undefined || longitude === undefined || isNaN(Number(latitude)) || isNaN(Number(longitude))) {
        return res.status(400).json({
          success: false,
          error: 'Valid numeric latitude and longitude are required.',
        });
      }

      const stmt = db.prepare(`
        INSERT INTO customers (first_name, last_name, phone, email, address, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        first_name.trim(),
        last_name.trim(),
        phone ? phone.trim() : null,
        email ? email.trim() : null,
        address ? address.trim() : null,
        parseFloat(String(latitude)),
        parseFloat(String(longitude))
      );

      const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid) as Customer;

      return res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: newCustomer,
      });
    } catch (err: any) {
      console.error('[createCustomer] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2.1 Edit customer
   * PUT /api/customers/:id
   */
  updateCustomer: (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid customer ID' });
      }

      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer | undefined;
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      const { first_name, last_name, phone, email, address, latitude, longitude }: UpdateCustomerDTO = req.body;

      const updatedFirstName = first_name !== undefined ? first_name.trim() : existing.first_name;
      const updatedLastName = last_name !== undefined ? last_name.trim() : existing.last_name;
      const updatedPhone = phone !== undefined ? phone.trim() : existing.phone;
      const updatedEmail = email !== undefined ? email.trim() : existing.email;
      const updatedAddress = address !== undefined ? address.trim() : existing.address;
      const updatedLat = latitude !== undefined ? parseFloat(String(latitude)) : existing.latitude;
      const updatedLng = longitude !== undefined ? parseFloat(String(longitude)) : existing.longitude;

      if (isNaN(updatedLat) || isNaN(updatedLng)) {
        return res.status(400).json({ success: false, error: 'Latitude and Longitude must be valid numbers' });
      }

      const stmt = db.prepare(`
        UPDATE customers
        SET first_name = ?, last_name = ?, phone = ?, email = ?, address = ?,
            latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(updatedFirstName, updatedLastName, updatedPhone, updatedEmail, updatedAddress, updatedLat, updatedLng, id);

      const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer;

      return res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer,
      });
    } catch (err: any) {
      console.error('[updateCustomer] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2.1 Delete customer
   * DELETE /api/customers/:id
   */
  deleteCustomer: (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: 'Invalid customer ID' });
      }

      const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer | undefined;
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Customer not found' });
      }

      db.prepare('DELETE FROM customers WHERE id = ?').run(id);

      return res.status(200).json({
        success: true,
        message: `Customer #${id} (${existing.first_name} ${existing.last_name}) deleted successfully.`,
      });
    } catch (err: any) {
      console.error('[deleteCustomer] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2.2 Search by partial first name or last name
   * GET /api/customers/search?q=สม
   */
  searchCustomersByName: (req: Request, res: Response) => {
    try {
      const q = req.query.q as string | undefined;
      const firstName = req.query.firstName as string | undefined;
      const lastName = req.query.lastName as string | undefined;

      let customers: Customer[];
      if (q) {
        const queryTerm = `%${q.trim()}%`;
        customers = db.prepare(`
          SELECT * FROM customers
          WHERE first_name LIKE ? OR last_name LIKE ?
          ORDER BY id DESC
        `).all(queryTerm, queryTerm) as Customer[];
      } else if (firstName || lastName) {
        const fTerm = `%${(firstName || '').trim()}%`;
        const lTerm = `%${(lastName || '').trim()}%`;
        customers = db.prepare(`
          SELECT * FROM customers
          WHERE first_name LIKE ? AND last_name LIKE ?
          ORDER BY id DESC
        `).all(fTerm, lTerm) as Customer[];
      } else {
        customers = db.prepare('SELECT * FROM customers ORDER BY id DESC').all() as Customer[];
      }

      const customersWithDistance = customers.map(c => {
        const d = calculateDistanceKm(MSU_CENTER.latitude, MSU_CENTER.longitude, c.latitude, c.longitude);
        return {
          ...c,
          distance_km: Math.round(d * 1000) / 1000,
          distance_meters: Math.round(d * 1000),
        };
      });

      return res.status(200).json({
        success: true,
        query: { q, firstName, lastName },
        center: MSU_CENTER,
        count: customersWithDistance.length,
        data: customersWithDistance,
      });
    } catch (err: any) {
      console.error('[searchCustomersByName] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * 2.3 Search customers within 1 km (or custom radius) from given coordinates
   * GET /api/customers/nearby?radius=1 (Defaults to มหาวิทยาลัยมหาสารคาม)
   */
  getNearbyCustomers: (req: Request, res: Response) => {
    try {
      const lat = req.query.lat as string | undefined;
      const lng = req.query.lng as string | undefined;
      const radius = req.query.radius as string | undefined;

      // Default to Mahasarakham University (MSU) center
      const centerLat = lat ? parseFloat(lat) : MSU_CENTER.latitude;
      const centerLng = lng ? parseFloat(lng) : MSU_CENTER.longitude;
      const maxRadiusKm = radius !== undefined ? parseFloat(radius) : 1.0;

      if (isNaN(centerLat) || isNaN(centerLng) || isNaN(maxRadiusKm) || maxRadiusKm <= 0) {
        return res.status(400).json({
          success: false,
          error: 'lat, lng, and radius must be valid numbers (> 0).',
        });
      }

      const allCustomers = db.prepare('SELECT * FROM customers').all() as Customer[];
      const nearbyCustomers = filterWithinRadius(
        allCustomers,
        centerLat,
        centerLng,
        maxRadiusKm,
        'latitude',
        'longitude'
      );

      return res.status(200).json({
        success: true,
        center: { latitude: centerLat, longitude: centerLng },
        radius_km: maxRadiusKm,
        count: nearbyCustomers.length,
        data: nearbyCustomers,
      });
    } catch (err: any) {
      console.error('[getNearbyCustomers] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};
