import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] Seed2Shelf Backend listening on http://localhost:${PORT}`);
  });
};

startServer();
