import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema({
  farmer_id: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  price: { type: Number, required: true },
  unit: { type: String },
  available_quantity: { type: Number, default: 0 },
  image_url: { type: String },
  is_organic: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  status: { type: String, enum: ['active','inactive','delisted'], default: 'active' },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
