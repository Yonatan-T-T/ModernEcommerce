import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleCartDrawer } from '@/store/slices/cartSlice';
import { openAuthModal } from '@/store/slices/authSlice';
import { useTranslation } from '@/i18n/translations';
import { Home, Sparkles, Heart, ShoppingBag, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { items } = useSelector((state: RootState) => state.cart);
  const { productIds: wishlistIds } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/account');
    } else {
      dispatch(openAuthModal('login'));
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-charcoal-900/95 backdrop-blur-xl border-t border-lumina-200/80 dark:border-white/10 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors ${
              isActive
                ? 'text-roseGold'
                : 'text-charcoal-500 dark:text-lumina-400 hover:text-charcoal-900 dark:hover:text-white'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">{t('mobile.home')}</span>
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors ${
              isActive
                ? 'text-roseGold'
                : 'text-charcoal-500 dark:text-lumina-400 hover:text-charcoal-900 dark:hover:text-white'
            }`
          }
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">{t('mobile.shop')}</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors ${
              isActive
                ? 'text-roseGold'
                : 'text-charcoal-500 dark:text-lumina-400 hover:text-charcoal-900 dark:hover:text-white'
            }`
          }
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-roseGold text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-wide">{t('mobile.saved')}</span>
        </NavLink>

        <button
          type="button"
          onClick={() => dispatch(toggleCartDrawer())}
          className="relative flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl text-charcoal-500 dark:text-lumina-400 hover:text-roseGold transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-roseGold text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-wide">{t('mobile.bag')}</span>
        </button>

        <button
          type="button"
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl transition-colors ${
            location.pathname.startsWith('/account')
              ? 'text-roseGold'
              : 'text-charcoal-500 dark:text-lumina-400 hover:text-charcoal-900 dark:hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">
            {isAuthenticated ? t('mobile.account') : t('nav.signIn')}
          </span>
        </button>
      </div>
    </nav>
  );
};
