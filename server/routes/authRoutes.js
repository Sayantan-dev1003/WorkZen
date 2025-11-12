const express = require('express');
const router = express.Router();
const { registerAdmin, loginUser } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', registerAdmin);

// POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;
