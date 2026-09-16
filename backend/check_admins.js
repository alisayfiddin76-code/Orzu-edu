const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/orzu_edu').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ role: 'SUPER_ADMIN' }).toArray();
  console.log('=== SUPER ADMIN FULL DATA ===');
  users.forEach(u => {
    // Show ALL fields
    const obj = Object.assign({}, u);
    delete obj.password; // don't show password hash
    console.log(JSON.stringify(obj, null, 2));
  });
  await mongoose.disconnect();
}).catch(e => {
  console.error('XATOLIK:', e.message);
  process.exit(1);
});
