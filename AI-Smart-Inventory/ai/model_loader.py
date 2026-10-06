"""
model_loader.py
---------------
Loads YOLOv8 models (custom models/best.pt or official pretrained yolov8n.pt).
Supports caching, dynamic class extraction, and model status introspection.
"""

import os
from pathlib import Path
from typing import Tuple, Dict, Any, Optional

import config

_cached_model = None
_model_meta = {}

def load_yolo_model(model_path: Optional[Path] = None):
    """
    Loads YOLOv8 model instance with caching.
    1. Checks if custom model exists at models/best.pt (or custom path).
    2. Falls back to lightweight official pretrained 'yolov8n.pt'.
    Returns (model, metadata_dict).
    """
    global _cached_model, _model_meta

    target_path = model_path or config.CUSTOM_MODEL_PATH

    # If already cached for this path
    if _cached_model is not None and _model_meta.get("path") == str(target_path):
        return _cached_model, _model_meta

    try:
        from ultralytics import YOLO
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"

        if target_path.exists() and target_path.stat().st_size > 1000:
            model = YOLO(str(target_path))
            model_type = "Custom Trained Retail Model (best.pt)"
            status = "LOADED_CUSTOM"
            actual_path = str(target_path)
        else:
            # Fallback to pretrained YOLOv8n (detects bottles, cups, apples, bananas, etc.)
            model = YOLO("yolov8n.pt")
            model_type = "Pretrained YOLOv8n (COCO Retail Fallback)"
            status = "LOADED_PRETRAINED"
            actual_path = "yolov8n.pt"

        # Dynamically read class names
        class_names = getattr(model, "names", {})
        if isinstance(class_names, list):
            class_names = {i: name for i, name in enumerate(class_names)}

        _model_meta = {
            "status": status,
            "model_type": model_type,
            "path": actual_path,
            "device": device,
            "classes_count": len(class_names),
            "class_names": class_names,
            "is_ready": True,
            "message": "🟢 YOLO Model Loaded & Ready for Inference"
        }
        _cached_model = model
        return model, _model_meta

    except Exception as e:
        _model_meta = {
            "status": "ERROR",
            "model_type": "None",
            "path": str(target_path),
            "device": "cpu",
            "classes_count": 0,
            "class_names": {},
            "is_ready": False,
            "message": f"⚠️ YOLO Engine Initialization Notice: {str(e)}"
        }
        return None, _model_meta

def get_model_status() -> Dict[str, Any]:
    """Returns status information about the active YOLO model."""
    global _model_meta
    if not _model_meta:
        load_yolo_model()
    return _model_meta
