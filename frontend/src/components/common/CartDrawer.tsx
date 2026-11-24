import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  setCartDrawer,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from '@/store/slices/cartSlice';
import { formatPrice } from '@/utils/cn';
import { validateCoupon } from '@/api/queries';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, isDrawerOpen, couponCode, discountAmount } = useSelector(
    (state: RootState) => state.cart
  );
  const { config } = useSelector((state: RootState) => state.config);

  const [promoInput, setPromoInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = config.freeShippingThreshold || 75;
  const progressToFreeShipping = Math.min(100, (subTotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subTotal);

  const shippingFee = subTotal >= freeShippingThreshold || items.length === 0 ? 0 : config.standardShippingFee || 7.99;
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

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(setCartDrawer(false))}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-charcoal-900 shadow-2xl flex flex-col border-l border-lumina-200 dark:border-charcoal-700">
          {/* Header */}
          <div className="p-6 border-b border-lumina-200 dark:border-charcoal-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-roseGold" />
              <h2 className="font-serif text-lg font-semibold tracking-wide text-charcoal-900 dark:text-white">
                Your Beauty Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => dispatch(setCartDrawer(false))}
              className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3.5 bg-lumina-50 dark:bg-charcoal-800/60 border-b border-lumina-200/60 dark:border-charcoal-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-charcoal-600 dark:text-lumina-300 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-roseGold" />
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-lumina-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-medium text-charcoal-900 dark:text-white">
                  Your bag is empty
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-lumina-400 max-w-xs">
                  Immerse yourself in our collection of cellular peptide elixirs and Parisian pigments.
                </p>
                <button
                  onClick={() => {
                    dispatch(setCartDrawer(false));
                    navigate('/shop');
                  }}
                  className="mt-4 px-6 py-2.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-roseGold transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.productVariantId || 0}`}
                  className="flex space-x-4 pb-6 border-b border-lumina-100 dark:border-charcoal-800/80 last:border-b-0"
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border border-lumina-200 dark:border-charcoal-700"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
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
                          className="text-charcoal-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {item.variantName && (
                        <p className="text-[11px] text-roseGold font-medium mt-0.5">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-xs font-bold text-charcoal-900 dark:text-lumina-200 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-lumina-200 dark:border-charcoal-700 rounded-full bg-lumina-50 dark:bg-charcoal-800 px-2 py-0.5">
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
                          className="p-1 text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-charcoal-900 dark:text-white">
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
                          className="p-1 text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-charcoal-400">
                        Total: {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-lumina-200 dark:border-charcoal-800 bg-lumina-50/50 dark:bg-charcoal-900 space-y-4">
              {/* Promo Code Input */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                      <Tag className="w-4 h-4" />
                      <span>Code: <strong>{couponCode}</strong> applied (-{formatPrice(discountAmount)})</span>
                    </div>
                    <button
                      onClick={() => dispatch(removeCoupon())}
                      className="text-emerald-600 hover:text-emerald-900 font-bold text-xs"
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
                      placeholder="Promo Code (e.g. LUMINA15)"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 rounded-lg focus:outline-none focus:border-roseGold uppercase"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !promoInput.trim()}
                      className="px-3 py-1.5 bg-lumina-200 dark:bg-charcoal-700 hover:bg-roseGold hover:text-white dark:hover:bg-roseGold text-charcoal-800 dark:text-lumina-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-500 mt-1">{couponError}</p>
                )}
              </div>

              {/* Subtotal, Shipping, Total */}
              <div className="space-y-1.5 text-xs text-charcoal-600 dark:text-lumina-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal-900 dark:text-white">
                    {formatPrice(subTotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-charcoal-900 dark:text-white pt-2 border-t border-lumina-200 dark:border-charcoal-800">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    dispatch(setCartDrawer(false));
                    navigate('/checkout');
                  }}
                  className="w-full py-3 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center space-x-2 hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-md group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    dispatch(setCartDrawer(false));
                    navigate('/cart');
                  }}
                  className="w-full py-2 bg-transparent text-charcoal-600 dark:text-lumina-300 hover:text-charcoal-900 dark:hover:text-white text-xs font-medium transition-colors"
                >
                  View Full Shopping Bag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
