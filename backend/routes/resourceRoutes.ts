
import express from 'express';
import * as resourceController from '../controllers/resourceController';

const router = express.Router();

// GET /api/resources - Get all resources
router.get('/', resourceController.getAllResources);

// GET /api/resources/:id - Get resource by ID
router.get('/:id', resourceController.getResourceById);

// POST /api/resources - Create a new resource
router.post('/', resourceController.createResource);

export default router;
