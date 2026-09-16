// To'g'ridan-to'g'ri joriy oy uchun UNPAID invoicelar yaratish skripti
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/orzu_edu').then(async () => {
  // Models
  const InvoiceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    final_amount: { type: Number },
    status: { type: String, default: 'UNPAID' },
    due_date: { type: Date, required: true },
    invoice_type: { type: String, default: 'FULL' },
  }, { strict: false });
  InvoiceSchema.index({ student: 1, group: 1, month: 1 }, { unique: true });

  const GroupSchema = new mongoose.Schema({
    title: String, status: String, students: [{ type: mongoose.Schema.Types.ObjectId }], price: Number
  }, { strict: false });

  const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
  const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dueDate = new Date(now.getFullYear(), now.getMonth(), 1);

  console.log(`\n=== ${month} OYI UCHUN INVOICE YARATISH ===\n`);

  const groups = await Group.find({ status: 'ACTIVE' });
  let created = 0, skipped = 0;

  for (const group of groups) {
    const amount = group.price || 0;
    console.log(`Guruh: "${group.title}" | narx: ${amount} | o'quvchilar: ${group.students.length}`);

    for (const studentId of group.students) {
      // Allaqachon mavjudmi?
      const exists = await Invoice.findOne({ student: studentId, group: group._id, month });
      if (exists) {
        console.log(`  ⏩ Skip (mavjud): student=${studentId} | status=${exists.status}`);
        skipped++;
        continue;
      }

      // Yangi invoice yaratish
      await Invoice.create({
        student: studentId,
        group: group._id,
        month,
        amount,
        discount: 0,
        final_amount: amount,
        status: 'UNPAID',
        due_date: dueDate,
        invoice_type: 'FULL',
      });
      console.log(`  ✅ Yaratildi: student=${studentId}`);
      created++;
    }
  }

  console.log(`\n=== NATIJA ===`);
  console.log(`Yaratildi: ${created}`);
  console.log(`O'tkazildi: ${skipped}`);
  console.log(`Oy: ${month}`);
  
  // Tekshirish
  const totalUnpaid = await Invoice.countDocuments({ status: 'UNPAID', month });
  console.log(`\nJoriy oy UNPAID invoicelar: ${totalUnpaid}`);

  await mongoose.disconnect();
  console.log('✅ Tugadi!');
}).catch(e => {
  console.error('XATOLIK:', e.message);
  process.exit(1);
});
