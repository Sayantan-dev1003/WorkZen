const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  department: { type: String },
  designation: { type: String },
  salary: { type: Number },
  joiningDate: { type: Date },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  status: { type: String, enum: ['Present', 'Absent', 'On Leave'], default: 'Present' },
  profilePicture: { type: String },
  emergencyContact: { type: String },
  bloodGroup: { type: String },
  manager: { type: String },
  location: { type: String },
  employeeId: { type: String, unique: true },
  // Identity documents
  pan: { type: String },
  uan: { type: String },
  // Bank details for payroll
  bankName: { type: String },
  bankAccountNumber: { type: String },
  bankIFSC: { type: String },
  bankBranch: { type: String }
}, { timestamps: true });

// Auto-generate employee ID before saving
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
