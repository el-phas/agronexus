import { User } from '../models/index.js';

export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      // `User` is a Mongoose model; use findById
      const user = await User.findById(req.user.id).lean();
      if (!user || !roles.includes(user.user_type)) return res.status(403).json({ error: 'Insufficient permissions' });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default requireRole;
