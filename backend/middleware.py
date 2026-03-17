import jwt
from flask import request

SECRET_KEY = "learning-progress-monitor-super-secret-key-2026"

def verify_token():

    print("HEADERS RECEIVED:", request.headers)

    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[-1]
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded

    except Exception as e:
        print("TOKEN ERROR:", e)
        return None