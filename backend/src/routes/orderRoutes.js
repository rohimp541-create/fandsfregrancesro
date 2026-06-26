const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', orderController.create);
router.get('/', authenticateToken, orderController.getAll);
router.get('/:id', authenticateToken, orderController.getById);
router.patch('/:id/status', authenticateToken, orderController.updateStatus);
router.delete('/:id', authenticateToken, orderController.delete);

module.exports = router;
