import { Farmer, User, Product } from '../models/index.js';

export const getFarmers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Farmer.findAndCountAll({
      include: [{ model: User, attributes: ['id', 'username', 'email', 'first_name', 'last_name'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ results: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username', 'email', 'first_name', 'last_name'] }]
    });
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findByPk(req.params.id);
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

    if (farmer.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await farmer.update(req.body);
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { farmer_id: req.params.id }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ where: { user_id: req.user.id } });
    if (!farmer) {
      return res.status(403).json({ error: 'Only farmers can access dashboard' });
    }

    const products = await Product.count({ where: { farmer_id: farmer.id } });
    const totalRevenue = 50000; // Mock for now
    const activeOrders = 12; // Mock for now
    const buyers = 156; // Mock for now

    res.json([
      { title: 'Total Revenue', value: 'KES ' + totalRevenue, change: '+12.5%', trend: 'up' },
      { title: 'Active Orders', value: activeOrders.toString(), change: '+3', trend: 'up' },
      { title: 'Products Listed', value: products.toString(), change: '-2', trend: 'down' },
      { title: 'Total Buyers', value: buyers.toString(), change: '+28', trend: 'up' }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
