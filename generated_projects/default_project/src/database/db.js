const mongoose = require('mongoose');

const CONNECTION_STRING = 'your_mongodb_connection_string';

const connectDB = async () => {
  try {
    await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;