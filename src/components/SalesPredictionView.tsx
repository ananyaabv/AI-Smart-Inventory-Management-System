import React, { useState, useMemo } from 'react';
import { ProductItem, StockTransaction } from '../types';
import {
  calculateSalesPredictions,
  generateConsumptionTrendCurve,
  ForecastHorizon,
  FootfallScenario,
  SCENARIO_MULTIPLIERS,
  ProductConsumptionPrediction
} from '../utils/salesPrediction';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  Filter,
  Flame,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  CheckCircle2,
  Calendar,
  Zap,
  ShoppingBag,
  Percent,
  Sliders,
  Store,
  Grid3X3,
  PackageOpen,
  ArrowRight,
  RefreshCw,
  Tag
} from 'lucide-react';

interface SalesPredictionViewProps {
  products: ProductItem[];
  transactions: StockTransaction[];
}

export const SalesPredictionView: React.FC<SalesPredictionViewProps> = ({
  products,
  transactions
}) => {
  // Scenario & Horizon controls
  const [horizon, setHorizon] = useState<ForecastHorizon>(30);
  const [scenario, setScenario] = useState<FootfallScenario>('normal');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'least' | 'planogram' | 'risk'>('all');

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'salesPercentage' | 'probability' | 'velocity' | 'demand' | 'stock'>('salesPercentage');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Planogram interactive state
  const [activePlanogramTab, setActivePlanogramTab] = useState<'Zone A' | 'Zone B' | 'Zone C' | 'Zone D'>('Zone A');
  const [isOrganising, setIsOrganising] = useState(false);
  const [organisationMessage, setOrganisationMessage] = useState<string | null>(null);

  // Compute predictions with sales percentage & product organisation
  const {
    predictions,
    topConsumed,
    leastConsumed,
    categoryMetrics,
    storewideAvgProbability,
    totalProjectedUnits,
    highConsumptionCount,
    leastConsumedCount,
    criticalStockoutCount,
    highConsumptionSalesShare,
    leastConsumptionSalesShare,
    highConsumptionStockTotal,
    leastConsumptionStockTotal
  } = useMemo(() => {
    return calculateSalesPredictions(products, transactions, horizon, scenario);
  }, [products, transactions, horizon, scenario]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered & sorted predictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesZone = selectedZone === 'All' || item.organisation.recommendedZone.startsWith(selectedZone);
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.organisation.recommendedZone.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesTab = true;
      if (activeTab === 'high') {
        matchesTab = item.consumptionTier === 'Top Consumed' || item.consumptionTier === 'High Demand';
      } else if (activeTab === 'least') {
        matchesTab = item.consumptionTier === 'Least Consumed';
      } else if (activeTab === 'risk') {
        matchesTab = item.stockoutRisk === 'Critical' || (item.daysOfSupply < 5 && item.consumptionProbability >= 60);
      } else if (activeTab === 'planogram') {
        matchesTab = item.organisation.recommendedZone.startsWith(activePlanogramTab);
      }

      return matchesCat && matchesZone && matchesSearch && matchesTab;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'salesPercentage') {
        valA = a.salesPercentage;
        valB = b.salesPercentage;
      } else if (sortBy === 'probability') {
        valA = a.consumptionProbability;
        valB = b.consumptionProbability;
      } else if (sortBy === 'velocity') {
        valA = a.dailyVelocity;
        valB = b.dailyVelocity;
      } else if (sortBy === 'demand') {
        valA = a.predictedDemandUnits;
        valB = b.predictedDemandUnits;
      } else if (sortBy === 'stock') {
        valA = a.currentStock;
        valB = b.currentStock;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [predictions, selectedCategory, selectedZone, searchTerm, activeTab, activePlanogramTab, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPredictions.length / rowsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPredictions.slice(start, start + rowsPerPage);
  }, [filteredPredictions, currentPage, rowsPerPage]);

  // Trend curve for chart
  const trendData = useMemo(() => {
    return generateConsumptionTrendCurve(topConsumed, leastConsumed, 14);
  }, [topConsumed, leastConsumed]);

  // Comparison Bar Chart: Top 5 vs Bottom 5 with Sales %
  const comparisonBarData = useMemo(() => {
    const top5 = topConsumed.slice(0, 5).map(p => ({
      name: p.name.length > 14 ? `${p.name.slice(0, 13)}...` : p.name,
      fullName: p.name,
      type: 'High Consumption',
      'Sales Percentage (%)': p.salesPercentage,
      'Consumption Probability (%)': p.consumptionProbability,
      'Daily Velocity': p.dailyVelocity,
      fill: '#10b981'
    }));

    const least5 = leastConsumed.slice(0, 5).map(p => ({
      name: p.name.length > 14 ? `${p.name.slice(0, 13)}...` : p.name,
      fullName: p.name,
      type: 'Least Consumption',
      'Sales Percentage (%)': p.salesPercentage,
      'Consumption Probability (%)': p.consumptionProbability,
      'Daily Velocity': p.dailyVelocity,
      fill: '#f43f5e'
    }));

    return [...top5, ...least5];
  }, [topConsumed, leastConsumed]);

  // Department / Category chart data
  const categoryChartData = useMemo(() => {
    return categoryMetrics.slice(0, 6).map(c => ({
      name: c.category.length > 12 ? `${c.category.slice(0, 11)}...` : c.category,
      fullName: c.category,
      'Sales Share (%)': c.salesPercentage,
      'Avg Probability (%)': c.avgConsumptionProbability
    }));
  }, [categoryMetrics]);

  // Planogram Zone breakdown counts
  const zoneStats = useMemo(() => {
    const zoneA = predictions.filter(p => p.organisation.recommendedZone.startsWith('Zone A'));
    const zoneB = predictions.filter(p => p.organisation.recommendedZone.startsWith('Zone B'));
    const zoneC = predictions.filter(p => p.organisation.recommendedZone.startsWith('Zone C'));
    const zoneD = predictions.filter(p => p.organisation.recommendedZone.startsWith('Zone D'));

    return {
      'Zone A': {
        name: 'Eye-Level Golden Zone (1.2m - 1.5m)',
        target: 'High Consumption Stock',
        count: zoneA.length,
        stockTotal: zoneA.reduce((s, p) => s + p.currentStock, 0),
        salesShare: parseFloat(zoneA.reduce((s, p) => s + p.salesPercentage, 0).toFixed(1)),
        avgProb: Math.round(zoneA.reduce((s, p) => s + p.consumptionProbability, 0) / Math.max(1, zoneA.length)),
        description: 'Prime front-facing shelves directly in natural shopper sightlines. Maximum facings assigned to high-velocity staples.'
      },
      'Zone B': {
        name: 'Mid-Shelf Reach Zone (0.7m - 1.1m)',
        target: 'Moderate Demand Stock',
        count: zoneB.length,
        stockTotal: zoneB.reduce((s, p) => s + p.currentStock, 0),
        salesShare: parseFloat(zoneB.reduce((s, p) => s + p.salesPercentage, 0).toFixed(1)),
        avgProb: Math.round(zoneB.reduce((s, p) => s + p.consumptionProbability, 0) / Math.max(1, zoneB.length)),
        description: 'Comfortable reach level for regular household essentials with steady, predictable replenishment cadence.'
      },
      'Zone C': {
        name: 'Bottom Shelf / Clearance Zone (0.2m - 0.6m)',
        target: 'Least Consumption Stock',
        count: zoneC.length,
        stockTotal: zoneC.reduce((s, p) => s + p.currentStock, 0),
        salesShare: parseFloat(zoneC.reduce((s, p) => s + p.salesPercentage, 0).toFixed(1)),
        avgProb: Math.round(zoneC.reduce((s, p) => s + p.consumptionProbability, 0) / Math.max(1, zoneC.length)),
        description: 'Lowest tier shelves reserved for slow movers and specialty items. Bundling tags and promotional clearance applied.'
      },
      'Zone D': {
        name: 'Checkout Impulse Zone (1.0m - 1.2m)',
        target: 'High-Turnover Impulse Stock',
        count: zoneD.length,
        stockTotal: zoneD.reduce((s, p) => s + p.currentStock, 0),
        salesShare: parseFloat(zoneD.reduce((s, p) => s + p.salesPercentage, 0).toFixed(1)),
        avgProb: Math.round(zoneD.reduce((s, p) => s + p.consumptionProbability, 0) / Math.max(1, zoneD.length)),
        description: 'Point-of-sale registers and checkout queuing displays for high customer pickup rates.'
      }
    };
  }, [predictions]);

  // Planogram Reorganisation trigger
  const handleSimulateReorganisation = () => {
    setIsOrganising(true);
    setTimeout(() => {
      setIsOrganising(false);
      setOrganisationMessage(
        `Optimized planogram layout applied! ${predictions.length.toLocaleString()} SKUs re-indexed across 4 shelf zones. Eye-level facings locked for high-consumption stock.`
      );
      setTimeout(() => setOrganisationMessage(null), 5000);
    }, 600);
  };

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Current Stock',
      'Sales Percentage (%)',
      'Consumption Probability (%)',
      'Daily Velocity (Units/Day)',
      `Predicted Demand (${horizon} Days)`,
      'Days of Supply',
      'Consumption Tier',
      'Stockout Risk',
      'Recommended Shelf Zone',
      'Shelf Height',
      'Shelf Facings',
      'Aisle Placement',
      'Merchandising Strategy'
    ];

    const rows = filteredPredictions.map(p => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.currentStock,
      `${p.salesPercentage}%`,
      `${p.consumptionProbability}%`,
      p.dailyVelocity,
      p.predictedDemandUnits,
      p.daysOfSupply === 999 ? 'N/A' : p.daysOfSupply,
      `"${p.consumptionTier}"`,
      `"${p.stockoutRisk}"`,
      `"${p.organisation.recommendedZone}"`,
      `"${p.organisation.shelfHeight}"`,
      p.organisation.recommendedFacings,
      `"${p.organisation.aislePlacement}"`,
      `"${p.organisation.merchandisingStrategy.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartStock_Sales_Prediction_Product_Organisation_${horizon}days_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Simulation & Horizon Control Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Sales Prediction & Product Organisation Engine
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Predictive Sales Share, Customer Demand & Planogram Organisation
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Calculates sales percentages across inventory, identifies high consumption fast-sellers vs least consumed slow-moving stock, and organizes shelf placement across store zones.
            </p>
          </div>

          {/* Interactive Forecast Horizon & Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Horizon Selector */}
            <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 shadow-inner">
              <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" /> Horizon:
              </span>
              {([7, 14, 30, 60] as ForecastHorizon[]).map(days => (
                <button
                  key={days}
                  onClick={() => {
                    setHorizon(days);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    horizon === days
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>

            {/* Scenario Selector */}
            <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-1 shadow-inner">
              <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-cyan-400" /> Footfall:
              </span>
              {(['normal', 'weekend', 'holiday', 'slow'] as FootfallScenario[]).map(sc => {
                const isSelected = scenario === sc;
                const labels: Record<FootfallScenario, string> = {
                  normal: 'Standard',
                  weekend: 'Weekend +25%',
                  holiday: 'Holiday +50%',
                  slow: 'Off-Peak -20%'
                };
                return (
                  <button
                    key={sc}
                    onClick={() => {
                      setScenario(sc);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={SCENARIO_MULTIPLIERS[sc].description}
                  >
                    {labels[sc]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI & Sales Percentage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: High-Consumption Sales Share % & Stock Units */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High-Consumption Sales Share</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Flame className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold font-mono text-emerald-400">
              {highConsumptionSalesShare}%
            </p>
            <span className="text-xs font-semibold text-emerald-300">of Total Store Sales</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, highConsumptionSalesShare)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5">
            <span>Current Stock: <strong className="text-white font-mono">{highConsumptionStockTotal.toLocaleString()}</strong> units</span>
            <span className="text-emerald-400 font-semibold">{highConsumptionCount} SKUs</span>
          </div>
        </div>

        {/* Card 2: Least-Consumption Sales Share % & Stock Units */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Least-Consumed Sales Share</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold font-mono text-rose-400">
              {leastConsumptionSalesShare}%
            </p>
            <span className="text-xs font-semibold text-rose-300">of Total Store Sales</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-rose-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, Math.min(100, leastConsumptionSalesShare * 5))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2.5">
            <span>Slow Stock: <strong className="text-white font-mono">{leastConsumptionStockTotal.toLocaleString()}</strong> units</span>
            <span className="text-rose-400 font-semibold">{leastConsumedCount} SKUs</span>
          </div>
        </div>

        {/* Card 3: Storewide Avg Purchase Probability */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Avg. Customer Probability</span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold font-mono text-white">
              {storewideAvgProbability}%
            </p>
            <span className="text-xs font-semibold text-indigo-300 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> High Propensity
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Probability of an active store visitor adding items to checkout basket
          </p>
        </div>

        {/* Card 4: Forecast Sales Demand & Run-Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Projected Demand ({horizon} Days)
            </span>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-cyan-300 mt-3">
            {totalProjectedUnits.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">Units</span>
          </p>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 mt-3 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Avg {Math.round(totalProjectedUnits / horizon).toLocaleString()} units daily velocity</span>
          </div>
        </div>
      </div>

      {/* Dedicated High vs. Least Consumption Stock Split Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Consumption Stock Card Deck */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    High Consumption Stock (Fast Movers)
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      {highConsumptionCount} SKUs
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Highest customer purchase velocity • Drives <strong className="text-emerald-400">{highConsumptionSalesShare}%</strong> of store sales
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('high');
                  const el = document.getElementById('sales-ledger');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Top High-Consumption Items */}
            <div className="space-y-3">
              {topConsumed.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-emerald-950/60 hover:border-emerald-500/40 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {item.sku}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Current Stock: <strong className="text-emerald-300 font-mono">{item.currentStock}</strong></span>
                        <span>•</span>
                        <span>Velocity: <strong className="text-white font-mono">{item.dailyVelocity}</strong>/day</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{item.organisation.recommendedZone.split(' - ')[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Sales % Badge */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Sales Share</div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                        {item.salesPercentage}%
                      </span>
                    </div>

                    {/* Probability Badge */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Probability</div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
                        {item.consumptionProbability}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Consumption Stock Total: <strong className="font-mono text-white ml-1">{highConsumptionStockTotal.toLocaleString()}</strong> units
            </span>
            <span className="text-[11px] text-slate-500">Planogram: Zone A (Golden Eye-Level)</span>
          </div>
        </div>

        {/* Least Consumption Stock Card Deck */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Least Consumption Stock (Slow Movers)
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                      {leastConsumedCount} SKUs
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Low customer intake • Generates only <strong className="text-rose-400">{leastConsumptionSalesShare}%</strong> of store sales
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('least');
                  const el = document.getElementById('sales-ledger');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Least-Consumed Items */}
            <div className="space-y-3">
              {leastConsumed.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-rose-950/60 hover:border-rose-500/40 rounded-xl p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center text-xs font-bold font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {item.sku}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Current Stock: <strong className="text-rose-300 font-mono">{item.currentStock}</strong></span>
                        <span>•</span>
                        <span>Supply: <strong className="text-amber-400 font-mono">{item.daysOfSupply === 999 ? '90+' : item.daysOfSupply}d</strong></span>
                        <span>•</span>
                        <span className="text-amber-400 font-medium">Zone C (Bottom/Clearance)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Sales % Badge */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Sales Share</div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono">
                        {item.salesPercentage}%
                      </span>
                    </div>

                    {/* Probability Badge */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Probability</div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold font-mono">
                        {item.consumptionProbability}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Slow-Moving Stock Total: <strong className="font-mono text-white ml-1">{leastConsumptionStockTotal.toLocaleString()}</strong> units
            </span>
            <span className="text-[11px] text-amber-400">Strategy: Bundle or 25% Clearance Markdown</span>
          </div>
        </div>
      </div>

      {/* Product Organisation & Planogram Optimizer */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Product Organisation & Store Planogram Architecture
              </span>
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">
              Shelf Space Allocation & Physical Merchandising Zones
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl">
              Stock items organised by customer consumption velocity: Golden eye-level zones reserved for high consumption staples, while least-consumed items are allocated single facings on lower clearance tiers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateReorganisation}
              disabled={isOrganising}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isOrganising ? 'animate-spin' : ''}`} />
              {isOrganising ? 'Optimizing Planogram...' : 'Re-Organise Stock Layout'}
            </button>
          </div>
        </div>

        {organisationMessage && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{organisationMessage}</span>
          </div>
        )}

        {/* 4-Zone Interactive Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {(['Zone A', 'Zone B', 'Zone C', 'Zone D'] as const).map(zoneKey => {
            const zData = zoneStats[zoneKey];
            const isSelected = activePlanogramTab === zoneKey;

            const badgeColor =
              zoneKey === 'Zone A'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : zoneKey === 'Zone B'
                ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                : zoneKey === 'Zone C'
                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

            return (
              <button
                key={zoneKey}
                onClick={() => {
                  setActivePlanogramTab(zoneKey);
                  setActiveTab('planogram');
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {zoneKey}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {zData.salesShare}% Sales Share
                  </span>
                </div>
                <h5 className="font-semibold text-sm text-white">{zData.name.split(' (')[0]}</h5>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{zData.target}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Stock: <strong className="text-white font-mono">{zData.stockTotal.toLocaleString()}</strong></span>
                  <span>{zData.count} SKUs</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Zone Detail Card & Merchandising Strategy */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {zoneStats[activePlanogramTab].name}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-semibold">
                Allocated for: {zoneStats[activePlanogramTab].target}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {zoneStats[activePlanogramTab].description}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Avg Probability</div>
              <div className="text-sm font-bold font-mono text-white">{zoneStats[activePlanogramTab].avgProb}%</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Shelf Stock</div>
              <div className="text-sm font-bold font-mono text-indigo-300">{zoneStats[activePlanogramTab].stockTotal.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations: Comparison & Department Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales Percentage & Daily Velocity Bar Chart (High vs Least) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <BarChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Sales Share & Consumption Velocity Comparison
                </h4>
                <p className="text-xs text-slate-400">
                  Comparing Top 5 High Consumption vs Bottom 5 Least Consumed Products
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonBarData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={val => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.fullName}</p>
                          <p className={`font-semibold ${data.type === 'High Consumption' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {data.type}
                          </p>
                          <p className="text-slate-300">
                            Sales Percentage: <strong className="text-indigo-400 font-mono">{data['Sales Percentage (%)']}%</strong>
                          </p>
                          <p className="text-slate-300">
                            Consumption Probability: <strong className="text-white font-mono">{data['Consumption Probability (%)']}%</strong>
                          </p>
                          <p className="text-slate-300">
                            Daily Outflow: <strong className="text-cyan-400 font-mono">{data['Daily Velocity']}</strong> units/day
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Sales Percentage (%)" radius={[4, 4, 0, 0]}>
                  {comparisonBarData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.type === 'High Consumption' ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              High Consumption (Top Sales Share)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              Least Consumed (Low Sales Share)
            </span>
          </div>
        </div>

        {/* Chart 2: 14-Day Cumulative Demand Curve */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  14-Day Cumulative Consumption Curve
                </h4>
                <p className="text-xs text-slate-400">
                  Projected demand divergence: Fast movers vs slow stock over time
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
              Scenario: {SCENARIO_MULTIPLIERS[scenario].label.split(' ')[0]}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="topDemandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="leastDemandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-emerald-400">
                            High Consumption: <strong className="font-mono">{payload[0]?.value?.toLocaleString()}</strong> units
                          </p>
                          <p className="text-rose-400">
                            Least Consumed: <strong className="font-mono">{payload[1]?.value?.toLocaleString()}</strong> units
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Top Consumed Demand (Units)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#topDemandGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="Least Consumed Demand (Units)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#leastDemandGrad)"
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Consumption & Sales Percentage Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Department Sales Percentage & Consumption Matrix
              </h4>
              <p className="text-xs text-slate-400">
                Department-level sales share, average consumption probability, and stock allocation
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryMetrics.map(cat => (
            <div
              key={cat.category}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white text-sm">{cat.category}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {cat.salesPercentage}% Sales Share
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Avg Consumption Probability:</span>
                  <span className="font-semibold text-white font-mono">{cat.avgConsumptionProbability}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${cat.avgConsumptionProbability}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-emerald-400">High: {cat.highDemandCount} SKUs</span>
                  <span className="text-rose-400">Least: {cat.leastConsumedCount} SKUs</span>
                  <span className="text-slate-400">{cat.productCount} Total</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  Top Seller: <span className="text-white font-medium">{cat.topConsumedProduct}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Filterable & Searchable Sales Prediction & Product Organisation Ledger */}
      <div id="sales-ledger" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Sales Prediction & Product Organisation Ledger
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {filteredPredictions.length.toLocaleString()} Products
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Interactive ledger with sales percentage share, consumption probability, current stock counts, and planogram shelf placements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'all', label: `All Products (${predictions.length})` },
            { id: 'high', label: `🔥 High Consumption Stock (${highConsumptionCount})` },
            { id: 'least', label: `❄️ Least Consumption Stock (${leastConsumedCount})` },
            { id: 'planogram', label: `🏪 Planogram (${activePlanogramTab})` },
            { id: 'risk', label: `⚠️ Stockout Risk (${criticalStockoutCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category / Zone Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, SKU, aisle..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {categoriesList.map(c => (
                <option key={c} value={c}>
                  Department: {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedZone}
              onChange={e => {
                setSelectedZone(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Shelf Zones</option>
              <option value="Zone A">Zone A: Eye-Level Golden Zone</option>
              <option value="Zone B">Zone B: Mid-Shelf Reach Zone</option>
              <option value="Zone C">Zone C: Bottom Shelf Clearance</option>
              <option value="Zone D">Zone D: Checkout Impulse</option>
            </select>
          </div>

          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="salesPercentage-desc">Sort by: Highest Sales Percentage</option>
              <option value="salesPercentage-asc">Sort by: Lowest Sales Percentage</option>
              <option value="probability-desc">Sort by: Highest Consumption Probability</option>
              <option value="probability-asc">Sort by: Lowest Consumption Probability</option>
              <option value="velocity-desc">Sort by: Highest Daily Velocity</option>
              <option value="stock-asc">Sort by: Lowest Stock Level</option>
              <option value="stock-desc">Sort by: Highest Stock Level</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">Product & SKU</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Sales Share (%)</th>
                <th className="py-3 px-3">Consumption Prob (%)</th>
                <th className="py-3 px-3">Daily Velocity</th>
                <th className="py-3 px-3">Forecast ({horizon}d)</th>
                <th className="py-3 px-3">Shelf Placement (Planogram)</th>
                <th className="py-3 px-3">Merchandising Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No products matched the current search or filters.
                  </td>
                </tr>
              ) : (
                paginatedList.map(item => {
                  const isHigh = item.consumptionTier === 'Top Consumed' || item.consumptionTier === 'High Demand';
                  const isLeast = item.consumptionTier === 'Least Consumed';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-850/50 transition-colors"
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.sku}</div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 text-slate-400">
                        {item.category}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-white">{item.currentStock}</span>
                        <span className="text-[10px] text-slate-400 ml-1">units</span>
                      </td>

                      {/* Sales Percentage */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
                            isHigh
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isLeast
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {item.salesPercentage}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {item.categorySalesPercentage}% of category
                        </div>
                      </td>

                      {/* Consumption Probability */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-800 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                isHigh ? 'bg-emerald-400' : isLeast ? 'bg-rose-400' : 'bg-indigo-400'
                              }`}
                              style={{ width: `${Math.min(100, item.consumptionProbability)}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-white">
                            {item.consumptionProbability}%
                          </span>
                        </div>
                      </td>

                      {/* Velocity */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {item.dailyVelocity} /day
                      </td>

                      {/* Forecast Demand */}
                      <td className="py-3 px-3 font-mono text-cyan-300">
                        {item.predictedDemandUnits} units
                      </td>

                      {/* Shelf Placement */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-white text-[11px]">
                          {item.organisation.recommendedZone.split(' - ')[0]}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.organisation.shelfHeight} ({item.organisation.recommendedFacings} facings)
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-[11px] text-slate-400 max-w-xs">
                        <span className={isHigh ? 'text-emerald-300' : isLeast ? 'text-amber-300' : 'text-slate-300'}>
                          {item.organisation.merchandisingStrategy}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2">
          <div>
            Showing <strong className="text-white">{filteredPredictions.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(currentPage * rowsPerPage, filteredPredictions.length)}</strong> of{' '}
            <strong className="text-white">{filteredPredictions.length.toLocaleString()}</strong> items
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-white px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
