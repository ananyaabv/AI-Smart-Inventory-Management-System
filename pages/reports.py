"""
pages/reports.py
----------------
Exportable audit trails, inventory valuation reports, and detection history logs.
"""

import streamlit as st
import pandas as pd
import datetime

import database
from utils.calculations import format_currency

def render():
    st.title("📑 Reports & Audit Data Export")
    st.caption("Generate, inspect, and download CSV compliance reports for inventory and AI scans")

    tab_inv, tab_tx, tab_det = st.tabs(["📦 Current Inventory Report", "🔄 Stock Transaction Audit Log", "🤖 AI Scan History Log"])

    # 1. Inventory Report
    with tab_inv:
        products = database.get_all_products()
        if products:
            df_inv = pd.DataFrame(products)
            df_inv["total_value"] = df_inv["quantity"] * df_inv["price"]

            st.write(f"Total Records: **{len(df_inv)} items** | Valuation: **{format_currency(df_inv['total_value'].sum())}**")

            csv_inv = df_inv.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download Inventory Catalog (CSV)",
                data=csv_inv,
                file_name=f"inventory_report_{datetime.date.today()}.csv",
                mime="text/csv",
                type="primary"
            )

            st.dataframe(df_inv, use_container_width=True, hide_index=True)
        else:
            st.info("No inventory records found.")

    # 2. Transactions Log
    with tab_tx:
        txs = database.get_stock_transactions(limit=250)
        if txs:
            df_tx = pd.DataFrame(txs)
            st.write(f"Total Transaction Entries: **{len(df_tx)}**")

            csv_tx = df_tx.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download Stock Audit Log (CSV)",
                data=csv_tx,
                file_name=f"stock_transactions_{datetime.date.today()}.csv",
                mime="text/csv"
            )
            st.dataframe(df_tx, use_container_width=True, hide_index=True)
        else:
            st.info("No transactions logged.")

    # 3. Detection History Log
    with tab_det:
        dets = database.get_detection_history(limit=100)
        if dets:
            df_det = pd.DataFrame(dets)
            st.write(f"Total AI Scan Sessions: **{len(df_det)}**")

            csv_det = df_det.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download AI Scan History (CSV)",
                data=csv_det,
                file_name=f"ai_detection_history_{datetime.date.today()}.csv",
                mime="text/csv"
            )
            st.dataframe(df_det, use_container_width=True, hide_index=True)
        else:
            st.info("No AI detection sessions recorded yet.")
