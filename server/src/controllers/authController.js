const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password, confirmPassword, department } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, username, email, and password.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // Check if username or email already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken. Please choose another one.'
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered. Please log in.'
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      department: department || 'Computer Science'
    });

    const token = generateToken(user._id, user.role);

    const safeUser = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginId = identifier || email || username;

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email or username and password.'
      });
    }

    const trimmedId = String(loginId).trim();
    const query = trimmedId.includes('@')
      ? { email: trimmedId.toLowerCase() }
      : { username: trimmedId.toLowerCase() };

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const token = generateToken(user._id, user.role);
    const safeUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
