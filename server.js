import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import contactsRouter from './src/routes/contacts.js';
import authRouter from './src/routes/auth.js';

import { notFoundHandler } from './src/middlewares/notFoundHandler.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

dotenv.config();

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => res.json({ ok: true }));
  // Auth rotaları
  app.use('/auth', authRouter);

  // Contacts rotaları
  app.use('/contacts', contactsRouter);

  // Not found & error handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}