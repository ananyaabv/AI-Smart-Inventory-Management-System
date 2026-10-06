import { StockTransaction } from '../types';

export function generate120Transactions(): StockTransaction[] {
  const transactions: StockTransaction[] = [];

  const executives = [
    'Alex Mercer (Store General Manager (VP Retail))',
    'Jordan Hayes (Director of Store Operations & Logistics)',
    'Taylor Morgan (Chief Store Auditor & Inventory Controller)',
    'Riley Sterling (Senior Merchandising & Procurement Head)'
  ];

  const productData = [
    { id: 'prod-1', name: 'bottle', cat: 'Beverages', baseQty: 34 },
    { id: 'prod-2', name: 'can', cat: 'Beverages', baseQty: 18 },
    { id: 'prod-3', name: 'apple', cat: 'Groceries & Produce', baseQty: 12 },
    { id: 'prod-4', name: 'orange', cat: 'Groceries & Produce', baseQty: 8 },
    { id: 'prod-5', name: 'banana', cat: 'Groceries & Produce', baseQty: 25 },
    { id: 'prod-6', name: 'laptop', cat: 'Electronics & Gadgets', baseQty: 5 },
    { id: 'prod-7', name: 'mouse', cat: 'Electronics & Gadgets', baseQty: 14 },
    { id: 'prod-8', name: 'cup', cat: 'Office Supplies', baseQty: 6 },
    { id: 'prod-9', name: 'book', cat: 'Office Supplies', baseQty: 42 },
    { id: 'prod-10', name: 'backpack', cat: 'Apparel & Bags', baseQty: 4 },
    { id: 'prod-11', name: 'handbag', cat: 'Apparel & Bags', baseQty: 6 },
    { id: 'prod-12', name: 'bread', cat: 'Groceries & Produce', baseQty: 18 },
    { id: 'prod-13', name: 'cereal box', cat: 'Groceries & Produce', baseQty: 24 },
    { id: 'prod-14', name: 'duffel bag', cat: 'Apparel & Bags', baseQty: 8 },
    { id: 'prod-15', name: 'Mineral Water 500ml', cat: 'Beverages', baseQty: 120 },
    { id: 'prod-16', name: 'Citrus Soda 330ml', cat: 'Beverages', baseQty: 95 },
    { id: 'prod-17', name: 'Wireless Ergonomic Optical Mouse', cat: 'Electronics & Gadgets', baseQty: 32 },
    { id: 'prod-18', name: 'Ultrabook 14-inch Core i7', cat: 'Electronics & Gadgets', baseQty: 12 },
    { id: 'prod-19', name: 'Noise-Cancelling Wireless Earbuds', cat: 'Electronics & Gadgets', baseQty: 28 },
    { id: 'prod-20', name: 'Mechanical Keyboard RGB', cat: 'Electronics & Gadgets', baseQty: 19 },
    { id: 'prod-21', name: 'Valencia Sweet Orange', cat: 'Groceries & Produce', baseQty: 45 },
    { id: 'prod-22', name: 'Honeycrisp Fresh Apple', cat: 'Groceries & Produce', baseQty: 60 },
    { id: 'prod-23', name: 'Whole Grain Sourdough Loaf', cat: 'Groceries & Produce', baseQty: 38 },
    { id: 'prod-24', name: 'Italian Penne Pasta 500g', cat: 'Groceries & Produce', baseQty: 84 },
    { id: 'prod-25', name: 'Cold Brew Coffee 500ml', cat: 'Beverages', baseQty: 55 },
    { id: 'prod-26', name: 'Unsweetened Green Tea', cat: 'Beverages', baseQty: 40 },
    { id: 'prod-27', name: 'Executive Lined Journal A5', cat: 'Office Supplies', baseQty: 75 },
    { id: 'prod-28', name: 'Insulated Stainless Tumbler', cat: 'Office Supplies', baseQty: 22 },
    { id: 'prod-29', name: 'Water-Resistant Commuter Backpack', cat: 'Apparel & Bags', baseQty: 16 },
    { id: 'prod-30', name: 'Kettle Cooked Sea Salt Chips', cat: 'Packaged Foods & Snacks', baseQty: 110 },
    { id: 'prod-31', name: 'Roasted Almonds 200g', cat: 'Packaged Foods & Snacks', baseQty: 65 },
    { id: 'prod-32', name: 'Dark Chocolate Bar 70%', cat: 'Packaged Foods & Snacks', baseQty: 90 },
    { id: 'prod-33', name: 'Antibacterial Foaming Hand Wash', cat: 'Health & Personal Care', baseQty: 50 },
    { id: 'prod-34', name: 'Mineral Sunscreen SPF50', cat: 'Health & Personal Care', baseQty: 30 },
    { id: 'prod-35', name: 'Stainless Steel Thermal Flask', cat: 'Home & Kitchen', baseQty: 24 }
  ];

  const types: ('IN' | 'OUT' | 'AI_SCAN_SYNC' | 'AUDIT_ADJUST')[] = [
    'AI_SCAN_SYNC', 'OUT', 'IN', 'OUT', 'AI_SCAN_SYNC', 'AUDIT_ADJUST', 'IN', 'OUT', 'IN', 'AI_SCAN_SYNC'
  ];

  const reasons = {
    IN: [
      'Vendor weekly master pallet intake and warehouse logging',
      'Central warehouse scheduled restock delivery (PO receipt)',
      'Wholesale supplier delivery batch verification',
      'Urgent safety buffer stock replenishment intake',
      'Seasonal promotional inventory arrival from distributor'
    ],
    OUT: [
      'Customer checkout point-of-sale register batch clearance',
      'Corporate bulk purchase order fulfillment and dispatch',
      'Front-of-store cashier station high-volume sales deduction',
      'Express online pickup order fulfillment from shelf stock',
      'Retail customer basket checkout transaction'
    ],
    AI_SCAN_SYNC: [
      'Visual shelf scanner optical audit automated stock count',
      'Smart camera shelf audit adjustment: physical count verified',
      'AI shelf scanner automated reconciliation with POS inventory',
      'Optical aisle scanner cycle count confirmation',
      'Digital shelf camera inventory audit reconciliation'
    ],
    AUDIT_ADJUST: [
      'Physical cycle audit recount and variance reconciliation',
      'Damaged packaging write-off during morning store inspection',
      'Merchandise display shelf rebalancing adjustment',
      'Executive inventory controller quarterly audit sign-off',
      'Stock expiration date inspection shrinkage adjustment'
    ]
  };

  // Generate 125 realistic historical transactions
  // Starting from today (2026-09-09 10:30) and going back across 25 days
  let currentRunningQty: { [name: string]: number } = {};
  productData.forEach(p => {
    currentRunningQty[p.name] = p.baseQty;
  });

  const now = new Date('2026-09-09T10:30:00');

  for (let i = 0; i < 125; i++) {
    const prod = productData[i % productData.length];
    const type = types[i % types.length];
    const exec = executives[i % executives.length];
    const reasonList = reasons[type];
    const reason = reasonList[i % reasonList.length];

    // Compute realistic delta
    let delta = 0;
    if (type === 'IN') {
      delta = 10 + ((i * 7) % 35);
    } else if (type === 'OUT') {
      delta = -(1 + ((i * 3) % 12));
    } else if (type === 'AI_SCAN_SYNC') {
      delta = (i % 2 === 0 ? 1 : -1) * (1 + (i % 6));
    } else {
      delta = -(1 + (i % 4));
    }

    const currentQty = currentRunningQty[prod.name] || prod.baseQty;
    const prevQty = Math.max(1, currentQty - delta);
    const newQty = Math.max(0, currentQty);

    // Timestamp calculation: roughly spread backwards by 2 to 6 hours each
    const hoursAgo = Math.floor(i * 4.8);
    const txTime = new Date(now.getTime() - hoursAgo * 3600 * 1000 - ((i * 17) % 60) * 60 * 1000);
    const timeStr = `${txTime.getFullYear()}-${String(txTime.getMonth() + 1).padStart(2, '0')}-${String(txTime.getDate()).padStart(2, '0')} ${String(txTime.getHours()).padStart(2, '0')}:${String(txTime.getMinutes()).padStart(2, '0')}`;

    transactions.push({
      id: `tx-audit-${1000 + i}`,
      timestamp: timeStr,
      productId: prod.id,
      productName: prod.name,
      type,
      quantityChange: delta,
      previousQuantity: prevQty,
      newQuantity: newQty,
      performedBy: exec,
      reason
    });
  }

  return transactions;
}

export const INITIAL_TRANSACTIONS: StockTransaction[] = generate120Transactions();
