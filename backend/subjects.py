from flask import Blueprint, request, jsonify
from database import subjects, topics
from bson import ObjectId
import jwt
from config import SECRET_KEY

subject_api = Blueprint("subjects", __name__)


def get_user(request):

    token = request.headers.get("Authorization")

    decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

    return decoded["user_id"]


# -----------------------
# SUBJECT ROUTES
# -----------------------

@subject_api.route("/subjects", methods=["GET"])
def get_subjects():

    user = get_user(request)

    data = list(subjects.find({"userId": user}))

    for s in data:
        s["_id"] = str(s["_id"])

    return jsonify(data)


@subject_api.route("/subjects", methods=["POST"])
def create_subject():

    user = get_user(request)

    data = request.json

    subjects.insert_one({
        "name": data["name"],
        "description": data["description"],
        "userId": user
    })

    return jsonify({"message": "Subject created"})


# -----------------------
# TOPIC ROUTES
# -----------------------

@subject_api.route("/topics/<subject_id>", methods=["POST"])
def add_topic(subject_id):

    user = get_user(request)

    data = request.json

    topics.insert_one({
        "title": data["title"],
        "subjectId": subject_id,
        "completed": False,
        "userId": user
    })

    return jsonify({"message": "Topic created"})


@subject_api.route("/topics/<subject_id>", methods=["GET"])
def get_topics(subject_id):

    data = list(topics.find({"subjectId": subject_id}))

    for t in data:
        t["_id"] = str(t["_id"])

    return jsonify(data)


@subject_api.route("/topics/complete/<topic_id>", methods=["PUT"])
def complete_topic(topic_id):

    topics.update_one(
        {"_id": ObjectId(topic_id)},
        {"$set": {"completed": True}}
    )

    return jsonify({"message": "Topic completed"})