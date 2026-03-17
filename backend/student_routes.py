from flask import Blueprint, request, jsonify
from database import get_cursor
from middleware import verify_token

student_bp = Blueprint("student", __name__)


# ---------------- GET ALL COURSES ----------------

@student_bp.route("/courses", methods=["GET"])
def get_courses():

    cur, conn = get_cursor()

    cur.execute("SELECT id,name,description FROM courses")

    data = cur.fetchall()

    courses = []

    for c in data:
        courses.append({
            "id": c[0],
            "name": c[1],
            "description": c[2]
        })

    cur.close()
    conn.close()

    return jsonify(courses)


# ---------------- ENROLL COURSE ----------------

@student_bp.route("/enroll", methods=["POST"])
def enroll_course():

    user = verify_token()

    if not user:
        return jsonify({"error":"Unauthorized"}),401

    data = request.json

    cur, conn = get_cursor()

    cur.execute(
        """
        INSERT INTO enrollments(user_id,course_id)
        VALUES(%s,%s)
        ON CONFLICT DO NOTHING
        """,
        (user["user_id"], data["course_id"])
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Course enrolled"})


@student_bp.route("/my-courses", methods=["GET"])
def my_courses():

    user = verify_token()

    cur,conn = get_cursor()

    cur.execute("""
    SELECT c.id,c.name,c.description
    FROM courses c
    JOIN enrollments e
    ON c.id=e.course_id
    WHERE e.user_id=%s
    """,(user["user_id"],))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(data)

# ---------------- GET SUBJECTS IN COURSE ----------------

@student_bp.route("/subjects/<course_id>", methods=["GET"])
def get_subjects(course_id):

    user = verify_token()

    if not user:
        return jsonify({"error":"Unauthorized"}),401

    cur, conn = get_cursor()

    cur.execute(
        "SELECT id,name FROM subjects WHERE course_id=%s",
        (course_id,)
    )

    data = cur.fetchall()

    subjects = []

    for s in data:
        subjects.append({
            "id": s[0],
            "name": s[1]
        })

    cur.close()
    conn.close()

    return jsonify(subjects)


# ---------------- GET TOPICS IN SUBJECT ----------------

@student_bp.route("/topics/<subject_id>", methods=["GET"])
def get_topics(subject_id):

    user = verify_token()

    if not user:
        return jsonify({"error":"Unauthorized"}),401

    cur, conn = get_cursor()

    cur.execute(
        """
        SELECT t.id,t.title,
        CASE WHEN p.completed=true THEN true ELSE false END
        FROM topics t
        LEFT JOIN progress p
        ON t.id=p.topic_id AND p.user_id=%s
        WHERE t.subject_id=%s
        """,
        (user["user_id"],subject_id)
    )

    data = cur.fetchall()

    topics = []

    for t in data:
        topics.append({
            "id": t[0],
            "title": t[1],
            "completed": t[2]
        })

    cur.close()
    conn.close()

    return jsonify(topics)


# ---------------- MARK TOPIC COMPLETE ----------------

@student_bp.route("/progress", methods=["POST"])
def mark_complete():

    user = verify_token()

    if not user:
        return jsonify({"error":"Unauthorized"}),401

    data = request.json

    cur, conn = get_cursor()

    cur.execute(
        """
        INSERT INTO progress(user_id,topic_id,completed)
        VALUES(%s,%s,true)
        ON CONFLICT (user_id,topic_id)
        DO UPDATE SET completed=true
        """,
        (user["user_id"], data["topic_id"])
    )

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message":"Progress updated"})


# ---------------- STUDENT PROGRESS SUMMARY ----------------

@student_bp.route("/progress", methods=["GET"])
def progress_summary():

    user = verify_token()

    if not user:
        return jsonify({"error":"Unauthorized"}),401

    cur, conn = get_cursor()

    cur.execute(
        """
        SELECT
        COUNT(t.id) as total_topics,
        COUNT(p.topic_id) as completed
        FROM topics t
        LEFT JOIN progress p
        ON t.id=p.topic_id AND p.user_id=%s
        """,
        (user["user_id"],)
    )

    total, completed = cur.fetchone()

    percent = 0

    if total > 0:
        percent = round((completed/total)*100)

    cur.close()
    conn.close()

    return jsonify({
        "total_topics": total,
        "completed_topics": completed,
        "progress_percent": percent
    })
