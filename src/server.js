import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routes/contacts.js';

dotenv.config();

export function setupServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  app.use('/contacts', contactsRouter);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  return app;
}