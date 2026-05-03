import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id: string; // Storing as string to match current frontend expectations
  from: string;
  type: string;
  time: string;
  msg: string;
  priority: boolean;
  targetType: string;
  targetId: string;
  createdAt: number;
}

const NotificationSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  type: { type: String, required: true },
  time: { type: String, required: true },
  msg: { type: String, required: true },
  priority: { type: Boolean, default: false },
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  createdAt: { type: Number, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
