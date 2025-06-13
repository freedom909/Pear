import express from 'express';
import * as userController from '../controllers/user';
import { passportConfig } from '../config/index.config';

const router = express.Router();

// Google Photos API routes
router.get('/photos', passportConfig.isAuthenticated, userController.getPhotos);
router.get('/files/download', passportConfig.isAuthenticated, userController.downloadFile);

export default router;