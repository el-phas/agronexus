import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Farmer from '../models/Farmer.js';
import OrderItem from '../models/OrderItem.js';
import Task from '../models/Task.js';
import Review from '../models/Review.js';

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

    // Personalized tips for authenticated farmers
    let personalized = { tips: [] };
    if (req.user) {
      const farmer = await Farmer.findOne({ user_id: req.user._id }).lean();
      if (farmer) {
        // Derive categories from farmer's products
        const categories = await Product.distinct('category', { farmer_id: farmer._id });
        const baseTips = [];
        if (!categories || categories.length === 0) {
          baseTips.push('Consider listing your first product with complete details to attract buyers.');
        } else {
          // Static map of example category tips
          const categoryTips = {
            tomato: ['Reduce watering during heavy rains to minimise cracking.', 'Harvest in the morning to reduce heat stress.'],
            maize: ['Consider split application of nitrogen fertilizer.', 'Monitor for stemborers after the rains.'],
            dairy: ['Increase feed during lactation to support milk production.'],
          };
          categories.slice(0,3).forEach((cat) => {
            const c = (cat || '').toLowerCase();
            if (categoryTips[c]) baseTips.push(...categoryTips[c]);
          });
        }
        // generic tips
        baseTips.push('Ensure proper storage and packaging to reduce post-harvest losses.');
        personalized.tips = Array.from(new Set(baseTips)).slice(0, 8);
        personalized.farmer = { farm_name: farmer.farm_name, location: farmer.location };
      }
    }

    // Weather driven insights: attempt to use a backend weather service when configured
    let weatherInsights = { irrigation: [], heatStress: [], frostProtection: [], sprayOptimization: [] };
    try {
      if (process.env.WEATHER_API_KEY && req.user) {
        // Placeholder: If you have a proper weather service, call it here and provide real analysis
        // For now we emit a static suggestion if the API key exists
        weatherInsights.irrigation.push('Upcoming rain expected — consider reducing irrigation tomorrow.');
        weatherInsights.heatStress.push('Temperatures rising during the day — provide shade for heat-sensitive crops.');
      }
    } catch (e) {
      // Ignore weather failures
    }

    // Market Trends: compute average price per category and best-selling products (global)
    const priceAgg = await OrderItem.aggregate([
      { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: '$product.category', avgPrice: { $avg: '$unit_price' }, lastPrice: { $last: '$unit_price' }, count: { $sum: '$quantity' } } },
      { $project: { category: '$_id', avgPrice: 1, lastPrice: 1, count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    const salesWindow = new Date();
    salesWindow.setDate(salesWindow.getDate() - 30);
    const bestSelling = await OrderItem.aggregate([
      { $lookup: { from: 'orders', localField: 'order_id', foreignField: '_id', as: 'order' } },
      { $unwind: { path: '$order', preserveNullAndEmptyArrays: false } },
      { $match: { 'order.createdAt': { $gte: salesWindow } } },
      { $group: { _id: '$product_id', sold: { $sum: '$quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { sold: 1, product: { name: '$product.name', price: '$product.price', category: '$product.category' } } }
    ]);

    // Soil & Crop Health Alerts — quick scan of recent review comments for keywords
    const reviewAlerts = [];
    const recentReviews = await Review.find().sort({ createdAt: -1 }).limit(100).lean();
    const keywords = ['yellow leaves', 'nutrient deficiency', 'stunted', 'pest', 'fall armyworm', 'blight'];
    recentReviews.forEach((r) => {
      if (!r.comment) return;
      const c = r.comment.toLowerCase();
      for (const kw of keywords) {
        if (c.includes(kw)) {
          reviewAlerts.push({ product_id: r.product_id, snippet: r.comment, keyword: kw });
          break;
        }
      }
    });

    // Seasonal recommendations: basic heuristics based on month
    const month = new Date().getMonth() + 1; // 1-12
    const seasonal = {
      recommendations: [],
      pests: [],
      harvestTiming: [],
    };
    if ([3,4,5].includes(month)) {
      seasonal.recommendations.push('Long rains season — consider early planting of maize and planting legumes for cover');
      seasonal.pests.push('Rust and fungal diseases more likely; monitor closely');
    } else if ([10,11,12].includes(month)) {
      seasonal.recommendations.push('Short rains season — ideal for quick-maturing vegetables');
      seasonal.pests.push('Fall armyworm may be active — monitor fields');
    } else {
      seasonal.recommendations.push('Dry season — focus on irrigation and water-conservation practices like mulching');
    }

    // Activity reminders — tasks due within a week
    let activityReminders = [];
    if (req.user) {
      const farmer = await Farmer.findOne({ user_id: req.user._id }).lean();
      if (farmer) {
        const now = new Date();
        const inAWeek = new Date();
        inAWeek.setDate(now.getDate() + 7);
        const tasks = await Task.find({ farmer_id: farmer._id, due_date: { $gte: now, $lte: inAWeek }, completed: false }).lean();
        activityReminders = tasks.map((t) => ({ title: t.title, due_date: t.due_date }));
      }
    }

    // AI-curated news & resources — placeholder static entries
    const curatedNews = [
      { title: 'Government announces subsidy for smallholder seeds', summary: 'Reduced seed prices for smallholders.', source: 'Ministry of Agriculture', publishedAt: new Date() },
      { title: 'New irrigation technology gains traction', summary: 'Low-cost drip kits enable water saving.', source: 'AgTech News', publishedAt: new Date() },
    ];
    const learningResources = [
      { title: 'Top 5 ways to boost tomato yield', type: 'article', url: '#' },
      { title: 'Best drip irrigation methods', type: 'video', url: '#' },
      { title: 'How to prevent fall armyworm', type: 'guide', url: '#' },
    ];

    // Community recommendations: top comments or tips from reviews
    const community = recentReviews.slice(0, 5).map((r) => ({ product_id: r.product_id, snippet: r.comment }));

    // AI productivity & business insights: simple heuristics
    const productivity = [];
    if (personalized.tips && personalized.tips.length) {
      productivity.push({ suggestion: 'Mulching could reduce water loss by ~30%', rationale: 'Recommended for regions with variable rains' });
    }
    const business = {
      avgPrices: priceAgg,
      bestSelling,
      recommendations: [],
    };
    // Add simple ROI suggestion
    if (Array.isArray(bestSelling) && bestSelling.length > 0) {
      business.recommendations.push('Consider focusing on higher-margin, best-selling products during peak demand periods.');
    }

    // Alerts & Warnings: combine data
    const alerts = [];
    if (reviewAlerts.length) alerts.push({ type: 'crop_health', items: reviewAlerts.slice(0, 5) });
    if ((bestSelling || []).length && (bestSelling[0].sold || 0) < 2) alerts.push({ type: 'low_sales_warning', message: 'Sales are low for your products this month' });

    res.json({
      categoryCounts,
      topProducts,
      topSellers,
      totalSales,
      personalized,
      weatherInsights,
      market: { priceAgg, bestSelling },
      soilCropAlerts: reviewAlerts,
      seasonal,
      activityReminders,
      curatedNews,
      learningResources,
      community,
      productivity,
      business,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { getInsights };
