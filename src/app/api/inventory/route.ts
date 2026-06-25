import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import StockAdjustment from '@/models/StockAdjustment';
import Notification from '@/models/Notification';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { isAdminAuthorized, getUserFromRequest } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin/audit';

export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    
    const products = await Product.find({ isArchived: { $ne: true } }).lean();

    let totalStock = 0;
    let lowStockCount = 0;
    
    const inventory = products.flatMap((p) =>
      p.variants.map((v) => {
        totalStock += v.stockCount;
        if (v.stockCount <= 10) lowStockCount++;
        return {
          productId: String(p._id),
          productTitle: p.title,
          sku: v.sku,
          size: v.size || 'Custom Pattern',
          material: p.category || 'Premium Poster',
          stockCount: v.stockCount,
          availableStock: v.stockCount,
        };
      })
    );

    // Simulated/Stored Data Structures for Frame Assets Integration
    // In production, connect this directly to a mongoose model: FrameAsset.find()
    const frames = [
      { _id: 'f1', material: 'Wood', type: 'Classic', size: '12x18 inches', color: 'Natural Oak', linearMetersStock: 85, unitCost: 180 },
      { _id: 'f2', material: 'MDF', type: 'Minimalist', size: 'A4 Standard', color: 'Matte Black', linearMetersStock: 4, unitCost: 90 },
      { _id: 'f3', material: 'Vinyl', type: 'Sticker Roll', size: '24-inch Matte', linearMetersStock: 210, unitCost: 320 }
    ];

    return successResponse({
      summary: { 
        totalStock, 
        lowStockCount, 
        productCount: inventory.length,
        criticalFrameShortage: frames.filter(f => f.linearMetersStock < 10).length 
      },
      inventory,
      frames
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

// Keep your PUT handler as is to handle variant edits perfectly!
export async function PUT(request: NextRequest) {
  try {
    if (!isAdminAuthorized(request)) return unauthorizedResponse();
    await dbConnect();
    const { productId, sku, newStock, reason } = await request.json();
    const user = getUserFromRequest(request);

    const product = await Product.findById(productId);
    if (!product) return notFoundResponse('Product not found');

    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) return notFoundResponse('Variant not found');

    const previousStock = variant.stockCount;
    variant.stockCount = Math.max(0, newStock);
    await product.save();

    await StockAdjustment.create({
      productId,
      productTitle: product.title,
      sku,
      previousStock,
      newStock: variant.stockCount,
      adjustment: variant.stockCount - previousStock,
      reason: reason || 'Manual adjustment',
      adminEmail: user?.email || 'admin',
    });

    if (variant.stockCount <= 10) {
      await Notification.create({
        type: 'stock',
        title: 'Low Stock Alert',
        message: `${product.title} (${sku}) has ${variant.stockCount} units left`,
        link: '/admin/inventory',
      });
    }

    await logAdminAction(request, 'stock_adjust', 'product', productId, {
      sku,
      previousStock,
      newStock: variant.stockCount,
    });
    return successResponse({ message: 'Stock updated', stockCount: variant.stockCount });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Bad request', 400);
  }
}
