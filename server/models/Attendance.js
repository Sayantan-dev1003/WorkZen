const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Optional: only for employees
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ['present','absent','leave','holiday'], default: 'present' }
}, { timestamps: true });
module.exports = mongoose.model('Attendance', attendanceSchema);
