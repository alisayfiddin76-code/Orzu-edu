const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/orzu_edu';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB ga ulandi.');

    const User = require('./src/models/User');
    const Lead = require('./src/models/Lead');

    console.log('\n--- BARCHA LIdLAR (LEADS) ---');
    const leads = await Lead.find({});
    console.log(`Jami arizalar (leads): ${leads.length} ta`);
    leads.forEach(l => {
      console.log(`ID: ${l._id} | Name: ${l.fullname} | Phone: ${l.phone} | Status: ${l.status} | BirthDate: ${l.birthDate}`);
    });

    console.log('\n--- BARCHA FOYDALANUVCHILAR (USERS) ---');
    const users = await User.find({});
    console.log(`Jami foydalanuvchilar (users): ${users.length} ta`);
    users.forEach(u => {
      console.log(`ID: ${u._id} | Name: ${u.firstname} ${u.lastname} | Phone: ${u.phone} | Role: ${u.role}`);
    });

  } catch (err) {
    console.error('Xatolik:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB dan uzildi.');
  }
}

run();
