const User = require('../../models/User');
const { success, error } = require('../../utils/response');

/**
 * Users Controller - Admin operations for user management
 */

/**
 * Update user role
 */
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['Admin', 'HR', 'PayrollOfficer', 'Employee'];
    if (!role || !validRoles.includes(role)) {
      return error(res, 'Invalid role. Must be one of: Admin, HR, PayrollOfficer, Employee', 400);
    }

    // Find and update user
    const user = await User.findById(id);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    // Update role
    user.role = role;
    await user.save();

    return success(res, { 
      message: 'Role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginId: user.loginId
      }
    });
  } catch (err) {
    console.error('Update role error:', err);
    return error(res, err.message, 500);
  }
};

/**
 * Get all users
 */
exports.list = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return success(res, { users });
  } catch (err) {
    console.error('List users error:', err);
    return error(res, err.message, 500);
  }
};
