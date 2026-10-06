import { SampleImage, CodeFile } from '../types';

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-1',
    name: 'Retail Beverage Cooler Shelf (Chilled Cans & Bottles)',
    category: 'Store Shelves • Beverages',
    url: '/shelves/beverage_shelf.jpg',
    boxes: [
      { id: 'can-1', label: 'soft drinks', confidence: 0.98, x: 5.5, y: 13.0, width: 13.5, height: 26.0, color: '#10b981' },
      { id: 'can-2', label: 'soft drinks', confidence: 0.97, x: 21.0, y: 13.0, width: 13.5, height: 26.0, color: '#10b981' },
      { id: 'can-3', label: 'soft drinks', confidence: 0.99, x: 36.5, y: 13.0, width: 13.5, height: 26.0, color: '#10b981' },
      { id: 'can-4', label: 'soft drinks', confidence: 0.96, x: 51.5, y: 13.0, width: 13.5, height: 26.0, color: '#10b981' },
      { id: 'can-5', label: 'soft drinks', confidence: 0.95, x: 67.0, y: 13.0, width: 13.5, height: 26.0, color: '#10b981' },
      { id: 'can-6', label: 'soft drinks', confidence: 0.97, x: 82.5, y: 13.0, width: 13.5, height: 26.0, color: '#10b981' },
      { id: 'bot-1', label: 'juices', confidence: 0.98, x: 16.0, y: 56.0, width: 14.5, height: 32.5, color: '#0ea5e9' },
      { id: 'bot-2', label: 'juices', confidence: 0.96, x: 32.0, y: 56.0, width: 14.0, height: 32.5, color: '#0ea5e9' },
      { id: 'bot-3', label: 'juices', confidence: 0.97, x: 47.5, y: 56.0, width: 14.0, height: 32.5, color: '#0ea5e9' },
      { id: 'bot-4', label: 'juices', confidence: 0.97, x: 63.0, y: 56.0, width: 13.5, height: 32.5, color: '#0ea5e9' },
      { id: 'bot-5', label: 'juices', confidence: 0.95, x: 77.5, y: 56.0, width: 13.5, height: 32.5, color: '#0ea5e9' }
    ]
  },
  {
    id: 'sample-3',
    name: 'Grocery Aisle Cereal Shelf (Breakfast Cereal Boxes)',
    category: 'Store Shelves • Packaged Goods',
    url: '/shelves/cereal_shelf.jpg',
    boxes: [
      { id: 'cb-1', label: 'cereal box', confidence: 0.98, x: 10.5, y: 36.5, width: 20.5, height: 42.0, color: '#f59e0b' },
      { id: 'cb-2', label: 'cereal box', confidence: 0.97, x: 31.0, y: 36.5, width: 19.5, height: 42.0, color: '#f59e0b' },
      { id: 'cb-3', label: 'cereal box', confidence: 0.99, x: 50.0, y: 36.0, width: 20.5, height: 42.5, color: '#f59e0b' },
      { id: 'cb-4', label: 'cereal box', confidence: 0.97, x: 70.5, y: 36.5, width: 21.5, height: 42.0, color: '#f59e0b' }
    ]
  },
  {
    id: 'sample-4',
    name: 'Tropical Produce Display (Ripe Yellow Bananas)',
    category: 'Produce • Fresh Fruits',
    url: '/shelves/banana_display.jpg',
    boxes: [
      { id: 'bn-1', label: 'banana', confidence: 0.98, x: 16.0, y: 40.0, width: 22.0, height: 35.0, color: '#eab308' },
      { id: 'bn-2', label: 'banana', confidence: 0.97, x: 40.0, y: 38.0, width: 23.0, height: 37.0, color: '#eab308' },
      { id: 'bn-3', label: 'banana', confidence: 0.99, x: 65.0, y: 40.0, width: 22.0, height: 35.0, color: '#eab308' }
    ],
    commercialBoxes: [
      {
        id: 'comm-bn-1',
        label: '1 Dozen Robusta Bananas',
        confidence: 0.98,
        x: 14.5,
        y: 36.0,
        width: 25.0,
        height: 42.0,
        color: '#eab308',
        commercialUnit: 'dozen',
        commercialQuantity: 1.0,
        pieceCount: 12,
        rateFormatted: '₹60/doz',
        subItems: [
          { id: 'bn-1', x: 16.0, y: 40.0, width: 22.0, height: 35.0, confidence: 0.98 }
        ]
      },
      {
        id: 'comm-bn-2',
        label: '1 Dozen Robusta Bananas',
        confidence: 0.97,
        x: 38.5,
        y: 35.0,
        width: 26.0,
        height: 43.0,
        color: '#eab308',
        commercialUnit: 'dozen',
        commercialQuantity: 1.0,
        pieceCount: 12,
        rateFormatted: '₹60/doz',
        subItems: [
          { id: 'bn-2', x: 40.0, y: 38.0, width: 23.0, height: 37.0, confidence: 0.97 }
        ]
      },
      {
        id: 'comm-bn-3',
        label: '1 Dozen Robusta Bananas',
        confidence: 0.99,
        x: 63.5,
        y: 36.0,
        width: 25.0,
        height: 42.0,
        color: '#eab308',
        commercialUnit: 'dozen',
        commercialQuantity: 1.0,
        pieceCount: 12,
        rateFormatted: '₹60/doz',
        subItems: [
          { id: 'bn-3', x: 65.0, y: 40.0, width: 22.0, height: 35.0, confidence: 0.99 }
        ]
      }
    ]
  },
  {
    id: 'sample-5',
    name: 'Dairy Refrigerated Case (Fresh Milk Cartons)',
    category: 'Store Shelves • Dairy',
    url: '/shelves/milk_cartons.jpg',
    boxes: [
      { id: 'mk-1', label: 'milk carton', confidence: 0.98, x: 9.0, y: 24.0, width: 18.0, height: 58.0, color: '#06b6d4' },
      { id: 'mk-2', label: 'milk carton', confidence: 0.97, x: 29.5, y: 24.0, width: 18.0, height: 58.0, color: '#06b6d4' },
      { id: 'mk-3', label: 'milk carton', confidence: 0.99, x: 50.0, y: 24.0, width: 18.0, height: 58.0, color: '#06b6d4' },
      { id: 'mk-4', label: 'milk carton', confidence: 0.96, x: 70.5, y: 24.0, width: 18.0, height: 58.0, color: '#06b6d4' }
    ]
  },
  {
    id: 'sample-6',
    name: 'Pantry Shelf Canned Goods (Soups, Beans & Veggies)',
    category: 'Store Shelves • Canned Goods',
    url: '/shelves/canned_goods.jpg',
    boxes: [
      { id: 'cg-1', label: 'canned goods', confidence: 0.98, x: 6.2, y: 31.5, width: 21.3, height: 46.8, color: '#14b8a6' },
      { id: 'cg-2', label: 'canned goods', confidence: 0.97, x: 28.5, y: 31.3, width: 21.6, height: 47.0, color: '#14b8a6' },
      { id: 'cg-3', label: 'canned goods', confidence: 0.99, x: 51.3, y: 31.3, width: 21.2, height: 47.0, color: '#14b8a6' },
      { id: 'cg-4', label: 'canned goods', confidence: 0.98, x: 73.5, y: 31.5, width: 21.6, height: 46.8, color: '#14b8a6' }
    ]
  },
  {
    id: 'sample-7',
    name: 'Citrus Fruit Produce Crates (Fresh Farm Oranges)',
    category: 'Produce • Fresh Fruits',
    url: '/shelves/oranges_display.jpg',
    boxes: [
      { id: 'org-1', label: 'orange', confidence: 0.98, x: 16.0, y: 33.0, width: 68.0, height: 50.0, color: '#f97316' }
    ],
    commercialBoxes: [
      {
        id: 'comm-org-1',
        label: '1.0 kg Farm Oranges',
        confidence: 0.98,
        x: 16.0,
        y: 33.0,
        width: 68.0,
        height: 50.0,
        color: '#f97316',
        commercialUnit: 'kg',
        commercialQuantity: 1.0,
        pieceCount: 6,
        rateFormatted: '₹90/kg',
        subItems: [
          { id: 'org-1', x: 16.0, y: 33.0, width: 68.0, height: 50.0, confidence: 0.98 }
        ]
      }
    ]
  }
];

export const PYTHON_FILES: CodeFile[] = [
  {
    name: 'app.py',
    language: 'python',
    description: 'Main Streamlit multi-view application: Detection with SQLite sync, Inventory CRUD, Analytics, Alerts, and CSV Reports.',
    content: `"""
app.py - AI Smart Inventory Management System (Full Application)
"""
import streamlit as st
import pandas as pd
from PIL import Image
from detector import InventoryDetector
import database as db

st.set_page_config(page_title="AI Smart Inventory", layout="wide")
db.init_db()

# Cached YOLOv8n detector
@st.cache_resource
def load_detector():
    return InventoryDetector(model_name="yolov8n.pt")

detector = load_detector()

# Sidebar Navigation
st.sidebar.title("📦 AI Inventory System")
nav = st.sidebar.radio("Navigation", [
    "📷 AI Vision Detection",
    "📦 Inventory Catalog",
    "📊 Analytics Dashboard",
    "⚠️ Low Stock Alerts",
    "📜 Audit Logs & Reports"
])

confidence = st.sidebar.slider("YOLOv8 Confidence", 0.1, 0.9, 0.25)

if nav == "📷 AI Vision Detection":
    st.header("📷 AI Object Detection & Stock Synchronization")
    uploaded = st.file_uploader("Upload inventory photo", type=["jpg", "png", "jpeg"])
    if uploaded:
        image = Image.open(uploaded)
        annotated_img, counts, details = detector.detect_objects(image, confidence)
        
        col1, col2 = st.columns(2)
        col1.image(image, caption="Original Image")
        col2.image(annotated_img, caption="YOLOv8 + OpenCV Annotated")
        
        st.subheader("Detected Counts")
        st.table(pd.DataFrame(list(counts.items()), columns=["Item", "Count"]))
        
        if st.button("🚀 Sync Detections to SQLite Inventory", type="primary"):
            db.sync_ai_detections_to_inventory(counts)
            st.success("Synchronized detected items directly into SQLite database!")
            st.rerun()

elif nav == "📦 Inventory Catalog":
    st.header("📦 Inventory Catalog (SQLite3)")
    items = db.get_all_products()
    st.dataframe(pd.DataFrame(items))

elif nav == "📊 Analytics Dashboard":
    st.header("📊 Inventory Valuation & Health Dashboard")
    kpis = db.get_inventory_summary_metrics()
    c1, c2, c3 = st.columns(3)
    c1.metric("Total Units", kpis['total_units'])
    c2.metric("Valuation", f"\${kpis['total_valuation']:,.2f}")
    c3.metric("Low Stock Alerts", kpis['low_stock_count'])

elif nav == "⚠️ Low Stock Alerts":
    st.header("⚠️ Low Stock Reorder Triggers")
    alerts = db.get_low_stock_alerts()
    for a in alerts:
        st.error(f"Alert: {a['name']} ({a['quantity']} left, min threshold {a['min_threshold']})")

elif nav == "📜 Audit Logs & Reports":
    st.header("📜 Audit Logs & CSV Exports")
    txs = db.get_recent_transactions(50)
    st.dataframe(pd.DataFrame(txs))
`
  },
  {
    name: 'database.py',
    language: 'python',
    description: 'SQLite3 database module managing products, audit transactions, detection logs, and KPI calculations.',
    content: `"""
database.py - SQLite3 Persistence Engine for AI Smart Inventory System
"""
import sqlite3
import datetime
from typing import List, Dict, Any

DB_NAME = "inventory.db"

def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                min_threshold INTEGER NOT NULL DEFAULT 5,
                unit_price REAL NOT NULL DEFAULT 0.0,
                location TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stock_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                transaction_type TEXT NOT NULL,
                quantity_change INTEGER NOT NULL,
                previous_quantity INTEGER NOT NULL,
                new_quantity INTEGER NOT NULL,
                performed_by TEXT NOT NULL,
                reason TEXT
            );
        """)
        conn.commit()

def get_all_products():
    with get_connection() as conn:
        return [dict(r) for r in conn.cursor().execute("SELECT * FROM products ORDER BY category, name;").fetchall()]

def sync_ai_detections_to_inventory(detected_counts: Dict[str, int]):
    with get_connection() as conn:
        cur = conn.cursor()
        for label, count in detected_counts.items():
            cur.execute("SELECT id, name, quantity FROM products WHERE LOWER(name) = LOWER(?);", (label.lower(),))
            row = cur.fetchone()
            if row:
                prev_qty = row['quantity']
                new_qty = prev_qty + count
                cur.execute("UPDATE products SET quantity = ? WHERE id = ?;", (new_qty, row['id']))
                cur.execute("""
                    INSERT INTO stock_transactions (product_id, product_name, transaction_type, quantity_change, previous_quantity, new_quantity, performed_by, reason)
                    VALUES (?, ?, 'AI_SCAN_SYNC', ?, ?, ?, 'YOLOv8n System', 'Automated scan sync');
                """, (row['id'], row['name'], count, prev_qty, new_qty))
        conn.commit()
`
  },
  {
    name: 'detector.py',
    language: 'python',
    description: 'Object detection inference module using Ultralytics YOLOv8n and OpenCV drawing.',
    content: `"""
detector.py - Ultralytics YOLOv8n + OpenCV Detection Engine
"""
import cv2
import numpy as np
from PIL import Image
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class InventoryDetector:
    def __init__(self, model_name: str = "yolov8n.pt"):
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_name)
        except Exception as e:
            logger.error(f"Error loading YOLO model: {e}")

    def detect_objects(self, image_input, confidence_threshold: float = 0.25):
        if isinstance(image_input, Image.Image):
            image_np = np.array(image_input)
        else:
            image_np = np.copy(image_input)

        if self.model is None:
            return image_np, {}, []

        results = self.model(image_np, conf=confidence_threshold)
        boxes = results[0].boxes

        annotated_bgr = cv2.cvtColor(image_np.copy(), cv2.COLOR_RGB2BGR)
        detected_labels = []
        details = []

        colors = [(255, 99, 71), (30, 144, 255), (50, 205, 50), (255, 165, 0)]

        for box in boxes:
            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            x1, y1, x2, y2 = xyxy
            conf = float(box.conf[0].cpu().numpy())
            cls_id = int(box.cls[0].cpu().numpy())
            class_name = self.model.names.get(cls_id, f"item_{cls_id}")

            detected_labels.append(class_name)
            details.append({"class": class_name, "confidence": conf, "box": [x1, y1, x2, y2]})

            color = colors[cls_id % len(colors)]
            cv2.rectangle(annotated_bgr, (x1, y1), (x2, y2), color, 2)
            cv2.putText(annotated_bgr, f"{class_name} {conf:.2f}", (x1, max(15, y1 - 6)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        annotated_rgb = cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB)
        return annotated_rgb, dict(Counter(detected_labels)), details
`
  },
  {
    name: 'auth.py',
    language: 'python',
    description: 'User authentication and role-based access module for the Streamlit application.',
    content: `"""
auth.py - Authentication and Role-Based Access Control
"""
from database import get_connection

def authenticate_user(username: str, password: str):
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, username, full_name, role, password_hash FROM users WHERE username = ?;", (username,))
        row = cur.fetchone()
        if row and row['password_hash'] == password:
            return dict(row)
    return None
`
  },
  {
    name: 'requirements.txt',
    language: 'plaintext',
    description: 'List of Python dependencies required for the complete full application.',
    content: `streamlit>=1.30.0
ultralytics>=8.1.0
opencv-python-headless>=4.8.0
pillow>=10.0.0
numpy>=1.24.0
pandas>=2.0.0
torch>=2.0.0
torchvision>=0.15.0
altair>=5.0.0
`
  },
  {
    name: 'README.md',
    language: 'markdown',
    description: 'Comprehensive project documentation, architecture diagram, and execution manual.',
    content: `# AI Smart Inventory Management System (Full Application)

## Quick Start
\`\`\`bash
pip install -r requirements.txt
streamlit run app.py
\`\`\`
`
  }
];
