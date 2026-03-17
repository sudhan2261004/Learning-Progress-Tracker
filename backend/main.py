from flask import Flask
from auth import auth_bp
from admin_route import admin_bp
from student_routes import student_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(admin_bp, url_prefix="/admin")
app.register_blueprint(student_bp, url_prefix="/student")


@app.route("/")
def home():
    return {"message": "Learning Progress API running"}


if __name__ == "__main__":
    app.run(debug=True)
