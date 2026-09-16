const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/orzu_edu').then(async () => {
  const db = mongoose.connection.db;
  
  // Students with lead field, check their enrollments
  const students = await db.collection('students').find({ lead: { $ne: null } }).toArray();
  
  console.log(`=== Lead'li o'quvchilar: ${students.length} ta ===\n`);
  
  for (const s of students) {
    const user = await db.collection('users').findOne({ _id: s.user });
    const enrollments = s.enrollments || [];
    console.log(`- ${user?.firstname} ${user?.lastname}`);
    console.log(`  lead: ${s.lead}`);
    console.log(`  enrollments.length: ${enrollments.length}`);
    console.log(`  enrollments:`, JSON.stringify(enrollments));
    console.log('');
  }

  // Also check groups to see who is in students array
  const groups = await db.collection('groups').find({}).toArray();
  console.log(`\n=== Guruhlar va ulardagi o'quvchilar ===`);
  for (const g of groups) {
    console.log(`Guruh: "${g.title}" | students array: ${(g.students || []).length} ta`);
    for (const sid of (g.students || [])) {
      const s = await db.collection('students').findOne({ _id: sid });
      const u = s ? await db.collection('users').findOne({ _id: s.user }) : null;
      console.log(`  - ${u?.firstname} ${u?.lastname} | enrollments: ${(s?.enrollments || []).length} ta`);
    }
  }

  await mongoose.disconnect();
}).catch(e => {
  console.error('XATOLIK:', e.message);
  process.exit(1);
});
