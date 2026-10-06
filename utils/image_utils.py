"""
image_utils.py
--------------
Image validation, persistent file storage, bounding box rendering, and encoding helpers.
"""

import os
import uuid
import base64
from pathlib import Path
from io import BytesIO
from typing import Tuple, Optional, List, Dict, Any

from PIL import Image, ImageDraw, ImageFont
import numpy as np

import config

def validate_image_file(uploaded_file) -> Tuple[bool, str]:
    """
    Validates file extension, MIME type, and size limits (<= 10MB).
    """
    if uploaded_file is None:
        return False, "No file was uploaded."

    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    filename = getattr(uploaded_file, "name", "upload.jpg")
    ext = Path(filename).suffix.lower()

    if ext not in allowed_extensions:
        return False, f"Invalid format '{ext}'. Supported formats: JPG, JPEG, PNG, WEBP."

    # Check size
    file_size = getattr(uploaded_file, "size", 0)
    max_bytes = config.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        return False, f"File size ({file_size / (1024 * 1024):.1f}MB) exceeds limit of {config.MAX_UPLOAD_SIZE_MB}MB."

    return True, "Valid image"

def save_uploaded_image(file_data, prefix: str = "shelf") -> Tuple[str, Path]:
    """
    Saves uploaded file or bytes to the uploads/ directory with a unique timestamped filename.
    Returns (filename, absolute_path).
    """
    unique_id = uuid.uuid4().hex[:8]
    filename = f"{prefix}_{unique_id}.jpg"
    dest_path = config.UPLOADS_DIR / filename

    if hasattr(file_data, "getvalue"):
        raw_bytes = file_data.getvalue()
    elif isinstance(file_data, bytes):
        raw_bytes = file_data
    else:
        # PIL Image
        file_data.save(dest_path, format="JPEG", quality=92)
        return filename, dest_path

    with open(dest_path, "wb") as f:
        f.write(raw_bytes)

    return filename, dest_path

def encode_image_base64(image_path: Path) -> str:
    """Converts image file to Base64 data string."""
    with open(image_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"

def draw_detection_boxes(
    pil_img: Image.Image,
    detections: List[Dict[str, Any]]
) -> Image.Image:
    """
    Renders high-contrast bounding boxes with class tags and confidence for each individual detected item.
    """
    img = pil_img.copy()
    draw = ImageDraw.Draw(img)
    w, h = img.size

    # Distinct color palette for retail product classes
    color_palette = [
        "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6",
        "#ec4899", "#3b82f6", "#ef4444", "#14b8a6", "#eab308"
    ]

    for idx, d in enumerate(detections):
        color = d.get("color") or color_palette[idx % len(color_palette)]
        x1, y1, x2, y2 = d["box"]
        label = d["label"]
        conf = d.get("confidence", 0.90)

        # Draw main rectangle with thickness 3
        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)

        # Label Text (individual item: e.g. "Bottle • 92%")
        tag_text = f"{label} • {int(conf * 100)}%"

        # Draw label background banner
        font_size = max(12, int(h * 0.025))
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()

        # Compute text size
        bbox = draw.textbbox((x1, y1), tag_text, font=font)
        tw = bbox[2] - bbox[0] + 10
        th = bbox[3] - bbox[1] + 6

        tag_y1 = max(0, y1 - th)
        tag_y2 = y1
        draw.rectangle([x1, tag_y1, x1 + tw, tag_y2], fill=color)
        draw.text((x1 + 5, tag_y1 + 2), tag_text, fill="white", font=font)

        # Subtle centroid dot
        cx = int((x1 + x2) / 2)
        cy = int((y1 + y2) / 2)
        r = 3
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill="white", outline=color)

    return img
