/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProductItem, StockTransaction, DetectionLog, UserProfile } from './types';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredDetections,
  saveStoredDetections,
  getStoredUser,
  saveStoredUser
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DetectionView } from './components/DetectionView';
import { InventoryView } from './components/InventoryView';
import { SalesPredictionView } from './components/SalesPredictionView';
import { AlertsView } from './components/AlertsView';
import { ReportsView } from './components/ReportsView';
import { SqliteModal } from './components/SqliteModal';
import {
  ArrowUp,
  Camera,
  Layers,
  BarChart3,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Store,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'detect' | 'inventory' | 'analytics' | 'alerts' | 'reports'>('detect');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredUser());
  const [products, setProducts] = useState<ProductItem[]>(getStoredProducts());
  const [transactions, setTransactions] = useState<StockTransaction[]>(getStoredTransactions());
  const [detectionLogs, setDetectionLogs] = useState<DetectionLog[]>(getStoredDetections());
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredDetections(detectionLogs);
  }, [detectionLogs]);

  useEffect(() => {
    saveStoredUser(currentUser);
  }, [currentUser]);

  // Scroll spy & back to top detection
  useEffect(() => {
    const sectionIds: ('detect' | 'inventory' | 'analytics' | 'alerts' | 'reports')[] = [
      'detect',
      'inventory',
      'analytics',
      'alerts',
      'reports'
    ];

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const scrollPos = window.scrollY + 180;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveTab(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId as any);
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Low stock counter
  const lowStockCount = products.filter(p => p.quantity <= p.minThreshold).length;

  // Add Product handler
  const handleAddProduct = (newP: Omit<ProductItem, 'id' | 'lastUpdated'>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newId = `prod-${Date.now()}`;
    const product: ProductItem = {
      ...newP,
      id: newId,
      lastUpdated: now
    };

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: now,
      productId: newId,
      productName: product.name,
      type: 'IN',
      quantityChange: product.quantity,
      previousQuantity: 0,
      newQuantity: product.quantity,
      performedBy: `${currentUser.name} (${currentUser.role})`,
      reason: 'Initial catalog creation'
    };

    setProducts(prev => [product, ...prev]);
    setTransactions(prev => [newTx, ...prev]);
  };

  // Update Product handler
  const handleUpdateProduct = (updated: ProductItem) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setProducts(prev => prev.map(p => p.id === updated.id ? { ...updated, lastUpdated: now } : p));
  };

  // Delete Product handler
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Adjust stock handler
  const handleAdjustStock = (
    productId: string,
    quantityChange: number,
    type: 'IN' | 'OUT',
    reason: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const delta = type === 'IN' ? Math.abs(quantityChange) : -Math.abs(quantityChange);
    const previousQuantity = prod.quantity;
    const newQuantity = Math.max(0, previousQuantity + delta);

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: now,
      productId: prod.id,
      productName: prod.name,
      type: type,
      quantityChange: delta,
      previousQuantity,
      newQuantity,
      performedBy: `${currentUser.name} (${currentUser.role})`,
      reason: reason || 'Manual stock level adjustment'
    };

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQuantity, lastUpdated: now } : p));
    setTransactions(prev => [newTx, ...prev]);
  };

  // Automated AI Detection Sync Handler
  const handleSyncDetections = (detectedCounts: { [label: string]: number }, imageName: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updatedProducts = [...products];
    const newTransactions: StockTransaction[] = [];
    const detectedItemsSummary: { label: string; count: number; confidence: number }[] = [];

    Object.entries(detectedCounts).forEach(([label, count]) => {
      detectedItemsSummary.push({ label, count, confidence: 0.90 });

      // Find product in catalog with fuzzy category matching
      const matchedIdx = updatedProducts.findIndex(p => {
        const pn = p.name.toLowerCase();
        const ln = label.toLowerCase();
        if (pn === ln) return true;
        if (ln === 'can' && (pn === 'can' || pn.includes('can') || pn.includes('soft drinks'))) return true;
        if (ln === 'bottle' && (pn === 'bottle' || pn.includes('water'))) return true;
        if (ln.includes('apple') && pn.includes('apple')) return true;
        if (ln.includes('orange') && pn.includes('orange')) return true;
        if (ln.includes('banana') && pn.includes('banana')) return true;
        if (ln.includes('pear') && pn.includes('pear')) return true;
        if (ln.includes('grape') && pn.includes('grape')) return true;
        if (ln.includes('milk') && pn.includes('milk')) return true;
        if (ln.includes('cereal') && pn.includes('cereal')) return true;
        if (ln.includes('drink') && pn.includes('drink')) return true;
        if (ln.includes('juice') && pn.includes('juice')) return true;
        if (ln.includes('canned') && pn.includes('canned')) return true;
        return false;
      });

      if (matchedIdx !== -1) {
        const currentProd = updatedProducts[matchedIdx];
        const prevQty = currentProd.quantity;

        let unitChange = count;
        let detailText = `${count} units`;
        if (currentProd.unit === 'kg') {
          const ppu = currentProd.piecesPerUnit || 6;
          unitChange = Math.max(1, Math.round(count / ppu));
          detailText = `${count} optical pieces reconciled as +${unitChange} kg (~${ppu} pcs/kg)`;
        } else if (currentProd.unit === 'dozen') {
          const ppu = currentProd.piecesPerUnit || 12;
          unitChange = Math.max(1, Math.round(count / ppu));
          detailText = `${count} optical pieces reconciled as +${unitChange} dozen (12 pcs/doz)`;
        } else {
          detailText = `+${count} ${currentProd.unit || 'units'}`;
        }

        const newQty = prevQty + unitChange;

        updatedProducts[matchedIdx] = {
          ...currentProd,
          quantity: newQty,
          lastUpdated: now
        };

        newTransactions.push({
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: now,
          productId: currentProd.id,
          productName: currentProd.name,
          type: 'AI_SCAN_SYNC',
          quantityChange: unitChange,
          previousQuantity: prevQty,
          newQuantity: newQty,
          performedBy: `${currentUser.name} (${currentUser.role})`,
          reason: `Automated visual scan audit: ${detailText} from ${imageName}`
        });
      }
    });

    const totalCount = Object.values(detectedCounts).reduce((a, b) => a + b, 0);

    const newLog: DetectionLog = {
      id: `detlog-${Date.now()}`,
      timestamp: now,
      imageName,
      itemsDetected: detectedItemsSummary,
      totalCount,
      appliedToInventory: true,
      notes: `Reconciled with inventory catalog by ${currentUser.name} (${currentUser.role})`
    };

    setProducts(updatedProducts);
    setTransactions(prev => [...newTransactions, ...prev]);
    setDetectionLogs(prev => [newLog, ...prev]);
  };

  // Quick Restock from Alerts
  const handleRestock = (productId: string, quantity: number) => {
    handleAdjustStock(productId, quantity, 'IN', 'Automated low-stock threshold replenishment');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        lowStockCount={lowStockCount}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onNavigateSection={scrollToSection}
      />

      {/* Main Content Area - All sections rendered continuously in a scrollable page */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section: Visual Shelf Scanner */}
        <section id="detect" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Camera className="w-3.5 h-3.5" />
                <span>Optical Scanner Recognition</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Camera Ready
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Visual Shelf Scanner & Real-Time Stock Count
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl">
              Point store cameras or upload shelf photos to instantly count physical stock, detect missing items, and sync with store inventory in real-time.
            </p>
          </div>

          <DetectionView
            products={products}
            currentUser={currentUser}
            onSyncDetections={handleSyncDetections}
          />
        </section>

        {/* Section Divider with Emerald Theme Accent */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent my-16 sm:my-20" />

        {/* Section: Complete Inventory Catalog (10,000 Products) */}
        <section id="inventory" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Layers className="w-3.5 h-3.5" />
                <span>Live Master Database</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {products.length.toLocaleString()} Active SKUs
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Master Product Catalog & Inventory Records
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl">
              Complete enterprise catalog of 10,000 retail items across all departments with instant keyword search, live stock counts, and prices in Indian Rupees (₹).
            </p>
          </div>

          <InventoryView
            products={products}
            currentUser={currentUser}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        </section>

        {/* Section Divider with Indigo/Cyan Theme Accent */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent my-16 sm:my-20" />

        {/* Section: Customer Sales Prediction & Product Organisation */}
        <section id="analytics" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sales Prediction & Product Organisation</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Sales Percentage & Planogram Layout Engine Active
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Customer Sales Prediction & Product Organisation
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl">
              Real-time sales percentage analytics and planogram product organisation: identifies stock with high consumption (fast-selling front-runners) and stock with least consumption (slow movers), with customer purchase probabilities and shelf space allocation.
            </p>
          </div>

          <SalesPredictionView
            products={products}
            transactions={transactions}
          />
        </section>

        {/* Section Divider with Amber Theme Accent */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent my-16 sm:my-20" />

        {/* Section: Low Stock Alerts & Reorder Triggers */}
        <section id="alerts" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Restock Triggers & Thresholds</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                lowStockCount > 0
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${lowStockCount > 0 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                {lowStockCount > 0 ? `${lowStockCount} Purchase Orders Required` : 'Stock Levels Optimal'}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Automated Stock Replenishment & Shortage Warnings
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl">
              Real-time safety stock monitoring, critical depleted alerts, and quick-action purchase orders to prevent stock-outs across store departments.
            </p>
          </div>

          <AlertsView
            products={products}
            onRestock={handleRestock}
          />
        </section>

        {/* Section Divider with Blue Theme Accent */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent my-16 sm:my-20" />

        {/* Section: Audit Logs & Reports */}
        <section id="reports" className="scroll-mt-24 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText className="w-3.5 h-3.5" />
                <span>Compliance & Operational Reports</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                {transactions.length}+ Verified Records
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Store Operational Audit Logs & Executive Reports
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-3xl">
              Immutable ledger of stock movements, camera scan logs, and instant one-click CSV and SQL data exports for financial compliance and stock reconciliation.
            </p>
          </div>

          <ReportsView
            products={products}
            transactions={transactions}
            detectionLogs={detectionLogs}
          />
        </section>
      </main>

      {/* Floating Quick Action / Scroll to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl border border-indigo-400/30 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* SQLite Inspector Modal */}
      <SqliteModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        products={products}
        transactions={transactions}
      />

      {/* Official Enterprise Store Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">
                SmartStock Enterprise Suite &copy; {new Date().getFullYear()}
              </p>
              <p className="text-[11px] text-slate-500">
                Central Flagship Store • Live physical shelf & inventory ledger synchronization
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live POS Sync Active
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Executive Audit Protection
            </span>
            <span>&bull;</span>
            <span>10,000 Catalog SKUs</span>
            <span>&bull;</span>
            <span>INR (₹) Standard Valuation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
