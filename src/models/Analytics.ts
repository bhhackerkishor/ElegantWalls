import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics extends Document {
  eventType: 'pageview' | 'add_to_cart' | 'remove_from_cart' | 'click_buy' | 'custom_upload' | 'theme_toggle';
  sessionId: string;
  details: Record<string, any>;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  eventType: {
    type: String,
    required: true,
    enum: ['pageview', 'add_to_cart', 'remove_from_cart', 'click_buy', 'custom_upload', 'theme_toggle'],
  },
  sessionId: {
    type: String,
    required: true,
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
export default Analytics;
