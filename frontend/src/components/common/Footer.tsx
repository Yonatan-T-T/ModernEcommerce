import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { showToast } from '@/store/slices/toastSlice';
import { ShieldCheck, Truck, Sparkles, HeartHandshake, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  const dispatch = useDispatch();
  const { config } = useSelector((state: RootState) => state.config);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    dispatch(
      showToast({
        message: 'Welcome to Lumina Society! Use code LUMINA15 for 15% off.',
        type: 'success',
      })
    );
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-lumina-100 dark:bg-charcoal-950 border-t border-lumina-200 dark:border-white/10 transition-colors pb-20 md:pb-0">
      {/* Brand Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-lumina-200/60 dark:border-charcoal-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-roseGold/10 flex items-center justify-center text-roseGold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">Active Molecular Purity</h4>
              <p className="text-xs text-charcoal-500 dark:text-lumina-400">Clinical actives & rare botanical oils</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-roseGold/10 flex items-center justify-center text-roseGold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">Express Delivery</h4>
              <p className="text-xs text-charcoal-500 dark:text-lumina-400">Complimentary over {config.currencySymbol}{config.freeShippingThreshold}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-roseGold/10 flex items-center justify-center text-roseGold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">Dermatologist Tested</h4>
              <p className="text-xs text-charcoal-500 dark:text-lumina-400">Hypoallergenic & non-comedogenic</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-roseGold/10 flex items-center justify-center text-roseGold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-charcoal-900 dark:text-white">Ethical Luxury</h4>
              <p className="text-xs text-charcoal-500 dark:text-lumina-400">100% Leaping Bunny certified cruelty-free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl tracking-widest uppercase font-semibold text-charcoal-900 dark:text-white">
                {config.storeName}
              </span>
            </Link>
            <p className="text-xs text-charcoal-600 dark:text-lumina-300 leading-relaxed max-w-sm">
              Crafted in limited small-batch formulations. Lumina Beauty marries cutting-edge multi-peptide cellular science with timeless Parisian couture aesthetics for luminous, immortal skin.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-lumina-200/50 dark:bg-charcoal-800 text-charcoal-600 dark:text-lumina-300 hover:text-roseGold hover:bg-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-lumina-200/50 dark:bg-charcoal-800 text-charcoal-600 dark:text-lumina-300 hover:text-roseGold hover:bg-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-lumina-200/50 dark:bg-charcoal-800 text-charcoal-600 dark:text-lumina-300 hover:text-roseGold hover:bg-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-4">
              The Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-600 dark:text-lumina-300">
              <li><Link to="/shop?categoryId=1" className="hover:text-roseGold transition-colors">Peptide Skincare</Link></li>
              <li><Link to="/shop?categoryId=2" className="hover:text-roseGold transition-colors">Silk Foundations</Link></li>
              <li><Link to="/shop?categoryId=3" className="hover:text-roseGold transition-colors">Haute Parfumerie</Link></li>
              <li><Link to="/shop?categoryId=4" className="hover:text-roseGold transition-colors">Botanical Body Elixirs</Link></li>
              <li><Link to="/shop?isBestSeller=true" className="hover:text-roseGold transition-colors">The Bestsellers</Link></li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-4">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-600 dark:text-lumina-300">
              <li><Link to="/order-tracking" className="hover:text-roseGold transition-colors">Track Your Order</Link></li>
              <li><Link to="/account" className="hover:text-roseGold transition-colors">My Beauty Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-roseGold transition-colors">Curated Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-roseGold transition-colors">Shopping Bag</Link></li>
              <li><span className="text-charcoal-400 dark:text-charcoal-500 cursor-not-allowed">Complimentary Consultation</span></li>
            </ul>
          </div>

          {/* VIP Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-white mb-4">
              The Lumina Society
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-lumina-300 mb-3">
              Receive private invitations, seasonal formulations, and 15% off your inaugural ritual.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-charcoal-900 border border-lumina-300 dark:border-white/10 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 text-xs font-semibold rounded-xl hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-colors"
              >
                Join Private List
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-lumina-200/60 dark:border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 dark:text-lumina-400">
          <p>© {new Date().getFullYear()} {config.storeName}. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-roseGold cursor-pointer">Privacy Policy</span>
            <span className="hover:text-roseGold cursor-pointer">Terms of Service</span>
            <span className="hover:text-roseGold cursor-pointer">Sustainability Report</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
