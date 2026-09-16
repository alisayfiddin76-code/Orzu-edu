// Test the new getRegisteredStudents logic directly
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/orzu_edu').then(async () => {
  const StudentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    enrollments: [{ group: mongoose.Schema.Types.ObjectId, joined_at: Date }],
  }, { strict: false });
  
  const GroupSchema = new mongoose.Schema({
    title: String,
    students: [{ type: mongoose.Schema.Types.ObjectId }],
  }, { strict: false });

  const UserSchema = new mongoose.Schema({
    firstname: String, lastname: String, phone: String
  }, { strict: false });

  const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
  const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  // New logic: collect all enrolled student IDs from Group.students
  const allGroups = await Group.find({}, { students: 1, title: 1 });
  const enrolledStudentIds = new Set();
  for (const group of allGroups) {
    for (const sid of (group.students || [])) {
      enrolledStudentIds.add(sid.toString());
    }
  }

  console.log(`Guruhlardagi jami unique student IDlar: ${enrolledStudentIds.size}`);
  console.log('IDs:', [...enrolledStudentIds]);

  // Find students with lead
  const allLeadStudents = await Student.find({ lead: { $ne: null } })
    .populate({ path: 'user', select: 'firstname lastname phone' })
    .populate({ path: 'lead', select: 'fullname course' });

  console.log(`\nLead'li jami o'quvchilar: ${allLeadStudents.length}`);

  // Filter out enrolled ones
  const unassigned = allLeadStudents.filter(s => !enrolledStudentIds.has(s._id.toString()));

  console.log(`\nGuruhga qo'shilmagan (ko'rsatilishi kerak): ${unassigned.length} ta`);
  unassigned.forEach(s => {
    console.log(`  - ${s.user?.firstname} ${s.user?.lastname} | lead kurs: ${s.lead?.course || '—'}`);
  });

  const assigned = allLeadStudents.filter(s => enrolledStudentIds.has(s._id.toString()));
  console.log(`\nGuruhda bor (ko'rinmasligi kerak): ${assigned.length} ta`);
  assigned.forEach(s => {
    console.log(`  - ${s.user?.firstname} ${s.user?.lastname}`);
  });

  await mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });
