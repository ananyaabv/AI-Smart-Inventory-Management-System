"""
pages/settings.py
-----------------
Application parameters, YOLO model configuration, and database maintenance tools.
"""

import streamlit as st
import os
from pathlib import Path

import config
import database
from ai.model_loader import get_model_status

def render():
    st.title("⚙️ System Settings & Diagnostics")
    st.caption("Fine-tune neural network weights, store operational rules, and perform data maintenance")

    # Section 1: AI Model Configuration
    st.subheader("🤖 YOLOv8 Computer Vision Settings")
    meta = get_model_status()

    st.write(f"**Model Status:** {meta.get('message')}")
    st.write(f"**Loaded Model Type:** {meta.get('model_type')}")
    st.write(f"**Inference Device:** `{meta.get('device')}`")
    st.write(f"**Number of Recognizable Classes:** {meta.get('classes_count')}")

    custom_exists = config.CUSTOM_MODEL_PATH.exists()
    if not custom_exists:
        st.warning(f"Note: Custom retail model not detected at `{config.CUSTOM_MODEL_PATH}`. System is currently operating using the standard YOLOv8n pretrained weights.")
        st.info("To use custom supermarket weights, train a YOLOv8 model and place the `best.pt` file inside the `models/` folder.")

    st.markdown("---")

    # Section 2: Store Operational Defaults
    st.subheader("🏪 Inventory Control Rules")
    s_col1, s_col2 = st.columns(2)
    with s_col1:
        st.number_input("Default Minimum Safe Stock Level", value=config.DEFAULT_MIN_STOCK, min_value=1, step=1)
    with s_col2:
        st.number_input("Default Maximum Shelf Capacity", value=config.DEFAULT_MAX_STOCK, min_value=10, step=5)

    st.markdown("---")

    # Section 3: Database Maintenance & Demo Reset
    st.subheader("🛠️ Database Maintenance & Data Seeding")
    st.write("Reset database with standard sample inventory for demonstration purposes:")

    if st.button("🌱 Reset & Seed Sample Inventory Data", type="secondary"):
        database.seed_sample_data()
        st.success("Sample supermarket inventory re-seeded successfully!")
        st.rerun()
