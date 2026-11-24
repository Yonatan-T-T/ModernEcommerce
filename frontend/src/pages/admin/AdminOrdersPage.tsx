import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminOrders, updateOrderStatus } from '@/api/queries';
import { Order } from '@/types';
import { formatPrice } from '@/utils/cn';
import {
  ShoppingBag,
  Truck,
  ExternalLink,
  X,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState<number | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState<number>(0);
  const [newTracking, setNewTracking] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', selectedStatus],
    queryFn: () => fetchAdminOrders(1, 50, selectedStatus),
  });

  const orders = ordersData?.items || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-overview'] });
      setIsDetailsOpen(false);
    },
  });

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewTracking(order.trackingNumber || '');
    setStatusNotes(order.notes || '');
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateMutation.mutate({
      id: selectedOrder.id,
      data: {
        status: newStatus,
        trackingNumber: newTracking || undefined,
        notes: statusNotes || undefined,
      },
    });
  };

  const statusColors: Record<number, string> = {
    0: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    1: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300',
    3: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    4: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-roseGold">
            Client Fulfillment
          </span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Order Fulfillment & Profit Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track order delivery stages, inspect line-item margins, and manage courier tracking.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedStatus === undefined ? '' : selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value === '' ? undefined : Number(e.target.value))}
            className="px-3.5 py-2 text-xs bg-white dark:bg-[#16161C] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-roseGold font-medium"
          >
            <option value="">All Orders ({orders.length})</option>
            <option value={0}>Pending</option>
            <option value={1}>Processing</option>
            <option value={2}>Shipped</option>
            <option value={3}>Delivered</option>
            <option value={4}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Cost (COGS)</th>
                <th className="py-3 px-4">Net Profit</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{o.customerName}</p>
                      <p className="text-[10px] text-slate-400">{o.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[o.status] || ''}`}>
                        {o.statusName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{formatPrice(o.totalAmount)}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{formatPrice(o.totalCost)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(o.netProfit)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDetails(o)}
                        className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-roseGold hover:text-white dark:hover:bg-roseGold dark:hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Inspect & Fulfill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Status Updater Modal */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)} />

          <div className="relative w-full max-w-2xl bg-white dark:bg-[#16161C] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/10 pb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-bold text-roseGold">Order Inspection</span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profit & Financial Breakdown Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Order Revenue</span>
                <p className="font-serif text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {formatPrice(selectedOrder.totalAmount)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Formulation Cost (COGS)</span>
                <p className="font-serif text-base font-bold text-slate-500 mt-0.5">
                  {formatPrice(selectedOrder.totalCost)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Net Realized Profit</span>
                <p className="font-serif text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatPrice(selectedOrder.netProfit)} ({selectedOrder.profitMargin}%)
                </p>
              </div>
            </div>

            {/* Items with Profit per item */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Purchased Formulations & Unit Economics
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                {selectedOrder.items.map((i) => (
                  <div key={i.id} className="p-3.5 flex items-center justify-between text-xs bg-white dark:bg-[#16161C]">
                    <div className="flex items-center space-x-3">
                      <img
                        src={i.productImageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-white/10 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{i.productName}</p>
                        {i.variantName && <p className="text-[10px] text-roseGold">{i.variantName}</p>}
                        <p className="text-[10px] text-slate-400">Unit Price: {formatPrice(i.unitPrice)} | Unit Cost: {formatPrice(i.unitCost)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">{formatPrice(i.subTotal)} ({i.quantity}x)</p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Profit: +{formatPrice(i.profit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Courier Fulfillment Form */}
            <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-4 text-xs">
              <h4 className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Fulfillment Controls
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Update Order Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-semibold"
                  >
                    <option value={0}>Pending (Awaiting fulfillment)</option>
                    <option value={1}>Processing (Hand-packaging in Atelier)</option>
                    <option value={2}>Shipped (In transit with courier)</option>
                    <option value={3}>Delivered (Arrived safely)</option>
                    <option value={4}>Cancelled (Restores stock to inventory)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Courier Tracking Reference
                  </label>
                  <input
                    type="text"
                    value={newTracking}
                    onChange={(e) => setNewTracking(e.target.value)}
                    placeholder="e.g. 1Z9999999999999999"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 bg-roseGold text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-roseGold-dark disabled:opacity-50 transition-colors shadow-xs"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Commit Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
