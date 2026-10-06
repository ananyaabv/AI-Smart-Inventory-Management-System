"""
preprocessing.py
----------------
Image verification, resolution checking, illumination analysis, and Laplacian blur detection.
"""

from typing import Dict, Any, Tuple, List
from PIL import Image
import numpy as np

def preprocess_and_validate_image(pil_img: Image.Image) -> Tuple[bool, Dict[str, Any], List[str]]:
    """
    Performs comprehensive pre-inference quality checks on retail shelf imagery:
    - Format & dimensions
    - Illumination / Brightness (0-255 scale)
    - Focus / Blur detection using Laplacian variance
    Returns (is_valid, metrics_dict, warnings_list).
    """
    warnings: List[str] = []
    w, h = pil_img.size

    # Ensure RGB
    if pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")

    np_img = np.array(pil_img)

    # 1. Dimension check
    if w < 200 or h < 200:
        warnings.append(f"Image resolution ({w}x{h}) is very low. Detections may be unreliable.")

    # 2. Brightness Check (Grayscale conversion)
    gray = np.dot(np_img[..., :3], [0.2989, 0.5870, 0.1140])
    mean_brightness = float(np.mean(gray))

    if mean_brightness < 40:
        warnings.append("⚠️ Low shelf illumination detected (< 40). Poor lighting may obscure dark product labels.")
    elif mean_brightness > 230:
        warnings.append("⚠️ High glare / overexposure detected (> 230). Reflections may wash out barcodes and text.")

    # 3. Blur Detection (Laplacian Variance)
    blur_score = 100.0
    try:
        import cv2
        gray_cv = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        laplacian_var = float(cv2.Laplacian(gray_cv, cv2.CV_64F).var())
        blur_score = laplacian_var
        if laplacian_var < 60.0:
            warnings.append(f"⚠️ Image appears blurry (Focus score: {laplacian_var:.1f} < 60). Camera shake or motion blur detected.")
    except ImportError:
        # Fallback approximation using numpy differences
        diff_x = np.abs(np.diff(gray, axis=1))
        diff_y = np.abs(np.diff(gray, axis=0))
        blur_score = float(np.mean(diff_x) + np.mean(diff_y))
        if blur_score < 4.0:
            warnings.append("⚠️ Image may be out of focus. Ensure camera lens is steady and clean.")

    metrics = {
        "width": w,
        "height": h,
        "megapixels": round((w * h) / 1_000_000, 2),
        "mean_brightness": round(mean_brightness, 1),
        "focus_score": round(blur_score, 1),
        "quality_ok": len(warnings) == 0
    }

    return True, metrics, warnings
