import mongoose from 'mongoose';

const { Schema } = mongoose;

const CartItemSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  unit_price: { type: Number, default: 0 },
}, { timestamps: true });

const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', CartItemSchema);
export default CartItem;
