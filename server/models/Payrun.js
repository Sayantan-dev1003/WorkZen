const mongoose = require('mongoose');
const payrunSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  status: { type: String, enum: ['draft','processed','paid'], default: 'draft' },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Payrun', payrunSchema);
