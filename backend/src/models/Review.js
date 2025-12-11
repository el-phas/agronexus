import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReviewSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;
