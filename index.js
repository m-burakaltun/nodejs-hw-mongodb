import dotenv from 'dotenv';
dotenv.config();

import { setupServer } from './server.js';
import { initMongoConnection } from './src/db/initMongoConnection.js';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  try {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is missing in .env');
      process.exit(1);
    }

    await initMongoConnection();
    console.log('✅ MongoDB connected');

    const app = setupServer();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

start();