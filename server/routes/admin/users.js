const express = require('express');
const router = express.Router();
const usersCtrl = require('../../controllers/admin/usersController');
const { verifyToken, adminOnly } = require('../../middlewares/authMiddleware');

router.use(verifyToken, adminOnly);
router.get('/', usersCtrl.list);
router.put('/:id/role', usersCtrl.updateRole);

module.exports = router;
