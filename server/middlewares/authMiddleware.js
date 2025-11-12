const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// Verify JWT Token
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user ID to request
    
    // Find employee record for this user (if exists)
    const employee = await Employee.findOne({ userId: decoded.id });
    if (employee) {
      req.user.empId = employee._id;
      req.user.employeeId = employee.employeeId;
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

exports.adminOnly = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success:false, message:'Unauthorized' });
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Admin') return res.status(403).json({ success:false, message:'Forbidden: Admins only' });
    next();
  } catch (err) {
    return res.status(500).json({ success:false, message:'Server error' });
  }
};

exports.hrOnly = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success:false, message:'Unauthorized' });
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'HR') return res.status(403).json({ success:false, message:'Forbidden: HR only' });
    next();
  } catch (err) {
    return res.status(500).json({ success:false, message:'Server error' });
  }
};

// Allow multiple roles
exports.allowRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ success:false, message:'Unauthorized' });
      const user = await User.findById(req.user.id);
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          success:false, 
          message:`Forbidden: Only ${allowedRoles.join(', ')} allowed` 
        });
      }
      next();
    } catch (err) {
      return res.status(500).json({ success:false, message:'Server error' });
    }
  };
};
