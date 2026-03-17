import gradio as gr
import bcrypt
from pymongo import MongoClient

# ---------------- DATABASE ----------------

client = MongoClient("mongodb://localhost:27017")
db = client["study_tracker"]

users = db["users"]
subjects = db["subjects"]
topics = db["topics"]

session = {"user": None}


# ---------------- AUTH FUNCTIONS ----------------

def register(email, password):
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    users.insert_one({
        "email": email,
        "password": hashed
    })

    return {"message": "User registered"}


def login(email, password):

    user = users.find_one({"email": email})

    if not user:
        return "User not found"

    if not bcrypt.checkpw(password.encode(), user["password"]):
        return "Wrong password"

    session["user"] = str(user["_id"])

    return "Login successful"


# ---------------- SUBJECT FUNCTIONS ----------------

def add_subject(name, description):

    subjects.insert_one({
        "name": name,
        "description": description,
        "userId": session["user"]
    })

    return {"message": "Subject added"}


def get_subjects():

    data = list(subjects.find({"userId": session["user"]}))

    for s in data:
        s["_id"] = str(s["_id"])

    return data


def get_subject_names():
    data = get_subjects()
    return [s["name"] for s in data]


# ---------------- TOPIC FUNCTIONS ----------------

def add_topic(subject_name, topic_title):

    data = get_subjects()

    subject_id = None

    for s in data:
        if s["name"] == subject_name:
            subject_id = s["_id"]

    topics.insert_one({
        "title": topic_title,
        "subjectId": subject_id,
        "completed": False,
        "userId": session["user"]
    })

    return {"message": "Topic added"}


# ---------------- PROGRESS ----------------

def show_progress():

    data = get_subjects()

    report = []

    for s in data:

        subject_topics = list(topics.find({"subjectId": s["_id"]}))

        total = len(subject_topics)

        completed = len([t for t in subject_topics if t["completed"]])

        percent = 0

        if total > 0:
            percent = round((completed / total) * 100)

        report.append({
            "subject": s["name"],
            "topics": total,
            "completed": completed,
            "progress": f"{percent}%"
        })

    return report


# ---------------- UI ----------------

with gr.Blocks() as demo:

    # ---------- AUTH PAGE ----------

    with gr.Column(visible=True) as auth_page:

        gr.Markdown("# Study Progress Tracker")

        login_btn_show = gr.Button("Login")
        register_btn_show = gr.Button("Register")

        # LOGIN FORM
        with gr.Column(visible=False) as login_form:

            login_email = gr.Textbox(label="Email")
            login_password = gr.Textbox(label="Password", type="password")

            login_btn = gr.Button("Login")
            login_output = gr.Textbox()

        # REGISTER FORM
        with gr.Column(visible=False) as register_form:

            reg_email = gr.Textbox(label="Email")
            reg_password = gr.Textbox(label="Password", type="password")

            register_btn = gr.Button("Register")
            register_output = gr.JSON()

    # ---------- DASHBOARD ----------

    with gr.Column(visible=False) as dashboard_page:

        gr.Markdown("# Dashboard")

        with gr.Row():
            subjects_btn = gr.Button("Subjects")
            progress_btn_nav = gr.Button("Progress")
            logout_btn = gr.Button("Logout")

        # SUBJECT PAGE
        with gr.Column(visible=False) as subjects_page:

            gr.Markdown("## Subjects")

            subject_name = gr.Textbox(label="Subject Name")
            subject_desc = gr.Textbox(label="Description")

            add_subject_btn = gr.Button("Add Subject")
            subject_output = gr.JSON()

            subject_dropdown = gr.Dropdown(label="Select Subject", choices=[])

            topic_title = gr.Textbox(label="Topic Title")
            add_topic_btn = gr.Button("Add Topic")
            topic_output = gr.JSON()

        # PROGRESS PAGE
        with gr.Column(visible=False) as progress_page:

            gr.Markdown("## Progress")

            load_progress_btn = gr.Button("Load Progress")
            progress_output = gr.JSON()


    # ---------- NAVIGATION ----------

    def show_login():
        return gr.update(visible=True), gr.update(visible=False)

    def show_register():
        return gr.update(visible=False), gr.update(visible=True)

    login_btn_show.click(show_login, None, [login_form, register_form])
    register_btn_show.click(show_register, None, [login_form, register_form])


    def login_user(email, password):

        result = login(email, password)

        if result == "Login successful":

            names = get_subject_names()

            return (
                "Login successful",
                gr.update(visible=False),
                gr.update(visible=True),
                gr.update(choices=names)
            )

        return result, gr.update(), gr.update(), gr.update()


    login_btn.click(
        login_user,
        [login_email, login_password],
        [login_output, auth_page, dashboard_page, subject_dropdown]
    )

    register_btn.click(register, [reg_email, reg_password], register_output)


    def logout_user():
        session["user"] = None
        return gr.update(visible=True), gr.update(visible=False)

    logout_btn.click(logout_user, None, [auth_page, dashboard_page])


    def open_subjects():
        names = get_subject_names()
        return gr.update(visible=True), gr.update(visible=False), gr.update(choices=names)

    subjects_btn.click(open_subjects, None, [subjects_page, progress_page, subject_dropdown])


    def open_progress():
        return gr.update(visible=False), gr.update(visible=True)

    progress_btn_nav.click(open_progress, None, [subjects_page, progress_page])


    add_subject_btn.click(add_subject, [subject_name, subject_desc], subject_output)

    add_topic_btn.click(add_topic, [subject_dropdown, topic_title], topic_output)

    load_progress_btn.click(show_progress, None, progress_output)


demo.launch()