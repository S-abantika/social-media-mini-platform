const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'connectly_secret_fallback_2026',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
