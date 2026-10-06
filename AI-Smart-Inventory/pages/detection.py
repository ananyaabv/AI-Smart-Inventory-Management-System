"""
pages/detection.py
------------------
Interactive AI Shelf Scanner: Upload or Live Camera capture, YOLOv8 inference,
automatic product grouping in single boxes, comparison with database stock, and inventory updates.
"""

import os
from pathlib import Path
from PIL import Image
import streamlit as st
import pandas as pd

import config
import database
from ai.preprocessing import preprocess_and_validate_image
from ai.detector import detect_shelf_products
from ai.counter import summarize_detection_counts
from utils.image_utils import save_uploaded_image
from utils.calculations import format_currency, compare_detected_vs_db

def render():
    st.title("📷 AI Shelf Detection & Scanner")
    st.caption("Computer Vision pipeline powered by YOLOv8 and optical contour geometry")

    # Detection Configuration in Expander
    with st.expander("⚙️ Detection Sensitivity & NMS Parameters", expanded=False):
        c1, c2 = st.columns(2)
        with c1:
            conf_threshold = st.slider("Confidence Threshold", min_value=0.10, max_value=0.95, value=config.DEFAULT_CONFIDENCE, step=0.05)
        with c2:
            iou_threshold = st.slider("IoU NMS Threshold", min_value=0.10, max_value=0.90, value=config.DEFAULT_IOU, step=0.05)

    # Input Method Tabs
    tab_upload, tab_camera = st.tabs(["📁 Upload Shelf Image", "📸 Live Device Camera"])
    raw_image = None
    image_source_name = "upload"

    with tab_upload:
        uploaded_file = st.file_uploader(
            "Choose a supermarket shelf or warehouse rack photo",
            type=["jpg", "jpeg", "png", "webp"],
            help="High-contrast shelf images yield highest optical accuracy"
        )
        if uploaded_file is not None:
            raw_image = Image.open(uploaded_file)
            image_source_name = uploaded_file.name

    with tab_camera:
        cam_picture = st.camera_input("Capture live shelf frame")
        if cam_picture is not None:
            raw_image = Image.open(cam_picture)
            image_source_name = "live_camera_capture.jpg"

    if raw_image is None:
        st.info("👆 Please upload an image or capture a frame using the camera above to begin AI analysis.")
        return

    # Image Quality Checks
    is_valid, q_metrics, warnings = preprocess_and_validate_image(raw_image)
    if warnings:
        for w in warnings:
            st.warning(w)

    # Action Button
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🚀 Analyze Shelf Image with YOLOv8", type="primary", use_container_width=True):
        with st.spinner("Processing image through YOLOv8 neural network and contour segmentation..."):
            # Save uploaded raw image
            saved_name, saved_path = save_uploaded_image(raw_image, prefix="scan")

            # Run detection pipeline
            detections, annotated_img, proc_time, out_path = detect_shelf_products(
                raw_image,
                conf_threshold=conf_threshold,
                iou_threshold=iou_threshold
            )

            # Summarize metrics
            summary = summarize_detection_counts(detections, proc_time)

            # Save in session state so user can update stock without losing results
            st.session_state["last_detection"] = {
                "raw_image": raw_image,
                "annotated_img": annotated_img,
                "image_name": saved_name,
                "detections": detections,
                "summary": summary,
                "out_path": str(out_path)
            }

            # Save in SQLite DETECTION_HISTORY
            det_id = database.save_detection_record(
                image_name=saved_name,
                total_objects=summary["total_objects"],
                unique_products=summary["unique_products"],
                avg_conf=summary["average_confidence"],
                proc_time=summary["processing_time"],
                detected_items=summary["product_details"]
            )
            st.session_state["last_detection_id"] = det_id

    # Display Results if Available in Session State
    if "last_detection" in st.session_state:
        res = st.session_state["last_detection"]
        summary = res["summary"]

        st.markdown("---")
        st.subheader("🔍 Detection Telemetry & Analysis")

        # Telemetry KPI cards
        k1, k2, k3, k4 = st.columns(4)
        with k1:
            st.metric("Total Items Counted", f"{summary['total_objects']} units")
        with k2:
            st.metric("Unique Product Classes", f"{summary['unique_products']}")
        with k3:
            st.metric("Average Confidence", f"{int(summary['average_confidence'] * 100)}%")
        with k4:
            st.metric("Inference Latency", f"{summary['processing_time']} sec")

        # Side-by-side Visual Comparison
        col_orig, col_annot = st.columns(2)
        with col_orig:
            st.caption("Original Raw Capture")
            st.image(res["raw_image"], use_container_width=True)
        with col_annot:
            st.caption("Annotated Individual Bounding Boxes")
            st.image(res["annotated_img"], use_container_width=True)

        # Inventory Matching Table
        st.markdown("---")
        st.subheader("📋 Shelf vs Database Reconciliation")

        reconcile_data = []
        for p in summary["product_details"]:
            p_name = p["name"]
            p_count = p["count"]
            p_conf = p["confidence"]

            matched_db = database.find_matching_product(p_name)
            if matched_db:
                db_qty = matched_db["quantity"]
                unit_price = matched_db["price"]
                comp = compare_detected_vs_db(p_count, db_qty)
                reconcile_data.append({
                    "product_id": matched_db["id"],
                    "Item": matched_db["name"],
                    "Category": matched_db["category"],
                    "Visible Count": p_count,
                    "Database Stock": db_qty,
                    "Stock Discrepancy": f"{comp['diff']} ({comp['status']})",
                    "Discrepancy Status": comp["status"],
                    "Unit Price": format_currency(unit_price),
                    "Shelf Valuation": format_currency(p_count * unit_price),
                    "Confidence": f"{int(p_conf * 100)}%"
                })
            else:
                reconcile_data.append({
                    "product_id": None,
                    "Item": f"{p_name} (Unregistered)",
                    "Category": "Uncategorized",
                    "Visible Count": p_count,
                    "Database Stock": 0,
                    "Stock Discrepancy": f"+{p_count} (NEW)",
                    "Discrepancy Status": "NEW",
                    "Unit Price": format_currency(50.0),
                    "Shelf Valuation": format_currency(p_count * 50.0),
                    "Confidence": f"{int(p_conf * 100)}%"
                })

        if reconcile_data:
            rec_df = pd.DataFrame(reconcile_data)
            display_cols = ["Item", "Category", "Visible Count", "Database Stock", "Stock Discrepancy", "Unit Price", "Shelf Valuation", "Confidence"]
            st.dataframe(rec_df[display_cols], use_container_width=True, hide_index=True)

            # Database Update Section
            st.markdown("### 💾 Inventory Stock Synchronization")
            st.write("Apply visible count updates to the SQLite database:")

            u1, u2 = st.columns([1.5, 1])
            with u1:
                update_mode = st.radio(
                    "Update Method",
                    options=config.INVENTORY_UPDATE_MODES,
                    horizontal=True,
                    help="Replace: overwrite quantity with visible count. Add: add visible count to existing stock."
                )

            with u2:
                st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
                if st.button("✅ Commit & Synchronize Database", type="primary", use_container_width=True):
                    updated_count = 0
                    for row in reconcile_data:
                        prod_id = row["product_id"]
                        vis_count = row["Visible Count"]

                        if prod_id is not None:
                            p_info = database.get_product_by_id(prod_id)
                            curr_stock = p_info["quantity"] if p_info else 0

                            if update_mode == "Replace Existing Stock":
                                new_stock = vis_count
                            elif update_mode == "Add Detected Stock":
                                new_stock = curr_stock + vis_count
                            else:
                                new_stock = vis_count

                            database.update_product_stock(prod_id, new_stock, source="AI_DETECTION")
                            updated_count += 1
                        else:
                            # Register new item automatically
                            clean_name = row["Item"].replace(" (Unregistered)", "")
                            new_id = database.insert_product({
                                "name": clean_name,
                                "category": "Retail Items",
                                "price": 50.0,
                                "quantity": vis_count,
                                "minimum_stock": config.DEFAULT_MIN_STOCK,
                                "maximum_stock": config.DEFAULT_MAX_STOCK,
                                "supplier": "Local Distributor"
                            })
                            updated_count += 1

                    st.success(f"🎉 Successfully synchronized {updated_count} product(s) into database via AI Optical Scan!")
                    database.check_and_generate_alerts()
                    st.balloons()
        else:
            st.info("No shelf products detected in this frame. Try adjusting the confidence threshold.")
