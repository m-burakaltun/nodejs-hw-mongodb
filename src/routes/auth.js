import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import * as authController from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../validation/authSchemas.js';

const router = Router();

// Kayıt
router.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(authController.register)
);

// Giriş
router.post(
  '/login',
  validateBody(loginSchema),
  ctrlWrapper(authController.login)
);

// Refresh token ile yeni access token alma
router.post('/refresh', ctrlWrapper(authController.refresh));

// Çıkış
router.post('/logout', ctrlWrapper(authController.logout));

export default router;
