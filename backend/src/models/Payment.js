import mongoose from 'mongoose';
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  payment_method: { type: String, enum: ['mpesa','bank_transfer','wallet'], default: 'mpesa' },
  status: { type: String, enum: ['initiated','pending','completed','failed','refunded'], default: 'initiated' },
  merchant_request_id: { type: String },
  checkout_request_id: { type: String },
  phone_number: { type: String },
  result_code: { type: Number },
  result_description: { type: String },
  receipt_number: { type: String },
  transaction_date: { type: Date },
  metadata: { type: Schema.Types.Mixed, default: {} },
  initiated_at: { type: Date },
  completed_at: { type: Date },
  failed_at: { type: Date },
}, { timestamps: true });

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export default Payment;
