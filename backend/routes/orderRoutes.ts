
import express from 'express';
import { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  getOrdersByUser, 
  updateOrderStatus
} from '../controllers/orderController';

const router = express.Router();

// Order routes
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.get('/user/:userId', getOrdersByUser);
router.patch('/:id/status', updateOrderStatus);

export default router;
