import { Router } from 'express';
import { customerController } from '../controllers/customerController';

const router = Router();

// 2.2 Search by partial first name, last name
router.get('/search', customerController.searchCustomersByName);

// 2.3 Search customers within 1 km from given coordinates
router.get('/nearby', customerController.getNearbyCustomers);

// 2.1 CRUD operations
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
