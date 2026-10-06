"""
utils package initialization
"""
from .calculations import (
    get_stock_status,
    calculate_inventory_value,
    calculate_reorder_amount,
    format_currency,
    compare_detected_vs_db
)
from .image_utils import (
    save_uploaded_image,
    encode_image_base64,
    draw_detection_boxes,
    validate_image_file
)
from .helpers import (
    normalize_name,
    generate_sku,
    get_status_badge_color,
    time_ago
)
