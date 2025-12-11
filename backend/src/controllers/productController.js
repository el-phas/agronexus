import { Product, Farmer, Review } from '../models/index.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, q } = req.query;
    const offset = (page - 1) * limit;

    const filter = {};
    if (category) filter.category = category;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [ { name: regex }, { description: regex } ];
    }

    const total = await Product.countDocuments(filter);
    const rows = await Product.find(filter)
      .populate('farmer_id', 'farm_name location')
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    res.json({ results: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer_id').lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const reviews = await Review.find({ product_id: product._id }).select('rating comment createdAt').lean();
    res.json({ ...product, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, unit, available_quantity, image_url, is_organic } = req.body;
    if (!req.user || !name || !price) return res.status(400).json({ error: 'Missing required fields' });

    const farmer = await Farmer.findOne({ user_id: req.user.id });
    if (!farmer) return res.status(403).json({ error: 'Only farmers can create products' });

    const product = await Product.create({ farmer_id: farmer._id, name, description, category, price, unit, available_quantity, image_url, is_organic: is_organic || false });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const farmer = await Farmer.findOne({ user_id: req.user.id });
    if (String(product.farmer_id) !== String(farmer._id)) return res.status(403).json({ error: 'Not authorized' });

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const farmer = await Farmer.findOne({ user_id: req.user.id });
    if (String(product.farmer_id) !== String(farmer._id)) return res.status(403).json({ error: 'Not authorized' });

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
