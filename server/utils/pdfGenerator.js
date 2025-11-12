const PDFDocument = require('pdfkit');

/**
 * Generate a payslip PDF for an employee
 * @param {Object} payslipData - Complete payslip data
 * @returns {PDFDocument} - PDF document stream
 */
function generatePayslipPDF(payslipData) {
  const { employee, payrun, salaryStructure, workedDays, salaryComputation } = payslipData;

  // Create a document
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    bufferPages: true
  });

  // Set background color for header
  const primaryColor = '#dc2626'; // red-600
  const lightBg = '#fee2e2'; // red-50
  const darkBg = '#fecaca'; // red-200
  const accentColor = '#ef4444'; // red-500

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `₹ ${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function to calculate salary effective date (1 month after joining)
  const calculateSalaryEffectiveDate = (joiningDateString) => {
    if (!joiningDateString || joiningDateString === 'N/A') return 'N/A';
    try {
      const joiningDate = new Date(joiningDateString);
      if (isNaN(joiningDate.getTime())) return 'N/A';
      
      // Add 1 month to joining date
      const effectiveDate = new Date(joiningDate);
      effectiveDate.setMonth(effectiveDate.getMonth() + 1);
      
      return effectiveDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      return 'N/A';
    }
  };

  const salaryEffectiveDate = calculateSalaryEffectiveDate(employee.dateOfJoining);

  // Company Logo/Header - Dark background
  doc.rect(0, 0, doc.page.width, 80).fill('#991b1b'); // dark red
  
  doc.fontSize(20)
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .text('[Company]', 60, 25);
  
  doc.fontSize(14)
    .fillColor('#ffffff')
    .font('Helvetica')
    .text('Odoo India', 60, 50);

  // Title Section - Red background
  doc.rect(0, 80, doc.page.width, 50).fill(primaryColor);
  
  doc.fontSize(16)
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .text('Salary Statement Report', 60, 95);

  let yPos = 160;

  // Employee Information Section - Light background
  doc.rect(50, yPos, doc.page.width - 100, 140).fill(lightBg);
  
  yPos += 20;
  
  // Left column - Employee Name
  doc.fontSize(10)
    .fillColor('#1e293b')
    .font('Helvetica')
    .text('Employee Name', 70, yPos);
  
  doc.fontSize(10)
    .fillColor('#000000')
    .font('Helvetica')
    .text(employee.name, doc.page.width - 250, yPos, { width: 200, align: 'right' });
  
  // Right column - Date of Joining
  doc.fontSize(10)
    .fillColor('#dc2626')
    .font('Helvetica')
    .text('Date Of Joining', doc.page.width - 250, yPos, { width: 200, align: 'left' });
  
  yPos += 15;
  doc.fontSize(10)
    .fillColor('#000000')
    .text(formatDate(employee.dateOfJoining), doc.page.width - 250, yPos, { width: 200, align: 'right' });
  
  yPos += 10;
  
  // Designation
  doc.fontSize(10)
    .fillColor('#dc2626')
    .font('Helvetica')
    .text('Designation', 70, yPos);
  
  yPos += 15;
  doc.fontSize(10)
    .fillColor('#000000')
    .text(employee.designation, 70, yPos);
  
  // Salary Effective From
  doc.fontSize(10)
    .fillColor('#dc2626')
    .font('Helvetica')
    .text('Salary Effective From', doc.page.width - 250, yPos - 15, { width: 200, align: 'left' });
  
  yPos += 5;
  doc.fontSize(10)
    .fillColor('#000000')
    .text(salaryEffectiveDate, doc.page.width - 250, yPos, { width: 200, align: 'right' });

  yPos += 40;

  // Salary Components Section Header - Red background
  doc.rect(50, yPos, doc.page.width - 100, 30).fill(primaryColor);
  
  doc.fontSize(11)
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .text('Salary Components', 70, yPos + 10)
    .text('Monthly Amount', doc.page.width / 2 - 20, yPos + 10, { width: 120, align: 'center' })
    .text('Yearly Amount', doc.page.width - 220, yPos + 10, { width: 120, align: 'center' });

  yPos += 30;

  // Earnings Section Header
  doc.rect(50, yPos, doc.page.width - 100, 25).fill('#fca5a5'); // red-300
  
  doc.fontSize(10)
    .fillColor('#7f1d1d')
    .font('Helvetica-Bold')
    .text('Earnings', 70, yPos + 8);

  yPos += 25;

  // Earnings Content
  const earningsHeight = salaryComputation.earnings.length * 22 + 20;
  doc.rect(50, yPos, doc.page.width - 100, earningsHeight).fill('#ffffff').stroke('#dc2626');
  
  yPos += 12;
  doc.fontSize(9).fillColor('#1e293b').font('Helvetica');
  
  salaryComputation.earnings.forEach((earning) => {
    const monthlyAmount = earning.amount;
    const yearlyAmount = earning.amount * 12;
    
    doc.text(earning.ruleName, 70, yPos, { width: 200 })
      .text(formatCurrency(monthlyAmount), doc.page.width / 2 - 20, yPos, { width: 120, align: 'right' })
      .text(formatCurrency(yearlyAmount), doc.page.width - 220, yPos, { width: 120, align: 'right' });
    yPos += 22;
  });

  yPos += 10;

  // Deductions Section Header
  doc.rect(50, yPos, doc.page.width - 100, 25).fill('#fca5a5'); // red-300
  
  doc.fontSize(10)
    .fillColor('#7f1d1d')
    .font('Helvetica-Bold')
    .text('Deduction', 70, yPos + 8);

  yPos += 25;

  // Deductions Content
  const deductionsHeight = salaryComputation.deductions.length * 22 + 20;
  doc.rect(50, yPos, doc.page.width - 100, deductionsHeight).fill('#ffffff').stroke('#dc2626');
  
  yPos += 12;
  doc.fontSize(9).fillColor('#1e293b').font('Helvetica');
  
  salaryComputation.deductions.forEach((deduction) => {
    const monthlyAmount = Math.abs(deduction.amount);
    const yearlyAmount = Math.abs(deduction.amount) * 12;
    
    doc.text(deduction.ruleName, 70, yPos, { width: 200 })
      .text(formatCurrency(monthlyAmount), doc.page.width / 2 - 20, yPos, { width: 120, align: 'right' })
      .text(formatCurrency(yearlyAmount), doc.page.width - 220, yPos, { width: 120, align: 'right' });
    yPos += 22;
  });

  yPos += 15;

  // Net Salary Section - Red highlight
  doc.rect(50, yPos, doc.page.width - 100, 40).fill(primaryColor);
  
  doc.fontSize(12)
    .fillColor('#ffffff')
    .font('Helvetica-Bold')
    .text('Net Salary', 70, yPos + 12)
    .fontSize(14)
    .text(formatCurrency(salaryComputation.netAmount), doc.page.width - 220, yPos + 12, { width: 150, align: 'right' });

  yPos += 50;

  // Footer spacing
  doc.fontSize(9)
    .fillColor('#666666')
    .font('Helvetica')
    .text('This is a system generated document.', 50, yPos, { align: 'center', width: doc.page.width - 100 });

  return doc;
}

module.exports = { generatePayslipPDF };
