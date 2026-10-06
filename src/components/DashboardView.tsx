import React, { useState, useMemo } from 'react';
import { ProductItem, StockTransaction } from '../types';
import { formatINR } from '../utils/storage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  IndianRupee,
  Package,
  Layers,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardViewProps {
  products: ProductItem[];
  transactions: StockTransaction[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ products, transactions }) => {
  // Aggregate KPIs
  const totalUnits = useMemo(() => products.reduce((acc, p) => acc + p.quantity, 0), [products]);
  const totalValuation = useMemo(() => products.reduce((acc, p) => acc + p.quantity * p.unitPrice, 0), [products]);
  const categoriesCount = useMemo(() => new Set(products.map(p => p.category)).size, [products]);
  const lowStockProducts = useMemo(() => products.filter(p => p.quantity <= p.minThreshold && p.quantity > 0), [products]);
  const outOfStockProducts = useMemo(() => products.filter(p => p.quantity === 0), [products]);
  const optimalProducts = useMemo(() => products.filter(p => p.quantity > p.minThreshold), [products]);

  // Category Stock Units & Difference Analysis
  const categoryAnalytics = useMemo(() => {
    const map: {
      [cat: string]: {
        units: number;
        targetUnits: number;
        valuation: number;
        skuCount: number;
      };
    } = {};

    products.forEach(p => {
      if (!map[p.category]) {
        map[p.category] = { units: 0, targetUnits: 0, valuation: 0, skuCount: 0 };
      }
      map[p.category].units += p.quantity;
      map[p.category].targetUnits += p.minThreshold;
      map[p.category].valuation += p.quantity * p.unitPrice;
      map[p.category].skuCount += 1;
    });

    return Object.entries(map).map(([category, data]) => {
      const unitDifference = data.units - data.targetUnits;
      const percentDiff = data.targetUnits > 0
        ? Math.round((unitDifference / data.targetUnits) * 100)
        : 0;

      let healthStatus: 'Healthy Surplus' | 'Balanced' | 'Reorder Warning' = 'Healthy Surplus';
      if (unitDifference < 0) {
        healthStatus = 'Reorder Warning';
      } else if (unitDifference <= data.targetUnits * 0.25) {
        healthStatus = 'Balanced';
      }

      return {
        category,
        currentUnits: data.units,
        targetUnits: data.targetUnits,
        unitDifference,
        percentDiff,
        healthStatus,
        valuation: Math.round(data.valuation),
        skuCount: data.skuCount
      };
    }).sort((a, b) => b.currentUnits - a.currentUnits);
  }, [products]);

  // Chart data for comparing current units vs target threshold units by category
  const categoryComparisonChartData = useMemo(() => {
    return categoryAnalytics.map(item => ({
      name: item.category.length > 14 ? `${item.category.slice(0, 12)}...` : item.category,
      fullName: item.category,
      'Current Stock Units': item.currentUnits,
      'Target Min Safe Units': item.targetUnits,
      'Unit Difference': item.unitDifference
    }));
  }, [categoryAnalytics]);

  // Health Distribution Data
  const healthData = [
    { name: 'Optimal Stock', value: optimalProducts.length, color: '#10B981' },
    { name: 'Low Stock Warning', value: lowStockProducts.length, color: '#F59E0B' },
    { name: 'Out of Stock', value: outOfStockProducts.length, color: '#EF4444' }
  ];

  // Transactions State: Search, Filter, Pagination for 100+ transactions
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT' | 'AI_SCAN_SYNC' | 'AUDIT_ADJUST'>('ALL');
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchesSearch =
        searchTerm === '' ||
        tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, typeFilter, searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  const handleTypeFilterChange = (type: 'ALL' | 'IN' | 'OUT' | 'AI_SCAN_SYNC' | 'AUDIT_ADJUST') => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Units */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Physical Units</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 mt-3">{totalUnits.toLocaleString()} <span className="text-sm font-normal text-slate-400">units</span></p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Live store catalog across {products.length.toLocaleString()} SKUs</span>
          </div>
        </div>

        {/* Total Store Valuation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Store Valuation</span>
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-3">
            {formatINR(totalValuation)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <span>Current inventory asset retail valuation</span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Departments</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-100 mt-3">{categoriesCount} <span className="text-sm font-normal text-slate-400">Categories</span></p>
          <div className="flex items-center gap-1.5 text-xs text-purple-300 mt-2 font-medium">
            <span>Multi-category store inventory</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Replenishment Priority</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 mt-3">
            {lowStockProducts.length + outOfStockProducts.length} <span className="text-sm font-normal text-slate-400">SKUs</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 mt-2 font-medium">
            <span>{outOfStockProducts.length > 0 ? `${outOfStockProducts.length} depleted, ${lowStockProducts.length} low` : 'Replenishment recommended'}</span>
          </div>
        </div>
      </div>

      {/* SECTION: DIFFERENCE IN STOCK UNITS BY CATEGORY */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <ArrowUpDown className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Stock Units Difference & Variance by Category
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comparison between current stocked physical units and baseline safety threshold requirements for each department.
            </p>
          </div>
          <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 self-start sm:self-auto">
            Net Surplus: <span className="text-emerald-400 font-bold">+{categoryAnalytics.reduce((acc, c) => acc + c.unitDifference, 0).toLocaleString()} Units</span>
          </div>
        </div>

        {/* Comparative Units Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryComparisonChartData} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(value: any, name: string) => [
                  `${Number(value).toLocaleString()} Units`,
                  name
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Bar dataKey="Current Stock Units" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Target Min Safe Units" fill="#64748B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Category Unit Differences Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-950/80">
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-right">Current Stock Units</th>
                <th className="py-3 px-4 font-semibold text-right">Target Baseline</th>
                <th className="py-3 px-4 font-semibold text-right">Difference in Units</th>
                <th className="py-3 px-4 font-semibold text-right">Unit Variance %</th>
                <th className="py-3 px-4 font-semibold text-center">SKU Count</th>
                <th className="py-3 px-4 font-semibold text-right">Inventory Value</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {categoryAnalytics.map((cat) => {
                const isSurplus = cat.unitDifference >= 0;
                return (
                  <tr key={cat.category} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200 font-sans">{cat.category}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">{cat.currentUnits.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{cat.targetUnits.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isSurplus
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-950/60 text-red-300 border border-red-500/30'
                      }`}>
                        {isSurplus ? `+${cat.unitDifference.toLocaleString()} Surplus` : `${cat.unitDifference.toLocaleString()} Deficit`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${isSurplus ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isSurplus ? `+${cat.percentDiff}%` : `${cat.percentDiff}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">{cat.skuCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-semibold">{formatINR(cat.valuation)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        cat.healthStatus === 'Healthy Surplus'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : cat.healthStatus === 'Balanced'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {cat.healthStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: 100+ RECENT STOCK MOVEMENT TRANSACTIONS (AUDIT TRAIL) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Recent Stock Movement Transactions (Audit Trail)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comprehensive chronological ledger of 100+ stock movements across camera audits, vendor intakes, dispatches, and executive adjustments.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <span>Total Recorded:</span>
            <span className="text-sky-400 font-bold">{transactions.length} Transactions</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {(['ALL', 'AI_SCAN_SYNC', 'IN', 'OUT', 'AUDIT_ADJUST'] as const).map((type) => {
              const labelMap: Record<string, string> = {
                ALL: `All (${transactions.length})`,
                AI_SCAN_SYNC: 'AI Shelf Scans',
                IN: 'Stock Intake (IN)',
                OUT: 'Dispatched (OUT)',
                AUDIT_ADJUST: 'Audit Adjustments'
              };
              const count = type === 'ALL'
                ? transactions.length
                : transactions.filter(t => t.type === type).length;

              const isSelected = typeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeFilterChange(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  {labelMap[type]} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input & Page Size */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search 100+ transactions..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={15}>15 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={200}>All (100+)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-950/80">
                <th className="py-2.5 px-4 font-semibold">TX ID</th>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold">Product Name</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold text-right">Quantity Change</th>
                <th className="py-2.5 px-4 font-semibold text-center">Previous → New</th>
                <th className="py-2.5 px-4 font-semibold">Authorized By</th>
                <th className="py-2.5 px-4 font-semibold">Operational Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedTransactions.map((tx) => {
                const isPositive = tx.quantityChange > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{tx.id}</td>
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">{tx.timestamp}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-200 capitalize font-sans">{tx.productName}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                        tx.type === 'AI_SCAN_SYNC'
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                          : tx.type === 'IN'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : tx.type === 'OUT'
                          ? 'bg-red-950/60 text-red-300 border border-red-500/40'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold font-mono">
                      <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                        {isPositive ? `+${tx.quantityChange}` : tx.quantityChange}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-300 font-mono text-[11px]">
                      {tx.previousQuantity} → <b className="text-slate-100">{tx.newQuantity}</b>
                    </td>
                    <td className="py-2.5 px-4 text-slate-200 font-sans text-[11px] whitespace-nowrap">{tx.performedBy}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans truncate max-w-xs text-[11px]" title={tx.reason}>
                      {tx.reason}
                    </td>
                  </tr>
                );
              })}
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{Math.min(filteredTransactions.length, (currentPage - 1) * rowsPerPage + 1)}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(filteredTransactions.length, currentPage * rowsPerPage)}</span> of{' '}
            <span className="font-semibold text-slate-200">{filteredTransactions.length}</span> transactions
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
