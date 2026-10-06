"""
detector.py
-----------
Object Detection Module using Pretrained YOLOv8n and OpenCV for AI Smart Inventory Management System.
Full Production Implementation for College Machine Learning Project.

Features:
- Ultralytics YOLOv8n object detection
- OpenCV color-coded bounding boxes and label tags
- Automatic item tallying and confidence filtering
- Direct inventory database sync integration
"""

import cv2
import numpy as np
from PIL import Image
from collections import Counter
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InventoryDetector:
    """
    Inventory object detector powered by Ultralytics pretrained YOLOv8n.
    Identifies items in an image, draws bounding boxes using OpenCV,
    and returns product counts and detection details.
    """
    
    def __init__(self, model_name: str = "yolov8n.pt"):
        """
        Initialize the YOLOv8 detector with pretrained weights.
        
        Args:
            model_name (str): Path or model string for Ultralytics YOLO.
                              Defaults to 'yolov8n.pt' (Pretrained Nano model).
        """
        self.model_name = model_name
        self.model = None
        self._load_model()

    def _load_model(self):
        """Loads the pretrained YOLOv8 model from ultralytics."""
        try:
            from ultralytics import YOLO
            logger.info(f"Loading pretrained model: {self.model_name}...")
            self.model = YOLO(self.model_name)
            logger.info("YOLOv8 model loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading YOLO model: {e}")
            self.model = None

    def detect_objects(self, image_input, confidence_threshold: float = 0.25):
        """
        Detect objects in an input image and count items.

        Args:
            image_input (PIL.Image or numpy.ndarray): Input inventory image.
            confidence_threshold (float): Minimum confidence threshold for detection (0.0 to 1.0).

        Returns:
            tuple: (annotated_image_np, product_counts_dict, detection_details_list)
        """
        # Convert PIL Image to numpy array (RGB) if needed
        if isinstance(image_input, Image.Image):
            image_np = np.array(image_input)
        else:
            image_np = np.copy(image_input)

        # Ensure image is in RGB format
        if len(image_np.shape) == 2:  # Grayscale
            image_np = cv2.cvtColor(image_np, cv2.COLOR_GRAY2RGB)
        elif image_np.shape[2] == 4:  # RGBA
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGBA2RGB)

        # Fallback if model failed to load (e.g. offline environment)
        if self.model is None:
            logger.warning("YOLO model not loaded. Returning empty detection.")
            return image_np, {}, []

        # Run YOLO inference
        results = self.model(image_np, conf=confidence_threshold)
        
        # Parse first result batch
        result = results[0]
        boxes = result.boxes

        # Copy original image for custom OpenCV drawing
        annotated_img = image_np.copy()

        # Convert RGB to BGR for OpenCV processing
        annotated_img_bgr = cv2.cvtColor(annotated_img, cv2.COLOR_RGB2BGR)

        detected_labels = []
        detection_details = []

        # Define color palette for bounding boxes (BGR format)
        colors = [
            (255, 99, 71),   # Tomato
            (30, 144, 255),  # Dodger Blue
            (50, 205, 50),   # Lime Green
            (255, 165, 0),   # Orange
            (147, 112, 219), # Medium Purple
            (0, 206, 209),   # Dark Turquoise
            (255, 105, 180), # Hot Pink
            (218, 165, 32)   # Goldenrod
        ]

        # Process detected bounding boxes
        for i, box in enumerate(boxes):
            # Extract box coordinates (x1, y1, x2, y2)
            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            x1, y1, x2, y2 = xyxy

            # Confidence score & class index
            conf = float(box.conf[0].cpu().numpy())
            cls_id = int(box.cls[0].cpu().numpy())
            
            # Retrieve class name from pretrained YOLO model names dict
            class_name = self.model.names.get(cls_id, f"class_{cls_id}")

            detected_labels.append(class_name)
            detection_details.append({
                "class_name": class_name,
                "confidence": round(conf, 4),
                "box": [x1, y1, x2, y2]
            })

            # Assign color based on class ID
            color = colors[cls_id % len(colors)]

            # 1. Draw Bounding Box using OpenCV
            thickness = max(2, int(min(annotated_img_bgr.shape[:2]) / 300))
            cv2.rectangle(annotated_img_bgr, (x1, y1), (x2, y2), color, thickness)

            # 2. Draw Label Background & Text
            label = f"{class_name} {conf:.2f}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = max(0.5, thickness * 0.25)
            font_thickness = max(1, int(thickness * 0.8))

            # Get text size
            (text_width, text_height), baseline = cv2.getTextSize(
                label, font, font_scale, font_thickness
            )

            # Rectangle above box for label text background
            label_y1 = max(y1 - text_height - 8, 0)
            label_y2 = y1
            cv2.rectangle(
                annotated_img_bgr,
                (x1, label_y1),
                (x1 + text_width + 8, label_y2),
                color,
                -1  # Filled
            )

            # Put text in white or dark depending on contrast
            cv2.putText(
                annotated_img_bgr,
                label,
                (x1 + 4, y1 - 4),
                font,
                font_scale,
                (255, 255, 255),
                font_thickness,
                cv2.LINE_AA
            )

        # Convert back from BGR to RGB for Streamlit/PIL compatibility
        final_annotated_rgb = cv2.cvtColor(annotated_img_bgr, cv2.COLOR_BGR2RGB)

        # Calculate counts per product name
        product_counts = dict(Counter(detected_labels))

        return final_annotated_rgb, product_counts, detection_details
