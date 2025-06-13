import { Router } from 'express';
import * as userController from '../controllers/user.js';
import * as googleController from '../controllers/google.js';
import { passportConfig } from '../config/index.config.js';

const router = Router();

// Local Authentication Routes
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.post('/logout', userController.logout);
router.get('/forgot', userController.getForgot);
router.post('/forgot', userController.postForgot);
router.get('/reset/:token', userController.getReset);
router.post('/reset/:token', userController.postReset);
router.get('/signup', userController.getSignup);
router.post('/signup', userController.postSignup);

// Account Management Routes
router.get('/account', passportConfig.isAuthenticated, userController.getAccount);
router.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
router.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
router.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
router.post('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

// Google Authentication Routes
router.get('/google', googleController.googleLogin);
router.get('/google/callback', googleController.googleCallback);
router.get('/google/connect', passportConfig.isAuthenticated, googleController.googleConnect);
router.get('/google/connect/callback', passportConfig.isAuthenticated, googleController.googleConnectCallback);
router.get('/google/unlink', passportConfig.isAuthenticated, googleController.googleUnlink);

export default router;