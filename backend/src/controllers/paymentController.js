import { Order, Payment } from '../models/index.js';
import daraja from '../services/daraja.js';

export const initiatePayment = async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;
    if (!orderId || !phoneNumber) return res.status(400).json({ error: 'Missing orderId or phoneNumber' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.buyer_id) !== String(req.user.id)) return res.status(403).json({ error: 'Not authorized' });
    if (order.status !== 'pending-payment') return res.status(400).json({ error: 'Order not payable' });

    const payment = await Payment.create({ order_id: orderId, amount: order.total_amount, payment_method: 'mpesa', phone_number: phoneNumber, status: 'initiated', initiated_at: new Date() });

    const darajaResult = await daraja.initiateStkPush({ phoneNumber, amount: order.total_amount, orderId });
    if (!darajaResult.success) {
      await Payment.findByIdAndUpdate(payment._id, { status: 'failed' });
      return res.status(500).json({ error: 'Failed to initiate payment', details: darajaResult.error });
    }

    const d = darajaResult.data;
    await Payment.findByIdAndUpdate(payment._id, { merchant_request_id: d.MerchantRequestID, checkout_request_id: d.CheckoutRequestID, status: 'pending' });

    return res.json({ payment_id: payment._id, merchant_request_id: d.MerchantRequestID, checkout_request_id: d.CheckoutRequestID, message: 'STK push sent' });
  } catch (error) {
    console.error('initiatePayment error', error);
    res.status(500).json({ error: error.message });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const order = await Order.findById(payment.order_id);
    if (!order || String(order.buyer_id) !== String(req.user.id)) return res.status(403).json({ error: 'Not authorized' });

    if (payment.status === 'completed' || payment.status === 'failed') {
      return res.json({ status: payment.status, receipt: payment.receipt_number });
    }

    // Query Daraja
    const result = await daraja.queryStkStatus(payment.checkout_request_id);
    if (!result.success) return res.status(500).json({ error: 'Payment service unavailable' });

    const data = result.data;
    const rc = data.ResultCode ?? data.Result?.ResultCode ?? null;
    if (rc === 0 || (data.ResultCode && String(data.ResultCode) === '0')) {
      await Payment.findByIdAndUpdate(payment._id, { status: 'completed', result_code: 0, result_description: 'Payment successful', completed_at: new Date() });
      await Order.findByIdAndUpdate(order._id, { status: 'payment-confirmed', payment_status: 'paid' });
      return res.json({ status: 'completed' });
    }

    return res.json({ status: payment.status || 'pending' });
  } catch (error) {
    console.error('checkPaymentStatus error', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleDarajaCallback = async (req, res) => {
  // Use a session for atomic updates
  const session = await Payment.startSession();
  session.startTransaction();
  try {
    const Body = req.body?.Body;
    const stk = Body?.stkCallback;
    if (!stk) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Invalid callback' });
    }

    const { ResultCode, MerchantRequestID, CheckoutRequestID, ResultDesc, CallbackMetadata } = stk;

    const payment = await Payment.findOne({ checkout_request_id: CheckoutRequestID }).session(session);
    if (!payment) {
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ message: 'ok' });
    }

    if (ResultCode === 0) {
      const metadata = {};
      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach(i => { metadata[i.Name] = i.Value; });
      } else if (CallbackMetadata && CallbackMetadata.ItemList) {
        CallbackMetadata.ItemList.forEach(i => { metadata[i.Name] = i.Value; });
      }

      await Payment.findByIdAndUpdate(payment._id, { status: 'completed', result_code: 0, result_description: ResultDesc, receipt_number: metadata.ReceiptNumber || null, transaction_date: metadata.TransactionDate ? new Date(metadata.TransactionDate) : new Date(), metadata }, { session });
      const order = await Order.findById(payment.order_id).session(session);
      if (order) await Order.findByIdAndUpdate(order._id, { status: 'payment-confirmed', payment_status: 'paid' }, { session });
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ message: 'ok' });
    }

    await Payment.findByIdAndUpdate(payment._id, { status: 'failed', result_code: ResultCode, result_description: ResultDesc }, { session });
    const order = await Order.findById(payment.order_id).session(session);
    if (order) await Order.findByIdAndUpdate(order._id, { status: 'cancelled', payment_status: 'failed', cancellation_reason: 'Payment failed', cancelled_by: 'system', cancellation_date: new Date() }, { session });
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: 'ok' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('handleDarajaCallback error', error);
    return res.status(200).json({ message: 'ok' });
  }
};

export default { initiatePayment, checkPaymentStatus, handleDarajaCallback };
