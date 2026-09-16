const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/orzuedu').then(async () => {
  const User = require('./src/models/User');
  await User.updateMany({ email: null }, { $unset: { email: 1 } });
  await User.updateMany({ username: null }, { $unset: { username: 1 } });
  console.log('Cleaned null values for email and username');
  try { await User.collection.dropIndex('username_1'); } catch (e) {}
  try { await User.collection.dropIndex('email_1'); } catch (e) {}
  await User.syncIndexes();
  console.log('Synced indexes');
  mongoose.disconnect();
});
