const API = "https://learning-progress-tracker-gova-backend.onrender.com";

function getToken(){
return localStorage.getItem("token");
}

function logout(){

if(!confirm("Are you sure you want to logout?")) return;

localStorage.removeItem("token");
localStorage.removeItem("role");

alert("Logged out successfully");

window.location.href = "login.html";

}


// ---------------- PAGE INIT ----------------

function initStudent(){

const token = getToken();
const role = localStorage.getItem("role");

if(!token || role !== "student"){
alert("Unauthorized Access");
window.location.href="login.html";
return;
}

loadCourses();
loadProgress();

}


// ---------------- LOAD COURSES ----------------

async function loadCourses(){

const res = await fetch(API+"/student/courses");

const courses = await res.json();

let html="";

for(let c of courses){

let enrolled = await checkEnrollment(c.id);

html+=`
<div class="card">

<h3>${c.name}</h3>
<p>${c.description}</p>

<button onclick="viewSubjects(${c.id})">View</button>

${enrolled 
? "<span class='enrolled'>Enrolled</span>"
: `<button onclick="enroll(${c.id})">Enroll</button>`}

</div>
`;

}

document.getElementById("courses").innerHTML=html;

}


// ---------------- CHECK ENROLLMENT ----------------

async function checkEnrollment(course_id){

const res = await fetch(API+"/student/subjects/"+course_id,{
headers:{
"Authorization":"Bearer "+getToken()
}
});

if(res.status===401){
logout();
return false;
}

const subjects = await res.json();

return subjects.length>0;

}


// ---------------- ENROLL COURSE ----------------

async function enroll(course_id){

await fetch(API+"/student/enroll",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+getToken()
},

body:JSON.stringify({course_id})

});

alert("Course Enrolled");

loadCourses();

}


// ---------------- VIEW SUBJECTS ----------------

async function viewSubjects(course_id){

const res = await fetch(API+"/student/subjects/"+course_id,{
headers:{
"Authorization":"Bearer "+getToken()
}
});

const subjects = await res.json();

let html="";

subjects.forEach(s=>{

html+=`

<div class="card">

<h3>${s.name}</h3>

<button onclick="viewTopics(${s.id})">View Topics</button>

</div>

`;

});

document.getElementById("subjects").innerHTML=html;

}


// ---------------- VIEW TOPICS ----------------

async function viewTopics(subject_id){

const res = await fetch(API+"/student/topics/"+subject_id,{
headers:{
"Authorization":"Bearer "+getToken()
}
});

const topics = await res.json();

let html="";

topics.forEach(t=>{

html+=`

<div class="card">

<h4>${t.title}</h4>

${t.completed
? "<span class='done'>Completed</span>"
: `<button onclick="completeTopic(${t.id})">Mark Complete</button>`}

</div>

`;

});

document.getElementById("topics").innerHTML=html;

loadProgress();

}


// ---------------- COMPLETE TOPIC ----------------

async function completeTopic(topic_id){

await fetch(API+"/student/progress",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+getToken()
},

body:JSON.stringify({topic_id})

});

alert("Topic Completed");

loadProgress();

}


// ---------------- LOAD PROGRESS ----------------

async function loadProgress(){

const res = await fetch(API+"/student/progress",{
headers:{
"Authorization":"Bearer "+getToken()
}
});

const p = await res.json();

document.getElementById("progress").innerHTML=`

<div class="card">

<p>Total Topics: ${p.total_topics}</p>

<p>Completed: ${p.completed_topics}</p>

<h3>${p.progress_percent}% Completed</h3>

</div>

`;

}