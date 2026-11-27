import { CartItem } from '@/types';

export interface ShippingCalculation {
  shippingFee: number;
  totalItems: number;
  totalWeightGrams: number;
}

/**
 * Calculates shipping between 400 and 1000 ETB based on total item count and total weight,
 * or 0 ETB when the cart is empty or subtotal exceeds the free shipping threshold.
 */
export function calculateShipping(
  items: CartItem[],
  subTotal: number,
  freeShippingThreshold = 10000
): ShippingCalculation {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeightGrams = items.reduce(
    (sum, item) => sum + (item.weightGrams && item.weightGrams > 0 ? item.weightGrams : 150) * item.quantity,
    0
  );

  if (totalItems <= 0 || subTotal > freeShippingThreshold) {
    return { shippingFee: 0, totalItems, totalWeightGrams };
  }

  const totalWeightKg = Math.max(0, totalWeightGrams) / 1000;
  const rawFee = 400 + Math.max(0, totalItems - 1) * 40 + totalWeightKg * 120;
  const shippingFee = Math.round(Math.min(1000, Math.max(400, rawFee)));

  return { shippingFee, totalItems, totalWeightGrams };
}
