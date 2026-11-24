import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeAndConfigSlices';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
  Store,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { config } = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Route protection
  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-lumina-50 dark:bg-charcoal-900">
        <div className="max-w-md w-full bg-white dark:bg-charcoal-800 p-8 rounded-3xl border border-lumina-200 dark:border-charcoal-700 text-center space-y-4 shadow-xl">
          <ShieldCheck className="w-12 h-12 text-roseGold mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-white">
            Admin Access Restricted
          </h2>
          <p className="text-xs text-charcoal-500 dark:text-lumina-400">
            This console is reserved for administrators. Please sign in with an administrator account (Demo: <code className="bg-lumina-100 dark:bg-charcoal-900 px-1.5 py-0.5 rounded font-mono text-roseGold">admin@luminabeauty.com</code>).
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-roseGold transition-colors"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    end?: boolean;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'Analytics & Overview',
      items: [
        { to: '/admin', label: 'Dashboard & Profit', icon: LayoutDashboard, end: true },
      ],
    },
    {
      title: 'Catalog & Inventory',
      items: [
        { to: '/admin/products', label: 'Products & Variants', icon: Package },
        { to: '/admin/inventory', label: 'Inventory & Stock Logs', icon: Boxes },
        { to: '/admin/categories-brands', label: 'Categories & Brands', icon: Tags },
      ],
    },
    {
      title: 'Orders & Customers',
      items: [
        { to: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
        { to: '/admin/customers', label: 'Customer Directory', icon: Users },
        { to: '/admin/coupons', label: 'Coupons & Discounts', icon: TicketPercent },
      ],
    },
  ];

  const currentSection = navSections
    .flatMap((s) => s.items)
    .find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] dark:bg-[#0E0E11] text-charcoal-900 dark:text-lumina-100 font-sans transition-colors">
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#141418] border-r border-slate-200/80 dark:border-white/10 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Admin Header */}
          <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <Link to="/admin" className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-wider text-charcoal-900 dark:text-white uppercase">
                {config.storeName}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-roseGold font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                Management Console
              </span>
            </Link>
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-6 flex-1">
            {navSections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  {sec.title}
                </p>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-roseGold text-white shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-white/10 space-y-1.5 bg-slate-50/50 dark:bg-white/[0.02]">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-roseGold transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Store className="w-4 h-4 text-roseGold" />
                <span>Customer Store</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <button
              onClick={() => {
                dispatch(logout());
                navigate('/');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#141418] border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-white">Admin</span>
              <span>/</span>
              <span className="text-roseGold font-medium">{currentSection?.label || 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Pill */}
            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 dark:border-white/10">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-roseGold"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-roseGold text-white text-xs font-bold flex items-center justify-center">
                  {user.fullName.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-roseGold font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
