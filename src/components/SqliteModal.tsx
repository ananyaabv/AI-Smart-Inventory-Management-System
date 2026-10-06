import React from 'react';
import { ProductItem, StockTransaction } from '../types';
import { generateSQLiteDump, downloadSQLDump } from '../utils/storage';
import { Database, Download, Copy, Check, X, Table, Code2 } from 'lucide-react';

interface SqliteModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  transactions: StockTransaction[];
}

export const SqliteModal: React.FC<SqliteModalProps> = ({
  isOpen,
  onClose,
  products,
  transactions
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const sqlDump = generateSQLiteDump(products, transactions);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">
                Store Master Database Archive & Export
              </h3>
              <p className="text-xs text-slate-400">
                Official store catalog data, transaction audit trails, and SQL backup records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Metrics */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/80 border-b border-slate-800 text-xs font-mono">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Catalog Products</span>
            <span className="text-base font-bold text-sky-400">{products.length.toLocaleString()} items</span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Transaction Audits</span>
            <span className="text-base font-bold text-emerald-400">{transactions.length.toLocaleString()} logs</span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Storage System</span>
            <span className="text-base font-bold text-purple-400">Enterprise SQL</span>
          </div>
        </div>

        {/* SQL Preview */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300">
          <pre className="whitespace-pre select-text">{sqlDump}</pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied SQL!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy SQL Dump</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => downloadSQLDump(products, transactions)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Database Backup (.sql)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
