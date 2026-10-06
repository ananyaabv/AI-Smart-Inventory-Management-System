"""
helpers.py
----------
String normalization, SKU generation, formatting, and audit log helpers.
"""

import re
import datetime
from typing import Optional

def normalize_name(name: str) -> str:
    """Removes special characters, extra spaces, and normalizes to lowercase."""
    clean = re.sub(r"[^a-zA-Z0-9\s]", "", name)
    return " ".join(clean.lower().split())

def generate_sku(category: str, name: str) -> str:
    """Generates standard SKU code like BEV-COC-9812."""
    cat_code = category[:3].upper() if category else "GEN"
    name_code = "".join([w[:2].upper() for w in name.split()[:2]]) or "ITM"
    timestamp_suffix = str(int(datetime.datetime.now().timestamp()))[-4:]
    return f"{cat_code}-{name_code}-{timestamp_suffix}"

def get_status_badge_color(status: str) -> str:
    """Returns CSS background / badge styling class."""
    status_upper = status.upper()
    if "OUT" in status_upper or "CRITICAL" in status_upper:
        return "red"
    elif "LOW" in status_upper or "WARNING" in status_upper:
        return "orange"
    elif "IN STOCK" in status_upper or "MATCH" in status_upper:
        return "green"
    return "blue"

def time_ago(timestamp_str: Optional[str]) -> str:
    """Formats timestamp into friendly '5 mins ago', '2 hours ago', etc."""
    if not timestamp_str:
        return "Just now"
    try:
        dt = datetime.datetime.strptime(timestamp_str[:19], "%Y-%m-%d %H:%M:%S")
        diff = datetime.datetime.now() - dt
        seconds = diff.total_seconds()
        if seconds < 60:
            return f"{int(seconds)}s ago"
        elif seconds < 3600:
            return f"{int(seconds // 60)}m ago"
        elif seconds < 86400:
            return f"{int(seconds // 3600)}h ago"
        else:
            return f"{int(seconds // 86400)}d ago"
    except Exception:
        return timestamp_str
