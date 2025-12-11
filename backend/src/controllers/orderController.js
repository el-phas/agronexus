import { Order, OrderItem, Product, User } from '../models/index.js';

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const filter = {
      $or: [ { buyer_id: req.user.id }, { seller_id: req.user.id } ]
    };
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const rows = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('buyer_id', 'username email')
      .populate('seller_id', 'username email')
      .lean();

    // Attach order items and product info
    const orderIds = rows.map(r => r._id);
    const items = await OrderItem.find({ order_id: { $in: orderIds } }).populate('product_id').lean();
    const itemsByOrder = items.reduce((acc, it) => {
      acc[String(it.order_id)] = acc[String(it.order_id)] || [];
      acc[String(it.order_id)].push(it);
      return acc;
    }, {});

    const results = rows.map(r => ({ ...r, items: itemsByOrder[String(r._id)] || [] }));
    res.json({ results, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('buyer_id seller_id').lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.buyer_id._id || order.buyer_id) !== String(req.user.id) && String(order.seller_id._id || order.seller_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const items = await OrderItem.find({ order_id: order._id }).populate('product_id').lean();
    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  try {
    const { items, delivery_address, delivery_notes } = req.body;
    const buyerId = req.user.id;

    if (!items || items.length === 0 || !delivery_address) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Missing required fields: items, delivery_address' });
    }

    // Validate products and stock
    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }
      if (product.available_quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Product "${product.name}" only has ${product.available_quantity} available` });
      }
    }

    // Calculate total
    let totalAmount = 0;
    const sellerId = items[0].seller_id;
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price;
    }

    const order = await Order.create([{ buyer_id: buyerId, seller_id: sellerId, total_amount: totalAmount, status: 'pending-payment', payment_status: 'not-initiated', delivery_address, delivery_notes, expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }], { session });
    const createdOrder = order[0];

    for (const item of items) {
      await OrderItem.create([{ order_id: createdOrder._id, product_id: item.product_id, quantity: item.quantity, unit_price: item.unit_price, subtotal: item.quantity * item.unit_price }], { session });
      await Product.updateOne({ _id: item.product_id }, { $inc: { available_quantity: -item.quantity } }).session(session);
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ id: createdOrder._id, total_amount: createdOrder.total_amount, status: createdOrder.status, payment_status: createdOrder.payment_status, message: 'Order created. Proceed to payment.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('createOrder error', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const validStatuses = ['processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Order not found' });
    }
    if (String(order.seller_id) !== String(req.user.id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: 'Only seller can update order status' });
    }

    const statusOrder = ['pending-payment', 'payment-confirmed', 'processing', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);
    if (newIndex <= currentIndex) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Cannot move order backwards in status' });
    }

    order.status = status;
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('updateOrderStatus error', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller_id: req.user.id }).sort({ createdAt: -1 }).limit(5).populate('buyer_id').lean();
    const orderIds = orders.map(o => o._id);
    const items = await OrderItem.find({ order_id: { $in: orderIds } }).populate('product_id').lean();
    const itemsByOrder = items.reduce((acc, it) => {
      acc[String(it.order_id)] = acc[String(it.order_id)] || [];
      acc[String(it.order_id)].push(it);
      return acc;
    }, {});

    const formatted = orders.map(o => ({
      id: 'ORD-' + String(o._id).slice(-6),
      buyer: o.buyer_id?.username || 'N/A',
      product: itemsByOrder[String(o._id)]?.[0]?.product_id?.name || 'N/A',
      quantity: itemsByOrder[String(o._id)]?.[0]?.quantity || 0,
      amount: 'KES ' + o.total_amount,
      status: o.status,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
