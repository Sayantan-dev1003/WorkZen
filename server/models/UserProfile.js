const mongoose = require('mongoose');

const salaryComponentSchema = new mongoose.Schema({
  basicSalary: { type: Number, default: 0 },
  basicSalaryPercent: { type: Number, default: 50 },
  hra: { type: Number, default: 0 },
  hraPercent: { type: Number, default: 50 },
  standardAllowance: { type: Number, default: 0 },
  standardAllowancePercent: { type: Number, default: 16.67 },
  performanceBonus: { type: Number, default: 0 },
  performanceBonusPercent: { type: Number, default: 8.33 },
  lta: { type: Number, default: 0 },
  ltaPercent: { type: Number, default: 8.33 },
  fixedAllowance: { type: Number, default: 0 },
  fixedAllowancePercent: { type: Number, default: 11.67 }
});

const pfContributionSchema = new mongoose.Schema({
  employeeAmount: { type: Number, default: 0 },
  employeePercent: { type: Number, default: 12 },
  employerAmount: { type: Number, default: 0 },
  employerPercent: { type: Number, default: 12 }
});

const taxDeductionSchema = new mongoose.Schema({
  professionalTax: { type: Number, default: 200 }
});

const salaryInfoSchema = new mongoose.Schema({
  monthlyWage: { type: Number, default: 0 },
  yearlyWage: { type: Number, default: 0 },
  workingDaysPerWeek: { type: Number, default: 5 },
  breakTimeHours: { type: Number, default: 1 },
  components: salaryComponentSchema,
  pf: pfContributionSchema,
  tax: taxDeductionSchema
});

const bankDetailsSchema = new mongoose.Schema({
  accountNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  uanNumber: { type: String, default: '' },
  employeeCode: { type: String, default: '' }
});

const privateInfoSchema = new mongoose.Schema({
  dateOfBirth: { type: Date },
  address: { type: String, default: '' },
  nationality: { type: String, default: 'Indian' },
  personalEmail: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', ''], default: '' },
  joiningDate: { type: Date },
  bankDetails: bankDetailsSchema
});

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  salaryInfo: salaryInfoSchema,
  privateInfo: privateInfoSchema,
  skills: [{ type: String }],
  certifications: [{ type: String }],
  about: { type: String, default: '' }
}, {
  timestamps: true
});

// Calculate salary components based on basic salary
userProfileSchema.methods.calculateSalaryComponents = function() {
  const monthlyWage = this.salaryInfo.monthlyWage || 0;
  
  // Basic Salary (50% of monthly wage)
  this.salaryInfo.components.basicSalary = (monthlyWage * this.salaryInfo.components.basicSalaryPercent) / 100;
  
  // HRA (50% of basic salary, which is 25% of monthly wage)
  const basicSalary = this.salaryInfo.components.basicSalary;
  this.salaryInfo.components.hra = (basicSalary * this.salaryInfo.components.hraPercent) / 100;
  
  // Standard Allowance (16.67% of monthly wage)
  this.salaryInfo.components.standardAllowance = (monthlyWage * this.salaryInfo.components.standardAllowancePercent) / 100;
  
  // Performance Bonus (8.33% of monthly wage)
  this.salaryInfo.components.performanceBonus = (monthlyWage * this.salaryInfo.components.performanceBonusPercent) / 100;
  
  // LTA (8.33% of monthly wage)
  this.salaryInfo.components.lta = (monthlyWage * this.salaryInfo.components.ltaPercent) / 100;
  
  // Fixed Allowance (remaining to make up 100%)
  this.salaryInfo.components.fixedAllowance = (monthlyWage * this.salaryInfo.components.fixedAllowancePercent) / 100;
  
  // PF Contribution (12% of basic salary each for employee and employer)
  this.salaryInfo.pf.employeeAmount = (basicSalary * this.salaryInfo.pf.employeePercent) / 100;
  this.salaryInfo.pf.employerAmount = (basicSalary * this.salaryInfo.pf.employerPercent) / 100;
  
  // Yearly wage
  this.salaryInfo.yearlyWage = monthlyWage * 12;
};

module.exports = mongoose.model('UserProfile', userProfileSchema);
