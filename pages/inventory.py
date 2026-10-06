"""
pages/inventory.py
------------------
Complete Product Catalog Management (CRUD), stock adjustments, and inventory health tracking.
"""

import streamlit as st
import pandas as pd
import datetime

import config
import database
from utils.calculations import format_currency, get_stock_status
from utils.helpers import generate_sku

def render():
    st.title("📦 Product Catalog & Inventory Management")
    st.caption("Add, modify, track, and adjust physical supermarket stock records")

    # Action Toolbar
    col_search, col_cat, col_status = st.columns([1.5, 1, 1])

    products = database.get_all_products()
    categories = sorted(list(set(p["category"] for p in products if p.get("category"))))
    categories_options = ["All Categories"] + categories

    with col_search:
        search_query = st.text_input("🔍 Search by Name or SKU", placeholder="e.g. Coca Cola, BEV-CC").strip().lower()

    with col_cat:
        selected_cat = st.selectbox("Filter Category", options=categories_options)

    with col_status:
        selected_status = st.selectbox("Stock Status", options=["All Statuses", "IN STOCK", "LOW STOCK", "OUT OF STOCK"])

    # Filter data
    filtered = []
    for p in products:
        stat, _ = get_stock_status(p["quantity"], p["minimum_stock"])

        # Search filter
        if search_query:
            name_match = search_query in p["name"].lower()
            sku_match = search_query in (p.get("sku") or "").lower()
            if not (name_match or sku_match):
                continue

        # Category filter
        if selected_cat != "All Categories" and p["category"] != selected_cat:
            continue

        # Status filter
        if selected_status != "All Statuses" and stat != selected_status:
            continue

        p_copy = dict(p)
        p_copy["status"] = stat
        p_copy["total_value"] = p["quantity"] * p["price"]
        filtered.append(p_copy)

    # Add Product Expander
    with st.expander("➕ Add New Product to Inventory Catalog", expanded=False):
        with st.form("add_product_form", clear_on_submit=True):
            f1, f2, f3 = st.columns(3)
            with f1:
                name_in = st.text_input("Product Name *", placeholder="e.g. Red Bull Energy Drink")
                category_in = st.text_input("Category", placeholder="Beverages, Snacks, etc.")
                sku_in = st.text_input("SKU (Optional)", placeholder="Leave blank to auto-generate")
            with f2:
                price_in = st.number_input("Unit Retail Price (₹) *", min_value=0.5, value=40.0, step=1.0)
                qty_in = st.number_input("Initial Quantity in Stock *", min_value=0, value=25, step=1)
                supplier_in = st.text_input("Supplier / Manufacturer", placeholder="e.g. Red Bull India")
            with f3:
                min_stock_in = st.number_input("Minimum Safe Stock", min_value=1, value=config.DEFAULT_MIN_STOCK, step=1)
                max_stock_in = st.number_input("Maximum Capacity", min_value=min_stock_in, value=config.DEFAULT_MAX_STOCK, step=1)
                expiry_in = st.date_input("Expiry Date", value=datetime.date.today() + datetime.timedelta(days=180))

            submitted = st.form_submit_button("Create Product Record", type="primary")
            if submitted:
                if not name_in.strip():
                    st.error("Product name is required!")
                else:
                    sku_final = sku_in.strip() if sku_in.strip() else generate_sku(category_in, name_in)
                    new_id = database.insert_product({
                        "name": name_in.strip(),
                        "category": category_in.strip() or "General",
                        "sku": sku_final,
                        "price": price_in,
                        "quantity": int(qty_in),
                        "minimum_stock": int(min_stock_in),
                        "maximum_stock": int(max_stock_in),
                        "supplier": supplier_in.strip() or "Standard Supplier",
                        "expiry_date": str(expiry_in)
                    })
                    st.success(f"Product '{name_in}' registered successfully with SKU: {sku_final}!")
                    st.rerun()

    st.markdown("---")

    # Inventory Table Display
    if filtered:
        df_table = pd.DataFrame(filtered)
        display_df = pd.DataFrame({
            "ID": df_table["id"],
            "SKU": df_table["sku"],
            "Product Name": df_table["name"],
            "Category": df_table["category"],
            "Unit Price": df_table["price"].apply(format_currency),
            "Quantity": df_table["quantity"],
            "Min Safe": df_table["minimum_stock"],
            "Total Value": df_table["total_value"].apply(format_currency),
            "Status": df_table["status"],
            "Supplier": df_table["supplier"],
            "Expiry Date": df_table["expiry_date"]
        })
        st.dataframe(display_df, use_container_width=True, hide_index=True)
    else:
        st.info("No products match the selected search or filter criteria.")

    # Quick Stock Adjustment & Edit Section
    st.markdown("---")
    st.subheader("⚡ Quick Stock Adjustments & Editing")

    prod_names = {p["id"]: f"{p['name']} ({p.get('sku', '')}) - Qty: {p['quantity']}" for p in products}
    if prod_names:
        selected_prod_id = st.selectbox(
            "Select Product to Adjust or Edit",
            options=list(prod_names.keys()),
            format_func=lambda pid: prod_names[pid]
        )

        p_sel = database.get_product_by_id(selected_prod_id)
        if p_sel:
            adj_col1, adj_col2, adj_col3 = st.columns([1, 1, 1.5])

            with adj_col1:
                st.write(f"**Current Balance:** {p_sel['quantity']} units")
                q_plus = st.button("➕ Increment (+1)", key="plus_1")
                q_minus = st.button("➖ Decrement (-1)", key="minus_1")
                if q_plus:
                    database.update_product_stock(selected_prod_id, p_sel['quantity'] + 1, source="MANUAL_QUICK")
                    st.rerun()
                if q_minus and p_sel['quantity'] > 0:
                    database.update_product_stock(selected_prod_id, p_sel['quantity'] - 1, source="MANUAL_QUICK")
                    st.rerun()

            with adj_col2:
                new_qty_direct = st.number_input("Set Exact Stock Count", min_value=0, value=int(p_sel['quantity']), step=1)
                if st.button("Save Quantity Change"):
                    database.update_product_stock(selected_prod_id, int(new_qty_direct), source="MANUAL_ADJUSTMENT")
                    st.success("Stock updated!")
                    st.rerun()

            with adj_col3:
                st.write("**Danger Zone:**")
                if st.button(f"🗑️ Delete '{p_sel['name']}'", type="secondary"):
                    database.delete_product(selected_prod_id)
                    st.warning(f"Deleted product {p_sel['name']}.")
                    st.rerun()
