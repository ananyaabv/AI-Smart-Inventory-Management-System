"""
pages/analytics.py
------------------
Interactive visual analytics, historical stock trends, and AI scan telemetry.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

import database
from utils.calculations import format_currency

def render():
    st.title("📈 Inventory Analytics & Visual Insights")
    st.caption("Deep-dive financial valuation, stock movements, and computer vision trend telemetry")

    products = database.get_all_products()
    transactions = database.get_stock_transactions(limit=100)
    detection_history = database.get_detection_history(limit=50)

    if not products:
        st.info("No product data available yet for analytics.")
        return

    df_prod = pd.DataFrame(products)
    df_prod["total_value"] = df_prod["quantity"] * df_prod["price"]

    # Row 1: Category Value & Top Products
    r1_c1, r1_c2 = st.columns(2)

    with r1_c1:
        st.subheader("💰 Inventory Valuation by Category")
        cat_val = df_prod.groupby("category")["total_value"].sum().reset_index()
        fig_val = px.bar(
            cat_val,
            x="category",
            y="total_value",
            color="category",
            labels={"total_value": "Valuation (₹)", "category": "Category"},
            text_auto=".2f",
            height=340
        )
        fig_val.update_layout(showlegend=False)
        st.plotly_chart(fig_val, use_container_width=True)

    with r1_c2:
        st.subheader("🏆 Top Products by Total Value")
        top_prods = df_prod.sort_values(by="total_value", ascending=True).tail(8)
        fig_top = px.bar(
            top_prods,
            x="total_value",
            y="name",
            orientation="h",
            labels={"total_value": "Total Value (₹)", "name": "Product"},
            color="total_value",
            color_continuous_scale="Blues",
            height=340
        )
        st.plotly_chart(fig_top, use_container_width=True)

    st.markdown("---")

    # Row 2: Stock Transactions Over Time
    st.subheader("🔄 Stock Transactions & Adjustments History")
    if transactions:
        tx_df = pd.DataFrame(transactions)
        tx_summary = tx_df.groupby(["transaction_type"])["id"].count().reset_index()
        tx_summary.columns = ["Transaction Type", "Count"]

        c_t1, c_t2 = st.columns([1, 1])
        with c_t1:
            fig_tx_types = px.pie(
                tx_summary,
                names="Transaction Type",
                values="Count",
                hole=0.4,
                title="Transaction Type Distribution",
                color_discrete_sequence=px.colors.qualitative.Pastel
            )
            st.plotly_chart(fig_tx_types, use_container_width=True)

        with c_t2:
            fig_tx_hist = px.histogram(
                tx_df,
                x="timestamp",
                y="quantity_change",
                color="transaction_type",
                title="Volume of Stock Inflows vs Outflows",
                height=340
            )
            st.plotly_chart(fig_tx_hist, use_container_width=True)
    else:
        st.info("No transaction records found.")

    st.markdown("---")

    # Row 3: AI Detection Telemetry
    st.subheader("🤖 AI Computer Vision Performance & Frequency")
    if detection_history:
        det_df = pd.DataFrame(detection_history)

        d1, d2 = st.columns(2)
        with d1:
            fig_det_trend = px.line(
                det_df,
                x="timestamp",
                y="total_objects",
                markers=True,
                title="Total Items Detected Per Shelf Scan Session",
                labels={"total_objects": "Items Detected", "timestamp": "Scan Date/Time"},
                height=320
            )
            st.plotly_chart(fig_det_trend, use_container_width=True)

        with d2:
            fig_conf = px.scatter(
                det_df,
                x="processing_time",
                y="average_confidence",
                size="total_objects",
                title="YOLO Latency vs Average Confidence",
                labels={"processing_time": "Inference Time (s)", "average_confidence": "Confidence"},
                height=320
            )
            st.plotly_chart(fig_conf, use_container_width=True)
    else:
        st.info("No AI detection sessions recorded yet. Run a scan from the AI Shelf Scanner page!")
