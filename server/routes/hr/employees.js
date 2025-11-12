const express = require('express');
const router = express.Router();
const empCtrl = require('../../controllers/hr/employeesController');
const { verifyToken, hrOnly } = require('../../middlewares/authMiddleware');

router.use(verifyToken, hrOnly);
router.get('/', empCtrl.list);
router.post('/', empCtrl.create);
router.get('/:id', empCtrl.get);
router.put('/:id', empCtrl.update);
router.delete('/:id', empCtrl.remove);

module.exports = router;

