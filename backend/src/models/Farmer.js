import mongoose from 'mongoose';

const { Schema } = mongoose;

const FarmerSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  location: { type: String, default: '' },
  farm_name: { type: String },
  bio: { type: String },
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  verification_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
}, { timestamps: true });

const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', FarmerSchema);
export default Farmer;
