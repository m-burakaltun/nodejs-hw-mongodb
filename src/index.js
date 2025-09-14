import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

dotenv.config();
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

const start = async () => {
  await initMongoConnection();
  setupServer();
};

start();