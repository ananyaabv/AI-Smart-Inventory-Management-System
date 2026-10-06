import React, { useState, useMemo, useEffect } from 'react';
import { ProductItem, UserProfile } from '../types';
import { formatINR } from '../utils/storage';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  MapPin,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface InventoryViewProps {
  products: ProductItem[];
  currentUser: UserProfile;
  onAddProduct: (p: Omit<ProductItem, 'id' | 'lastUpdated'>) => void;
  onUpdateProduct: (p: ProductItem) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (productId: string, quantityChange: number, type: 'IN' | 'OUT', reason: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  currentUser,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Healthy' | 'Low' | 'Empty'>('All');

  // Active view tab: Master catalog vs Fresh Produce Groups (per kg / dozen)
  const [activeTab, setActiveTab] = useState<'ALL_CATALOG' | 'PRODUCE_GROUPS'>('ALL_CATALOG');
  const [produceSubFilter, setProduceSubFilter] = useState<'ALL' | 'KG' | 'DOZEN' | 'FRUITS' | 'VEGETABLES' | 'PACKS'>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<ProductItem | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('Standard restocking');

  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);

  // RBAC permissions based on executive position
  const isGM = currentUser.role.includes('General Manager');
  const isAuditor = currentUser.role.includes('Auditor');
  const isOps = currentUser.role.includes('Operations');
  const isProcure = currentUser.role.includes('Procurement') || currentUser.role.includes('Merchandising');

  // Add form fields
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Groceries & Produce');
  const [newUnit, setNewUnit] = useState<string>('kg');
  const [newProduceType, setNewProduceType] = useState<string>('fruit');
  const [newPiecesPerUnit, setNewPiecesPerUnit] = useState<number>(6);
  const [newQty, setNewQty] = useState(10);
  const [newMin, setNewMin] = useState(5);
  const [newPrice, setNewPrice] = useState(140.00);
  const [newLoc, setNewLoc] = useState('Produce Display Bin 1');
  const [newNotes, setNewNotes] = useState('');

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Fresh Produce Specific Groupings
  const produceCatalog = useMemo(() => {
    return products.filter(p =>
      p.category === 'Groceries & Produce' ||
      p.produceType === 'fruit' ||
      p.produceType === 'vegetable' ||
      p.unit === 'kg' ||
      p.unit === 'dozen'
    );
  }, [products]);

  const kgProduce = useMemo(() => produceCatalog.filter(p => p.unit === 'kg'), [produceCatalog]);
  const dozenProduce = useMemo(() => produceCatalog.filter(p => p.unit === 'dozen'), [produceCatalog]);
  const packProduce = useMemo(() => produceCatalog.filter(p => p.unit === 'pack' || (p.unit !== 'kg' && p.unit !== 'dozen')), [produceCatalog]);

  const fruitsProduce = useMemo(() => produceCatalog.filter(p => p.produceType === 'fruit' || (!p.produceType && (p.name.includes('apple') || p.name.includes('orange') || p.name.includes('banana') || p.name.includes('pear') || p.name.includes('grape')))), [produceCatalog]);
  const vegProduce = useMemo(() => produceCatalog.filter(p => p.produceType === 'vegetable' || (!p.produceType && (p.name.includes('tomato') || p.name.includes('onion') || p.name.includes('potato') || p.name.includes('cucumber') || p.name.includes('carrot') || p.name.includes('spinach')))), [produceCatalog]);

  const totalKgStock = useMemo(() => kgProduce.reduce((acc, p) => acc + p.quantity, 0), [kgProduce]);
  const totalKgValuation = useMemo(() => kgProduce.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0), [kgProduce]);

  const totalDozenStock = useMemo(() => dozenProduce.reduce((acc, p) => acc + p.quantity, 0), [dozenProduce]);
  const totalDozenValuation = useMemo(() => dozenProduce.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0), [dozenProduce]);

  const totalPackStock = useMemo(() => packProduce.reduce((acc, p) => acc + p.quantity, 0), [packProduce]);
  const totalPackValuation = useMemo(() => packProduce.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0), [packProduce]);

  // Filtered Produce Items for Produce Group view
  const filteredProduceItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return produceCatalog.filter(p => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term);

      let matchesSub = true;
      if (produceSubFilter === 'KG') matchesSub = p.unit === 'kg';
      else if (produceSubFilter === 'DOZEN') matchesSub = p.unit === 'dozen';
      else if (produceSubFilter === 'FRUITS') matchesSub = p.produceType === 'fruit' || (!p.produceType && (p.name.includes('apple') || p.name.includes('orange') || p.name.includes('banana') || p.name.includes('pear') || p.name.includes('grape')));
      else if (produceSubFilter === 'VEGETABLES') matchesSub = p.produceType === 'vegetable' || (!p.produceType && (p.name.includes('tomato') || p.name.includes('onion') || p.name.includes('potato') || p.name.includes('cucumber') || p.name.includes('carrot') || p.name.includes('spinach')));
      else if (produceSubFilter === 'PACKS') matchesSub = p.unit === 'pack' || (p.unit !== 'kg' && p.unit !== 'dozen');

      let matchesStatus = true;
      if (statusFilter === 'Healthy') matchesStatus = p.quantity > p.minThreshold;
      else if (statusFilter === 'Low') matchesStatus = p.quantity <= p.minThreshold && p.quantity > 0;
      else if (statusFilter === 'Empty') matchesStatus = p.quantity === 0;

      return matchesSearch && matchesSub && matchesStatus;
    });
  }, [produceCatalog, searchTerm, produceSubFilter, statusFilter]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter(p => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term);

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStatus = true;
      if (statusFilter === 'Healthy') matchesStatus = p.quantity > p.minThreshold;
      else if (statusFilter === 'Low') matchesStatus = p.quantity <= p.minThreshold && p.quantity > 0;
      else if (statusFilter === 'Empty') matchesStatus = p.quantity === 0;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, statusFilter]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, statusFilter, pageSize, activeTab, produceSubFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, validCurrentPage, pageSize]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;
    onAddProduct({
      sku: newSku.trim().toUpperCase(),
      name: newName.trim().toLowerCase(),
      category: newCat,
      unit: newUnit as any,
      produceType: (newCat === 'Groceries & Produce' || newCat === 'Groceries') ? (newProduceType as any) : undefined,
      piecesPerUnit: (newUnit === 'kg' || newUnit === 'dozen') ? Number(newPiecesPerUnit) : 1,
      quantity: Number(newQty),
      minThreshold: Number(newMin),
      unitPrice: Number(newPrice),
      location: newLoc,
      notes: newNotes
    });
    setIsAddModalOpen(false);
    // Reset form
    setNewSku('');
    setNewName('');
    setNewQty(10);
    setNewMin(5);
    setNewPrice(140.00);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    onAdjustStock(adjustingProduct.id, adjustQty, adjustType, adjustReason);
    setAdjustingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Authority Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-100">
                10,000 Product SKUs Master Database
              </p>
              <p className="text-xs text-slate-400">
                Instant search, price tracking in ₹, and real-time inventory adjustments.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isAuditor) {
                setPermissionAlert("Auditor Authority Notice: Direct SKU catalog onboarding is reserved for General Management, Operations, and Procurement heads. The Chief Auditor role holds complete authority for stock auditing, reconciliations, and physical adjustments.");
                return;
              }
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Executive Authority Context */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Sign-off:</span>
            <span className="font-semibold text-slate-200">{currentUser.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-sky-400 font-medium">{currentUser.role}</span>
          </div>
          <div className="flex items-center gap-2">
            {isGM && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                Full Master Authority (Add, Edit, Decommission & Audit)
              </span>
            )}
            {isOps && (
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-semibold">
                Operations & Stock Replenishment Authority
              </span>
            )}
            {isAuditor && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-semibold">
                Chief Audit & Physical Count Reconciliation Authority
              </span>
            )}
            {isProcure && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
                Merchandising & Catalog Procurement Authority
              </span>
            )}
          </div>
        </div>

        {/* Dismissible Permission Alert */}
        {permissionAlert && (
          <div className="mt-3 p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{permissionAlert}</span>
            </div>
            <button
              onClick={() => setPermissionAlert(null)}
              className="text-amber-400 hover:text-amber-200 font-bold px-2 py-0.5 rounded hover:bg-amber-900/40 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="mt-5 space-y-3">
          {/* Inventory Mode Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('ALL_CATALOG')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ALL_CATALOG'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Store Catalog (10,000 SKUs)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PRODUCE_GROUPS')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'PRODUCE_GROUPS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>🍏</span>
                <span>Fresh Produce Groups (Per Kg / Dozen)</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-mono font-bold">
                  {produceCatalog.length} SKUs
                </span>
              </button>
            </div>

            {activeTab === 'PRODUCE_GROUPS' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">Produce Filter:</span>
                {(['ALL', 'KG', 'DOZEN', 'FRUITS', 'VEGETABLES', 'PACKS'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setProduceSubFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      produceSubFilter === filterKey
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {filterKey === 'ALL' && 'All Produce'}
                    {filterKey === 'KG' && '⚖️ Per Kg'}
                    {filterKey === 'DOZEN' && '🍌 Per Dozen'}
                    {filterKey === 'FRUITS' && '🍎 Fruits'}
                    {filterKey === 'VEGETABLES' && '🥕 Vegetables'}
                    {filterKey === 'PACKS' && '📦 Pre-packed'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'PRODUCE_GROUPS' ? "Search produce (e.g. apple, banana, tomato)..." : "Search by SKU, product name, or aisle..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>

            {activeTab === 'ALL_CATALOG' && (
              <div className="sm:col-span-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>Category: {c}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={activeTab === 'ALL_CATALOG' ? "sm:col-span-3" : "sm:col-span-7"}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full py-1.5 px-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy Stock</option>
                <option value="Low">Low Stock Alerts</option>
                <option value="Empty">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Fresh Produce Summary Cards (Visible when PRODUCE_GROUPS is selected) */}
      {activeTab === 'PRODUCE_GROUPS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Per Kilogram Group Card */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍏</span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Sold by Weight (Per Kg)
                  </h4>
                  <p className="text-[11px] text-slate-400">Apples, Oranges, Pears, Tomatoes, Potatoes</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {kgProduce.length} SKUs
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Stock on Display:</span>
                <span className="font-mono font-bold text-slate-100 text-sm">{totalKgStock.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category Valuation:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{formatINR(totalKgValuation)}</span>
              </div>
            </div>
          </div>

          {/* Per Dozen Group Card */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍌</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    Sold by Count (Per Dozen)
                  </h4>
                  <p className="text-[11px] text-slate-400">Robusta, Yelakki & Cavendish Bananas (12/doz)</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {dozenProduce.length} SKUs
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Stock on Display:</span>
                <span className="font-mono font-bold text-slate-100 text-sm">
                  {totalDozenStock.toLocaleString()} doz <span className="text-[10px] text-slate-500 font-normal">({totalDozenStock * 12} pcs)</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category Valuation:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{formatINR(totalDozenValuation)}</span>
              </div>
            </div>
          </div>

          {/* Pre-packed Punnets / Packs Group Card */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍇</span>
                <div>
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                    Pre-packed & Punnets
                  </h4>
                  <p className="text-[11px] text-slate-400">500g Grapes punnets, Spinach bunches & Herbs</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {packProduce.length} SKUs
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Stock on Display:</span>
                <span className="font-mono font-bold text-slate-100 text-sm">{totalPackStock.toLocaleString()} packs</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category Valuation:</span>
                <span className="font-mono font-bold text-purple-400 text-sm">{formatINR(totalPackValuation)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Inventory Table or Fresh Produce Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-950/70">
                <th className="py-3 px-4 font-semibold">SKU & Product</th>
                <th className="py-3 px-4 font-semibold">Classification & Unit</th>
                <th className="py-3 px-4 font-semibold">In Stock</th>
                <th className="py-3 px-4 font-semibold">Min Threshold</th>
                <th className="py-3 px-4 font-semibold">Unit Price / Rate</th>
                <th className="py-3 px-4 font-semibold">Valuation</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Health Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(activeTab === 'PRODUCE_GROUPS' ? filteredProduceItems : paginatedProducts).map((p) => {
                const isLow = p.quantity <= p.minThreshold && p.quantity > 0;
                const isOut = p.quantity === 0;
                const valuation = p.quantity * p.unitPrice;
                const isKg = p.unit === 'kg';
                const isDozen = p.unit === 'dozen';

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 capitalize text-sm">{p.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{p.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                          {p.category}
                        </span>
                        {isKg && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                            ⚖️ Sold per kg (~{p.piecesPerUnit || 6} pcs/kg)
                          </span>
                        )}
                        {isDozen && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            🍌 Sold per dozen (12 pcs/doz)
                          </span>
                        )}
                        {!isKg && !isDozen && p.unit && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono">
                            Unit: {p.unit}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm">
                      <span className={isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-slate-100'}>
                        {p.quantity} <span className="text-xs font-normal text-slate-400">{p.unit || 'units'}</span>
                      </span>
                      {isKg && p.piecesPerUnit && (
                        <div className="text-[10px] text-slate-500 font-normal">
                          ~{(p.quantity * p.piecesPerUnit).toLocaleString()} pieces
                        </div>
                      )}
                      {isDozen && (
                        <div className="text-[10px] text-slate-500 font-normal">
                          {(p.quantity * 12).toLocaleString()} pieces
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {p.minThreshold} {p.unit || 'units'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 font-semibold">
                      {formatINR(p.unitPrice)}
                      <span className="text-[10px] text-slate-400 font-normal"> / {p.unit || 'unit'}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                      {formatINR(valuation)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{p.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/50 border border-red-500/30 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustType('IN');
                            setAdjustQty(isKg ? 5 : isDozen ? 2 : 5);
                          }}
                          className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                          title={`Restock IN (+ ${p.unit || 'units'})`}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustType('OUT');
                            setAdjustQty(1);
                          }}
                          className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                          title={`Dispatch OUT (- ${p.unit || 'units'})`}
                        >
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (isAuditor) {
                              setPermissionAlert("Auditor Authority Notice: Direct editing of SKU definitions and base catalog pricing is reserved for Merchandising and Store Operations. Please use the Stock Adjustment buttons to reconcile physical inventory quantities.");
                              return;
                            }
                            setEditingProduct(p);
                          }}
                          className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (!isGM) {
                              setPermissionAlert(`Executive Authority Required: Decommissioning and permanent deletion of SKU (${p.sku}) is strictly reserved for the Store General Manager (VP Retail). Please contact Rajesh Singhania for catalog removal approvals.`);
                              return;
                            }
                            if (confirm(`Store Master Action: Are you sure you want to permanently decommission and delete ${p.name.toUpperCase()} (${p.sku}) from the store catalog?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                          title={isGM ? "Decommission SKU (GM Authority)" : "Decommission SKU (Requires GM Approval)"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{filteredProducts.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-200">{Math.min(validCurrentPage * pageSize, filteredProducts.length).toLocaleString()}</strong> of{' '}
              <strong className="text-sky-400">{filteredProducts.length.toLocaleString()}</strong> filtered items
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 font-mono">
              Total Dataset: {products.length.toLocaleString()} SKUs
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-slate-400 text-[11px]">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
              </select>
            </div>

            {/* Nav Buttons */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage <= 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={validCurrentPage <= 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-mono text-slate-300 text-xs">
              Page <strong className="text-sky-400">{validCurrentPage}</strong> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage >= totalPages}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                Add New Product to Store Catalog
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BEV-JUC-00012"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Product Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. juice, apple, bottle"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewCat(val);
                      if (val === 'Groceries & Produce' || val === 'Groceries') {
                        setNewUnit('kg');
                        setNewProduceType('fruit');
                        setNewPiecesPerUnit(6);
                      } else if (val === 'Beverages') {
                        setNewUnit('can');
                      } else {
                        setNewUnit('unit');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Groceries & Produce">Groceries & Fresh Produce</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Apparel & Bags">Apparel & Bags</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Storage Location</label>
                  <input
                    type="text"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Unit & Produce Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Selling Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => {
                      const u = e.target.value;
                      setNewUnit(u);
                      if (u === 'kg') setNewPiecesPerUnit(6);
                      else if (u === 'dozen') setNewPiecesPerUnit(12);
                      else setNewPiecesPerUnit(1);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  >
                    <option value="kg">⚖️ kg (Kilogram - by weight)</option>
                    <option value="dozen">🍌 dozen (Dozen - 12 count)</option>
                    <option value="can">🥫 can (Soft drink can)</option>
                    <option value="bottle">🍾 bottle (Water/Juice)</option>
                    <option value="pack">📦 pack (Punnet / Bunch)</option>
                    <option value="box">📦 box</option>
                    <option value="carton">📦 carton</option>
                    <option value="unit">unit (Single piece)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Item Classification</label>
                  <select
                    value={newProduceType}
                    onChange={(e) => setNewProduceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="fruit">🍎 Fresh Fruit</option>
                    <option value="vegetable">🥕 Fresh Vegetable</option>
                    <option value="beverage">🥤 Beverage</option>
                    <option value="dairy">🥛 Dairy</option>
                    <option value="staple">🌾 Staple / Grain</option>
                    <option value="other">General Item</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">
                    {newUnit === 'kg' ? 'Pieces per Kg' : newUnit === 'dozen' ? 'Pieces per Dozen' : 'Pieces per Pack'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPiecesPerUnit}
                    onChange={(e) => setNewPiecesPerUnit(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Initial Qty ({newUnit})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Min Threshold ({newUnit})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMin}
                    onChange={(e) => setNewMin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Rate / Unit (₹/{newUnit})</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Optional item notes or supplier batch info..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Adjust Stock for {adjustingProduct.name}
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center font-mono">
                <span className="text-slate-400">Current Stock:</span>
                <span className="text-lg font-bold text-sky-400">
                  {adjustingProduct.quantity} {adjustingProduct.unit || 'units'}
                  {adjustingProduct.unit === 'kg' && adjustingProduct.piecesPerUnit && (
                    <span className="text-xs text-slate-500 font-normal ml-2">
                      (~{(adjustingProduct.quantity * adjustingProduct.piecesPerUnit).toLocaleString()} pcs)
                    </span>
                  )}
                  {adjustingProduct.unit === 'dozen' && (
                    <span className="text-xs text-slate-500 font-normal ml-2">
                      ({(adjustingProduct.quantity * 12).toLocaleString()} pcs)
                    </span>
                  )}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('IN')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                      adjustType === 'IN'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Stock IN (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('OUT')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-2 transition-all ${
                      adjustType === 'OUT'
                        ? 'bg-red-950 border-red-500 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Stock OUT (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Quantity to Change ({adjustingProduct.unit || 'units'})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-mono text-slate-100 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Transaction Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-400" />
                Edit Product: {editingProduct.name}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateProduct(editingProduct);
                setEditingProduct(null);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Selling Unit</label>
                  <select
                    value={editingProduct.unit || 'unit'}
                    onChange={(e) => {
                      const u = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        unit: u,
                        piecesPerUnit: u === 'kg' ? 6 : u === 'dozen' ? 12 : 1
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  >
                    <option value="kg">⚖️ kg (Kilogram - per kg)</option>
                    <option value="dozen">🍌 dozen (Dozen - per dozen)</option>
                    <option value="can">🥫 can (Soft drink can)</option>
                    <option value="bottle">🍾 bottle (Bottle)</option>
                    <option value="pack">📦 pack (Punnet / Pack)</option>
                    <option value="box">📦 box</option>
                    <option value="carton">📦 carton</option>
                    <option value="unit">unit (Piece / Count)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pieces per Commercial Unit</label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.piecesPerUnit || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, piecesPerUnit: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Min Threshold</label>
                  <input
                    type="number"
                    value={editingProduct.minThreshold}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minThreshold: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Rate / Unit (₹/{editingProduct.unit || 'unit'})</label>
                  <input
                    type="number"
                    step="0.50"
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Location</label>
                  <input
                    type="text"
                    value={editingProduct.location}
                    onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
