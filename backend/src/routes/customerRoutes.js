const express = require('express');
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, customerController.getAll);
router.get('/:id', authenticateToken, customerController.getById);

module.exports = router;
