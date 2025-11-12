require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/workzen')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    const users = await User.find({});
    console.log(`Found ${users.length} users:\n`);
    
    for (const user of users) {
      const employee = await Employee.findOne({ userId: user._id });
      console.log(`📧 ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Employee: ${employee ? `Yes (${employee.employeeId})` : 'No'}`);
      console.log('');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
