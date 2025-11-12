const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const deductionSchema = new mongoose.Schema({
  ruleName: { type: String, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const workedDaysSchema = new mongoose.Schema({
  workingDaysInMonth: { type: Number, required: true },
  attendance: {
    days: { type: Number, required: true },
    amount: { type: Number, required: true },
    note: { type: String }
  },
  paidTimeOff: {
    days: { type: Number, required: true },
    amount: { type: Number, required: true },
    note: { type: String }
  },
  total: {
    days: { type: Number, required: true },
    amount: { type: Number, required: true }
  }
}, { _id: false });

const payrollSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  
  // Legacy fields (keeping for backward compatibility)
  gross: { type: Number },
  deductions: { type: Number },
  netPay: { type: Number },
  
  // Detailed computation data
  workedDays: { type: workedDaysSchema },
  earnings: [earningSchema],
  grossAmount: { type: Number },
  deductionsList: [deductionSchema],
  totalDeductions: { type: Number },
  netAmount: { type: Number },
  
  // Metadata
  salaryStructure: { type: String, default: 'Regular Pay' },
  status: { type: String, enum: ['draft', 'done', 'paid'], default: 'draft' },
  payrunId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payrun' },
  
  // Employee snapshot at time of payroll
  employeeSnapshot: {
    name: String,
    employeeId: String,
    email: String,
    department: String,
    designation: String,
    location: String,
    dateOfJoining: String,
    pan: String,
    uan: String,
    bankAccount: String
  }
}, { timestamps: true });

// Index for quick lookups
payrollSchema.index({ empId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
