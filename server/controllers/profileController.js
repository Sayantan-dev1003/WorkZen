const UserProfile = require('../models/UserProfile');
const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { success, error } = require('../utils/response');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user.id });
    
    // Create profile if it doesn't exist
    if (!profile) {
      profile = await UserProfile.create({
        userId: req.user.id,
        salaryInfo: {},
        privateInfo: {},
        skills: [],
        certifications: []
      });
    }
    
    // Fetch user details
    const userDetails = await User.findById(req.user.id).select('-password');
    
    // Fetch employee details if exists
    const employee = await Employee.findOne({ userId: req.user.id });
    
    success(res, { profile, user: userDetails, employee });
  } catch (err) {
    console.error('Get profile error:', err);
    error(res, 'Error fetching profile', 500);
  }
};

// Update salary info
exports.updateSalaryInfo = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      profile = await UserProfile.create({ userId: req.user.id });
    }
    
    // Update salary info
    profile.salaryInfo = {
      ...profile.salaryInfo,
      ...req.body,
      components: {
        ...profile.salaryInfo.components,
        ...req.body.components
      },
      pf: {
        ...profile.salaryInfo.pf,
        ...req.body.pf
      },
      tax: {
        ...profile.salaryInfo.tax,
        ...req.body.tax
      }
    };
    
    // Calculate salary components
    profile.calculateSalaryComponents();
    
    await profile.save();
    
    success(res, { profile, message: 'Salary info updated successfully' });
  } catch (err) {
    console.error('Update salary info error:', err);
    error(res, 'Error updating salary info', 500);
  }
};

// Update private info
exports.updatePrivateInfo = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      profile = await UserProfile.create({ userId: req.user.id });
    }
    
    // Update private info
    profile.privateInfo = {
      ...profile.privateInfo,
      ...req.body,
      bankDetails: {
        ...profile.privateInfo.bankDetails,
        ...req.body.bankDetails
      }
    };
    
    await profile.save();
    
    success(res, { profile, message: 'Private info updated successfully' });
  } catch (err) {
    console.error('Update private info error:', err);
    error(res, 'Error updating private info', 500);
  }
};

// Update resume (skills, certifications, about)
exports.updateResume = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      profile = await UserProfile.create({ userId: req.user.id });
    }
    
    const { skills, certifications, about } = req.body;
    
    if (skills !== undefined) profile.skills = skills;
    if (certifications !== undefined) profile.certifications = certifications;
    if (about !== undefined) profile.about = about;
    
    await profile.save();
    
    success(res, { profile, message: 'Resume updated successfully' });
  } catch (err) {
    console.error('Update resume error:', err);
    error(res, 'Error updating resume', 500);
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Validate input
    if (!oldPassword || !newPassword) {
      return error(res, 'Old password and new password are required', 400);
    }
    
    if (newPassword.length < 6) {
      return error(res, 'New password must be at least 6 characters long', 400);
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return error(res, 'User not found', 404);
    }
    
    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return error(res, 'Current password is incorrect', 400);
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    success(res, { message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    error(res, 'Error changing password', 500);
  }
};
