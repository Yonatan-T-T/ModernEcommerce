import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { RootState } from '@/store/store';
import { dismissToast } from '@/store/slices/toastSlice';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { toasts } = useSelector((state: RootState) => state.toast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), 3200)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto z-[60] flex flex-col items-center md:items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon =
            t.type === 'error'
              ? AlertCircle
              : t.type === 'info'
              ? Info
              : CheckCircle2;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-charcoal-900/95 dark:bg-charcoal-800/95 text-white backdrop-blur-xl border border-white/10 shadow-2xl max-w-sm w-full md:w-auto"
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  t.type === 'error'
                    ? 'text-red-400'
                    : t.type === 'info'
                    ? 'text-roseGold-light'
                    : 'text-emerald-400'
                }`}
              />
              <span className="text-xs font-medium flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => dispatch(dismissToast(t.id))}
                className="text-white/50 hover:text-white p-0.5 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
