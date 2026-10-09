import { Router } from 'express';
import { orderController } from '../controllers/orderController';

const router = Router();

// 3.1 Simulate 20-30 orders with complete information
router.post('/seed', orderController.seedOrdersSimulation);

// 3.2 Clear (delete all) simulated orders
router.delete('/clear', orderController.clearAllOrders);
router.post('/clear', orderController.clearAllOrders);

// 3.3 Show all orders within 2 km from given coordinates
router.get('/nearby', orderController.getNearbyOrders);

// 3.1.3 Dedicated box count update endpoint
router.patch('/:id/box-count', orderController.updateBoxCount);
router.put('/:id/box-count', orderController.updateBoxCount);

// 3.1 Standard CRUD operations
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

export default router;
