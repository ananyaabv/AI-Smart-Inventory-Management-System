"""
pages/about.py
--------------
System architecture documentation, deep learning workflow, and academic project specifications.
"""

import streamlit as st
import config

def render():
    st.title("ℹ️ About AI Smart Inventory System")
    st.caption("Computer Vision & Edge Deep Learning for Automated Retail Inventory Intelligence")

    st.markdown("""
    ### 🎯 Project Overview
    **SmartStock** is an intelligent automated retail inventory management platform.
    Traditional supermarket inventory tracking suffers from human counting errors, shrinkage, and delayed replenishment cycles.
    
    This platform leverages **State-of-the-Art Computer Vision (YOLOv8)** combined with **OpenCV morphological contour processing**
    to instantly detect, identify, and count physical items placed on supermarket shelves from standard camera captures.

    ---

    ### 🏗️ Technical Architecture & Pipeline
    1. **Optical Capture Layer:** High-resolution digital imagery via mobile camera capture or drag-and-drop shelf photo upload.
    2. **Pre-Inference Quality Validator:** Automated checks for brightness (grayscale mean) and image sharpness (Laplacian variance focus score).
    3. **Deep Learning Core (YOLOv8):** Single-stage deep convolutional network performing simultaneous classification and spatial bounding box localization.
    4. **Retail Enclosing & Grouping Algorithm:** Automatically aggregates items of the same product class located in the same shelf tier into a single unified enclosing box with unit count aggregation (e.g. 5 bottles -> 1 single box with count: 5 units).
    5. **Relational Database Engine (SQLite3):** Relational persistence tracking catalog schemas, audit transactions, detection logs, and stock alerts.
    6. **Analytics & BI Layer:** Interactive telemetry dashboards powered by Streamlit and Plotly.

    ---

    ### 🛠️ Technology Stack
    - **Language:** Python 3.10+
    - **Computer Vision:** Ultralytics YOLOv8, OpenCV, Pillow, NumPy
    - **Database:** SQLite3 with ACID transaction integrity
    - **User Interface:** Streamlit with Plotly Express
    - **Data Processing:** Pandas

    ---

    ### 🎓 College Project / Demo Notes
    - **Project Name:** AI Smart Inventory Management System
    - **Domain:** Artificial Intelligence, Computer Vision & Retail Automation
    """)
