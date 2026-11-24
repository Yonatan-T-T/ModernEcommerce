import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { trackOrderByNumber } from '@/api/queries';
import { formatPrice } from '@/utils/cn';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber: paramOrderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const [inputOrderNumber, setInputOrderNumber] = useState(paramOrderNumber || '');
  const [activeQueryNumber, setActiveQueryNumber] = useState(paramOrderNumber || '');

  useEffect(() => {
    if (paramOrderNumber) {
      setInputOrderNumber(paramOrderNumber);
      setActiveQueryNumber(paramOrderNumber);
    }
  }, [paramOrderNumber]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['tracking', activeQueryNumber],
    queryFn: () => trackOrderByNumber(activeQueryNumber),
    enabled: !!activeQueryNumber,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOrderNumber.trim()) {
      setActiveQueryNumber(inputOrderNumber.trim());
      navigate(`/order-tracking/${encodeURIComponent(inputOrderNumber.trim())}`);
    }
  };

  // Status mapping to steps (0: Pending, 1: Processing, 2: Shipped, 3: Delivered, 4: Cancelled)
  const currentStep = order ? (order.status === 4 ? -1 : order.status) : 0;

  const steps = [
    { title: 'Order Confirmed', desc: 'Ritual registered in atelier', icon: Clock },
    { title: 'Processing', desc: 'Hand-crafted & packed', icon: Package },
    { title: 'In Transit', desc: 'Express dispatch with carrier', icon: Truck },
    { title: 'Delivered', desc: 'Unveiled at your destination', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-roseGold">
          Concierge Delivery
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-900 dark:text-white">
          Track Your Beauty Ritual
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-lumina-400 max-w-sm mx-auto">
          Enter your unique order reference to check hand-packaging status and live courier transit.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={inputOrderNumber}
              onChange={(e) => setInputOrderNumber(e.target.value)}
              placeholder="e.g. LB-20241118-4291"
              required
              className="w-full pl-10 pr-3 py-2.5 text-xs bg-white dark:bg-charcoal-800 border border-lumina-300 dark:border-charcoal-700 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 rounded-xl focus:outline-none focus:border-roseGold uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-charcoal-900 dark:bg-lumina-100 text-white dark:text-charcoal-900 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-roseGold transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="p-12 text-center animate-pulse space-y-4">
          <div className="h-8 bg-lumina-200 dark:bg-charcoal-800 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-lumina-200 dark:bg-charcoal-800 rounded w-1/2 mx-auto" />
        </div>
      )}

      {error && activeQueryNumber && (
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl text-center space-y-2 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Order Not Found</h4>
          <p className="text-xs text-red-600 dark:text-red-400">
            Please verify order reference number <strong className="font-mono">{activeQueryNumber}</strong> and try again.
          </p>
        </div>
      )}

      {order && (
        <div className="bg-white dark:bg-charcoal-800/80 rounded-3xl border border-lumina-200 dark:border-charcoal-700 p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-lumina-100 dark:border-charcoal-700 gap-4">
            <div>
              <span className="text-[11px] text-charcoal-400 font-mono">Reference: {order.orderNumber}</span>
              <h2 className="font-serif text-xl font-bold text-charcoal-900 dark:text-white mt-0.5">
                Current Status: <span className="text-roseGold">{order.statusName}</span>
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              {order.trackingNumber && (
                <div className="px-3 py-1.5 rounded-xl bg-lumina-100 dark:bg-charcoal-700 text-xs font-mono text-charcoal-800 dark:text-lumina-200 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-roseGold" />
                  <span>Tracking: <strong>{order.trackingNumber}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Visual Tracker */}
          <div className="py-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-2 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                        isPassed
                          ? 'bg-roseGold text-white ring-4 ring-roseGold/20'
                          : 'bg-lumina-100 dark:bg-charcoal-700 text-charcoal-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-semibold ${
                          isPassed ? 'text-charcoal-900 dark:text-white' : 'text-charcoal-400'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-charcoal-500 dark:text-lumina-400 max-w-[130px]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Destination & Order Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-lumina-100 dark:border-charcoal-700 text-xs">
            <div className="space-y-2">
              <h4 className="font-semibold text-charcoal-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-roseGold" />
                Shipping Destination
              </h4>
              <p className="text-charcoal-600 dark:text-lumina-300 font-medium">{order.customerName}</p>
              {order.shippingAddress && (
                <p className="text-charcoal-500 leading-relaxed">
                  {order.shippingAddress.streetAddress} {order.shippingAddress.apartment}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-charcoal-900 dark:text-white uppercase tracking-wider text-[11px]">
                Items in This Shipment ({order.items.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {order.items.map((i) => (
                  <div key={i.id} className="flex justify-between items-center text-xs">
                    <span className="text-charcoal-700 dark:text-lumina-200 truncate max-w-[200px]">
                      {i.quantity}x {i.productName} {i.variantName ? `(${i.variantName})` : ''}
                    </span>
                    <span className="font-semibold">{formatPrice(i.subTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
