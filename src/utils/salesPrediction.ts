import { ProductItem, StockTransaction } from '../types';

export interface ShelfOrganisation {
  recommendedZone: 'Zone A - Eye-Level (Golden Zone)' | 'Zone B - Mid-Shelf (Reach Zone)' | 'Zone C - Bottom Shelf (Clearance / Specialty)' | 'Zone D - Checkout (Impulse Zone)';
  shelfHeight: string; // e.g. '1.2m - 1.5m (Eye Level)'
  recommendedFacings: number; // 1 to 5
  aislePlacement: string; // e.g. 'Aisle 1 Entrance Endcap'
  merchandisingStrategy: string; // actionable layout recommendation
  bundlingSuggestion?: string;
}

export interface ProductConsumptionPrediction {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  unitPrice: number;
  dailyVelocity: number; // units consumed per day
  consumptionProbability: number; // 0.0 to 100.0%
  salesPercentage: number; // % share of total store sales volume
  categorySalesPercentage: number; // % share within its own category
  predictedDemandUnits: number; // predicted consumption for selected horizon & scenario
  daysOfSupply: number; // currentStock / dailyVelocity
  stockoutRisk: 'Critical' | 'Moderate' | 'Safe' | 'Overstocked';
  consumptionTier: 'Top Consumed' | 'High Demand' | 'Moderate' | 'Least Consumed';
  recommendation: string;
  turnoverScore: number; // 0 to 100
  organisation: ShelfOrganisation;
}

export interface CategoryConsumptionMetric {
  category: string;
  avgConsumptionProbability: number;
  totalDailyVelocity: number;
  projectedUnits: number;
  salesPercentage: number; // % of total store sales
  topConsumedProduct: string;
  leastConsumedProduct: string;
  productCount: number;
  highDemandCount: number;
  leastConsumedCount: number;
  highConsumptionStockUnits: number;
  leastConsumptionStockUnits: number;
}

export type ForecastHorizon = 7 | 14 | 30 | 60;
export type FootfallScenario = 'normal' | 'weekend' | 'holiday' | 'slow';

export const SCENARIO_MULTIPLIERS: Record<FootfallScenario, { label: string; multiplier: number; description: string }> = {
  normal: { label: 'Normal Traffic (1.0x)', multiplier: 1.0, description: 'Standard weekday customer volume and baseline consumption.' },
  weekend: { label: 'Weekend Surge (+25%)', multiplier: 1.25, description: 'Elevated weekend footfall with increased impulse purchases.' },
  holiday: { label: 'Festive / Holiday Rush (+50%)', multiplier: 1.5, description: 'Peak seasonal demand with rapid turnover across all departments.' },
  slow: { label: 'Off-Peak / Rainy Day (-20%)', multiplier: 0.8, description: 'Lower walk-in foot traffic and conservative basket sizes.' }
};

// Deterministic hash to ensure stable baseline rates per product
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Known high and low demand keywords for retail predictability
const HIGH_CONSUMPTION_KEYWORDS = [
  'milk', 'bread', 'banana', 'apple', 'water', 'cola', 'egg', 'curd', 'dahi',
  'butter', 'rice', 'atta', 'potato', 'onion', 'sugar', 'tea', 'biscuit',
  'chips', 'paneer', 'tomato', 'juice', 'maggi', 'noodle', 'salt'
];

const LEAST_CONSUMED_KEYWORDS = [
  'truffle', 'dragon fruit', 'caviar', 'quinoa', 'saffron', 'artichoke',
  'avocado', 'imported cheese', 'brie', 'parmesan wheel', 'sparkling wine glass',
  'sanitizing machine', 'organic flaxseed oil', 'premium balsamic', 'anchovy',
  'caper', 'goji berry', 'matcha ceremonial', 'wasabi paste'
];

/**
 * Calculates sales predictions, sales percentages, high/least consumption stock, and product organisation
 */
export function calculateSalesPredictions(
  products: ProductItem[],
  transactions: StockTransaction[],
  horizonDays: ForecastHorizon = 30,
  scenario: FootfallScenario = 'normal'
): {
  predictions: ProductConsumptionPrediction[];
  topConsumed: ProductConsumptionPrediction[];
  leastConsumed: ProductConsumptionPrediction[];
  categoryMetrics: CategoryConsumptionMetric[];
  storewideAvgProbability: number;
  totalProjectedUnits: number;
  highConsumptionCount: number;
  leastConsumedCount: number;
  criticalStockoutCount: number;
  highConsumptionSalesShare: number;
  leastConsumptionSalesShare: number;
  highConsumptionStockTotal: number;
  leastConsumptionStockTotal: number;
} {
  const scenarioMultiplier = SCENARIO_MULTIPLIERS[scenario].multiplier;

  // Aggregate historical transaction outflows per product
  const txOutflows: Record<string, number> = {};
  transactions.forEach(tx => {
    if (tx.type === 'OUT' || (tx.type === 'AI_SCAN_SYNC' && tx.quantityChange < 0)) {
      const absQty = Math.abs(tx.quantityChange);
      txOutflows[tx.productId] = (txOutflows[tx.productId] || 0) + absQty;
      txOutflows[tx.productName.toLowerCase()] = (txOutflows[tx.productName.toLowerCase()] || 0) + absQty;
    }
  });

  // First pass: Calculate velocities and raw predicted demand
  const rawPredictions = products.map(product => {
    const nameLower = product.name.toLowerCase();
    const hash = hashString(product.id + product.name);
    const hashMod = (hash % 1000) / 1000;

    const isExplicitHigh = HIGH_CONSUMPTION_KEYWORDS.some(k => nameLower.includes(k));
    const isExplicitLow = LEAST_CONSUMED_KEYWORDS.some(k => nameLower.includes(k));

    let baseDailyVelocity = 0;
    let baseProbability = 0;

    if (isExplicitHigh) {
      baseDailyVelocity = 18 + hashMod * 35; // 18 - 53 units/day
      baseProbability = 82 + hashMod * 16.5; // 82% - 98.5%
    } else if (isExplicitLow) {
      baseDailyVelocity = 0.08 + hashMod * 0.45; // 0.08 - 0.53 units/day
      baseProbability = 5.2 + hashMod * 22; // 5.2% - 27.2%
    } else {
      const cat = product.category.toLowerCase();
      if (cat.includes('dairy') || cat.includes('produce') || cat.includes('fruit') || cat.includes('vegetable')) {
        baseDailyVelocity = 12 + hashMod * 22;
        baseProbability = 72 + hashMod * 22;
      } else if (cat.includes('beverage') || cat.includes('bakery') || cat.includes('snack')) {
        baseDailyVelocity = 9 + hashMod * 18;
        baseProbability = 65 + hashMod * 25;
      } else if (cat.includes('personal') || cat.includes('household') || cat.includes('cleaning')) {
        baseDailyVelocity = 3 + hashMod * 8;
        baseProbability = 42 + hashMod * 32;
      } else if (cat.includes('electronics') || cat.includes('specialty') || cat.includes('luxury')) {
        baseDailyVelocity = 0.2 + hashMod * 1.5;
        baseProbability = 14 + hashMod * 28;
      } else {
        baseDailyVelocity = 4 + hashMod * 10;
        baseProbability = 48 + hashMod * 32;
      }
    }

    const historicalTxOut = txOutflows[product.id] || txOutflows[nameLower] || 0;
    if (historicalTxOut > 0) {
      baseDailyVelocity = Math.max(baseDailyVelocity, historicalTxOut * 0.35);
      baseProbability = Math.min(99.4, baseProbability + Math.min(10, historicalTxOut * 0.5));
    }

    const effectiveDailyVelocity = parseFloat((baseDailyVelocity * scenarioMultiplier).toFixed(2));
    const effectiveProbability = parseFloat(
      Math.min(99.6, Math.max(3.8, baseProbability * (0.9 + scenarioMultiplier * 0.1))).toFixed(1)
    );

    const predictedDemandUnits = Math.max(1, Math.round(effectiveDailyVelocity * horizonDays));
    const daysOfSupply = effectiveDailyVelocity > 0
      ? parseFloat((product.quantity / effectiveDailyVelocity).toFixed(1))
      : 999;

    let stockoutRisk: 'Critical' | 'Moderate' | 'Safe' | 'Overstocked' = 'Safe';
    if (daysOfSupply < 3 && product.quantity > 0) {
      stockoutRisk = 'Critical';
    } else if (daysOfSupply < 7) {
      stockoutRisk = 'Moderate';
    } else if (daysOfSupply > 45 && effectiveProbability < 35) {
      stockoutRisk = 'Overstocked';
    }

    let consumptionTier: 'Top Consumed' | 'High Demand' | 'Moderate' | 'Least Consumed' = 'Moderate';
    if (effectiveProbability >= 80) {
      consumptionTier = 'Top Consumed';
    } else if (effectiveProbability >= 60) {
      consumptionTier = 'High Demand';
    } else if (effectiveProbability < 35) {
      consumptionTier = 'Least Consumed';
    }

    // Product Organisation Logic
    let organisation: ShelfOrganisation;
    if (consumptionTier === 'Top Consumed') {
      const isImpulse = nameLower.includes('gum') || nameLower.includes('chocolate') || nameLower.includes('cola') || nameLower.includes('chips');
      if (isImpulse) {
        organisation = {
          recommendedZone: 'Zone D - Checkout (Impulse Zone)',
          shelfHeight: '1.0m - 1.2m (Point-of-Sale Register)',
          recommendedFacings: 4,
          aislePlacement: 'Front Cashier Lanes & Grab-and-Go Kiosks',
          merchandisingStrategy: 'High-turnover impulse facing to maximize basket conversion during checkout wait.',
          bundlingSuggestion: 'Display adjacent to chilled beverages for instant cross-buy.'
        };
      } else {
        organisation = {
          recommendedZone: 'Zone A - Eye-Level (Golden Zone)',
          shelfHeight: '1.2m - 1.5m (Golden Eye Level)',
          recommendedFacings: 4,
          aislePlacement: 'Aisle 1 Prime Entrance Endcap & Central Corridor',
          merchandisingStrategy: 'Allocate maximum shelf facings at natural eye-level to maintain stock availability and speed up shopper pickup.',
          bundlingSuggestion: 'Feature alongside complementary breakfast or snack staples.'
        };
      }
    } else if (consumptionTier === 'High Demand') {
      organisation = {
        recommendedZone: 'Zone A - Eye-Level (Golden Zone)',
        shelfHeight: '1.1m - 1.4m (High Visibility Level)',
        recommendedFacings: 3,
        aislePlacement: 'Aisle 2 Primary Shelf Center',
        merchandisingStrategy: 'Prime eye-level allocation with regular 2-hour fronting & facing checks.',
        bundlingSuggestion: 'Pair with weekly promotional displays.'
      };
    } else if (consumptionTier === 'Least Consumed') {
      organisation = {
        recommendedZone: 'Zone C - Bottom Shelf (Clearance / Specialty)',
        shelfHeight: '0.2m - 0.6m (Lower Tier Shelf)',
        recommendedFacings: 1,
        aislePlacement: 'Secondary Perimeter Aisle or Specialty Nook',
        merchandisingStrategy: 'Minimize shelf footprint to 1 facing. Bundle with high-runner staples or launch clearance markdown to liquidate deadstock.',
        bundlingSuggestion: 'Bundle with fast-moving staples (e.g., Bread/Milk) with a 20% combo discount.'
      };
    } else {
      organisation = {
        recommendedZone: 'Zone B - Mid-Shelf (Reach Zone)',
        shelfHeight: '0.7m - 1.1m (Reach Height)',
        recommendedFacings: 2,
        aislePlacement: 'Standard Department Aisles (Rows 3-6)',
        merchandisingStrategy: 'Standard double facing layout with routine weekly replenishments.',
        bundlingSuggestion: 'Standard shelf merchandising with category signage.'
      };
    }

    let recommendation = 'Standard restocking schedule.';
    if (consumptionTier === 'Top Consumed') {
      if (stockoutRisk === 'Critical' || stockoutRisk === 'Moderate') {
        recommendation = `Rapid depletion alert! Expedite reorder of ${predictedDemandUnits} units to avoid shelf vacancy.`;
      } else {
        recommendation = 'Maintain priority front-facing shelf placement and prime aisle endcaps.';
      }
    } else if (consumptionTier === 'Least Consumed') {
      if (stockoutRisk === 'Overstocked') {
        recommendation = 'Slow customer intake. Launch 20% promotional bundle or clearance discount to prevent deadstock.';
      } else {
        recommendation = 'Minimal consumption rate. Limit reorder batch to just-in-time single units.';
      }
    } else {
      recommendation = 'Healthy steady demand. Follow automated safety stock threshold.';
    }

    const turnoverScore = Math.min(100, Math.round((effectiveProbability * 0.7) + (Math.min(effectiveDailyVelocity, 40) / 40 * 30)));

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      currentStock: product.quantity,
      unitPrice: product.unitPrice,
      dailyVelocity: effectiveDailyVelocity,
      consumptionProbability: effectiveProbability,
      predictedDemandUnits,
      daysOfSupply,
      stockoutRisk,
      consumptionTier,
      recommendation,
      turnoverScore,
      organisation
    };
  });

  // Calculate total storewide predicted demand
  const storeTotalDemand = Math.max(1, rawPredictions.reduce((sum, p) => sum + p.predictedDemandUnits, 0));

  // Category demand map for category sales percentage
  const categoryDemandSums: Record<string, number> = {};
  rawPredictions.forEach(p => {
    categoryDemandSums[p.category] = (categoryDemandSums[p.category] || 0) + p.predictedDemandUnits;
  });

  // Second pass: Calculate exact Sales Percentage (Share of Total Sales)
  const predictions: ProductConsumptionPrediction[] = rawPredictions.map(p => {
    const salesPercentage = parseFloat(((p.predictedDemandUnits / storeTotalDemand) * 100).toFixed(2));
    const catTotal = categoryDemandSums[p.category] || p.predictedDemandUnits;
    const categorySalesPercentage = parseFloat(((p.predictedDemandUnits / Math.max(1, catTotal)) * 100).toFixed(1));

    return {
      ...p,
      salesPercentage,
      categorySalesPercentage
    };
  });

  // Sort descending by consumption probability & velocity to find top consumed
  const sortedByConsumption = [...predictions].sort(
    (a, b) => b.consumptionProbability - a.consumptionProbability || b.dailyVelocity - a.dailyVelocity
  );

  const topConsumed = sortedByConsumption.slice(0, 10);
  const leastConsumed = [...sortedByConsumption].reverse().slice(0, 10);

  // Category aggregates
  const categoryMap: Record<string, {
    probs: number[];
    dailySum: number;
    unitsSum: number;
    items: ProductConsumptionPrediction[];
    highStock: number;
    leastStock: number;
  }> = {};

  predictions.forEach(p => {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { probs: [], dailySum: 0, unitsSum: 0, items: [], highStock: 0, leastStock: 0 };
    }
    categoryMap[p.category].probs.push(p.consumptionProbability);
    categoryMap[p.category].dailySum += p.dailyVelocity;
    categoryMap[p.category].unitsSum += p.predictedDemandUnits;
    categoryMap[p.category].items.push(p);

    if (p.consumptionTier === 'Top Consumed' || p.consumptionTier === 'High Demand') {
      categoryMap[p.category].highStock += p.currentStock;
    } else if (p.consumptionTier === 'Least Consumed') {
      categoryMap[p.category].leastStock += p.currentStock;
    }
  });

  const categoryMetrics: CategoryConsumptionMetric[] = Object.entries(categoryMap).map(([category, data]) => {
    const avgProb = parseFloat((data.probs.reduce((a, b) => a + b, 0) / data.probs.length).toFixed(1));
    const sortedItems = [...data.items].sort((a, b) => b.consumptionProbability - a.consumptionProbability);
    const topItem = sortedItems[0]?.name || 'N/A';
    const leastItem = sortedItems[sortedItems.length - 1]?.name || 'N/A';
    const highDemandCount = data.items.filter(i => i.consumptionTier === 'Top Consumed' || i.consumptionTier === 'High Demand').length;
    const leastConsumedCount = data.items.filter(i => i.consumptionTier === 'Least Consumed').length;
    const catSalesPercentage = parseFloat(((data.unitsSum / storeTotalDemand) * 100).toFixed(1));

    return {
      category,
      avgConsumptionProbability: avgProb,
      totalDailyVelocity: parseFloat(data.dailySum.toFixed(1)),
      projectedUnits: data.unitsSum,
      salesPercentage: catSalesPercentage,
      topConsumedProduct: topItem,
      leastConsumedProduct: leastItem,
      productCount: data.items.length,
      highDemandCount,
      leastConsumedCount,
      highConsumptionStockUnits: data.highStock,
      leastConsumptionStockUnits: data.leastStock
    };
  }).sort((a, b) => b.salesPercentage - a.salesPercentage);

  const storewideAvgProbability = parseFloat(
    (predictions.reduce((acc, p) => acc + p.consumptionProbability, 0) / Math.max(1, predictions.length)).toFixed(1)
  );

  const highItems = predictions.filter(p => p.consumptionTier === 'Top Consumed' || p.consumptionTier === 'High Demand');
  const leastItems = predictions.filter(p => p.consumptionTier === 'Least Consumed');

  const highUnitsSum = highItems.reduce((acc, p) => acc + p.predictedDemandUnits, 0);
  const leastUnitsSum = leastItems.reduce((acc, p) => acc + p.predictedDemandUnits, 0);

  const highConsumptionSalesShare = parseFloat(((highUnitsSum / storeTotalDemand) * 100).toFixed(1));
  const leastConsumptionSalesShare = parseFloat(((leastUnitsSum / storeTotalDemand) * 100).toFixed(1));

  const highConsumptionStockTotal = highItems.reduce((acc, p) => acc + p.currentStock, 0);
  const leastConsumptionStockTotal = leastItems.reduce((acc, p) => acc + p.currentStock, 0);

  const totalProjectedUnits = storeTotalDemand;
  const highConsumptionCount = highItems.length;
  const leastConsumedCount = leastItems.length;
  const criticalStockoutCount = predictions.filter(p => p.stockoutRisk === 'Critical').length;

  return {
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
  };
}

/**
 * Generates 14-day or 30-day projected timeline data for chart
 */
export function generateConsumptionTrendCurve(
  topProducts: ProductConsumptionPrediction[],
  leastProducts: ProductConsumptionPrediction[],
  days: number = 14
) {
  const points = [];
  const topTotalDaily = topProducts.reduce((sum, p) => sum + p.dailyVelocity, 0);
  const leastTotalDaily = leastProducts.reduce((sum, p) => sum + p.dailyVelocity, 0);

  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayOfWeek = d.getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.25 : 1.0;

    points.push({
      day: `Day ${i}`,
      date: dateLabel,
      'Top Consumed Demand (Units)': Math.round(topTotalDaily * i * weekendBoost),
      'Least Consumed Demand (Units)': Math.round(leastTotalDaily * i),
      'Daily Top Units': Math.round(topTotalDaily * weekendBoost),
      'Daily Least Units': parseFloat((leastTotalDaily).toFixed(1))
    });
  }

  return points;
}
