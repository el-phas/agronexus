import jwt from 'jsonwebtoken';
import { User, Farmer } from '../models/index.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, user_type, first_name, last_name } = req.body;
    
    if (!username || !email || !password || !user_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      user_type,
      first_name,
      last_name,
    });

    // If farmer, create farmer profile
    if (user_type === 'farmer') {
      await Farmer.create({
        user_id: user.id,
        location: '',
        farm_name: username,
      });
    }

    const token = generateToken(user.id);
    res.status(201).json({ 
      user: { id: user.id, username: user.username, email: user.email, user_type: user.user_type },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken(user.id);
    res.json({ 
      user: { id: user.id, username: user.username, email: user.email, user_type: user.user_type },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  res.json({ message: 'Logged out' });
};
