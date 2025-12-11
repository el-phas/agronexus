import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  unit_price: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
}, { timestamps: false });

const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', OrderItemSchema);
export default OrderItem;
