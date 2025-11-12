require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Employee = require('./models/Employee');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workzen');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

/**
 * Get existing users and employees
 */
async function getExistingUsersAndEmployees() {
  console.log('👥 Finding existing users...');

  const userEmails = [
    'sayantanhalder78@gmail.com',    // Sayantan Halder (Admin)
    'nirmaljoshi123456789@gmail.com', // Nirmal Joshi (Employee)
    'prithraj120@gmail.com',          // Prithviraj Verma (HR)
    'cpeaceful28@gmail.com'           // Chandan Bishoyi (Payroll Officer) - corrected typo
  ];

  const users = await User.find({
    email: { $in: userEmails }
  });

  if (users.length === 0) {
    console.log('❌ No users found. Please ensure users are logged in and exist in the database.');
    process.exit(1);
  }

  console.log(`✓ Found ${users.length} users`);

  const userMap = new Map();
  for (const user of users) {
    let employee = await Employee.findOne({ userId: user._id });
    
    // Create employee record if it doesn't exist
    if (!employee) {
      console.log(`   ℹ Creating employee record for ${user.name}...`);
      employee = await Employee.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        salary: 50000, // Default salary
        department: user.role === 'Admin' ? 'Administration' : 
                   user.role === 'HR' ? 'Human Resources' :
                   user.role === 'PayrollOfficer' ? 'Finance' : 'General',
        designation: user.role === 'Admin' ? 'System Administrator' :
                    user.role === 'HR' ? 'HR Manager' :
                    user.role === 'PayrollOfficer' ? 'Payroll Officer' : 'Employee',
        joiningDate: new Date(2025, 0, 1),
        status: 'Present'
      });
      console.log(`   ✓ Created employee record: ${employee.employeeId}`);
    }
    
    userMap.set(user.email, { user, employee });
    console.log(`   - ${user.name} (${user.role}) - Employee ID: ${employee.employeeId} - Salary: ₹${employee.salary}`);
  }

  return userMap;
}

/**
 * Generate attendance for October 2025
 * Working days in October 2025: 23 days (excluding weekends)
 * 
 * User attendance patterns:
 * - Sayantan Halder (Admin): 20 present, 2 paid leaves, 1 sick leave (absent)
 * - Nirmal Joshi (Employee): 18 present, 3 paid leaves, 2 unpaid leaves (absent)
 * - Pritviraj Verma (HR): 22 present, 1 paid leave
 * - Chandan Bishoyi (Payroll Officer): 19 present, 2 paid leaves, 2 sick leaves (absent)
 */
async function seedAttendance() {
  try {
    console.log('🌱 Starting attendance seeding for October 2025...\n');

    // Get existing users and employees
    const userMap = await getExistingUsersAndEmployees();

    // Clear existing October 2025 attendance
    const octStart = new Date(2025, 9, 1); // October 1, 2025
    const octEnd = new Date(2025, 9, 31, 23, 59, 59); // October 31, 2025
    
    const deleteCount = await Attendance.deleteMany({
      date: { $gte: octStart, $lte: octEnd }
    });
    console.log(`\n🗑️  Cleared ${deleteCount.deletedCount} existing October 2025 attendance records`);

    // Generate all working days in October 2025 (excluding weekends)
    const workingDays = [];
    for (let day = 1; day <= 31; day++) {
      const date = new Date(2025, 9, day); // October is month 9 (0-indexed)
      const dayOfWeek = date.getDay();
      // Only Monday to Friday (1-5)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays.push(day);
      }
    }

    console.log(`\n📅 October 2025 has ${workingDays.length} working days (Mon-Fri)`);

    // Define attendance patterns for each user
    const attendancePatterns = {
      'sayantanhalder78@gmail.com': {
        name: 'Sayantan Halder (Admin)',
        present: 20,
        paidLeave: 2,
        sickLeave: 1, // marked as absent
        unpaidLeave: 0
      },
      'nirmaljoshi123456789@gmail.com': {
        name: 'Nirmal Joshi (Employee)',
        present: 18,
        paidLeave: 3,
        sickLeave: 0,
        unpaidLeave: 2 // marked as absent
      },
      'prithraj120@gmail.com': {
        name: 'Prithviraj Verma (HR)',
        present: 22,
        paidLeave: 1,
        sickLeave: 0,
        unpaidLeave: 0
      },
      'cpeaceful28@gmail.com': {
        name: 'Chandan Bishoyi (Payroll Officer)',
        present: 19,
        paidLeave: 2,
        sickLeave: 2, // marked as absent
        unpaidLeave: 0
      }
    };

    const attendanceRecords = [];

    // Generate attendance for each user
    for (const [email, userData] of userMap.entries()) {
      const { user, employee } = userData;
      const pattern = attendancePatterns[email];

      if (!pattern) {
        console.log(`⚠️  No attendance pattern defined for ${email}`);
        continue;
      }

      if (!employee) {
        console.log(`⚠️  Skipping ${user.name} - no employee record found`);
        continue;
      }

      console.log(`\n👤 Generating attendance for ${pattern.name}:`);

      // Shuffle working days to randomize attendance
      const shuffledDays = [...workingDays].sort(() => Math.random() - 0.5);
      
      let dayIndex = 0;
      
      // Present days
      for (let i = 0; i < pattern.present; i++) {
        const day = shuffledDays[dayIndex++];
        const date = new Date(2025, 9, day, 9, 0, 0); // 9 AM check-in
        const checkOut = new Date(2025, 9, day, 18, 0, 0); // 6 PM check-out
        
        attendanceRecords.push({
          userId: user._id,
          empId: employee._id,
          date: date,
          checkIn: date,
          checkOut: checkOut,
          status: 'present'
        });
      }
      console.log(`   ✓ ${pattern.present} present days`);

      // Paid leave days
      for (let i = 0; i < pattern.paidLeave; i++) {
        const day = shuffledDays[dayIndex++];
        const date = new Date(2025, 9, day, 0, 0, 0);
        
        attendanceRecords.push({
          userId: user._id,
          empId: employee._id,
          date: date,
          status: 'leave'
        });
      }
      console.log(`   ✓ ${pattern.paidLeave} paid leave days`);

      // Sick leave days (marked as absent)
      for (let i = 0; i < pattern.sickLeave; i++) {
        const day = shuffledDays[dayIndex++];
        const date = new Date(2025, 9, day, 0, 0, 0);
        
        attendanceRecords.push({
          userId: user._id,
          empId: employee._id,
          date: date,
          status: 'absent'
        });
      }
      console.log(`   ✓ ${pattern.sickLeave} sick leave days (absent)`);

      // Unpaid leave days (marked as absent)
      for (let i = 0; i < pattern.unpaidLeave; i++) {
        const day = shuffledDays[dayIndex++];
        const date = new Date(2025, 9, day, 0, 0, 0);
        
        attendanceRecords.push({
          userId: user._id,
          empId: employee._id,
          date: date,
          status: 'absent'
        });
      }
      console.log(`   ✓ ${pattern.unpaidLeave} unpaid leave days (absent)`);

      const totalMarked = pattern.present + pattern.paidLeave + pattern.sickLeave + pattern.unpaidLeave;
      const paidDays = pattern.present + pattern.paidLeave;
      console.log(`   📊 Total: ${totalMarked}/${workingDays.length} days marked, ${paidDays} paid days`);
    }

    // Insert all attendance records
    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`\n✅ Successfully seeded ${attendanceRecords.length} attendance records for October 2025`);
    } else {
      console.log('\n⚠️  No attendance records to seed');
    }

    // Show summary
    console.log('\n📊 Attendance Summary for October 2025:');
    for (const [email, pattern] of Object.entries(attendancePatterns)) {
      const paidDays = pattern.present + pattern.paidLeave;
      console.log(`   ${pattern.name}: ${paidDays} paid days (${pattern.present} present + ${pattern.paidLeave} leave)`);
    }

  } catch (error) {
    console.error('❌ Error seeding attendance:', error);
  }
}

// Run the seed
connectDB().then(async () => {
  await seedAttendance();
  console.log('\n✨ Seeding complete!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
