export interface SubItemUnit {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  color: string;
  count?: number; // total units grouped in this box (e.g. 5 units)
  subItems?: SubItemUnit[]; // individual detected items within this grouped box
  commercialUnit?: 'kg' | 'dozen' | 'can' | 'bottle' | 'pack' | 'box' | 'unit' | string;
  commercialQuantity?: number; // e.g. 1.0 (for 1 kg or 1 dozen)
  pieceCount?: number; // e.g. 6 pieces per kg or 12 pieces per dozen
  rateFormatted?: string; // e.g. "₹180/kg"
}

export interface SampleImage {
  id: string;
  name: string;
  category: string;
  url: string;
  boxes: BoundingBox[];
  commercialBoxes?: BoundingBox[]; // boxes around produce grouped per kg / dozen
}

export type ProductUnit = 'kg' | 'dozen' | 'can' | 'bottle' | 'pack' | 'box' | 'carton' | 'unit' | string;

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  location: string;
  lastUpdated: string;
  barcode?: string;
  notes?: string;
  unit?: ProductUnit;
  produceType?: 'fruit' | 'vegetable' | 'dairy' | 'staple' | 'beverage' | 'other';
  piecesPerUnit?: number; // e.g., 6 pieces/kg for apples/oranges/pears, 12 pieces/dozen for bananas
  netWeightGrams?: number;
}

export interface StockTransaction {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'AI_SCAN_SYNC' | 'AUDIT_ADJUST';
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  performedBy: string;
  reason: string;
}

export interface DetectionLog {
  id: string;
  timestamp: string;
  imageName: string;
  itemsDetected: { label: string; count: number; confidence: number }[];
  totalCount: number;
  appliedToInventory: boolean;
  notes?: string;
}

export type ExecutiveRole =
  | 'Store General Manager (VP Retail)'
  | 'Director of Store Operations & Logistics'
  | 'Chief Store Auditor & Inventory Controller'
  | 'Senior Merchandising & Procurement Head';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: ExecutiveRole | string;
  department?: string;
  avatar: string;
}

export interface ProductCount {
  productName: string;
  count: number;
  percentage: string;
  color: string;
}

export interface CodeFile {
  name: string;
  language: string;
  content: string;
  description: string;
}

export interface OpenCVOptions {
  cannyLow?: number;
  cannyHigh?: number;
  minArea?: number;
  maxArea?: number;
  confidenceThreshold?: number;
  targetClass?: string;
  shelfCategory?: string;
}

export interface OpenCVDetectionResult {
  boxes: BoundingBox[];
  counts: { [label: string]: number };
  totalItems: number;
  cannyMapUrl?: string;
  thresholdMapUrl?: string;
  contoursCount: number;
  processingTimeMs: number;
  engineUsed: 'opencv-wasm' | 'opencv-canvas-cv';
}
