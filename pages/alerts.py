"""
pages/alerts.py
---------------
Automated stock threshold monitoring, shelf deficit warnings, expiry alerts, and resolution actions.
"""

import streamlit as st
import pandas as pd
import datetime

import database
from utils.helpers import time_ago

def render():
    st.title("🚨 Stock Alerts & Quality Assurance")
    st.caption("Active threshold alerts, expiration notices, and reconciliation tasks")

    # Refresh alerts button
    col_t1, col_t2 = st.columns([3, 1])
    with col_t2:
        if st.button("🔄 Check & Re-evaluate Alerts", use_container_width=True):
            database.check_and_generate_alerts()
            st.success("Evaluated all inventory thresholds!")
            st.rerun()

    # Filter by Severity
    filter_sev = st.radio("Filter Alerts by Severity", ["All", "CRITICAL", "WARNING", "INFO"], horizontal=True)

    alerts = database.get_all_alerts(limit=50)

    if filter_sev != "All":
        alerts = [a for a in alerts if a["severity"] == filter_sev]

    unresolved = [a for a in alerts if a["resolved"] == 0]
    resolved = [a for a in alerts if a["resolved"] == 1]

    tab_unresolved, tab_resolved = st.tabs([f"⚠️ Active Alerts ({len(unresolved)})", f"✅ Resolved History ({len(resolved)})"])

    with tab_unresolved:
        if unresolved:
            for al in unresolved:
                al_id = al["id"]
                sev = al["severity"]
                msg = al["message"]
                created = time_ago(al["created_at"])

                with st.container():
                    c_badge, c_msg, c_act = st.columns([1, 4, 1.2])
                    with c_badge:
                        if sev == "CRITICAL":
                            st.error("🚨 CRITICAL")
                        elif sev == "WARNING":
                            st.warning("⚠️ WARNING")
                        else:
                            st.info("ℹ️ INFO")
                    with c_msg:
                        st.markdown(f"**{msg}**")
                        st.caption(f"Triggered: {created} | Alert ID: #{al_id}")
                    with c_act:
                        if st.button(f"Mark Resolved", key=f"res_{al_id}", use_container_width=True):
                            database.resolve_alert(al_id)
                            st.rerun()
                    st.divider()
        else:
            st.success("🎉 No active alerts! All product inventory counts and expiry dates are within safe parameters.")

    with tab_resolved:
        if resolved:
            res_df = pd.DataFrame(resolved)[["created_at", "severity", "message"]]
            res_df.columns = ["Timestamp", "Severity", "Message"]
            st.dataframe(res_df, use_container_width=True, hide_index=True)
        else:
            st.info("No resolved alerts in log.")
