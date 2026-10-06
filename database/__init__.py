"""
database package initialization
"""
from .database import (
    init_db,
    get_connection,
    get_all_products,
    get_product_by_id,
    get_product_by_name,
    find_matching_product,
    insert_product,
    update_product,
    delete_product,
    update_product_stock,
    record_stock_transaction,
    get_stock_transactions,
    save_detection_record,
    get_detection_history,
    get_detection_results_by_id,
    create_alert,
    get_active_alerts,
    get_all_alerts,
    resolve_alert,
    check_and_generate_alerts,
    get_inventory_kpis,
    seed_sample_data
)
