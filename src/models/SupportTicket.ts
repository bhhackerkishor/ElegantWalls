import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicketMessage {
  sender: 'customer' | 'admin';
  senderEmail: string;
  message: string;
  timestamp: Date;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  orderId?: string;
  messages: ITicketMessage[];
  internalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>({
  sender: { type: String, enum: ['customer', 'admin'], required: true },
  senderEmail: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SupportTicketSchema = new Schema<ISupportTicket>({
  ticketNumber: { type: String, required: true, unique: true },
  customerEmail: { type: String, required: true, lowercase: true },
  customerName: { type: String, default: '' },
  subject: { type: String, required: true },
  status: { type: String, enum: ['open', 'pending', 'resolved'], default: 'open' },
  orderId: { type: String },
  messages: [TicketMessageSchema],
  internalNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
export default SupportTicket;
