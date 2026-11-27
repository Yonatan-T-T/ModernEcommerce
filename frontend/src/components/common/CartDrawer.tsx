import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { RootState } from '@/store/store';
import {
  setCartDrawer,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from '@/store/slices/cartSlice';
import { showToast } from '@/store/slices/toastSlice';
import { useTranslation } from '@/i18n/translations';
import { formatPrice } from '@/utils/cn';
import { calculateShipping } from '@/utils/shipping';
import { validateCoupon } from '@/api/queries';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { items, isDrawerOpen, couponCode, discountAmount } = useSelector(
    (state: RootState) => state.cart
  );
  const { config } = useSelector((state: RootState) => state.config);

  const [promoInput, setPromoInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = config.freeShippingThreshold || 10000;
  const progressToFreeShipping = Math.min(100, (subTotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subTotal);

  const { shippingFee } = calculateShipping(items, subTotal, freeShippingThreshold);
  const finalTotal = Math.max(0, subTotal - discountAmount) + shippingFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await validateCoupon(promoInput.trim(), subTotal);
      if (res.isValid) {
        const applied = res.code || promoInput.trim().toUpperCase();
        dispatch(applyCoupon({ code: applied, discountAmount: res.discountAmount }));
        dispatch(showToast({ message: `Promo code ${applied} applied` }));
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

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => dispatch(setCartDrawer(false))}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white dark:bg-charcoal-900 shadow-2xl flex flex-col border-l border-lumina-200 dark:border-white/10"
            >
              {/* Header */}
              <div className="px-5 py-4 sm:p-6 border-b border-lumina-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShoppingBag className="w-5 h-5 text-roseGold" />
                  <h2 className="font-serif text-lg font-semibold tracking-wide text-charcoal-900 dark:text-white">
                    {t('cart.title')} ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </h2>
                </div>
                <button
                  onClick={() => dispatch(setCartDrawer(false))}
                  className="p-2 rounded-full text-charcoal-400 hover:bg-lumina-100 dark:hover:bg-white/5 hover:text-charcoal-900 dark:hover:text-white transition-colors"
                  aria-label="Close bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Bar */}
              <div className="px-5 sm:px-6 py-3.5 bg-lumina-50 dark:bg-charcoal-800/60 border-b border-lumina-200/60 dark:border-white/10">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-charcoal-600 dark:text-lumina-300 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-roseGold shrink-0" />
                    {amountToFreeShipping === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Complimentary Express Shipping Unlocked!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="text-charcoal-900 dark:text-white">{formatPrice(amountToFreeShipping)}</strong> for Free Shipping
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-[10px] text-charcoal-500 dark:text-lumina-400">
                    {Math.round(progressToFreeShipping)}%
                  </span>
                </div>
                <div className="w-full bg-lumina-200 dark:bg-charcoal-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-roseGold to-lumina-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-5 py-5 sm:p-6 space-y-5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-lumina-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-charcoal-900 dark:text-white">
                      {t('cart.empty')}
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-lumina-400 max-w-xs leading-relaxed">
                      {t('cart.emptyDesc')}
                    </p>
                    <button
                      onClick={() => {
                        dispatch(setCartDrawer(false));
                        navigate('/shop');
                      }}
                      className="mt-4 px-7 py-3 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-roseGold transition-colors"
                    >
                      {t('home.exploreLink')}
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={`${item.productId}-${item.productVariantId || 0}`}
                      className="flex space-x-3.5 pb-5 border-b border-lumina-100 dark:border-white/[0.07] last:border-b-0"
                    >
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-xl border border-lumina-200 dark:border-white/10 shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-semibold text-charcoal-900 dark:text-white line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              onClick={() =>
                                dispatch(
                                  removeFromCart({
                                    productId: item.productId,
                                    productVariantId: item.productVariantId,
                                  })
                                )
                              }
                              className="text-charcoal-400 hover:text-red-500 transition-colors p-1 -mr-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.variantName && (
                            <p className="text-[11px] text-roseGold font-medium mt-0.5 truncate">
                              {item.variantName}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Touch-friendly Quantity Stepper */}
                          <div className="flex items-center border border-lumina-200 dark:border-white/10 rounded-full bg-lumina-50 dark:bg-charcoal-800 px-1.5 py-0.5">
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
                              className="w-7 h-7 flex items-center justify-center text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold text-charcoal-900 dark:text-white">
                              {item.quantity}
                            </span>
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
                              className="w-7 h-7 flex items-center justify-center text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-charcoal-900 dark:text-white">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Summary */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 bg-lumina-50 dark:bg-charcoal-800/80 border-t border-lumina-200 dark:border-white/10 space-y-4 pb-safe">
                  {/* Coupon Form */}
                  <div>
                    {couponCode ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300">
                          <Tag className="w-3.5 h-3.5" />
                          <span>
                            Code <strong>{couponCode}</strong> applied
                          </span>
                        </div>
                        <button
                          onClick={() => dispatch(removeCoupon())}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="Promo code (e.g. LUMINA15)"
                          className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-charcoal-900 border border-lumina-200 dark:border-white/10 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold uppercase"
                        />
                        <button
                          type="submit"
                          disabled={couponLoading || !promoInput.trim()}
                          className="px-4 py-2 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 text-xs font-semibold rounded-xl hover:bg-roseGold transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </form>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-red-500 mt-1">{couponError}</p>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-charcoal-600 dark:text-lumina-300">
                    <div className="flex justify-between">
                      <span>{t('cart.subtotal')}</span>
                      <span className="font-semibold text-charcoal-900 dark:text-white">
                        {formatPrice(subTotal)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <span>Discount ({couponCode})</span>
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
                    <div className="flex justify-between text-sm font-bold text-charcoal-900 dark:text-white pt-2 border-t border-lumina-200 dark:border-white/10">
                      <span>{t('cart.total')}</span>
                      <span className="text-roseGold">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => {
                        dispatch(setCartDrawer(false));
                        navigate('/checkout');
                      }}
                      className="w-full py-3.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-widest uppercase flex items-center justify-center space-x-2 hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-md group"
                    >
                      <span>{t('cart.checkout')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => {
                        dispatch(setCartDrawer(false));
                        navigate('/cart');
                      }}
                      className="w-full py-2 text-center text-xs text-charcoal-500 dark:text-lumina-400 hover:text-roseGold font-medium transition-colors"
                    >
                      {t('cart.viewFull')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
