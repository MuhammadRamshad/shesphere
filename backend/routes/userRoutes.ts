
import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController';

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User profile routes
router.get('/:id', getUserProfile);
router.put('/:id', updateUserProfile);

export default router;
