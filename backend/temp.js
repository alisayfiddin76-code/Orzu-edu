const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/orzu_edu').then(async () => {
  const db = mongoose.connection.db;
  const student = await db.collection('students').findOne({ parentPhone: { $exists: true, $ne: null, $ne: "" } });
  if (student) console.log(student.parentPhone);
  else console.log('None');
  process.exit(0);
})
