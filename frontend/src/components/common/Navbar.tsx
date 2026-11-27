import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { toggleCartDrawer } from '@/store/slices/cartSlice';
import { openAuthModal, logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeAndConfigSlices';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  Package,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items } = useSelector((state: RootState) => state.cart);
  const { productIds: wishlistIds } = useSelector((state: RootState) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { config } = useSelector((state: RootState) => state.config);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-lumina-50/85 dark:bg-charcoal-900/85 backdrop-blur-xl border-b border-lumina-200/60 dark:border-white/[0.07] transition-colors">
      {/* Luxury Promo Bar */}
      <div className="bg-gradient-to-r from-roseGold/15 via-lumina-200/50 to-roseGold/15 dark:from-roseGold-dark/30 dark:via-charcoal-800/80 dark:to-roseGold-dark/30 py-1.5 px-4 text-center text-[11px] sm:text-xs tracking-wider uppercase font-medium text-charcoal-700 dark:text-lumina-200">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-roseGold shrink-0" />
          <span className="truncate">
            Free Shipping Over {config.currencySymbol}{config.freeShippingThreshold} · Code:{' '}
            <strong className="underline decoration-roseGold/60 underline-offset-2">LUMINA15</strong>
          </span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-xl text-charcoal-800 dark:text-lumina-100 hover:bg-lumina-200/40 dark:hover:bg-white/5 hover:text-roseGold transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Left Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium tracking-wide">
            <Link
              to="/shop"
              className="text-charcoal-700 dark:text-lumina-200 hover:text-roseGold dark:hover:text-roseGold transition-colors"
            >
              All Products
            </Link>
            <Link
              to="/shop?categoryId=1"
              className="text-charcoal-700 dark:text-lumina-200 hover:text-roseGold dark:hover:text-roseGold transition-colors"
            >
              Skincare
            </Link>
            <Link
              to="/shop?categoryId=2"
              className="text-charcoal-700 dark:text-lumina-200 hover:text-roseGold dark:hover:text-roseGold transition-colors"
            >
              Makeup
            </Link>
            <Link
              to="/shop?categoryId=3"
              className="text-charcoal-700 dark:text-lumina-200 hover:text-roseGold dark:hover:text-roseGold transition-colors"
            >
              Fragrance
            </Link>
            <Link
              to="/shop?isBestSeller=true"
              className="text-roseGold font-semibold hover:opacity-80 transition-opacity"
            >
              Bestsellers
            </Link>
          </nav>

          {/* Center Brand Logo */}
          <div className="text-center">
            <Link to="/" className="group flex flex-col items-center">
              <span className="font-serif text-xl sm:text-2xl lg:text-3xl tracking-[0.18em] uppercase font-semibold text-charcoal-900 dark:text-white group-hover:text-roseGold transition-colors">
                {config.storeName}
              </span>
              <span className="hidden sm:block text-[10px] tracking-[0.28em] uppercase text-charcoal-500 dark:text-lumina-400 font-medium">
                {config.tagline || 'Haute Parfumerie & Skincare'}
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Search Trigger (Desktop & Tablet) */}
            <div className="relative hidden sm:block">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search elixirs, shades..."
                    autoFocus
                    className="w-48 lg:w-60 pl-3.5 pr-8 py-1.5 text-xs bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white rounded-full border border-lumina-300 dark:border-white/10 focus:outline-none focus:border-roseGold shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-2.5 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-200/40 dark:hover:bg-white/5 hover:text-roseGold transition-colors"
                  title="Search Products"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Dark/Light Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-200/40 dark:hover:bg-white/5 hover:text-roseGold transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Wishlist (Desktop/Tablet) */}
            <Link
              to="/wishlist"
              className="hidden sm:flex relative p-2 rounded-full text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-200/40 dark:hover:bg-white/5 hover:text-roseGold transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-roseGold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Account / Auth (Desktop) */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-1 pr-2.5 rounded-full hover:bg-lumina-200/50 dark:hover:bg-charcoal-800 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-7 h-7 rounded-full object-cover border border-roseGold"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-roseGold text-white flex items-center justify-center text-xs font-semibold">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-medium text-charcoal-700 dark:text-lumina-200">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>

                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl border border-lumina-200 dark:border-white/10 py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-lumina-100 dark:border-white/10">
                      <p className="text-xs font-semibold text-charcoal-900 dark:text-white truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-charcoal-500 dark:text-lumina-400 truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full bg-roseGold/15 text-roseGold">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'Admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-roseGold hover:bg-lumina-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Admin Console
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      My Account & Profile
                    </Link>

                    <Link
                      to="/account?tab=orders"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-100 dark:hover:bg-white/5 transition-colors"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Order History
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        dispatch(logout());
                        if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/account')) {
                          navigate('/');
                        }
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-lumina-100 dark:border-white/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal('login'))}
                className="hidden md:flex p-2 rounded-full text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-200/40 dark:hover:bg-white/5 hover:text-roseGold transition-colors items-center gap-1.5 text-xs font-medium"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden lg:inline">Sign In</span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative p-2 sm:p-2.5 rounded-full bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-sm"
              title="Shopping Bag"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-roseGold text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-charcoal-900 animate-scale-in">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden overflow-hidden border-t border-lumina-200 dark:border-white/10 bg-lumina-50/95 dark:bg-charcoal-900/95 backdrop-blur-xl"
          >
            <div className="px-4 pt-3 pb-5 space-y-3">
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search serums, foundations, shades..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-charcoal-800 border border-lumina-200 dark:border-white/10 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                />
              </form>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-charcoal-800/80 border border-lumina-200/60 dark:border-white/10 text-xs font-medium text-charcoal-800 dark:text-lumina-100 hover:border-roseGold"
                >
                  All Products
                </Link>
                <Link
                  to="/shop?isBestSeller=true"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-roseGold/10 border border-roseGold/20 text-xs font-semibold text-roseGold"
                >
                  Bestsellers
                </Link>
                <Link
                  to="/shop?categoryId=1"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-charcoal-800/80 border border-lumina-200/60 dark:border-white/10 text-xs font-medium text-charcoal-800 dark:text-lumina-100"
                >
                  Skincare
                </Link>
                <Link
                  to="/shop?categoryId=2"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-charcoal-800/80 border border-lumina-200/60 dark:border-white/10 text-xs font-medium text-charcoal-800 dark:text-lumina-100"
                >
                  Makeup
                </Link>
                <Link
                  to="/shop?categoryId=3"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-charcoal-800/80 border border-lumina-200/60 dark:border-white/10 text-xs font-medium text-charcoal-800 dark:text-lumina-100"
                >
                  Fragrance
                </Link>
                <Link
                  to="/order-tracking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-charcoal-800/80 border border-lumina-200/60 dark:border-white/10 text-xs font-medium text-charcoal-800 dark:text-lumina-100"
                >
                  Track Order
                </Link>
              </div>

              {user?.role === 'Admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-roseGold text-white text-xs font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Admin Console</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
