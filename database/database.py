"""
database.py
-----------
SQLite3 database manager for AI Smart Inventory Management System.
Handles schema initialization, products catalog, stock transactions, alerts, and AI detection history.
"""

import sqlite3
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

import config

def get_connection() -> sqlite3.Connection:
    """Returns an active SQLite database connection with row factory."""
    conn = sqlite3.connect(str(config.DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    """Initializes SQLite schema and populates sample inventory if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. PRODUCTS Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PRODUCTS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            sku TEXT UNIQUE,
            price REAL NOT NULL DEFAULT 0.0,
            quantity INTEGER NOT NULL DEFAULT 0,
            minimum_stock INTEGER NOT NULL DEFAULT 10,
            maximum_stock INTEGER NOT NULL DEFAULT 50,
            supplier TEXT,
            expiry_date TEXT,
            image_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 2. DETECTION_HISTORY Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS DETECTION_HISTORY (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_name TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_objects INTEGER NOT NULL,
            unique_products INTEGER NOT NULL,
            average_confidence REAL NOT NULL,
            processing_time REAL NOT NULL
        );
    """)

    # 3. DETECTION_RESULTS Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS DETECTION_RESULTS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            detection_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            count INTEGER NOT NULL,
            average_confidence REAL NOT NULL,
            FOREIGN KEY (detection_id) REFERENCES DETECTION_HISTORY(id) ON DELETE CASCADE
        );
    """)

    # 4. STOCK_TRANSACTIONS Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS STOCK_TRANSACTIONS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL, -- IN, OUT, ADJUSTMENT, AI_DETECTION
            previous_quantity INTEGER NOT NULL,
            quantity_change INTEGER NOT NULL,
            new_quantity INTEGER NOT NULL,
            source TEXT DEFAULT 'SYSTEM',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES PRODUCTS(id) ON DELETE CASCADE
        );
    """)

    # 5. ALERTS Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ALERTS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            alert_type TEXT NOT NULL, -- LOW_STOCK, OUT_OF_STOCK, EXPIRY, MISMATCH
            message TEXT NOT NULL,
            severity TEXT NOT NULL, -- CRITICAL, WARNING, INFO
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved INTEGER DEFAULT 0,
            FOREIGN KEY (product_id) REFERENCES PRODUCTS(id) ON DELETE SET NULL
        );
    """)

    conn.commit()

    # Seed sample products if table is currently empty
    cursor.execute("SELECT COUNT(*) FROM PRODUCTS")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_sample_data(conn)

    conn.close()

def seed_sample_data(conn: Optional[sqlite3.Connection] = None) -> None:
    """Populates realistic initial supermarket inventory."""
    close_after = False
    if conn is None:
        conn = get_connection()
        close_after = True

    cursor = conn.cursor()
    sample_products = [
        ("Coca Cola", "Beverages", "BEV-CC-500", 40.0, 25, 10, 50, "Coca Cola Beverages Ltd.", "2026-12-31"),
        ("Pepsi", "Beverages", "BEV-PEP-500", 40.0, 20, 10, 50, "PepsiCo India", "2026-12-15"),
        ("Lays", "Snacks", "SNK-LAY-CL", 20.0, 35, 15, 60, "PepsiCo Foods", "2026-11-20"),
        ("Kurkure", "Snacks", "SNK-KUR-MS", 20.0, 30, 15, 60, "PepsiCo Foods", "2026-10-30"),
        ("Milk", "Dairy", "DRY-AMUL-1L", 32.0, 12, 10, 30, "Amul Dairy Cooperative", "2026-09-18"),
        ("Juice", "Beverages", "BEV-REAL-1L", 60.0, 18, 10, 40, "Real Fruit Juices", "2026-11-15"),
        ("Biscuits", "Snacks", "SNK-BRIT-GD", 30.0, 40, 20, 80, "Britannia Industries", "2026-12-01"),
        ("Water Bottle", "Beverages", "BEV-BISL-1L", 20.0, 50, 25, 100, "Bisleri International", "2027-06-30"),
        ("Chocolate", "Confectionery", "CNF-CAD-DRY", 50.0, 22, 15, 50, "Cadbury India", "2026-10-15"),
        ("Noodles", "Instant Food", "INS-MAGG-4P", 14.0, 45, 20, 80, "Nestle India", "2026-11-10"),
    ]

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for name, cat, sku, price, qty, min_s, max_s, supp, exp in sample_products:
        cursor.execute("""
            INSERT INTO PRODUCTS (name, category, sku, price, quantity, minimum_stock, maximum_stock, supplier, expiry_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, cat, sku, price, qty, min_s, max_s, supp, exp, now, now))
        prod_id = cursor.lastrowid

        # Record initial stock transaction
        cursor.execute("""
            INSERT INTO STOCK_TRANSACTIONS (product_id, transaction_type, previous_quantity, quantity_change, new_quantity, source, timestamp)
            VALUES (?, 'IN', 0, ?, ?, 'INITIAL_SEED', ?)
        """, (prod_id, qty, qty, now))

    conn.commit()
    check_and_generate_alerts(conn)

    if close_after:
        conn.close()

# -----------------------------------------------------------------------------
# Product Operations
# -----------------------------------------------------------------------------

def get_all_products() -> List[Dict[str, Any]]:
    """Retrieves all products from the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM PRODUCTS ORDER BY name ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_product_by_id(product_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a single product by primary key."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM PRODUCTS WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_product_by_name(name: str) -> Optional[Dict[str, Any]]:
    """Finds product by exact name."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM PRODUCTS WHERE LOWER(name) = LOWER(?)", (name.strip(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def find_matching_product(label: str) -> Optional[Dict[str, Any]]:
    """
    Fuzzy / normalized search for detected object class in products catalog.
    E.g., 'bottle' matches 'Coca Cola', 'Pepsi', or 'Water Bottle'.
    'can' matches beverage cans, 'lays' matches 'Lays'.
    """
    label_clean = label.lower().strip()
    products = get_all_products()

    # 1. Exact name match
    for p in products:
        if p["name"].lower() == label_clean:
            return p

    # 2. Substring or token match
    for p in products:
        p_name = p["name"].lower()
        if label_clean in p_name or p_name in label_clean:
            return p

    # 3. Category match (e.g. 'bottle' -> first Beverage)
    category_hints = {
        "bottle": ["beverages"],
        "can": ["beverages"],
        "snack": ["snacks", "instant food"],
        "pack": ["snacks", "instant food"],
        "box": ["groceries", "cereals"]
    }
    if label_clean in category_hints:
        for cat in category_hints[label_clean]:
            for p in products:
                if p["category"].lower() == cat:
                    return p

    return None

def insert_product(data: Dict[str, Any]) -> int:
    """Inserts a new product into SQLite."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO PRODUCTS (name, category, sku, price, quantity, minimum_stock, maximum_stock, supplier, expiry_date, image_path, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["name"].strip(),
        data.get("category", "General"),
        data.get("sku", f"SKU-{int(datetime.datetime.now().timestamp())}"),
        float(data.get("price", 0.0)),
        int(data.get("quantity", 0)),
        int(data.get("minimum_stock", config.DEFAULT_MIN_STOCK)),
        int(data.get("maximum_stock", config.DEFAULT_MAX_STOCK)),
        data.get("supplier", "Default Supplier"),
        data.get("expiry_date", ""),
        data.get("image_path", ""),
        now, now
    ))
    prod_id = cursor.lastrowid

    # Record initial transaction
    cursor.execute("""
        INSERT INTO STOCK_TRANSACTIONS (product_id, transaction_type, previous_quantity, quantity_change, new_quantity, source, timestamp)
        VALUES (?, 'IN', 0, ?, ?, 'ADD_PRODUCT', ?)
    """, (prod_id, data.get("quantity", 0), data.get("quantity", 0), now))

    conn.commit()
    check_and_generate_alerts(conn)
    conn.close()
    return prod_id

def update_product(product_id: int, data: Dict[str, Any]) -> bool:
    """Updates product attributes and logs stock adjustments if quantity altered."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT quantity FROM PRODUCTS WHERE id = ?", (product_id,))
    curr_row = cursor.fetchone()
    if not curr_row:
        conn.close()
        return False

    old_qty = curr_row[0]
    new_qty = int(data.get("quantity", old_qty))
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        UPDATE PRODUCTS
        SET name = ?, category = ?, sku = ?, price = ?, quantity = ?, minimum_stock = ?, maximum_stock = ?, supplier = ?, expiry_date = ?, updated_at = ?
        WHERE id = ?
    """, (
        data["name"],
        data["category"],
        data["sku"],
        float(data["price"]),
        new_qty,
        int(data["minimum_stock"]),
        int(data["maximum_stock"]),
        data.get("supplier", ""),
        data.get("expiry_date", ""),
        now,
        product_id
    ))

    if old_qty != new_qty:
        delta = new_qty - old_qty
        tx_type = "IN" if delta > 0 else "OUT"
        cursor.execute("""
            INSERT INTO STOCK_TRANSACTIONS (product_id, transaction_type, previous_quantity, quantity_change, new_quantity, source, timestamp)
            VALUES (?, ?, ?, ?, ?, 'MANUAL_EDIT', ?)
        """, (product_id, tx_type, old_qty, delta, new_qty, now))

    conn.commit()
    check_and_generate_alerts(conn)
    conn.close()
    return True

def delete_product(product_id: int) -> bool:
    """Deletes a product from the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM PRODUCTS WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return True

def update_product_stock(product_id: int, new_quantity: int, source: str = "AI_DETECTION") -> bool:
    """
    Updates the stock count of an existing product and logs an audit transaction.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT quantity FROM PRODUCTS WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False

    prev_qty = row[0]
    qty_change = new_quantity - prev_qty
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        UPDATE PRODUCTS
        SET quantity = ?, updated_at = ?
        WHERE id = ?
    """, (new_quantity, now, product_id))

    cursor.execute("""
        INSERT INTO STOCK_TRANSACTIONS (product_id, transaction_type, previous_quantity, quantity_change, new_quantity, source, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (product_id, "AI_DETECTION" if "AI" in source else ("IN" if qty_change >= 0 else "OUT"), prev_qty, qty_change, new_quantity, source, now))

    conn.commit()
    check_and_generate_alerts(conn)
    conn.close()
    return True

# -----------------------------------------------------------------------------
# Stock Transactions & History
# -----------------------------------------------------------------------------

def record_stock_transaction(product_id: int, tx_type: str, prev_q: int, change: int, new_q: int, source: str = "SYSTEM") -> None:
    """Records an explicit stock transaction entry."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO STOCK_TRANSACTIONS (product_id, transaction_type, previous_quantity, quantity_change, new_quantity, source, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (product_id, tx_type, prev_q, change, new_q, source, now))
    conn.commit()
    conn.close()

def get_stock_transactions(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent stock transaction history with product names."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, p.name as product_name, p.sku as product_sku, p.category as product_category
        FROM STOCK_TRANSACTIONS t
        LEFT JOIN PRODUCTS p ON t.product_id = p.id
        ORDER BY t.id DESC
        LIMIT ?
    """, (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# -----------------------------------------------------------------------------
# AI Detection History
# -----------------------------------------------------------------------------

def save_detection_record(
    image_name: str,
    total_objects: int,
    unique_products: int,
    avg_conf: float,
    proc_time: float,
    detected_items: List[Dict[str, Any]]
) -> int:
    """
    Saves a completed YOLO shelf scan to DETECTION_HISTORY and detailed lines in DETECTION_RESULTS.
    """
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO DETECTION_HISTORY (image_name, timestamp, total_objects, unique_products, average_confidence, processing_time)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (image_name, now, total_objects, unique_products, avg_conf, proc_time))
    detection_id = cursor.lastrowid

    for item in detected_items:
        cursor.execute("""
            INSERT INTO DETECTION_RESULTS (detection_id, product_name, count, average_confidence)
            VALUES (?, ?, ?, ?)
        """, (detection_id, item["name"], item["count"], item["confidence"]))

    conn.commit()
    conn.close()
    return detection_id

def get_detection_history(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves previous shelf scan sessions."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM DETECTION_HISTORY
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_detection_results_by_id(detection_id: int) -> List[Dict[str, Any]]:
    """Retrieves detailed product breakdowns for a scan session."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM DETECTION_RESULTS
        WHERE detection_id = ?
        ORDER BY count DESC
    """, (detection_id,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# -----------------------------------------------------------------------------
# Alerts Engine
# -----------------------------------------------------------------------------

def create_alert(product_id: Optional[int], alert_type: str, message: str, severity: str = "WARNING") -> int:
    """Creates a system alert if an identical active alert does not already exist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id FROM ALERTS
        WHERE product_id = ? AND alert_type = ? AND resolved = 0
    """, (product_id, alert_type))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return existing[0]

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO ALERTS (product_id, alert_type, message, severity, created_at, resolved)
        VALUES (?, ?, ?, ?, ?, 0)
    """, (product_id, alert_type, message, severity, now))
    alert_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return alert_id

def get_active_alerts() -> List[Dict[str, Any]]:
    """Returns all unresolved stock and expiry alerts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, p.name as product_name, p.quantity, p.minimum_stock, p.maximum_stock
        FROM ALERTS a
        LEFT JOIN PRODUCTS p ON a.product_id = p.id
        WHERE a.resolved = 0
        ORDER BY CASE a.severity WHEN 'CRITICAL' THEN 1 WHEN 'WARNING' THEN 2 ELSE 3 END, a.id DESC
    """)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def get_all_alerts(limit: int = 100) -> List[Dict[str, Any]]:
    """Returns alerts history."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, p.name as product_name, p.quantity, p.minimum_stock
        FROM ALERTS a
        LEFT JOIN PRODUCTS p ON a.product_id = p.id
        ORDER BY a.id DESC
        LIMIT ?
    """, (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

def resolve_alert(alert_id: int) -> bool:
    """Marks an alert as resolved in SQLite."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE ALERTS SET resolved = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return True

def check_and_generate_alerts(conn: Optional[sqlite3.Connection] = None) -> None:
    """Evaluates all products for low stock, out of stock, and upcoming expiry."""
    close_after = False
    if conn is None:
        conn = get_connection()
        close_after = True

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM PRODUCTS")
    products = [dict(r) for r in cursor.fetchall()]

    today = datetime.date.today()

    for p in products:
        p_id = p["id"]
        p_name = p["name"]
        qty = p["quantity"]
        min_s = p["minimum_stock"]
        max_s = p["maximum_stock"]
        reorder_qty = max(0, max_s - qty)

        # 1. Out of stock check
        if qty == 0:
            cursor.execute("SELECT id FROM ALERTS WHERE product_id = ? AND alert_type = 'OUT_OF_STOCK' AND resolved = 0", (p_id,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO ALERTS (product_id, alert_type, message, severity, created_at, resolved)
                    VALUES (?, 'OUT_OF_STOCK', ?, 'CRITICAL', CURRENT_TIMESTAMP, 0)
                """, (p_id, f"CRITICAL: {p_name} is completely OUT OF STOCK! Recommended reorder: {reorder_qty} units."))

        # 2. Low stock check
        elif qty <= min_s:
            cursor.execute("SELECT id FROM ALERTS WHERE product_id = ? AND alert_type = 'LOW_STOCK' AND resolved = 0", (p_id,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT INTO ALERTS (product_id, alert_type, message, severity, created_at, resolved)
                    VALUES (?, 'LOW_STOCK', ?, 'WARNING', CURRENT_TIMESTAMP, 0)
                """, (p_id, f"WARNING: {p_name} is running LOW (Stock: {qty} <= Minimum: {min_s}). Reorder: {reorder_qty} units."))

        # Auto-resolve low/out alerts if stock has been replenished
        if qty > min_s:
            cursor.execute("UPDATE ALERTS SET resolved = 1 WHERE product_id = ? AND alert_type IN ('LOW_STOCK', 'OUT_OF_STOCK') AND resolved = 0", (p_id,))

        # 3. Expiry date check
        exp_str = p.get("expiry_date")
        if exp_str:
            try:
                exp_date = datetime.datetime.strptime(exp_str, "%Y-%m-%d").date()
                days_left = (exp_date - today).days
                if days_left < 0:
                    cursor.execute("SELECT id FROM ALERTS WHERE product_id = ? AND alert_type = 'EXPIRY' AND resolved = 0", (p_id,))
                    if not cursor.fetchone():
                        cursor.execute("""
                            INSERT INTO ALERTS (product_id, alert_type, message, severity, created_at, resolved)
                            VALUES (?, 'EXPIRY', ?, 'CRITICAL', CURRENT_TIMESTAMP, 0)
                        """, (p_id, f"EXPIRED: {p_name} expired {abs(days_left)} days ago ({exp_str})! Remove from shelf."))
                elif days_left <= 14:
                    cursor.execute("SELECT id FROM ALERTS WHERE product_id = ? AND alert_type = 'EXPIRY' AND resolved = 0", (p_id,))
                    if not cursor.fetchone():
                        cursor.execute("""
                            INSERT INTO ALERTS (product_id, alert_type, message, severity, created_at, resolved)
                            VALUES (?, 'EXPIRY', ?, 'WARNING', CURRENT_TIMESTAMP, 0)
                        """, (p_id, f"EXPIRING SOON: {p_name} expires in {days_left} days ({exp_str}). Consider promotional clearance."))
            except ValueError:
                pass

    conn.commit()
    if close_after:
        conn.close()

# -----------------------------------------------------------------------------
# KPIs & Aggregate Metrics
# -----------------------------------------------------------------------------

def get_inventory_kpis() -> Dict[str, Any]:
    """Calculates dynamic executive metrics directly from SQLite."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM PRODUCTS")
    total_products = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(quantity), 0) FROM PRODUCTS")
    total_units = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM PRODUCTS WHERE quantity <= minimum_stock AND quantity > 0")
    low_stock_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM PRODUCTS WHERE quantity = 0")
    out_of_stock_count = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(quantity * price), 0.0) FROM PRODUCTS")
    inventory_value = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM DETECTION_HISTORY")
    ai_scans_count = cursor.fetchone()[0]

    conn.close()

    return {
        "total_products": total_products,
        "total_units": total_units,
        "low_stock": low_stock_count,
        "out_of_stock": out_of_stock_count,
        "inventory_value": float(inventory_value),
        "ai_scans": ai_scans_count
    }
