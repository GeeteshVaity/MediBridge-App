const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    retryWrites: true,
  });

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  return mongoose.connection;
};

module.exports = { connectDB };
