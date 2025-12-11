import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema({
  buyer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending-payment','payment-confirmed','processing','shipped','delivered','completed','cancelled','refunded'], default: 'pending-payment' },
  payment_status: { type: String, enum: ['not-initiated','pending','paid','failed'], default: 'not-initiated' },
  total_amount: { type: Number, required: true }, // Updated to match the original field type
  delivery_address: { type: String },
  delivery_notes: { type: String },
  expected_delivery: { type: Date },
  cancellation_reason: { type: String },
  cancelled_by: { type: String, enum: ['buyer','seller','admin'] },
  cancellation_date: { type: Date },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
