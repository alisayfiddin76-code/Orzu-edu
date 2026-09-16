const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/orzu_edu').then(async () => {
  const InvoiceSchema = new mongoose.Schema({
    student: mongoose.Schema.Types.ObjectId,
    group: mongoose.Schema.Types.ObjectId,
    month: String,
    amount: Number,
    status: String,
    due_date: Date
  }, { strict: false });

  const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

  const total = await Invoice.countDocuments();
  const unpaid = await Invoice.countDocuments({ status: 'UNPAID' });
  const paid = await Invoice.countDocuments({ status: 'PAID' });

  const now = new Date();
  const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const currentUnpaid = await Invoice.countDocuments({ status: 'UNPAID', month: currentMonth });

  // Oylar boyicha
  const byMonth = await Invoice.aggregate([
    { $group: { _id: '$month', total: { $sum: 1 }, unpaid: { $sum: { $cond: [{ $eq: ['$status', 'UNPAID'] }, 1, 0] } }, paid: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] } } } },
    { $sort: { _id: -1 } },
    { $limit: 8 }
  ]);

  // Oxirgi 5 UNPAID
  const lastUnpaid = await Invoice.find({ status: 'UNPAID' }).sort({ createdAt: -1 }).limit(5);

  console.log('=== INVOICE DIAGNOSTIKA ===');
  console.log('Jami invoicelar:', total);
  console.log('UNPAID:', unpaid);
  console.log('PAID:', paid);
  console.log('');
  console.log('Joriy oy:', currentMonth);
  console.log('Joriy oy UNPAID:', currentUnpaid);
  console.log('');
  console.log('Oylar boyicha:');
  byMonth.forEach(m => console.log(' ', m._id, '| jami:', m.total, '| unpaid:', m.unpaid, '| paid:', m.paid));
  console.log('');
  console.log('Oxirgi 5 UNPAID invoice:');
  lastUnpaid.forEach(inv => console.log('  oy:', inv.month, '| summa:', inv.amount, '| due_date:', inv.due_date));

  await mongoose.disconnect();
}).catch(e => {
  console.error('XATOLIK:', e.message);
  process.exit(1);
});
