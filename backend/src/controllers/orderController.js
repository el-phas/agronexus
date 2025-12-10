import { Order, OrderItem, Product, User } from '../models/index.js';
import sequelize from '../config/database.js';

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
  const transaction = await sequelize.transaction();
  try {
    const { items, delivery_address, delivery_notes } = req.body;
    const buyerId = req.user.id;

    if (!items || items.length === 0 || !delivery_address) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Missing required fields: items, delivery_address' });
    }

    // Validate products and stock
    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }
      if (product.available_quantity < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: `Product "${product.name}" only has ${product.available_quantity} available` });
      }
    }

    // Calculate total
    let totalAmount = 0;
    const sellerId = items[0].seller_id;
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price;
    }

    const order = await Order.create({ buyer_id: buyerId, seller_id: sellerId, total_amount: totalAmount, status: 'pending-payment', payment_status: 'not-initiated', delivery_address, delivery_notes, expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, { transaction });

    for (const item of items) {
      await OrderItem.create({ order_id: order.id, product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price, subtotal: item.quantity * item.unit_price }, { transaction });
      await Product.decrement('available_quantity', { by: item.quantity, where: { id: item.product_id }, transaction });
    }

    await transaction.commit();
    res.status(201).json({ id: order.id, total_amount: order.total_amount, status: order.status, payment_status: order.payment_status, message: 'Order created. Proceed to payment.' });
  } catch (error) {
    await transaction.rollback();
    console.error('createOrder error', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const validStatuses = ['processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByPk(orderId, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.seller_id !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Only seller can update order status' });
    }

    const statusOrder = ['pending-payment', 'payment-confirmed', 'processing', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);
    if (newIndex <= currentIndex) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cannot move order backwards in status' });
    }

    await order.update({ status }, { transaction });
    await transaction.commit();
    res.json(order);
  } catch (error) {
    await transaction.rollback();
    console.error('updateOrderStatus error', error);
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
