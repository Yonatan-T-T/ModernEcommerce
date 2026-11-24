import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
      setSearchTerm('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-lumina-50/90 dark:bg-charcoal-900/90 backdrop-blur-md border-b border-lumina-200/50 dark:border-charcoal-700/50 transition-colors">
      {/* Luxury Promo Bar */}
      <div className="bg-gradient-to-r from-roseGold/20 via-lumina-300/30 to-roseGold/20 dark:from-roseGold-dark/40 dark:via-charcoal-800 dark:to-roseGold-dark/40 py-1.5 px-4 text-center text-xs tracking-wider uppercase font-medium text-charcoal-700 dark:text-lumina-200">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-roseGold animate-pulse" />
          Complimentary Worldwide Shipping on Orders Over {config.currencySymbol}{config.freeShippingThreshold} | Code: <span className="font-bold underline">LUMINA15</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-charcoal-800 dark:text-lumina-100 hover:text-roseGold transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Left Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
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
              <span className="font-serif text-2xl sm:text-3xl tracking-widest uppercase font-semibold text-charcoal-900 dark:text-white group-hover:text-roseGold transition-colors">
                {config.storeName}
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-charcoal-500 dark:text-lumina-400 font-medium">
                {config.tagline || 'Haute Parfumerie & Skincare'}
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Trigger */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search beauty elixirs, shades..."
                    autoFocus
                    className="w-48 sm:w-64 pl-3 pr-8 py-1.5 text-xs bg-lumina-100 dark:bg-charcoal-800 rounded-full border border-lumina-300 dark:border-charcoal-600 focus:outline-none focus:border-roseGold"
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
                  className="p-2 text-charcoal-700 dark:text-lumina-200 hover:text-roseGold transition-colors"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-charcoal-700 dark:text-lumina-200 hover:text-roseGold transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-charcoal-700 dark:text-lumina-200 hover:text-roseGold transition-colors hidden sm:block"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-roseGold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            <div className="relative">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1.5 p-1.5 rounded-full hover:bg-lumina-200/50 dark:hover:bg-charcoal-800 transition-colors"
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

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-charcoal-800 rounded-xl shadow-luxury border border-lumina-200 dark:border-charcoal-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onMouseLeave={() => setIsProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-lumina-100 dark:border-charcoal-700">
                        <p className="text-xs font-semibold text-charcoal-900 dark:text-white truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-charcoal-500 dark:text-lumina-400 truncate">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-roseGold/10 text-roseGold">
                          {user.role}
                        </span>
                      </div>

                      {user.role === 'Admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-medium text-roseGold hover:bg-lumina-100 dark:hover:bg-charcoal-700 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/account"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-100 dark:hover:bg-charcoal-700 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        My Account & Profile
                      </Link>

                      <Link
                        to="/account?tab=orders"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-charcoal-700 dark:text-lumina-200 hover:bg-lumina-100 dark:hover:bg-charcoal-700 transition-colors"
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
                        className="flex items-center w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-lumina-100 dark:border-charcoal-700"
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
                  className="p-2 text-charcoal-700 dark:text-lumina-200 hover:text-roseGold transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Shopping Bag / Cart Button */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative p-2.5 rounded-full bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-sm"
              title="Shopping Bag"
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
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-lumina-200 dark:border-charcoal-700 bg-lumina-50 dark:bg-charcoal-900 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-charcoal-800 dark:text-lumina-100 hover:text-roseGold"
          >
            All Products
          </Link>
          <Link
            to="/shop?categoryId=1"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-charcoal-800 dark:text-lumina-100 hover:text-roseGold"
          >
            Skincare
          </Link>
          <Link
            to="/shop?categoryId=2"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-charcoal-800 dark:text-lumina-100 hover:text-roseGold"
          >
            Makeup
          </Link>
          <Link
            to="/shop?categoryId=3"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-charcoal-800 dark:text-lumina-100 hover:text-roseGold"
          >
            Fragrance
          </Link>
          <Link
            to="/shop?isBestSeller=true"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold py-1.5 text-roseGold"
          >
            Bestsellers
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-charcoal-800 dark:text-lumina-100 hover:text-roseGold"
          >
            Wishlist ({wishlistIds.length})
          </Link>
          <Link
            to="/order-tracking"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium py-1.5 text-charcoal-800 dark:text-lumina-100 hover:text-roseGold"
          >
            Track Order
          </Link>
          {user?.role === 'Admin' && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold py-1.5 text-roseGold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
