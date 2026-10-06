# Custom YOLOv8 Model Training Guide for Retail Shelves

This directory is designated for custom-trained YOLOv8 weights (e.g. `best.pt`).

---

## 1. Dataset Directory Structure
Organize your labeled retail dataset following the standard Ultralytics YOLO format:

```text
dataset/
├── data.yaml
├── images/
│   ├── train/
│   │   ├── shelf_001.jpg
│   │   └── shelf_002.jpg
│   └── val/
│       ├── shelf_101.jpg
│       └── shelf_102.jpg
└── labels/
    ├── train/
    │   ├── shelf_001.txt
    │   └── shelf_002.txt
    └── val/
        ├── shelf_101.txt
        └── shelf_102.txt
```

---

## 2. YOLO Label Format
Each `.txt` file corresponding to an image contains normalized bounding box annotations (one per line):
```text
<class_id> <x_center> <y_center> <width> <height>
```
*All values normalized between `0.0` and `1.0`.*

Example (`shelf_001.txt`):
```text
0 0.245 0.450 0.082 0.320
0 0.340 0.450 0.080 0.318
1 0.650 0.720 0.120 0.240
```

---

## 3. Dataset Configuration (`data.yaml`)
Create `data.yaml` specifying dataset paths and product classes:

```yaml
path: /path/to/dataset  # Dataset root directory
train: images/train    # Training images
val: images/val        # Validation images

# Number of retail classes
nc: 5

# Retail class labels
names:
  0: Bottle
  1: Can
  2: Box
  3: Snack
  4: TetraPack
```

---

## 4. Model Training Command
Run YOLOv8 training using Python CLI:

```bash
# Train lightweight YOLOv8 nano model for 50 epochs with 640x640 resolution
yolo detect train data=data.yaml model=yolov8n.pt epochs=50 imgsz=640 batch=16 device=0
```

Or via Python script:
```python
from ultralytics import YOLO

# Load base model
model = YOLO("yolov8n.pt")

# Train model
results = model.train(
    data="data.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    device="cpu"  # or 0 for CUDA GPU
)
```

---

## 5. Deployment
After training completes:
1. Locate your trained weights at `runs/detect/train/weights/best.pt`.
2. Copy `best.pt` into this directory: `models/best.pt`.
3. Restart or reload the Streamlit app. The system will automatically detect and load `models/best.pt`!
