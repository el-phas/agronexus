import { Product, Farmer, Review } from '../models/index.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, q } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (q) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${q}%` } },
        { description: { [require('sequelize').Op.like]: `%${q}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Farmer, attributes: ['farm_name', 'location'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ 
      results: rows, 
      total: count, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Farmer, attributes: ['id', 'farm_name', 'location', 'rating'] },
        { model: Review, attributes: ['id', 'rating', 'comment', 'createdAt'] }
      ]
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, unit, available_quantity, image_url, is_organic } = req.body;
    
    if (!req.user || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const farmer = await Farmer.findOne({ where: { user_id: req.user.id } });
    if (!farmer) {
      return res.status(403).json({ error: 'Only farmers can create products' });
    }

    const product = await Product.create({
      farmer_id: farmer.id,
      name,
      description,
      category,
      price,
      unit,
      available_quantity,
      image_url,
      is_organic: is_organic || false,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const farmer = await Farmer.findOne({ where: { user_id: req.user.id } });
    if (product.farmer_id !== farmer.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const farmer = await Farmer.findOne({ where: { user_id: req.user.id } });
    if (product.farmer_id !== farmer.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
