"""
auth.py
-------
Authentication and User Role Management Module for AI Smart Inventory System.
Supports Login, Role verification, and Session handling.
"""

from typing import Optional, Dict, Any
from database import get_connection

def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Validates user credentials against the SQLite database.
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, full_name, role, password_hash FROM users WHERE username = ?;", (username.strip(),))
        user = cursor.fetchone()
        if user and user['password_hash'] == password.strip():
            return {
                "id": user['id'],
                "username": user['username'],
                "full_name": user['full_name'],
                "role": user['role']
            }
    return None

def get_demo_users():
    """Returns demo login hints for evaluation."""
    return [
        {"username": "admin", "role": "Inventory Manager", "pass": "admin123"},
        {"username": "store1", "role": "Store Associate", "pass": "store123"},
        {"username": "evaluator", "role": "ML Project Evaluator", "pass": "eval123"}
    ]
