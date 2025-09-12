
import express from 'express';
import { createOrder, verifyPayment, processCodOrder } from '../controllers/paymentController';

const router = express.Router();

// Payment routes
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/cod', processCodOrder);

export default router;
