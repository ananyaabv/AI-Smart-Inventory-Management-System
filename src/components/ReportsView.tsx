import React, { useState } from 'react';
import { ProductItem, StockTransaction, DetectionLog } from '../types';
import { exportToCSV, downloadSQLDump } from '../utils/storage';
import {
  FileText,
  Download,
  Database,
  History,
  Camera,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface ReportsViewProps {
  products: ProductItem[];
  transactions: StockTransaction[];
  detectionLogs: DetectionLog[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  products,
  transactions,
  detectionLogs
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'transactions' | 'detections'>('transactions');
  const [txFilter, setTxFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = txFilter === 'All' || t.type === txFilter;
    const matchesSearch =
      t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Export & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-100">
                Official Compliance & Data Reports
              </p>
              <p className="text-xs text-slate-400">
                Immutable audit ledger, verification logs, and instant CSV/SQL data exports.
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToCSV(products, `smartstock_inventory_${Date.now()}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Inventory CSV</span>
            </button>

            <button
              onClick={() => exportToCSV(transactions, `smartstock_transactions_${Date.now()}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Transactions CSV (100+)</span>
            </button>

            <button
              onClick={() => downloadSQLDump(products, transactions)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-sm font-semibold"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database SQL Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveReportTab('transactions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeReportTab === 'transactions'
                ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Store Movement Audit Logs ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveReportTab('detections')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeReportTab === 'detections'
                ? 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Shelf Audit History ({detectionLogs.length})</span>
          </button>
        </div>

        {/* Filter Toolbar for Transactions */}
        {activeReportTab === 'transactions' && (
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={txFilter}
                onChange={(e) => setTxFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Transaction Types</option>
                <option value="AI_SCAN_SYNC">Camera Visual Audit</option>
                <option value="IN">Supplier Delivery IN (+)</option>
                <option value="OUT">Customer Sale OUT (-)</option>
                <option value="AUDIT_ADJUST">Inventory Stock Adjustment</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {activeReportTab === 'transactions' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-950/70">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Product SKU & Name</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Quantity Delta</th>
                  <th className="py-3 px-4 font-semibold">Stock Reconciled</th>
                  <th className="py-3 px-4 font-semibold">Operator</th>
                  <th className="py-3 px-4 font-semibold">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTransactions.map((tx) => {
                  const isPositive = tx.quantityChange > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{tx.timestamp}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-100 capitalize">{tx.productName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'AI_SCAN_SYNC'
                            ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                            : tx.type === 'IN'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-950/60 text-red-300 border border-red-500/40'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isPositive ? 'text-emerald-400' : 'text-red-400'}>
                          {isPositive ? `+${tx.quantityChange}` : tx.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {tx.previousQuantity} → <b className="text-slate-100">{tx.newQuantity}</b>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{tx.performedBy}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans">{tx.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-950/70">
                  <th className="py-3 px-4 font-semibold">Scan Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Image Source</th>
                  <th className="py-3 px-4 font-semibold">Total Verified</th>
                  <th className="py-3 px-4 font-semibold">Products Identified</th>
                  <th className="py-3 px-4 font-semibold">Inventory Updated?</th>
                  <th className="py-3 px-4 font-semibold">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {detectionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{log.imageName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-400 text-sm">{log.totalCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {log.itemsDetected.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono"
                          >
                            {item.label}: <b>{item.count}</b>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {log.appliedToInventory ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Yes (Synced)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Scanned Only</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
