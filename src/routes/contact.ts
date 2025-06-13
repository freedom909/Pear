import express from 'express';
import * as contactController from '../controllers/contact';

const router = express.Router();

// Contact routes
router.get('/contact', contactController.getContact);
router.post('/contact', contactController.postContact);

export default router;