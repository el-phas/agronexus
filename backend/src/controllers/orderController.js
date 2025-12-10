import { Order, OrderItem, Product, User } from '../models/index.js';

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      [require('sequelize').Op.or]: [
        { buyer_id: req.user.id },
        { seller_id: req.user.id }
      ]
    };
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'Buyer', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'Seller', attributes: ['id', 'username', 'email'] },
        { model: OrderItem, include: [{ model: Product }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ results: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Buyer' },
        { model: User, as: 'Seller' },
        { model: OrderItem, include: [{ model: Product }] }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, seller_id, total_amount } = req.body;

    if (!items || !seller_id || !total_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await Order.create({
      buyer_id: req.user.id,
      seller_id,
      total_amount,
      status: 'pending',
    });

    for (const item of items) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Only seller can update order status' });
    }

    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { seller_id: req.user.id },
      include: [
        { model: User, as: 'Buyer', attributes: ['username', 'email'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['name'] }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    const formatted = orders.map(o => ({
      id: 'ORD-' + String(o.id).padStart(3, '0'),
      buyer: o.Buyer.username,
      product: o.OrderItems[0]?.Product?.name || 'N/A',
      quantity: o.OrderItems[0]?.quantity || 0,
      amount: 'KES ' + o.total_amount,
      status: o.status,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
