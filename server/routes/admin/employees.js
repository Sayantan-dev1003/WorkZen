const express = require('express');
const router = express.Router();
const empCtrl = require('../../controllers/admin/employeesController');
const { verifyToken, allowRoles } = require('../../middlewares/authMiddleware');

// Allow Admin and PayrollOfficer to access employee data
router.use(verifyToken, allowRoles('Admin', 'PayrollOfficer'));
router.get('/', empCtrl.list);
router.post('/', empCtrl.create);
router.get('/:id', empCtrl.get);
router.put('/:id', empCtrl.update);
router.delete('/:id', empCtrl.remove);

module.exports = router;
