import type { Order } from '@/types';
import { formatPrice } from './utils';
import { SITE_NAME } from './constants';

export function generateInvoiceHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.title}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.size} / ${item.material}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price * item.quantity)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${order.orderNumber}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; color: #1E1A16; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #B08D46; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 800; color: #B08D46; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #F3EFE9; padding: 10px; text-align: left; font-size: 13px; }
    .total-row { font-weight: 700; font-size: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">${SITE_NAME}</div>
      <p style="color:#666;font-size:13px;margin-top:4px">Tax Invoice</p>
    </div>
    <div style="text-align:right">
      <p><strong>Invoice #:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
      <p><strong>Payment:</strong> ${order.paymentStatus.toUpperCase()} (${order.paymentMethod.toUpperCase()})</p>
    </div>
  </div>
  <div style="display:flex;gap:40px;margin-bottom:30px">
    <div>
      <h4 style="margin-bottom:8px;color:#B08D46">Bill To</h4>
      <p>${order.shippingDetails.name}</p>
      <p>${order.shippingDetails.phone}</p>
      <p>${order.shippingDetails.address}, ${order.shippingDetails.city}</p>
      <p>${order.shippingDetails.state} - ${order.shippingDetails.pincode}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Variant</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Rate</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div style="text-align:right;margin-top:20px">
    ${order.discountAmount > 0 ? `<p>Discount: -${formatPrice(order.discountAmount)}</p>` : ''}
    <p class="total-row">Total: ${formatPrice(order.totalAmount)}</p>
  </div>
  <p style="margin-top:40px;font-size:12px;color:#999;text-align:center">Thank you for shopping with ${SITE_NAME}!</p>
</body>
</html>`;
}
