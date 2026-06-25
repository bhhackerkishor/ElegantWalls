import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  type: 'order' | 'stock' | 'review' | 'support' | 'return' | 'user' | 'payment' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  type: { 
    type: String, 
    enum: ['order', 'stock', 'review', 'support', 'return', 'user', 'payment', 'system'], 
    default: 'system' 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;