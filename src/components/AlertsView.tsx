import React, { useState, useMemo } from 'react';
import { ProductItem } from '../types';
import { formatINR } from '../utils/storage';
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AlertsViewProps {
  products: ProductItem[];
  onRestock: (productId: string, quantity: number) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ products, onRestock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [alertType, setAlertType] = useState<'ALL' | 'OUT' | 'LOW'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const allLowStockItems = useMemo(() => {
    return products
      .filter(p => p.quantity <= p.minThreshold)
      .sort((a, b) => a.quantity - b.quantity);
  }, [products]);

  const filteredAlerts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allLowStockItems.filter(item => {
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      const isOut = item.quantity === 0;
      let matchesType = true;
      if (alertType === 'OUT') matchesType = isOut;
      if (alertType === 'LOW') matchesType = !isOut;

      return matchesSearch && matchesType;
    });
  }, [allLowStockItems, searchTerm, alertType]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const validPage = Math.min(page, totalPages);

  const paginatedAlerts = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, validPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-100">
                Automated Restock & Replenishment Monitor
              </p>
              <p className="text-xs text-slate-400">
                Active safety threshold triggers requiring purchase order placement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-400 font-semibold">
              {allLowStockItems.length.toLocaleString()} Active Alert(s)
            </div>
            <div className="text-xs font-mono bg-red-950/60 px-3 py-1.5 rounded-lg border border-red-800 text-red-400 font-semibold">
              {products.filter(p => p.quantity === 0).length.toLocaleString()} Out of Stock
            </div>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert by SKU, item name, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={alertType}
              onChange={(e) => {
                setAlertType(e.target.value as any);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Alerts ({allLowStockItems.length})</option>
              <option value="OUT">Critical: Out of Stock (0 units)</option>
              <option value="LOW">Warning: Below Safety Threshold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      {paginatedAlerts.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedAlerts.map((item) => {
              const isOut = item.quantity === 0;
              const deficit = Math.max(0, item.minThreshold - item.quantity);
              const recommendedReorder = Math.max(10, deficit + 15);

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
                    isOut
                      ? 'bg-red-950/20 border-red-500/40'
                      : 'bg-amber-950/20 border-amber-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                            isOut ? 'bg-red-500 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {isOut ? 'OUT OF STOCK' : 'LOW STOCK WARNING'}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{item.sku}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 capitalize mt-2">{item.name}</h3>
                        <p className="text-xs text-slate-400">Category: {item.category}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold font-mono text-red-400">{item.quantity}</p>
                        <p className="text-[10px] text-slate-500">Current Stock</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Min Threshold</span>
                        <span className="font-bold text-slate-300">{item.minThreshold} units</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Shortage Deficit</span>
                        <span className="font-bold text-red-400">-{deficit} units</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Unit Cost</span>
                        <span className="font-bold text-slate-300">{formatINR(item.unitPrice)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Location: {item.location}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      Recommended Reorder: <b className="text-sky-400 font-mono">+{recommendedReorder} units</b>
                    </span>

                    <button
                      onClick={() => onRestock(item.id, recommendedReorder)}
                      className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>⚡ 1-Click Restock (+{recommendedReorder})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alerts Pagination Bar */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Showing alerts <strong className="text-slate-200">{(validPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-200">{Math.min(validPage * pageSize, filteredAlerts.length)}</strong> of{' '}
              <strong className="text-amber-400">{filteredAlerts.length}</strong> matching triggers
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={validPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="font-mono text-slate-300">
                Page {validPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">No Matching Stock Alerts Found!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search criteria.' : 'All inventory items in this filter currently exceed minimum safety thresholds.'}
          </p>
        </div>
      )}
    </div>
  );
};
