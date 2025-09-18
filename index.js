import dotenv from 'dotenv';
import { setupServer } from './server.js';
import { initMongoConnection } from './src/db/initMongoConnection.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const start = async () => {
  await initMongoConnection();
  const app = setupServer();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();