import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ MONGODB_URI is not defined in environment variables (.env)');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });

    console.log('✓ MongoDB Connected Successfully to Atlas');
    console.log(`[Database Host] ${conn.connection.host}`);
    console.log(`[Database Name] ${conn.connection.name}`);
  } catch (error: any) {
    console.error('⚠️ MongoDB Initial Connection Warning:', error.message || error);
    console.log('🔄 Server will retry MongoDB Atlas connection automatically on first request...');
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB event error:', err);
});

export default connectDB;
