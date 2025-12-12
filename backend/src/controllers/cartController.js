import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

export const getCart = async (req, res) => {
  try {
    const items = await CartItem.find({ user_id: req.user._id }).populate('product_id').lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const product = await Product.findById(product_id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let item = await CartItem.findOne({ user_id: req.user._id, product_id });
    if (item) {
      item.quantity += Number(quantity || 1);
      item.unit_price = product.price;
      await item.save();
    } else {
      item = await CartItem.create({ user_id: req.user._id, product_id, quantity: Number(quantity || 1), unit_price: product.price });
    }
    const populated = await CartItem.findById(item._id).populate('product_id').lean();
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = await CartItem.findById(id);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    if (!item.user_id.equals(req.user._id)) return res.status(403).json({ error: 'Not authorized' });
    item.quantity = Number(quantity || item.quantity);
    await item.save();
    const populated = await CartItem.findById(item._id).populate('product_id').lean();
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CartItem.findById(id);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });
    if (!item.user_id.equals(req.user._id)) return res.status(403).json({ error: 'Not authorized' });
    await item.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getCart, addToCart, updateCartItem, removeCartItem };
