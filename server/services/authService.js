const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

/**
 * Auth Service - Business logic for authentication
 */
class AuthService {
  /**
   * Generate Login ID in format: OIJODO20220001
   * OI = Odoo India (company code)
   * JO = First 2 letters of first name
   * DO = First 2 letters of last name
   * 2022 = Joining year
   * 0001 = Serial number
   */
  async generateLoginId(fullName, year) {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts[nameParts.length - 1] || '';
    
    // Get first 2 letters of each name (uppercase)
    const firstInitials = firstName.substring(0, 2).toUpperCase().padEnd(2, 'O');
    const lastInitials = lastName.substring(0, 2).toUpperCase().padEnd(2, 'O');
    
    // Company code (fixed for Odoo India)
    const companyCode = 'OI';
    
    // Count existing users for this year to get serial number
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);
    
    const count = await User.countDocuments({
      joiningYear: year,
      loginId: { $exists: true }
    });
    
    const serialNumber = String(count + 1).padStart(4, '0');
    
    // Format: OIJODO20220001
    return `${companyCode}${firstInitials}${lastInitials}${year}${serialNumber}`;
  }

  /**
   * Register a new user (Admin only)
   */
  async register(userData) {
    const { email, password, name, phone } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Registration is only for Admin users
    const role = 'Admin';

    // Generate Login ID
    const joiningYear = new Date().getFullYear();
    const loginId = await this.generateLoginId(name, joiningYear);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      loginId,
      joiningYear,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loginId: user.loginId,
      },
      token: generateToken(user._id),
    };
  }

  /**
   * Login user (accepts email or loginId)
   */
  async login(credentials) {
    const { email, password } = credentials;

    console.log('Login attempt with:', email);

    // Find user by email or loginId
    const user = await User.findOne({
      $or: [{ email }, { loginId: email }]
    });
    
    console.log('User found:', user ? `Yes - ${user.email} (LoginID: ${user.loginId})` : 'No');
    
    if (!user) {
      console.log('User not found:', email);
      throw new Error('Invalid credentials');
    }

    console.log('User found:', { id: user._id, email: user.email, hasPassword: !!user.password });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      throw new Error('Invalid credentials');
    }

    console.log('Login successful for user:', email);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loginId: user.loginId,
      },
      token: generateToken(user._id),
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

module.exports = new AuthService();
