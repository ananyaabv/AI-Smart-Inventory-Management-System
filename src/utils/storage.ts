import { ProductItem, StockTransaction, DetectionLog, UserProfile } from '../types';
import { generate10000Products, PRIMARY_PRODUCTS } from './productGenerator';
import { INITIAL_TRANSACTIONS } from './transactionGenerator';

export { INITIAL_TRANSACTIONS };

const STORAGE_KEYS = {
  PRODUCTS: 'smartstock_products_10k_inr_v11',
  TRANSACTIONS: 'smartstock_transactions_v6',
  DETECTIONS: 'smartstock_detections_v6',
  USER: 'smartstock_current_user_v6'
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    username: 'alex_mercer',
    name: 'Alex Mercer',
    role: 'Store General Manager (VP Retail)',
    department: 'Store Leadership & General Management',
    avatar: ''
  },
  {
    id: 'usr-2',
    username: 'jordan_hayes',
    name: 'Jordan Hayes',
    role: 'Director of Store Operations & Logistics',
    department: 'Store Operations & Replenishment',
    avatar: ''
  },
  {
    id: 'usr-3',
    username: 'taylor_morgan',
    name: 'Taylor Morgan',
    role: 'Chief Store Auditor & Inventory Controller',
    department: 'Financial Auditing & Stock Reconciliation',
    avatar: ''
  },
  {
    id: 'usr-4',
    username: 'riley_sterling',
    name: 'Riley Sterling',
    role: 'Senior Merchandising & Procurement Head',
    department: 'Procurement & Vendor Supply Chain',
    avatar: ''
  }
];

export const INITIAL_PRODUCTS: ProductItem[] = PRIMARY_PRODUCTS;

export const INITIAL_DETECTIONS: DetectionLog[] = [
  {
    id: 'detlog-1',
    timestamp: '2026-09-09 10:15',
    imageName: 'Aisle 3 Beverage Cooler (Bottles & Cans)',
    itemsDetected: [
      { label: 'bottle', count: 5, confidence: 0.96 },
      { label: 'can', count: 4, confidence: 0.88 }
    ],
    totalCount: 9,
    appliedToInventory: true,
    notes: 'Reconciled stock levels with Aisle 3 Cooler optical camera scan.'
  },
  {
    id: 'detlog-2',
    timestamp: '2026-09-09 09:00',
    imageName: 'Fresh Farm Produce Bin (Apples & Oranges)',
    itemsDetected: [
      { label: 'apple', count: 3, confidence: 0.97 },
      { label: 'orange', count: 3, confidence: 0.95 }
    ],
    totalCount: 6,
    appliedToInventory: false,
    notes: 'Morning inspection check prior to store customer opening.'
  },
  {
    id: 'detlog-3',
    timestamp: '2026-09-08 17:30',
    imageName: 'Electronics Showcase (Laptop Workstation)',
    itemsDetected: [
      { label: 'laptop', count: 1, confidence: 0.99 }
    ],
    totalCount: 1,
    appliedToInventory: true,
    notes: 'Daily high-value locker shelf optical audit.'
  },
  {
    id: 'detlog-4',
    timestamp: '2026-09-08 14:15',
    imageName: 'Chilled Beverage Stack (Soda Cans)',
    itemsDetected: [
      { label: 'can', count: 4, confidence: 0.95 }
    ],
    totalCount: 4,
    appliedToInventory: true,
    notes: 'Automated scan sync before afternoon restocking.'
  },
  {
    id: 'detlog-5',
    timestamp: '2026-09-08 11:30',
    imageName: 'Produce Display (Fresh Yellow Bananas)',
    itemsDetected: [
      { label: 'banana', count: 2, confidence: 0.98 }
    ],
    totalCount: 2,
    appliedToInventory: true,
    notes: 'Produce aisle banana shelf optical reconciliation.'
  },
  {
    id: 'detlog-6',
    timestamp: '2026-09-07 16:45',
    imageName: 'Stationery Section (Hardcover Notebooks)',
    itemsDetected: [
      { label: 'book', count: 2, confidence: 0.96 }
    ],
    totalCount: 2,
    appliedToInventory: true,
    notes: 'Gift & Stationery bay stock audit.'
  }
];

// Helper functions for persistent state
let inMemory10kProducts: ProductItem[] | null = null;

export function getStoredProducts(): ProductItem[] {
  if (inMemory10kProducts && inMemory10kProducts.length >= 10000) {
    return inMemory10kProducts;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 10000 && parsed[4]?.unit) {
        inMemory10kProducts = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read products from localStorage', e);
  }

  const generated = generate10000Products();
  inMemory10kProducts = generated;
  saveStoredProducts(generated);
  return generated;
}

export function saveStoredProducts(products: ProductItem[]): void {
  inMemory10kProducts = products;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.warn('LocalStorage quota or write error (persisting in memory):', e);
  }
}

export function getStoredTransactions(): StockTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read transactions from localStorage', e);
  }
  saveStoredTransactions(INITIAL_TRANSACTIONS);
  return INITIAL_TRANSACTIONS;
}

export function saveStoredTransactions(transactions: StockTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
}

export function getStoredDetections(): DetectionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DETECTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read detections from localStorage', e);
  }
  saveStoredDetections(INITIAL_DETECTIONS);
  return INITIAL_DETECTIONS;
}

export function saveStoredDetections(detections: DetectionLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(detections));
  } catch (e) {
    console.error('Failed to save detections to localStorage', e);
  }
}

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read user from localStorage', e);
  }
  return INITIAL_USERS[0];
}

export function saveStoredUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user to localStorage', e);
  }
}

// CSV Export Generator
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const val = item[header];
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val ?? '').replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// SQLite SQL Dump Generator
export function generateSQLiteDump(products: ProductItem[], transactions: StockTransaction[]): string {
  let sql = `-- =========================================================================
-- AI Smart Inventory Management System - Complete SQLite3 Database Dump
-- Generated: ${new Date().toISOString()}
-- =========================================================================

PRAGMA foreign_keys = ON;

-- 1. Products / Inventory Table
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_threshold INTEGER NOT NULL DEFAULT 5,
    unit_price REAL NOT NULL DEFAULT 0.0,
    location TEXT,
    last_updated TEXT NOT NULL,
    notes TEXT
);

-- 2. Stock Transactions Log Table
DROP TABLE IF EXISTS stock_transactions;
CREATE TABLE stock_transactions (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('IN', 'OUT', 'AI_SCAN_SYNC', 'AUDIT_ADJUST')),
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    performed_by TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. AI Detection Scans History Table
DROP TABLE IF EXISTS detection_history;
CREATE TABLE detection_history (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    image_name TEXT NOT NULL,
    items_detected_json TEXT NOT NULL,
    total_count INTEGER NOT NULL,
    applied_to_inventory INTEGER DEFAULT 0,
    notes TEXT
);

-- 4. Users Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

-- Insert Seed Users (Executive Management)
INSERT INTO users VALUES ('usr-1', 'rajesh_gm', 'Rajesh Singhania', 'Store General Manager (VP Retail)', 'sha256_mock_hash_1');
INSERT INTO users VALUES ('usr-2', 'priya_ops', 'Priya Sharma', 'Director of Store Operations & Logistics', 'sha256_mock_hash_2');
INSERT INTO users VALUES ('usr-3', 'anand_audit', 'Anand Verma', 'Chief Store Auditor & Inventory Controller', 'sha256_mock_hash_3');
INSERT INTO users VALUES ('usr-4', 'meera_procure', 'Meera Nambiar', 'Senior Merchandising & Procurement Head', 'sha256_mock_hash_4');

-- Insert Products Data
`;

  products.forEach(p => {
    sql += `INSERT INTO products VALUES ('${p.id}', '${p.sku}', '${p.name.replace(/'/g, "''")}', '${p.category}', ${p.quantity}, ${p.minThreshold}, ${p.unitPrice}, '${p.location.replace(/'/g, "''")}', '${p.lastUpdated}', '${(p.notes || '').replace(/'/g, "''")}');\n`;
  });

  sql += `\n-- Insert Transactions Data\n`;
  transactions.forEach(t => {
    sql += `INSERT INTO stock_transactions VALUES ('${t.id}', '${t.timestamp}', '${t.productId}', '${t.productName.replace(/'/g, "''")}', '${t.type}', ${t.quantityChange}, ${t.previousQuantity}, ${t.newQuantity}, '${t.performedBy.replace(/'/g, "''")}', '${t.reason.replace(/'/g, "''")}');\n`;
  });

  return sql;
}

export function formatINR(val: number): string {
  return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function downloadSQLDump(products: ProductItem[], transactions: StockTransaction[]): void {
  const sql = generateSQLiteDump(products, transactions);
  const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `store_inventory_sql_archive_${Date.now()}.sql`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
