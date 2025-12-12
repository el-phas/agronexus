import { Farmer, User, Product, Order } from '../models/index.js';

export const getFarmers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = {};
    const total = await Farmer.countDocuments(query);
    const rows = await Farmer.find(query).skip(offset).limit(parseInt(limit)).lean();
    res.json({ results: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).lean();
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

    if (farmer.user_id.toString() !== req.user._id.toString()) {
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
    const products = await Product.find({ farmer_id: req.params.id }).lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user_id: req.user._id });
    if (!farmer) {
      return res.status(403).json({ error: 'Only farmers can access dashboard' });
    }
    const products = await Product.countDocuments({ farmer_id: farmer._id });

    // Total revenue and active orders for this farmer (orders where seller_id matches the farmer's user)
    const totalRevenueAgg = await Order.aggregate([
      { $match: { seller_id: farmer.user_id } },
      { $group: { _id: null, totalRevenue: { $sum: '$total_amount' }, activeOrders: { $sum: { $cond: [{ $in: ['$status', ['delivered','completed','cancelled','refunded']] }, 0, 1] } } } }
    ]);
    const totalRevenue = (totalRevenueAgg[0] && totalRevenueAgg[0].totalRevenue) || 0;
    const activeOrders = (totalRevenueAgg[0] && totalRevenueAgg[0].activeOrders) || 0;
    const buyersUnique = await Order.distinct('buyer_id', { seller_id: farmer.user_id });
    const buyers = Array.isArray(buyersUnique) ? buyersUnique.length : 0;

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
