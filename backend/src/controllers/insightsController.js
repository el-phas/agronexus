import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Farmer from '../models/Farmer.js';

export const getInsights = async (req, res) => {
  try {
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    const topProducts = await Product.find().sort({ rating: -1 }).limit(5).lean();

    const topSellers = await Product.aggregate([
      { $group: { _id: '$farmer_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'farmers', localField: '_id', foreignField: '_id', as: 'farmer' } },
      { $unwind: { path: '$farmer', preserveNullAndEmptyArrays: true } },
      { $project: { count: 1, farmer: { farm_name: 1, location: 1 } } }
    ]);

    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$total_amount' }, orders: { $sum: 1 } } },
    ]);
    const totalSales = totalSalesAgg[0] || { totalSales: 0, orders: 0 };

    res.json({ categoryCounts, topProducts, topSellers, totalSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { getInsights };
