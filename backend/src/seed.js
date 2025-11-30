require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./utils/db');
const User = require('./models/User');

const run = async () => {
  await connectDB();
  await User.deleteMany({});
  const admin = new User({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' });
  const user = new User({ name: 'Demo User', email: 'user@example.com', password: 'password123', role: 'user' });
  await admin.save();
  await user.save();
  console.log('Seeded admin@example.com and user@example.com both with password password123');
  mongoose.connection.close();
};

run().catch(e => {
  console.error(e);
  process.exit(1);
});
