const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable or default to local MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/green-hydrogen-platform';
    
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✓ MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.db.databaseName}`);
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.error('Please make sure MongoDB is running on your system');
    console.error('You can install MongoDB from: https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Close connection on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
