"""
counter.py
----------
Aggregates bounding boxes into inventory item counts, unique product tallies,
and confidence metrics.
"""

from typing import List, Dict, Any

def summarize_detection_counts(
    detections: List[Dict[str, Any]],
    processing_time: float
) -> Dict[str, Any]:
    """
    Computes summary metrics from detected bounding boxes:
    - total_objects (sum of all unit counts)
    - unique_products (number of distinct product types)
    - count_per_product (e.g. {'Bottle': 5, 'Can': 3})
    - average_confidence
    - processing_time
    """
    if not detections:
        return {
            "total_objects": 0,
            "unique_products": 0,
            "count_per_product": {},
            "product_details": [],
            "average_confidence": 0.0,
            "processing_time": processing_time
        }

    count_per_product: Dict[str, int] = {}
    conf_per_product: Dict[str, List[float]] = {}
    total_objects = 0
    all_confs = []

    for d in detections:
        label = d["label"]
        count = d.get("count", 1)
        conf = d.get("confidence", 0.9)

        count_per_product[label] = count_per_product.get(label, 0) + count
        conf_per_product.setdefault(label, []).append(conf)
        total_objects += count
        all_confs.append(conf)

    product_details = []
    for label, count in count_per_product.items():
        avg_c = float(sum(conf_per_product[label]) / len(conf_per_product[label]))
        product_details.append({
            "name": label,
            "count": count,
            "confidence": round(avg_c, 2)
        })

    avg_overall_conf = float(sum(all_confs) / len(all_confs)) if all_confs else 0.0

    return {
        "total_objects": total_objects,
        "unique_products": len(count_per_product),
        "count_per_product": count_per_product,
        "product_details": product_details,
        "average_confidence": round(avg_overall_conf, 2),
        "processing_time": round(processing_time, 3)
    }
