const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(verifyToken);

// Get user profile
router.get('/', profileController.getProfile);

// Update salary info
router.put('/salary', profileController.updateSalaryInfo);

// Update private info
router.put('/private', profileController.updatePrivateInfo);

// Update resume
router.put('/resume', profileController.updateResume);

// Change password
router.put('/change-password', profileController.changePassword);

module.exports = router;
