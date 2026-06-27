const jwt = require('jsonwebtoken');
const config = require('./env');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.admin = decoded;
    next();
  } catch {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

module.exports = { authenticateToken };
