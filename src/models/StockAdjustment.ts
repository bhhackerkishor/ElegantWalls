import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStockAdjustment extends Document {
  productId: string;
  productTitle: string;
  sku: string;
  previousStock: number;
  newStock: number;
  adjustment: number;
  reason: string;
  adminEmail: string;
  createdAt: Date;
}

const StockAdjustmentSchema = new Schema<IStockAdjustment>({
  productId: { type: String, required: true },
  productTitle: { type: String, required: true },
  sku: { type: String, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  adjustment: { type: Number, required: true },
  reason: { type: String, default: '' },
  adminEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

StockAdjustmentSchema.index({ productId: 1, createdAt: -1 });

const StockAdjustment: Model<IStockAdjustment> =
  mongoose.models.StockAdjustment || mongoose.model<IStockAdjustment>('StockAdjustment', StockAdjustmentSchema);
export default StockAdjustment;
