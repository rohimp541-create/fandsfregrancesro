const express = require('express');
const Setting = require('./Setting');
const { authenticateToken } = require('./authMiddleware');
const { asyncHandler } = require('./errorHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const settings = await Setting.getAll();
  res.json({ success: true, data: settings });
}));

router.put('/', authenticateToken, asyncHandler(async (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, message: 'Settings object is required.' });
  }

  for (const [key, val] of Object.entries(settings)) {
    await Setting.set(key, String(val));
  }

  const updatedSettings = await Setting.getAll();

  // Notify clients in real-time
  const io = req.app.get('io');
  if (io) {
    io.emit('settings:updated', updatedSettings);
  }

  res.json({ success: true, data: updatedSettings });
}));

module.exports = router;
