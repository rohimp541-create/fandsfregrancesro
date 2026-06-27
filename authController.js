const jwt = require('jsonwebtoken');
const Admin = require('./Admin');
const config = require('./env');
const { asyncHandler } = require('./errorHandler');

const authController = {
  login: asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isValid = await Admin.verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: { id: admin.id, username: admin.username },
      },
    });
  }),

  verify: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: { admin: req.admin },
    });
  }),
};

module.exports = authController;
