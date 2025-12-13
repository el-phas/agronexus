import jwt from 'jsonwebtoken';
import { User, Farmer } from '../models/index.js';

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

export const register = async (req, res) => {
  try {
    let { username, email, password, user_type, first_name, last_name, farm_name, location } = req.body || {};

    // Basic sanitization
    username = typeof username === 'string' ? username.trim() : '';
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    farm_name = typeof farm_name === 'string' ? farm_name.trim() : '';
    location = typeof location === 'string' ? location.trim() : '';

    if (!username || !email || !password || !user_type) return res.status(400).json({ error: 'Missing required fields: username, email, password, user_type' });

    // If registering as farmer, require farm_name and location for better onboarding
    if (user_type === 'farmer' && (!farm_name || !location)) {
      return res.status(400).json({ error: 'Farmer registration requires farm_name and location' });
    }

    const user = await User.create({ username, email, password, user_type, first_name, last_name });

    if (user_type === 'farmer') {
      await Farmer.create({ user_id: user._id, location: location || '', farm_name: farm_name || username });
    }

    const token = generateToken(user._id);
    // Set HttpOnly secure cookie for session token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    };
    res.cookie('agronexus_token', token, cookieOptions);
    res.status(201).json({ user: { id: user._id, username: user.username, email: user.email, user_type: user.user_type }, token });
  } catch (error) {
    // Duplicate key error
    if (error && error.code === 11000) {
      const dupKey = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(409).json({ error: `${dupKey} already exists` });
    }
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = generateToken(user._id);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
    res.cookie('agronexus_token', token, cookieOptions);
    res.json({ user: { id: user._id, username: user.username, email: user.email, user_type: user.user_type }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('agronexus_token');
  res.json({ message: 'Logged out' });
};
