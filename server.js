import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import contactsRouter from './src/routes/contacts.js';
import { notFoundHandler } from './src/middlewares/notFoundHandler.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

dotenv.config();

export function setupServer() {
  const app = express();

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  app.use('/contacts', contactsRouter);

  
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}