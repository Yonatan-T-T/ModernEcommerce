import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackOrderByNumber } from '@/api/queries';
import { formatPrice } from '@/utils/cn';
import { useTranslation } from '@/i18n/translations';
import { CheckCircle2, Package, Truck, Sparkles, ArrowRight } from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { t } = useTranslation();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => trackOrderByNumber(orderNumber!),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center animate-pulse">
        <div className="h-12 bg-lumina-200 dark:bg-charcoal-800 rounded w-1/2 mx-auto mb-4" />
        <div className="h-6 bg-lumina-200 dark:bg-charcoal-800 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold tracking-[0.25em] uppercase text-roseGold">
          {t('confirm.badge')}
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white">
          {t('confirm.title')}
        </h1>

        <p className="text-xs sm:text-sm text-charcoal-600 dark:text-lumina-300 max-w-md mx-auto">
          {t('confirm.subtitle')}
        </p>

        <div className="inline-block px-4 py-2 bg-lumina-100 dark:bg-charcoal-800 rounded-xl border border-lumina-200 dark:border-charcoal-700 text-xs font-mono font-bold text-charcoal-900 dark:text-white">
          {t('confirm.orderNumber')}: <span className="text-roseGold">{orderNumber}</span>
        </div>
      </div>

      {order && (
        <div className="bg-white dark:bg-charcoal-800/70 rounded-3xl border border-lumina-200 dark:border-charcoal-700 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-lumina-100 dark:border-charcoal-700 gap-2">
            <div>
              <p className="text-[11px] text-charcoal-500 uppercase font-semibold">Recipient</p>
              <p className="text-xs font-bold text-charcoal-900 dark:text-white">{order.customerName}</p>
              <p className="text-xs text-charcoal-500">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-[11px] text-charcoal-500 uppercase font-semibold">Status</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {order.statusName}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-lumina-100 dark:divide-charcoal-700/60 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.productImageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-lumina-200 dark:border-charcoal-700"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-charcoal-900 dark:text-white">{item.productName}</h4>
                    {item.variantName && <p className="text-[10px] text-roseGold">{item.variantName}</p>}
                    <p className="text-[11px] text-charcoal-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-charcoal-900 dark:text-white">{formatPrice(item.subTotal)}</span>
              </div>
            ))}
          </div>

          {/* Order Financials */}
          <div className="border-t border-lumina-200 dark:border-charcoal-700 pt-4 space-y-1.5 text-xs text-charcoal-600 dark:text-lumina-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subTotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({order.couponCode})</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-charcoal-900 dark:text-white pt-2 border-t border-lumina-100 dark:border-charcoal-700">
              <span>Total Paid</span>
              <span className="text-roseGold">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to={`/order-tracking/${orderNumber}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-roseGold transition-colors text-center"
        >
          Track Live Delivery
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-8 py-3.5 border border-lumina-300 dark:border-charcoal-700 text-charcoal-800 dark:text-lumina-200 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-lumina-100 dark:hover:bg-charcoal-800 transition-colors text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
