import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { closeAuthModal, setAuthModalTab, setCredentials } from '@/store/slices/authSlice';
import { useTranslation } from '@/i18n/translations';
import api from '@/api/client';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthModalOpen, authModalTab } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      const { data } = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPass,
      });

      if (data.succeeded) {
        dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
        if (data.data.user.role === 'Admin' && !location.pathname.startsWith('/admin')) {
          navigate('/admin');
        } else if (data.data.user.role !== 'Admin' && location.pathname.startsWith('/admin')) {
          navigate('/account');
        }
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/register', {
        fullName,
        email,
        password,
        phoneNumber,
      });

      if (data.succeeded) {
        dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
        if (data.data.user.role === 'Admin') {
          navigate('/admin');
        } else if (location.pathname.startsWith('/admin')) {
          navigate('/account');
        }
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@luminabeauty.com');
    setPassword('Admin123!');
    handleLogin(undefined, 'admin@luminabeauty.com', 'Admin123!');
  };

  const fillDemoCustomer = () => {
    setEmail('sarah.j@example.com');
    setPassword('Customer123!');
    handleLogin(undefined, 'sarah.j@example.com', 'Customer123!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(closeAuthModal())}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-lumina-200 dark:border-charcoal-700 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-roseGold/20 via-lumina-300/30 to-roseGold/20 h-2" />

        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-roseGold">
                {t('auth.concierge')}
              </span>
              <h2 className="font-serif text-2xl font-semibold text-charcoal-900 dark:text-white mt-1">
                {authModalTab === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
              </h2>
            </div>
            <button
              onClick={() => dispatch(closeAuthModal())}
              className="text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Login Bar */}
          <div className="mb-6 p-3 rounded-xl bg-lumina-100 dark:bg-charcoal-800 border border-lumina-200 dark:border-charcoal-700">
            <p className="text-[11px] font-semibold text-charcoal-600 dark:text-lumina-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-roseGold" />
              {t('auth.quickDemo')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="py-1.5 px-2 bg-white dark:bg-charcoal-900 border border-roseGold/40 text-charcoal-800 dark:text-white hover:bg-roseGold hover:text-white dark:hover:bg-roseGold rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-roseGold" />
                {t('auth.adminDemo')}
              </button>
              <button
                type="button"
                onClick={fillDemoCustomer}
                className="py-1.5 px-2 bg-white dark:bg-charcoal-900 border border-lumina-300 dark:border-charcoal-600 text-charcoal-800 dark:text-white hover:bg-roseGold hover:text-white dark:hover:bg-roseGold rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm"
              >
                <UserIcon className="w-3.5 h-3.5 text-charcoal-500" />
                {t('auth.customerDemo')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-lumina-200 dark:border-charcoal-700 mb-6">
            <button
              onClick={() => {
                dispatch(setAuthModalTab('login'));
                setError(null);
              }}
              className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                authModalTab === 'login'
                  ? 'border-roseGold text-roseGold'
                  : 'border-transparent text-charcoal-500 dark:text-lumina-400 hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => {
                dispatch(setAuthModalTab('register'));
                setError(null);
              }}
              className={`pb-2.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                authModalTab === 'register'
                  ? 'border-roseGold text-roseGold'
                  : 'border-transparent text-charcoal-500 dark:text-lumina-400 hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {authModalTab === 'login' ? (
            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sarah.j@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-lumina-50 dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-lumina-50 dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-lumina-50 dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sarah.j@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-lumina-50 dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-lumina-50 dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 dark:text-lumina-300 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-lumina-50 dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-roseGold dark:hover:bg-roseGold dark:hover:text-white transition-all shadow-md disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
