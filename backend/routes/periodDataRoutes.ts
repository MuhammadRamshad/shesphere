
import express from 'express';
import * as periodDataController from '../controllers/periodDataController';

const router = express.Router();

// GET /api/period-data - Get period data for a user
router.get('/', periodDataController.getUserPeriodData);

// POST /api/period-data - Save period data
router.post('/', periodDataController.savePeriodData);

export default router;
