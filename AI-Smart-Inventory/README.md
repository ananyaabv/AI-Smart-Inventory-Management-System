# 📦 SmartStock: AI Smart Inventory Management System
> **Automated Retail Shelf Object Detection, Multi-Unit Location Grouping & Real-Time SQLite Inventory Intelligence**

---

## 📌 1. Project Overview
**SmartStock** is an end-to-end intelligent inventory management system designed for supermarkets, retail shelves, and warehouse stock counting. By pairing **YOLOv8 Computer Vision** with an **OpenCV spatial grouping algorithm** and an **ACID-compliant SQLite database**, SmartStock replaces tedious and error-prone manual barcode scanning with automated visual auditing.

### Key Highlights:
- **Instant Shelf Scanning:** Upload images or capture directly via a mobile or desktop camera.
- **Single Enclosing Box Grouping:** Automatically groups products of the same class located in the same shelf tier into a single enclosing bounding box displaying the aggregated unit count (e.g. *5 bottles in the same location = 1 box with count: 5 units*).
- **Automated Discrepancy Reconciliation:** Compares visual counts against database records to flag shortages, shrinkage, or surplus stock.
- **Audit-Ready Persistence:** Fully logged stock transactions, detection logs, and automated low-stock and product expiration alerts.

---

## 🏗️ 2. System Architecture & Pipeline

```text
[ Camera / Image Upload ]
           │
           ▼
[ Pre-Inference Quality Validator ]
 (Brightness Mean & Laplacian Focus Variance)
           │
           ▼
[ YOLOv8 Neural Network Inference ]
 (Class Identification & Raw Bounding Boxes)
           │
           ▼
[ Spatial Retail Grouping Algorithm ]
 (Encloses same-type items in single box with N units)
           │
           ▼
[ SQLite Inventory Reconciliation ]
 (Computes Visible Stock vs DB Stock & Discrepancies)
           │
           ▼
[ Automated Inventory Update & Transaction Logging ]
 (STOCK_TRANSACTIONS, DETECTION_HISTORY, ALERTS)
           │
           ▼
[ Analytics, KPIs & Reorder Actions ]
```

---

## 🛠️ 3. Technology Stack
- **Deep Learning / Computer Vision:** Ultralytics YOLOv8, OpenCV, Pillow, NumPy
- **Database:** SQLite3
- **Frontend / Application Engine:** Streamlit, Plotly Express
- **Data Wrangling:** Pandas
- **Language:** Python 3.10+

---

## 📁 4. Project Structure

```text
AI-Smart-Inventory/
├── app.py                      # Master Streamlit application & navigation router
├── config.py                   # Centralized application configuration & constants
├── requirements.txt            # Complete Python dependencies
├── README.md                   # System documentation & setup guide
├── .gitignore                  # Git ignore rules for virtualenvs and models
├── models/
│   ├── best.pt                 # Place custom YOLO weights here (optional)
│   └── README.md               # Custom dataset labeling & training guide
├── database/
│   ├── __init__.py
│   ├── database.py             # SQLite3 schema, CRUD operations & alert triggers
│   └── inventory.db            # Auto-generated SQLite database
├── ai/
│   ├── __init__.py
│   ├── model_loader.py         # Dynamic YOLO model loader & status inspector
│   ├── detector.py             # Detection pipeline & same-location product grouping
│   ├── preprocessing.py        # Illumination & Laplacian blur quality checks
│   └── counter.py              # Item aggregation, counts & confidence calculator
├── pages/
│   ├── dashboard.py            # Executive KPI metrics & health charts
│   ├── detection.py            # AI Shelf Scanner (Upload/Camera + Sync)
│   ├── inventory.py            # Product catalog CRUD & quick +/- adjustments
│   ├── analytics.py            # Plotly valuation, trend & telemetry charts
│   ├── alerts.py               # Low stock, out-of-stock & expiration warnings
│   ├── reports.py              # CSV export for inventory, audit logs & scans
│   ├── settings.py             # YOLO thresholds & database maintenance tools
│   └── about.py                # Academic project specs & architecture details
├── utils/
│   ├── __init__.py
│   ├── calculations.py         # Valuation math, status tags & reorder calculations
│   ├── image_utils.py          # Bounding box rendering & storage helpers
│   └── helpers.py              # SKU generation, normalization & time-ago helpers
├── uploads/                    # Persistent storage for scanned images
├── outputs/                    # Visual bounding-box annotated results
└── assets/                     # UI graphics & icons
```

---

## ⚡ 5. Installation & Setup Instructions (Windows & Linux)

### Step 1: Clone or Extract the Project
```bash
git clone https://github.com/your-username/AI-Smart-Inventory.git
cd AI-Smart-Inventory
```

### Step 2: Create a Virtual Environment
**On Windows (Command Prompt / PowerShell):**
```cmd
python -m venv venv
venv\Scripts\activate
```

**On Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Upgrade Pip and Install Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Run the Application
```bash
streamlit run app.py
```
*The app will automatically open in your browser at `http://localhost:8501`.*

---

## 🗄️ 6. Database Schema (SQLite3)

1. **`PRODUCTS`**: Catalog items, SKU, category, price, quantity, min_stock, max_stock, supplier, expiry_date.
2. **`DETECTION_HISTORY`**: Scan session timestamps, image filenames, total objects detected, processing time.
3. **`DETECTION_RESULTS`**: Detailed product breakdowns per scan session.
4. **`STOCK_TRANSACTIONS`**: Immutable audit logs of all `IN`, `OUT`, `MANUAL_EDIT`, and `AI_DETECTION` quantity changes.
5. **`ALERTS`**: Triggered warnings for `LOW_STOCK`, `OUT_OF_STOCK`, and `EXPIRY` events.

---

## 🎯 7. Supported Product Classes & Grouping Logic
The system supports both standard COCO retail items (Bottles, Cans, Cups, Apples, Bananas, etc.) and custom trained models.
- When **Group Same Type in Single Box** is enabled:
  If multiple items of the same product class (such as 5 bottles) are placed on the same shelf tier, the algorithm clusters their contours and draws **a single unified bounding box** marked `Bottle (5 units) • 94%`, directly updating the shelf count to 5 units without creating cluttered individual boxes.

---

## 🎓 8. Academic Project / Author Details
- **Project:** AI Smart Inventory Management System
- **Domain:** Artificial Intelligence, Computer Vision & Retail Automation
- **Target Platform:** Desktop, Tablet & Mobile Browser
