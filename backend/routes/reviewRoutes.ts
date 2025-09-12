
import express from 'express';
import * as reviewController from '../controllers/reviewController';

const router = express.Router();

// GET /api/reviews - Get reviews for a product
router.get('/', reviewController.getProductReviews);

// POST /api/reviews - Create a new review
router.post('/', reviewController.createReview);

// PATCH /api/reviews/:id/helpful - Update review helpful count
router.patch('/:id/helpful', reviewController.updateHelpfulCount);

export default router;
