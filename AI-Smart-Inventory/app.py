"""
app.py
------
AI Smart Inventory Management System (SmartStock)
Master Streamlit Application Entry Point.
"""

import streamlit as st
import config
import database

# Import Page Modules
from pages import (
    dashboard,
    detection,
    inventory,
    analytics,
    alerts,
    reports,
    settings,
    about
)

# 1. Page Configuration
st.set_page_config(
    page_title=f"{config.APP_NAME} - {config.APP_TAGLINE}",
    page_icon=config.APP_ICON,
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Database Initialization
database.init_db()

# 3. Sidebar Navigation & Branding
with st.sidebar:
    st.title(f"{config.APP_ICON} {config.APP_NAME}")
    st.caption(config.APP_TAGLINE)
    st.markdown("---")

    menu_selection = st.radio(
        "Navigation",
        options=[
            "📊 Dashboard",
            "📷 AI Shelf Scanner",
            "📦 Inventory Catalog",
            "📈 Analytics & Trends",
            "🚨 Stock Alerts",
            "📑 Reports & Export",
            "⚙️ Settings",
            "ℹ️ About System"
        ],
        index=0
    )

    st.markdown("---")
    st.markdown("### 📡 System Diagnostics")
    st.success("🟢 SQLite Database: Connected")
    st.info("🤖 YOLOv8 Computer Vision: Ready")

    active_alerts = database.get_active_alerts()
    if active_alerts:
        st.warning(f"⚠️ {len(active_alerts)} Active Stock Alert(s)")
    else:
        st.caption("✅ Inventory thresholds healthy")

    st.markdown("---")
    st.caption("Academic Project • Smart Retail Vision v2.5")

# 4. Route to Selected Page
if menu_selection == "📊 Dashboard":
    dashboard.render()
elif menu_selection == "📷 AI Shelf Scanner":
    detection.render()
elif menu_selection == "📦 Inventory Catalog":
    inventory.render()
elif menu_selection == "📈 Analytics & Trends":
    analytics.render()
elif menu_selection == "🚨 Stock Alerts":
    alerts.render()
elif menu_selection == "📑 Reports & Export":
    reports.render()
elif menu_selection == "⚙️ Settings":
    settings.render()
elif menu_selection == "ℹ️ About System":
    about.render()
