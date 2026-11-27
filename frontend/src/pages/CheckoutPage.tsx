import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { createOrder } from '@/api/queries';
import { formatPrice } from '@/utils/cn';
import { useTranslation } from '@/i18n/translations';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { items, couponCode, discountAmount } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { config } = useSelector((state: RootState) => state.config);

  const subTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingFee = subTotal >= (config.freeShippingThreshold || 75) ? 0 : config.standardShippingFee || 7.99;
  const finalTotal = Math.max(0, subTotal - discountAmount) + shippingFee;

  // Form State
  const [formData, setFormData] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phoneNumber || '',
    streetAddress: '742 Evergreen Terrace',
    apartment: 'Suite 4B',
    city: 'Beverly Hills',
    state: 'CA',
    postalCode: '90210',
    country: 'United States',
    paymentMethod: 'CreditCard',
    cardNumber: '•••• •••• •••• 4242',
    cardExp: '12/28',
    cardCvc: '888',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-charcoal-900 dark:text-white">Your bag is empty</h2>
        <p className="text-xs text-charcoal-500 dark:text-lumina-400">Please add products to your bag before checking out.</p>
        <Link to="/shop" className="inline-block mt-4 px-6 py-2.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold uppercase hover:bg-roseGold transition-colors">
          Go to Shop
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: {
          fullName: formData.customerName,
          streetAddress: formData.streetAddress,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phoneNumber: formData.customerPhone,
        },
        paymentMethod: formData.paymentMethod,
        couponCode: couponCode || undefined,
        notes: formData.notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          productVariantId: i.productVariantId,
          quantity: i.quantity,
        })),
      };

      const order = await createOrder(orderPayload);
      dispatch(clearCart());
      navigate(`/order-confirmation/${order.orderNumber}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Unable to complete your order. Please check stock availability and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/cart" className="text-xs text-charcoal-600 dark:text-lumina-300 hover:text-roseGold flex items-center gap-1.5 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{t('checkout.returnToBag')}</span>
        </Link>
        <div className="flex items-center space-x-2 text-xs text-charcoal-500 dark:text-lumina-400">
          <Lock className="w-3.5 h-3.5 text-roseGold" />
          <span>{t('checkout.secure')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* 1. Contact Information */}
            <div className="bg-white dark:bg-charcoal-800/80 rounded-3xl p-6 sm:p-8 border border-lumina-200 dark:border-charcoal-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-lumina-100 dark:border-charcoal-700 pb-3">
                <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-roseGold text-white text-xs flex items-center justify-center font-bold">1</span>
                  {t('checkout.contact')}
                </h3>
                {!isAuthenticated && (
                  <span className="text-xs text-roseGold font-medium">{t('checkout.guest')}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                    {t('checkout.fullName')}
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Sarah Jenkins"
                    className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                    Email Address (for order tracking) *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    placeholder="sarah.j@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 438-9210"
                    className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white dark:bg-charcoal-800/80 rounded-3xl p-6 sm:p-8 border border-lumina-200 dark:border-charcoal-700 shadow-xs space-y-4">
              <div className="border-b border-lumina-100 dark:border-charcoal-700 pb-3">
                <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-roseGold text-white text-xs flex items-center justify-center font-bold">2</span>
                  {t('checkout.delivery')}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                    {t('checkout.street')}
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="742 Evergreen Terrace"
                    className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                      Suite / Apt
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="Apt 4B"
                      className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Beverly Hills"
                      className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                      State / Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      placeholder="CA 90210"
                      className="w-full px-3.5 py-2.5 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                    Special Gifting / Delivery Instructions
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g. Leave with building concierge, gift wrapped..."
                    className="w-full px-3.5 py-2 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white dark:bg-charcoal-800/60 rounded-3xl p-6 sm:p-8 border border-lumina-200 dark:border-charcoal-700 shadow-xs space-y-4">
              <div className="border-b border-lumina-100 dark:border-charcoal-700 pb-3">
                <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-roseGold text-white text-xs flex items-center justify-center font-bold">3</span>
                  {t('checkout.payment')}
                </h3>
              </div>

              {/* Payment Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['CreditCard', 'ApplePay', 'PayPal', 'CashOnDelivery'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: method })}
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                      formData.paymentMethod === method
                        ? 'border-roseGold bg-roseGold/10 text-roseGold shadow-xs ring-1 ring-roseGold'
                        : 'border-lumina-200 dark:border-charcoal-700 hover:bg-lumina-50 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-lumina-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{method === 'CreditCard' ? 'Credit Card' : method}</span>
                  </button>
                ))}
              </div>

              {formData.paymentMethod === 'CreditCard' && (
                <div className="pt-3 space-y-3 p-4 bg-lumina-50 dark:bg-charcoal-900/60 rounded-2xl border border-lumina-200/80 dark:border-charcoal-700">
                  <div className="flex items-center justify-between text-xs text-charcoal-600 dark:text-lumina-300">
                    <span className="font-medium">Card Information (Simulated Sandbox)</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">Test Mode Enabled</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="cardExp"
                      value={formData.cardExp}
                      onChange={handleInputChange}
                      className="px-3.5 py-2.5 text-xs bg-white dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                    />
                    <input
                      type="text"
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      className="px-3.5 py-2.5 text-xs bg-white dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? '...' : `${t('checkout.completeOrder')} — ${formatPrice(finalTotal)}`}</span>
            </button>
          </form>
        </div>

        {/* Right Summary: 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-charcoal-800/80 rounded-3xl p-6 sm:p-8 border border-lumina-200 dark:border-charcoal-700 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white border-b border-lumina-100 dark:border-charcoal-700 pb-3">
              {t('checkout.orderItems')} ({items.length})
            </h3>

            <div className="divide-y divide-lumina-100 dark:divide-charcoal-700/60 max-h-80 overflow-y-auto space-y-3">
              {items.map((item) => (
                <div key={`${item.productId}-${item.productVariantId || 0}`} className="pt-3 first:pt-0 flex items-center space-x-3.5">
                  <div className="relative">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100'}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl border border-lumina-200 dark:border-charcoal-700"
                    />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-charcoal-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-charcoal-900 dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <p className="text-[11px] text-roseGold font-medium">{item.variantName}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-charcoal-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-lumina-200 dark:border-charcoal-700 space-y-2 text-xs text-charcoal-600 dark:text-lumina-300">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-charcoal-900 dark:text-white">{formatPrice(subTotal)}</span>
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
                    <span className="text-emerald-600 font-medium">{t('cart.free')}</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-charcoal-900 dark:text-white pt-3 border-t border-lumina-200 dark:border-charcoal-700">
                <span>{t('checkout.totalAmount')}</span>
                <span className="text-roseGold">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="p-3 bg-lumina-100 dark:bg-charcoal-900 rounded-xl text-[11px] text-charcoal-500 space-y-1">
              <p>✔ {t('checkout.reserveNote1')}</p>
              <p>✔ {t('checkout.reserveNote2')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
