import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon } from '@/store/slices/cartSlice';
import { formatPrice } from '@/utils/cn';
import { validateCoupon } from '@/api/queries';
import { useTranslation } from '@/i18n/translations';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Sparkles, ShieldCheck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { items, couponCode, discountAmount } = useSelector((state: RootState) => state.cart);
  const { config } = useSelector((state: RootState) => state.config);

  const [promoInput, setPromoInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const freeShippingThreshold = config.freeShippingThreshold || 10000;
  const progressToFreeShipping = Math.min(100, (subTotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subTotal);

  const shippingFee = subTotal > freeShippingThreshold || items.length === 0 ? 0 : config.standardShippingFee || 7.99;
  const finalTotal = Math.max(0, subTotal - discountAmount) + shippingFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(promoInput.trim(), subTotal);
      if (res.isValid) {
        dispatch(applyCoupon({ code: res.code || promoInput.trim().toUpperCase(), discountAmount: res.discountAmount }));
        setPromoInput('');
      } else {
        setCouponError(res.message);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Failed to apply coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-lumina-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-400 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-semibold text-charcoal-900 dark:text-white">
          {t('cart.empty')}
        </h2>
        <p className="text-sm text-charcoal-500 max-w-md mx-auto">
          {t('cart.emptyDesc')}
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-roseGold transition-colors"
        >
          {t('home.exploreLink')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-roseGold">
          {t('cart.eyebrow')}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white mt-1">
          {t('cart.reviewSelection')} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t('cart.itemsLabel')})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Free Shipping Alert Bar */}
          <div className="p-4 bg-lumina-100 dark:bg-charcoal-800/80 rounded-2xl border border-lumina-200 dark:border-charcoal-700">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-charcoal-700 dark:text-lumina-200 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-roseGold" />
                {amountToFreeShipping === 0 ? (
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {t('cart.unlockedShipping')}
                  </strong>
                ) : (
                  <span>
                    <strong>{formatPrice(amountToFreeShipping)}</strong> {t('cart.addMoreForFree')}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-roseGold">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-lumina-200 dark:bg-charcoal-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-roseGold to-lumina-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-white dark:bg-charcoal-800/60 rounded-3xl border border-lumina-200 dark:border-charcoal-700 divide-y divide-lumina-100 dark:divide-charcoal-700/60 overflow-hidden shadow-xs">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.productVariantId || 0}`}
                className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-lumina-200 dark:border-charcoal-700"
                  />
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-charcoal-900 dark:text-white">
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-xs text-roseGold font-medium mt-0.5">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-charcoal-600 dark:text-lumina-300 mt-1">
                      {formatPrice(item.price)} {t('cart.each')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-lumina-200 dark:border-charcoal-700 rounded-full bg-lumina-50 dark:bg-charcoal-800 px-3 py-1">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            productVariantId: item.productVariantId,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                      className="text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white px-1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-bold text-charcoal-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            productVariantId: item.productVariantId,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      disabled={item.quantity >= item.maxStock}
                      className="text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white px-1 disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-serif text-sm font-bold text-charcoal-900 dark:text-white w-20 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() =>
                      dispatch(
                        removeFromCart({
                          productId: item.productId,
                          productVariantId: item.productVariantId,
                        })
                      )
                    }
                    className="text-charcoal-400 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/shop"
              className="text-xs text-charcoal-600 dark:text-lumina-300 hover:text-roseGold font-medium flex items-center gap-1.5"
            >
              ← {t('cart.continue')}
            </Link>
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-charcoal-800/80 rounded-3xl border border-lumina-200 dark:border-charcoal-700 p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white border-b border-lumina-100 dark:border-charcoal-700 pb-4">
              {t('cart.orderSummary')}
            </h3>

            {/* Promo Code Input */}
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                    <Tag className="w-4 h-4" />
                    <span><strong>{couponCode}</strong> {t('cart.couponApplied')}</span>
                  </div>
                  <button
                    onClick={() => dispatch(removeCoupon())}
                    className="text-emerald-600 hover:text-emerald-900 font-bold"
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder={t('cart.promoPlaceholder')}
                    className="flex-1 px-3 py-2 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !promoInput.trim()}
                    className="px-4 py-2 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 text-xs font-semibold rounded-xl hover:bg-roseGold transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : t('cart.apply')}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-500 mt-1">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs text-charcoal-600 dark:text-lumina-300 border-t border-lumina-100 dark:border-charcoal-700 pt-4">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-charcoal-900 dark:text-white">
                  {formatPrice(subTotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{t('cart.discount')} ({couponCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('cart.shipping')}</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('cart.free')}</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-charcoal-900 dark:text-white border-t border-lumina-200 dark:border-charcoal-700 pt-3">
                <span>{t('cart.estimatedTotal')}</span>
                <span className="text-roseGold">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-widest uppercase flex items-center justify-center space-x-2 hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-md group"
            >
              <span>{t('cart.checkout')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-charcoal-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('cart.secureBadge')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
