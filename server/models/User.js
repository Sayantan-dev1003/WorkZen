const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  loginId: { type: String, unique: true, sparse: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'HR', 'PayrollOfficer', 'Employee'],
    default: 'Employee' 
  },
  status: { type: String, default: 'Active' },
  joiningYear: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
