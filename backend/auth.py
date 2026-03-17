from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from database import get_cursor

SECRET_KEY = "learning-progress-monitor-super-secret-key-2026"

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json
    email = data["email"]
    password = data["password"]
    role = data["role"]

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    cur, conn = get_cursor()

    cur.execute(
        "INSERT INTO users(email,password,role) VALUES(%s,%s,%s)",
        (email, hashed, role)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "User registered"})


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json
    email = data["email"]
    password = data["password"]

    cur, conn = get_cursor()

    cur.execute(
        "SELECT id,password,role FROM users WHERE email=%s",
        (email,)
    )

    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_id, hashed, role = user

    if not bcrypt.checkpw(password.encode(), hashed.encode()):
        return jsonify({"error": "Wrong password"}), 401

    token = jwt.encode(
        {"user_id": user_id, "role": role},
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"token": token, "role": role})