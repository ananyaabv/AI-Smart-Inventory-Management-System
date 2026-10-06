"""
config.py
---------
Configuration parameters and default settings for AI Smart Inventory Management System (SmartStock).
"""

import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "database" / "inventory.db"
MODELS_DIR = BASE_DIR / "models"
CUSTOM_MODEL_PATH = MODELS_DIR / "best.pt"
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
ASSETS_DIR = BASE_DIR / "assets"

# Ensure runtime directories exist
os.makedirs(BASE_DIR / "database", exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

# Application Identity
APP_NAME = "SmartStock"
APP_TAGLINE = "AI-Powered Shelf Detection & Inventory Intelligence"
APP_ICON = "📦"
CURRENCY_SYMBOL = "₹"

# AI Inference Defaults
DEFAULT_CONFIDENCE = 0.50
DEFAULT_IOU = 0.45
DEFAULT_IMAGE_SIZE = 640
MAX_UPLOAD_SIZE_MB = 10

# Inventory Defaults
DEFAULT_MIN_STOCK = 10
DEFAULT_MAX_STOCK = 50
INVENTORY_UPDATE_MODES = [
    "Replace Existing Stock",
    "Add Detected Stock",
    "Manual Adjustment"
]

# Standard Retail Classes (COCO + Custom Product Mappings)
COCO_RETAIL_MAP = {
    "bottle": "Bottle",
    "cup": "Cup",
    "can": "Can",
    "banana": "Banana",
    "apple": "Apple",
    "orange": "Orange",
    "sandwich": "Snack",
    "carrot": "Produce",
    "cake": "Bakery",
    "book": "Notebook",
    "cell phone": "Phone",
    "box": "Box / Pack"
}
