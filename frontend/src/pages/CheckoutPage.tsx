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
  Smartphone,
  Landmark,
  Wallet,
  Banknote,
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
    streetAddress: 'Cameroon Street, Bole Medhanialem',
    apartment: 'Floor 3, Suite 302',
    city: 'Addis Ababa',
    state: 'Bole Sub-City',
    postalCode: '1000',
    country: 'Ethiopia',
    paymentMethod: 'Telebirr',
    walletPhone: user?.phoneNumber || '+251 91 123 4567',
    chapaChannel: 'telebirr',
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
                    placeholder="+251 91 123 4567"
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

            {/* 3. Payment Method — Ethiopian Payment Gateways */}
            <div className="bg-white dark:bg-charcoal-800/60 rounded-3xl p-6 sm:p-8 border border-lumina-200 dark:border-charcoal-700 shadow-xs space-y-5">
              <div className="border-b border-lumina-100 dark:border-charcoal-700 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-roseGold text-white text-xs flex items-center justify-center font-bold">3</span>
                  {t('checkout.payment')}
                </h3>
                <span className="text-[11px] text-charcoal-500 dark:text-lumina-400">
                  {t('checkout.gatewaySubtitle')}
                </span>
              </div>

              {/* Ethiopian Gateway Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  {
                    id: 'Telebirr',
                    label: t('checkout.telebirr'),
                    sub: 'Ethio Telecom',
                    icon: Smartphone,
                    accent: 'text-[#0095DA]',
                  },
                  {
                    id: 'CBEBirr',
                    label: t('checkout.cbeBirr'),
                    sub: 'Commercial Bank',
                    icon: Landmark,
                    accent: 'text-[#7C2182] dark:text-[#C46FD0]',
                  },
                  {
                    id: 'Chapa',
                    label: t('checkout.chapa'),
                    sub: 'All ET Banks & Cards',
                    icon: ShieldCheck,
                    accent: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    id: 'Amole',
                    label: t('checkout.amole'),
                    sub: 'Dashen Bank',
                    icon: Wallet,
                    accent: 'text-amber-600 dark:text-amber-400',
                  },
                  {
                    id: 'CashOnDelivery',
                    label: t('checkout.cod'),
                    sub: 'Addis Delivery',
                    icon: Banknote,
                    accent: 'text-roseGold',
                  },
                ].map((gw) => {
                  const Icon = gw.icon;
                  const isSelected = formData.paymentMethod === gw.id;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: gw.id })}
                      className={`py-3 px-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all text-center ${
                        isSelected
                          ? 'border-roseGold bg-roseGold/10 text-charcoal-900 dark:text-white shadow-xs ring-1 ring-roseGold'
                          : 'border-lumina-200 dark:border-charcoal-700 hover:bg-lumina-50 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-lumina-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${gw.accent}`} />
                      <span className="leading-tight mt-0.5">{gw.label}</span>
                      <span className="text-[9px] font-normal text-charcoal-400 dark:text-lumina-400">
                        {gw.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Gateway Details Panel */}
              {formData.paymentMethod === 'Telebirr' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0095DA]/[0.06] dark:bg-[#0095DA]/10 border border-[#0095DA]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0095DA] text-white text-[10px] font-bold tracking-wider uppercase">
                        telebirr
                      </span>
                      <span className="text-xs font-semibold text-charcoal-900 dark:text-white">
                        SuperApp & USSD (*127#)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#0095DA]">{formatPrice(finalTotal)}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                      {t('checkout.walletPhone')}
                    </label>
                    <input
                      type="tel"
                      name="walletPhone"
                      value={formData.walletPhone}
                      onChange={handleInputChange}
                      required
                      placeholder="+251 91 123 4567"
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-charcoal-900 border border-[#0095DA]/30 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-[#0095DA] font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-500 dark:text-lumina-400">
                    A Telebirr PIN prompt will be pushed to your phone upon clicking Complete Order.
                  </p>
                </div>
              )}

              {formData.paymentMethod === 'CBEBirr' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#7C2182]/[0.06] dark:bg-[#7C2182]/15 border border-[#7C2182]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#7C2182] text-white text-[10px] font-bold tracking-wider uppercase">
                        CBE Birr
                      </span>
                      <span className="text-xs font-semibold text-charcoal-900 dark:text-white">
                        Commercial Bank of Ethiopia (*847#)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#7C2182] dark:text-[#D58AE0]">{formatPrice(finalTotal)}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                      {t('checkout.walletPhone')}
                    </label>
                    <input
                      type="tel"
                      name="walletPhone"
                      value={formData.walletPhone}
                      onChange={handleInputChange}
                      required
                      placeholder="+251 91 123 4567"
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-charcoal-900 border border-[#7C2182]/30 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-[#7C2182] font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-500 dark:text-lumina-400">
                    Instant merchant verification via CBE Birr Mobile App or *847#.
                  </p>
                </div>
              )}

              {formData.paymentMethod === 'Chapa' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/[0.06] dark:bg-emerald-500/10 border border-emerald-500/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase">
                        Chapa
                      </span>
                      <span className="text-xs font-semibold text-charcoal-900 dark:text-white">
                        Ethiopian Unified Checkout
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(finalTotal)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'telebirr', name: 'Telebirr' },
                      { id: 'cbebirr', name: 'CBE Birr' },
                      { id: 'awash', name: 'AwashBirr' },
                      { id: 'abyssinia', name: 'Bank of Abyssinia' },
                      { id: 'mpesa', name: 'M-Pesa ET' },
                    ].map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, chapaChannel: ch.id })}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                          formData.chapaChannel === ch.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-lumina-300 border-emerald-500/25'
                        }`}
                      >
                        {ch.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-charcoal-500 dark:text-lumina-400">
                    Pay securely in ETB via Chapa with Telebirr, CBE, Awash, Abyssinia, M-Pesa, or local cards.
                  </p>
                </div>
              )}

              {formData.paymentMethod === 'Amole' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.06] dark:bg-amber-500/10 border border-amber-500/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-bold tracking-wider uppercase">
                        Amole
                      </span>
                      <span className="text-xs font-semibold text-charcoal-900 dark:text-white">
                        Dashen Bank Digital Wallet
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{formatPrice(finalTotal)}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                      {t('checkout.walletPhone')}
                    </label>
                    <input
                      type="tel"
                      name="walletPhone"
                      value={formData.walletPhone}
                      onChange={handleInputChange}
                      required
                      placeholder="+251 91 123 4567"
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-charcoal-900 border border-amber-500/30 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'CashOnDelivery' && (
                <div className="p-4 rounded-2xl bg-lumina-50 dark:bg-charcoal-900/60 border border-lumina-200 dark:border-charcoal-700 text-xs text-charcoal-600 dark:text-lumina-300 space-y-1">
                  <p className="font-semibold text-charcoal-900 dark:text-white">
                    Pay in Cash or Mobile Transfer on Delivery ({formatPrice(finalTotal)})
                  </p>
                  <p className="text-[11px] text-charcoal-500 dark:text-lumina-400">
                    Available for same-day courier delivery across Addis Ababa (Bole, Kazanchis, Old Airport, CMC, Piassa).
                  </p>
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
