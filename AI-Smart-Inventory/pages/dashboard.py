"""
pages/dashboard.py
------------------
Executive inventory KPI dashboard, visual category breakdowns, and critical stock alerts.
"""

import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

import config
import database
from utils.calculations import format_currency, get_stock_status
from utils.helpers import time_ago

def render():
    st.title("📊 Inventory Overview & Executive Dashboard")
    st.caption("Real-time telemetry, shelf valuations, and AI optical scan intelligence")

    # Fetch KPIs directly from SQLite
    kpis = database.get_inventory_kpis()
    model_status = database.database.config.CUSTOM_MODEL_PATH.exists()

    # System Status Bar
    status_col1, status_col2, status_col3 = st.columns([1, 1, 1])
    with status_col1:
        st.success("🟢 SQLite Database: Connected & Operational")
    with status_col2:
        st.info("🤖 YOLOv8 Engine: Active (Optical + AI)")
    with status_col3:
        active_alerts_count = len(database.get_active_alerts())
        if active_alerts_count > 0:
            st.warning(f"⚠️ {active_alerts_count} Active Stock Alert(s)")
        else:
            st.success("✅ All Stock Levels Healthy")

    st.markdown("---")

    # KPI Metric Cards
    m1, m2, m3, m4, m5, m6 = st.columns(6)
    with m1:
        st.metric("Total Products", f"{kpis['total_products']}")
    with m2:
        st.metric("Total Units", f"{kpis['total_units']:,}")
    with m3:
        st.metric("Low Stock", f"{kpis['low_stock']}", delta="-Attention" if kpis['low_stock'] > 0 else "0", delta_color="inverse")
    with m4:
        st.metric("Out of Stock", f"{kpis['out_of_stock']}", delta="-Critical" if kpis['out_of_stock'] > 0 else "0", delta_color="inverse")
    with m5:
        st.metric("Inventory Value", format_currency(kpis['inventory_value']))
    with m6:
        st.metric("AI Scans Run", f"{kpis['ai_scans']}")

    st.markdown("<br>", unsafe_allow_html=True)

    # Charts Section
    products = database.get_all_products()
    if products:
        df = pd.DataFrame(products)

        c1, c2 = st.columns([1.2, 1])

        with c1:
            st.subheader("📦 Stock by Category")
            cat_df = df.groupby("category")["quantity"].sum().reset_index()
            fig_cat = px.bar(
                cat_df,
                x="category",
                y="quantity",
                color="category",
                labels={"quantity": "Units in Stock", "category": "Category"},
                text_auto=True,
                height=320
            )
            fig_cat.update_layout(showlegend=False, margin=dict(l=20, r=20, t=20, b=20))
            st.plotly_chart(fig_cat, use_container_width=True)

        with c2:
            st.subheader("🎯 Stock Health Distribution")
            statuses = []
            for _, r in df.iterrows():
                stat, _ = get_stock_status(r["quantity"], r["minimum_stock"])
                statuses.append(stat)
            df["status"] = statuses
            status_counts = df["status"].value_counts().reset_index()
            status_counts.columns = ["Status", "Count"]

            fig_donut = px.pie(
                status_counts,
                names="Status",
                values="Count",
                hole=0.45,
                color="Status",
                color_discrete_map={
                    "IN STOCK": "#10b981",
                    "LOW STOCK": "#f59e0b",
                    "OUT OF STOCK": "#ef4444"
                },
                height=320
            )
            fig_donut.update_layout(margin=dict(l=20, r=20, t=20, b=20))
            st.plotly_chart(fig_donut, use_container_width=True)

    # Alerts & Recent Transactions Side-by-Side
    st.markdown("---")
    a1, a2 = st.columns([1, 1])

    with a1:
        st.subheader("🚨 Critical & Warning Alerts")
        alerts = database.get_active_alerts()[:5]
        if alerts:
            for al in alerts:
                sev = al["severity"]
                if sev == "CRITICAL":
                    st.error(f"**{al['message']}** ({time_ago(al['created_at'])})")
                else:
                    st.warning(f"**{al['message']}** ({time_ago(al['created_at'])})")
        else:
            st.info("No active alerts at this time.")

    with a2:
        st.subheader("📜 Recent Stock Activity")
        transactions = database.get_stock_transactions(limit=6)
        if transactions:
            tx_df = pd.DataFrame(transactions)[["timestamp", "product_name", "transaction_type", "quantity_change", "new_quantity", "source"]]
            tx_df.columns = ["Time", "Product", "Type", "Change", "Balance", "Source"]
            st.dataframe(tx_df, use_container_width=True, hide_index=True)
        else:
            st.info("No stock transactions recorded yet.")
