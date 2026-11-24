import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCoupons, createCoupon, deleteCoupon, fetchCustomers } from '@/api/queries';
import { Plus, Trash2, TicketPercent, X, Check, Users } from 'lucide-react';
import { formatPrice } from '@/utils/cn';

export const AdminCouponsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<number>(0); // 0: %, 1: $
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minimumSpend, setMinimumSpend] = useState<number>(50);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: fetchCoupons,
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsModalOpen(false);
      setCode('');
      setDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      code,
      description,
      discountType,
      discountValue,
      minimumSpend,
      isActive: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-roseGold">Promotions</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Coupons & Client Incentives
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure promotional voucher codes, percentage discounts, and order thresholds.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-roseGold text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-roseGold-dark transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Promo Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-6 bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs space-y-4 relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider">
                  {c.code}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.description}</p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-roseGold/15 text-roseGold">
                {c.discountType === 0 ? `${c.discountValue}% Off` : `$${c.discountValue} Off`}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>Minimum Spend: <strong className="text-slate-900 dark:text-white">{formatPrice(c.minimumSpend)}</strong></p>
              <p>Total Redemptions: <strong className="text-slate-900 dark:text-white">{c.timesUsed} times</strong></p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (confirm(`Delete coupon code ${c.code}?`)) deleteMutation.mutate(c.id);
                }}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#16161C] rounded-2xl border border-slate-200 dark:border-white/10 p-6 z-10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Create Promo Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="e.g. VIP25"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl uppercase font-mono focus:outline-none focus:border-roseGold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 25% off for private launch"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-roseGold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium"
                  >
                    <option value={0}>Percentage (%)</option>
                    <option value={1}>Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Value ({discountType === 0 ? '%' : '$'})</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minimum Spend ($)</label>
                <input
                  type="number"
                  value={minimumSpend}
                  onChange={(e) => setMinimumSpend(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-roseGold text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-roseGold-dark disabled:opacity-50 transition-colors shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminCustomersPage: React.FC = () => {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: fetchCustomers,
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-roseGold">Clientele</span>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          Customer Directory & Lifetime Value
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review customer order histories, total expenditures, and communication details.
        </p>
      </div>

      <div className="bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-roseGold" />
            Registered Clients
          </h3>
          <span className="text-xs text-slate-400">{customers.length} Accounts Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading clients...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No registered customers yet.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{c.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{c.email}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{c.phoneNumber || '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{c.orderCount}</td>
                    <td className="py-3.5 px-4 font-bold text-roseGold">{formatPrice(c.totalSpent)}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
