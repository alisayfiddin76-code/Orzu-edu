const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/orzu_edu';
const User = require('./src/models/User');

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // 1) Test Admin
    const adminPhone = '+998901234567';
    const admin = await User.findOne({ phone: adminPhone }).select('+password');
    if (admin) {
      const isMatch = await admin.matchPassword('admin123');
      console.log(`Admin (${adminPhone}) -> password 'admin123' matches: ${isMatch}`);
      const isMatch2 = await admin.matchPassword('123456');
      console.log(`Admin (${adminPhone}) -> password '123456' matches: ${isMatch2}`);
    } else {
      console.log('Admin user not found');
    }

    // 2) Test Teacher 1
    const teacherPhone = '+998901585003';
    const teacher = await User.findOne({ phone: teacherPhone }).select('+password');
    if (teacher) {
      const isMatch = await teacher.matchPassword('123456');
      console.log(`Teacher (${teacherPhone}) -> password '123456' matches: ${isMatch}`);
    } else {
      console.log('Teacher Ozodbek not found');
    }

    // 3) Test Teacher 2
    const teacherPhone2 = '+998911111111';
    const teacher2 = await User.findOne({ phone: teacherPhone2 }).select('+password');
    if (teacher2) {
      const isMatch = await teacher2.matchPassword('123456');
      console.log(`Teacher (${teacherPhone2}) -> password '123456' matches: ${isMatch}`);
    } else {
      console.log('Teacher Ali not found');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
