const express = require('express');
const authController = require('./authController');
const { authenticateToken } = require('./authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.get('/verify', authenticateToken, authController.verify);

module.exports = router;
