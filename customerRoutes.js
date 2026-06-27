const express = require('express');
const customerController = require('./customerController');
const { authenticateToken } = require('./authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, customerController.getAll);
router.get('/:id', authenticateToken, customerController.getById);

module.exports = router;
