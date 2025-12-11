import mongoose from 'mongoose';

const { Schema } = mongoose;

const TaskSchema = new Schema({
  farmer_id: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
  title: { type: String, required: true },
  description: { type: String },
  due_date: { type: Date },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
export default Task;
