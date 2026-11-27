import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { useQuery } from '@tanstack/react-query';
import { fetchMyOrders, fetchProducts } from '@/api/queries';
import { ProductCard } from '@/components/common/ProductCard';
import { updateUser, logout, openAuthModal } from '@/store/slices/authSlice';
import api from '@/api/client';
import { formatPrice } from '@/utils/cn';
import {
  Package,
  Heart,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { productIds: wishlistIds } = useSelector((state: RootState) => state.wishlist);

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Queries
  const { data: myOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    enabled: isAuthenticated,
  });

  const { data: allProductsData } = useQuery({
    queryKey: ['products-for-wishlist'],
    queryFn: () => fetchProducts({ pageSize: 50 }),
    enabled: wishlistIds.length > 0,
  });

  const wishlistedProducts = (allProductsData?.items || []).filter((p) =>
    wishlistIds.includes(p.id)
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-roseGold mx-auto" />
        <h2 className="font-serif text-2xl font-semibold">Client Sign In Required</h2>
        <p className="text-xs text-charcoal-500">
          Please sign in to access your order history, personal beauty profile, and saved wishlists.
        </p>
        <button
          onClick={() => dispatch(openAuthModal('login'))}
          className="mt-4 px-8 py-3 bg-charcoal-900 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-roseGold transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const { data } = await api.put('/auth/profile', { fullName, phoneNumber });
      if (data.succeeded) {
        dispatch(updateUser(data.data));
        setProfileMsg('Profile updated successfully.');
      }
    } catch (err: any) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Client Overview Card */}
      <div className="bg-gradient-to-r from-lumina-100 via-lumina-50 to-lumina-100 dark:from-charcoal-800 dark:via-charcoal-900 dark:to-charcoal-800 p-8 rounded-3xl border border-lumina-200 dark:border-charcoal-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-roseGold shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-roseGold text-white font-serif text-2xl flex items-center justify-center font-bold shadow-md">
              {user.fullName.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">
                {user.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-roseGold/20 text-roseGold">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 dark:text-lumina-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user.role === 'Admin' && (
            <Link
              to="/admin"
              className="px-5 py-2.5 bg-roseGold text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-roseGold-dark transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </Link>
          )}
          <button
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
            className="px-5 py-2.5 border border-lumina-300 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-200 hover:text-red-500 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-lumina-200 dark:border-charcoal-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className={`pb-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'border-roseGold text-roseGold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'wishlist' })}
          className={`pb-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'wishlist'
              ? 'border-roseGold text-roseGold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Curated Wishlist ({wishlistIds.length})</span>
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'profile' })}
          className={`pb-3 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'border-roseGold text-roseGold'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-32 bg-lumina-200 dark:bg-charcoal-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Package className="w-8 h-8 text-charcoal-400 mx-auto" />
              <p className="text-xs text-charcoal-500">You haven't placed any orders yet.</p>
              <Link to="/shop" className="inline-block mt-2 text-xs font-bold text-roseGold uppercase tracking-wider">
                Explore the Catalog →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 bg-white dark:bg-charcoal-800/80 rounded-2xl border border-lumina-200 dark:border-charcoal-700 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-lumina-100 dark:border-charcoal-700 gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-charcoal-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      <p className="text-[11px] text-charcoal-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-lumina-100 dark:bg-charcoal-700 text-charcoal-800 dark:text-lumina-200">
                        {order.statusName}
                      </span>
                      <Link
                        to={`/order-tracking/${order.orderNumber}`}
                        className="text-xs text-roseGold font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="divide-y divide-lumina-50 dark:divide-charcoal-700/40">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-medium text-charcoal-900 dark:text-white">{item.productName}</span>
                            {item.variantName && <p className="text-[10px] text-roseGold">{item.variantName}</p>}
                            <p className="text-[10px] text-charcoal-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-charcoal-900 dark:text-white">{formatPrice(item.subTotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-lumina-100 dark:border-charcoal-700 flex justify-between items-center text-xs">
                    <span className="text-charcoal-500">Payment: {order.paymentMethod}</span>
                    <span className="font-bold text-sm text-charcoal-900 dark:text-white">
                      Total: <span className="text-roseGold">{formatPrice(order.totalAmount)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-8 h-8 text-charcoal-400 mx-auto" />
              <p className="text-xs text-charcoal-500">Your wishlist is currently empty.</p>
              <Link to="/shop" className="inline-block mt-2 text-xs font-bold text-roseGold uppercase tracking-wider">
                Discover Formulations to Save →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="max-w-md bg-white dark:bg-charcoal-800 p-8 rounded-3xl border border-lumina-200 dark:border-charcoal-700 space-y-4 shadow-xs">
          <h3 className="font-serif text-lg font-semibold text-charcoal-900 dark:text-white">
            Personal Information
          </h3>

          {profileMsg && (
            <p className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl text-xs font-medium">
              {profileMsg}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
              Email Address (immutable)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3.5 py-2 text-xs bg-lumina-100 dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700 text-charcoal-700 dark:text-lumina-300 rounded-xl opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-lumina-50 dark:bg-charcoal-900 border border-lumina-200 dark:border-charcoal-700 text-charcoal-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-3 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-roseGold transition-colors disabled:opacity-50"
          >
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};
