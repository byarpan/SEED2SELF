import { Router } from 'express';
import { authController } from './auth.controller.js';
import { AuthValidator } from './auth.validator.js';
import { authenticateJWT } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// POST /api/v1/auth/register (Register User)
router.post('/register', AuthValidator.validateRegisterBody, authController.register);

// POST /api/v1/auth/login (Login User)
router.post('/login', AuthValidator.validateLoginBody, authController.login);

// GET /api/v1/auth/me (Get Authenticated User Profile from MongoDB Atlas)
router.get('/me', authenticateJWT, authController.me);

// POST /api/v1/auth/logout (Logout Flow)
router.post('/logout', authController.logout);

// POST /api/v1/auth/refresh-token (Refresh Token Flow)
router.post('/refresh-token', authController.refreshToken);

export default router;
