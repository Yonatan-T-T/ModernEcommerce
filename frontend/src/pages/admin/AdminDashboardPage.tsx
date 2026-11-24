import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsDashboard } from '@/api/queries';
import { formatPrice } from '@/utils/cn';
import {
  DollarSign,
  TrendingUp,
  Boxes,
  ShoppingCart,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: fetchAnalyticsDashboard,
    refetchInterval: 15000,
  });

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/60 dark:border-white/5" />
          ))}
        </div>
        <div className="h-72 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/60 dark:border-white/5" />
      </div>
    );
  }

  // Calculate chart max height scale
  const maxRevenueInTrend = Math.max(...analytics.salesTrend.map((d) => d.revenue), 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Overview & Financial Intelligence
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time COGS profit analytics calculated directly as <span className="font-mono text-roseGold font-medium">(Selling Price − Cost Price) × Qty Sold</span>.
        </p>
      </div>

      {/* 4 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Profit */}
        <div className="p-5 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice(analytics.totalNetProfit)}
            </h3>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{analytics.profitMarginPercentage}% Margin</span>
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-roseGold/10 text-roseGold flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice(analytics.totalRevenue)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {analytics.totalOrders} total completed orders
            </p>
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="p-5 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total COGS (Cost)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice(analytics.totalCostOfGoodsSold)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ingredients & production costs
            </p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              {formatPrice(analytics.averageOrderValue)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {analytics.totalCustomers} registered clients
            </p>
          </div>
        </div>
      </div>

      {/* 2. Visual Sales, Cost & Profit Trend Chart */}
      <div className="p-6 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Revenue & Profit Trends (14-Day Performance)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily comparison between gross customer sales and realized profit
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-roseGold" />
              <span>Revenue</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Net Profit</span>
            </span>
          </div>
        </div>

        {/* Responsive Bar Chart */}
        <div className="h-56 w-full flex items-end gap-2 pt-4 border-b border-slate-100 dark:border-white/5">
          {analytics.salesTrend.map((dp, idx) => {
            const revHeight = Math.max(6, (dp.revenue / maxRevenueInTrend) * 180);
            const profHeight = Math.max(4, (dp.profit / maxRevenueInTrend) * 180);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-black text-white text-[10px] p-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-lg border border-white/10">
                  <p className="font-bold">{dp.date}</p>
                  <p className="text-roseGold-light">Revenue: {formatPrice(dp.revenue)}</p>
                  <p className="text-emerald-400">Profit: {formatPrice(dp.profit)}</p>
                  <p className="text-slate-400">Orders: {dp.orderCount}</p>
                </div>

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1">
                  <div
                    className="w-1/2 bg-roseGold/80 hover:bg-roseGold rounded-t-sm transition-all"
                    style={{ height: `${revHeight}px` }}
                  />
                  <div
                    className="w-1/2 bg-emerald-500/80 hover:bg-emerald-500 rounded-t-sm transition-all"
                    style={{ height: `${profHeight}px` }}
                  />
                </div>

                {/* Date Label */}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 truncate w-full text-center">
                  {dp.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Valuation & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Valuation Card */}
        <div className="p-6 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-roseGold" />
              Warehouse Asset Value
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Warehouse Cost Basis</span>
              <p className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {formatPrice(analytics.totalInventoryCostValue)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
              <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Potential Retail Turnover</span>
              <p className="font-serif text-lg font-bold text-roseGold mt-0.5">
                {formatPrice(analytics.totalInventoryRetailValue)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
              <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">Unrealized Potential Profit</span>
              <p className="font-serif text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatPrice(analytics.totalInventoryRetailValue - analytics.totalInventoryCostValue)}
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span>Total Units: <strong className="text-slate-900 dark:text-white">{analytics.totalUnitsInStock}</strong></span>
              <span>Low Stock Alerts: <strong className="text-amber-500">{analytics.lowStockItemCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Category Share */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-roseGold" />
            Revenue by Discipline
          </h3>

          <div className="space-y-4 pt-1">
            {analytics.salesByCategory.map((c) => (
              <div key={c.categoryId} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{c.categoryName}</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    {formatPrice(c.revenue)} ({c.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-roseGold h-2 rounded-full"
                    style={{ width: `${Math.max(4, c.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Top Selling Formulations Table */}
      <div className="p-6 bg-white dark:bg-[#18181D] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            High-Margin & Top Selling Formulations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Per-product profit contribution breakdown
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Formulation</th>
                <th className="py-2.5 px-3">Selling Price</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3">Units Sold</th>
                <th className="py-2.5 px-3">Revenue</th>
                <th className="py-2.5 px-3">Total Cost</th>
                <th className="py-2.5 px-3">Net Profit</th>
                <th className="py-2.5 px-3 rounded-r-lg">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {analytics.topProducts.map((p) => (
                <tr key={p.productId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 flex items-center space-x-2.5">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=80'}
                      alt=""
                      className="w-8 h-8 object-cover rounded-lg border border-slate-200 dark:border-white/10"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{p.productName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{p.sku}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">{formatPrice(p.sellingPrice)}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{formatPrice(p.costPrice)}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{p.unitsSold}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{formatPrice(p.totalRevenue)}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{formatPrice(p.totalCost)}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(p.netProfit)}
                  </td>
                  <td className="py-3 px-3 font-bold text-roseGold">{p.profitMargin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
