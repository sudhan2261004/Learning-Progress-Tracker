from flask import Blueprint, request, jsonify
from database import get_cursor
from middleware import verify_token

admin_bp = Blueprint("admin", __name__)


# ---------------- ADD COURSE ----------------

@admin_bp.route("/courses", methods=["POST"])
def add_course():

    user = verify_token()

    if not user:
        return jsonify({"error": "Unauthorized - Token missing"}), 401

    if user["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.json

    cur, conn = get_cursor()

    cur.execute(
        "INSERT INTO courses(name,description,created_by) VALUES(%s,%s,%s)",
        (data["name"], data["description"], user["user_id"])
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Course created"})


# ---------------- ADD SUBJECT ----------------

@admin_bp.route("/subjects", methods=["POST"])
def add_subject():
    user = verify_token()
    if not user:
        return jsonify({"error": "Unauthorized - Token missing"}), 401
    if user["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.json

    cur, conn = get_cursor()

    cur.execute(
        "INSERT INTO subjects(name,description,course_id) VALUES(%s,%s,%s)",
        (data["name"], data["description"], data["course_id"])
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Subject created"})


# ---------------- ADD TOPIC ----------------

@admin_bp.route("/topics", methods=["POST"])
def add_topic():

    user = verify_token()

    if not user:
        return jsonify({"error": "Unauthorized - Token missing"}), 401

    if user["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.json

    cur, conn = get_cursor()

    cur.execute(
        "INSERT INTO topics(title,subject_id) VALUES(%s,%s)",
        (data["title"], data["subject_id"])
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Topic created"})

@admin_bp.route("/courses", methods=["GET"])
def get_courses():

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    cur,conn = get_cursor()

    cur.execute("SELECT id,name,description FROM courses")

    data = cur.fetchall()

    courses=[]

    for c in data:
        courses.append({
            "id":c[0],
            "name":c[1],
            "description":c[2]
        })

    cur.close()
    conn.close()

    return jsonify(courses)

@admin_bp.route("/courses/<course_id>", methods=["PUT"])
def update_course(course_id):

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    data = request.json

    cur,conn = get_cursor()

    cur.execute(
        "UPDATE courses SET name=%s,description=%s WHERE id=%s",
        (data["name"],data["description"],course_id)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Course updated"})

@admin_bp.route("/courses/<course_id>", methods=["DELETE"])
def delete_course(course_id):

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    cur,conn = get_cursor()

    cur.execute("DELETE FROM courses WHERE id=%s",(course_id,))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Course deleted"})

@admin_bp.route("/subjects", methods=["GET"])
def get_subjects():

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    cur,conn = get_cursor()

    cur.execute("""
    SELECT s.id,s.name,s.description,c.name
    FROM subjects s
    JOIN courses c
    ON s.course_id=c.id
    """)

    data = cur.fetchall()

    subjects=[]

    for s in data:
        subjects.append({
            "id":s[0],
            "name":s[1],
            "description":s[2],
            "course_name":s[3]
        })

    cur.close()
    conn.close()

    return jsonify(subjects)

@admin_bp.route("/subjects/<subject_id>", methods=["PUT"])
def update_subject(subject_id):

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    data = request.json

    cur,conn = get_cursor()

    cur.execute(
        "UPDATE subjects SET name=%s,description=%s WHERE id=%s",
        (data["name"],data["description"],subject_id)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Subject updated"})

@admin_bp.route("/subjects/<subject_id>", methods=["DELETE"])
def delete_subject(subject_id):

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    cur,conn = get_cursor()

    cur.execute("DELETE FROM subjects WHERE id=%s",(subject_id,))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Subject deleted"})

@admin_bp.route("/topics", methods=["GET"])
def get_topics():

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    cur,conn = get_cursor()

    cur.execute("SELECT id,title,subject_id FROM topics")

    data = cur.fetchall()

    topics=[]

    for t in data:
        topics.append({
            "id":t[0],
            "title":t[1],
            "subject_id":t[2]
        })

    cur.close()
    conn.close()

    return jsonify(topics)

@admin_bp.route("/topics/<topic_id>", methods=["PUT"])
def update_topic(topic_id):

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    data = request.json

    cur,conn = get_cursor()

    cur.execute(
        "UPDATE topics SET title=%s WHERE id=%s",
        (data["title"],topic_id)
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Topic updated"})

@admin_bp.route("/topics/<topic_id>", methods=["DELETE"])
def delete_topic(topic_id):

    user = verify_token()

    if not user or user["role"] != "admin":
        return jsonify({"error":"Admin access required"}),403

    cur,conn = get_cursor()

    cur.execute("DELETE FROM topics WHERE id=%s",(topic_id,))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Topic deleted"})

