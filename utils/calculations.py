"""
calculations.py
---------------
Inventory mathematics, currency formatting, stock health classification, and reorder metrics.
"""

from typing import Dict, Any, Tuple
import config

def format_currency(amount: float) -> str:
    """Formats a monetary value in Indian Rupees (₹)."""
    return f"{config.CURRENCY_SYMBOL}{amount:,.2f}"

def get_stock_status(quantity: int, min_stock: int) -> Tuple[str, str]:
    """
    Returns (Status Label, Theme Color Code):
    - OUT OF STOCK (qty == 0) -> Red
    - LOW STOCK (qty <= min_stock) -> Orange/Amber
    - IN STOCK (qty > min_stock) -> Emerald Green
    """
    if quantity <= 0:
        return "OUT OF STOCK", "#ef4444"
    elif quantity <= min_stock:
        return "LOW STOCK", "#f59e0b"
    return "IN STOCK", "#10b981"

def calculate_inventory_value(quantity: int, price: float) -> float:
    """Calculates product valuation."""
    return round(float(quantity) * float(price), 2)

def calculate_reorder_amount(quantity: int, max_stock: int) -> int:
    """Calculates suggested replenishment quantity up to maximum shelf capacity."""
    return max(0, max_stock - quantity)

def compare_detected_vs_db(detected_count: int, db_quantity: int) -> Dict[str, Any]:
    """
    Compares optical AI count against records in database.
    Returns delta, discrepancy type, and status tag.
    """
    diff = detected_count - db_quantity
    if diff == 0:
        return {
            "diff": 0,
            "status": "MATCHED",
            "message": "Physical shelf stock exactly matches database records.",
            "color": "#10b981"
        }
    elif diff < 0:
        return {
            "diff": diff,
            "status": "SHORTAGE",
            "message": f"Shelf has {abs(diff)} fewer units than database (shrinkage/theft/misplacement).",
            "color": "#ef4444"
        }
    else:
        return {
            "diff": diff,
            "status": "SURPLUS",
            "message": f"Shelf has {diff} extra units detected (unrecorded restocking).",
            "color": "#3b82f6"
        }
