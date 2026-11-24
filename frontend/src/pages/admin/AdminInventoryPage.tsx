import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInventoryOverview,
  fetchLowStockItems,
  adjustStock,
  fetchInventoryTransactions,
} from '@/api/queries';
import { InventoryItem } from '@/types';
import { formatPrice } from '@/utils/cn';
import {
  Boxes,
  AlertTriangle,
  History,
  X,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(undefined);
  const [quantityChange, setQuantityChange] = useState<number>(10);
  const [reasonType, setReasonType] = useState<number>(1); // Restock = 1, Manual = 2, Damage = 3, Return = 4
  const [reasonDesc, setReasonDesc] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['admin-inventory-overview'],
    queryFn: fetchInventoryOverview,
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: fetchLowStockItems,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['admin-inventory-transactions'],
    queryFn: () => fetchInventoryTransactions(1, 20),
  });

  const transactions = transactionsData?.items || [];

  // Mutations
  const adjustMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
      setReasonDesc('');
    },
  });

  const openAdjustModal = (item: InventoryItem, defaultChange = 10, defaultType = 1) => {
    setSelectedProduct(item);
    setSelectedVariantId(item.variants?.[0]?.variantId);
    setQuantityChange(defaultChange);
    setReasonType(defaultType);
    setReasonDesc(defaultType === 1 ? 'Fresh factory batch restock' : 'Inventory audit correction');
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    adjustMutation.mutate({
      productId: selectedProduct.productId,
      productVariantId: selectedVariantId || undefined,
      quantityChange,
      reasonType,
      reason: reasonDesc,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-roseGold">
          Supply Chain & Stock Control
        </span>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          Real-Time Inventory & Stock Movement Audit
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Stock levels deduct automatically on customer orders and restore on order cancellations.
        </p>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStock.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-amber-800 dark:text-amber-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {lowStock.length} Low Stock Alert{lowStock.length > 1 ? 's' : ''} Detected
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                The following formulations are at or below safety threshold: {lowStock.map((i) => `${i.productName} (${i.currentStock} left)`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => openAdjustModal(lowStock[0], 25, 1)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-amber-700 transition-colors shadow-xs shrink-0"
          >
            Quick Restock ({lowStock[0].productName})
          </button>
        </div>
      )}

      {/* Inventory Stock Levels Table */}
      <div className="bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-roseGold" />
            Warehouse Stock Levels
          </h3>
          <span className="text-xs text-slate-400">
            {inventory.length} Active Formulations Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Formulation</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Retail Value</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading stock levels...</td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 flex items-center space-x-3">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-white/10 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{item.productName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{item.productSku}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.categoryName}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{formatPrice(item.costPrice)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white font-mono">{formatPrice(item.sellingPrice)}</td>
                    <td className="py-3.5 px-4 font-bold text-sm">
                      <span className={item.isLowStock ? 'text-amber-500' : 'text-slate-900 dark:text-white'}>
                        {item.currentStock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.currentStock === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                          Out of Stock
                        </span>
                      ) : item.isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          Low Stock ({item.currentStock})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openAdjustModal(item, 20, 1)}
                        className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-roseGold hover:text-white dark:hover:bg-roseGold dark:hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        + Restock
                      </button>
                      <button
                        onClick={() => openAdjustModal(item, -1, 3)}
                        className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        - Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Audit Log (Transactions) */}
      <div className="bg-white dark:bg-[#141418] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-roseGold" />
            Supply Chain Audit Trail (Real-Time Log)
          </h3>
          <span className="text-xs text-slate-400">Chronological Event Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Formulation</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Adjustment</th>
                <th className="py-3 px-4">Stock After</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                    {t.productName}
                    {t.variantName && <span className="text-[10px] text-roseGold ml-1">({t.variantName})</span>}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      {t.transactionTypeName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {t.quantityChange > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{t.quantityChange}
                      </span>
                    ) : (
                      <span className="text-roseGold flex items-center gap-0.5">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {t.quantityChange}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {t.quantityAfter}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300">
                    {t.reason}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-500 dark:text-slate-400">
                    {t.performedByName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal Dialog */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-white dark:bg-[#16161C] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 z-10 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Adjust Formulation Stock
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 rounded-xl flex items-center space-x-3">
              <img
                src={selectedProduct.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80'}
                alt=""
                className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-white/10"
              />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{selectedProduct.productName}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Current Stock: <strong className="text-slate-900 dark:text-white">{selectedProduct.currentStock} units</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              {selectedProduct.variants?.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Variant
                  </label>
                  <select
                    value={selectedVariantId || ''}
                    onChange={(e) => setSelectedVariantId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium"
                  >
                    {selectedProduct.variants.map((v) => (
                      <option key={v.variantId} value={v.variantId}>
                        {v.variantName} (Current: {v.currentStock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity Adjustment (+ to add, - to deduct) *
                </label>
                <input
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(Number(e.target.value))}
                  required
                  placeholder="+25 or -5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-bold font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason Classification *
                </label>
                <select
                  value={reasonType}
                  onChange={(e) => setReasonType(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium"
                >
                  <option value={1}>Restock (New factory shipment)</option>
                  <option value={2}>Manual Adjustment (Cycle count)</option>
                  <option value={3}>Damage Correction (Expired / Tester)</option>
                  <option value={4}>Return Restock (Client exchange)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Log Reason / Notes *
                </label>
                <input
                  type="text"
                  value={reasonDesc}
                  onChange={(e) => setReasonDesc(e.target.value)}
                  required
                  placeholder="e.g. Received Paris Atelier freight batch #402"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C1C22] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="px-6 py-2 bg-roseGold text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-roseGold-dark disabled:opacity-50 transition-colors shadow-xs"
                >
                  {adjustMutation.isPending ? 'Logging...' : 'Commit Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
