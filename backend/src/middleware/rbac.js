import { User } from '../models/index.js';

export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user || !roles.includes(user.user_type)) return res.status(403).json({ error: 'Insufficient permissions' });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default requireRole;
