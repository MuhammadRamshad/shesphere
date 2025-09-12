
import express from 'express';
import * as safetyController from '../controllers/safetyController';
const router = express.Router();

// Safety contacts
// GET /api/safety/contacts - Get safety contacts for a user
router.get('/contacts', safetyController.getSafetyContacts);

// POST /api/safety/contacts - Create a new safety contact
router.post('/contacts', safetyController.createSafetyContact);

// DELETE /api/safety/contacts/:id - Delete a safety contact
router.delete('/contacts/:id', safetyController.deleteSafetyContact);

// Safety alerts
// GET /api/safety/alerts - Get safety alerts for a user
router.get('/alerts', safetyController.getSafetyAlerts);

// POST /api/safety/alerts - Create a new safety alert
//router.post('/alerts', safetyController.createSafetyAlert);
router.post('/alerts', (req, res, next) => {
    console.log('POST /api/safety/alerts route hit');
    next();
  }, safetyController.createSafetyAlert);


export default router;
