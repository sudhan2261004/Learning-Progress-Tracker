const API = "https://learning-progress-tracker-gova-backend.onrender.com";

function getToken(){
return localStorage.getItem("token");
}

function headers(){

const token = getToken();

if(!token){
logout();
return;
}

return {
"Content-Type":"application/json",
"Authorization":"Bearer " + token
};

}


function logout(){

if(!confirm("Are you sure you want to logout?")) return;

localStorage.removeItem("token");
localStorage.removeItem("role");

alert("Logged out successfully");

window.location.href = "index.html";

}


function initAdmin(){

const token = getToken();
const role = localStorage.getItem("role");

if(!token || role !== "admin"){
alert("Unauthorized Access");
window.location.href="index.html";
return;
}

loadCourses();
loadSubjects();
loadCourseDropdown();
loadTopics();

}


////////////////////////////////////
// COURSE CRUD
////////////////////////////////////

async function createCourse(){

const name = document.getElementById("courseName").value;
const description = document.getElementById("courseDesc").value;

await fetch(API+"/admin/courses",{
method:"POST",
headers:headers(),
body:JSON.stringify({name,description})
});

alert("Course Created");

loadCourses();

}


async function loadCourses(){

const res = await fetch(API+"/admin/courses",{
headers:headers()
});

const courses = await res.json();

let html="";

courses.forEach(c=>{

html+=`
<div class="card">

<b>${c.name}</b>
<p>${c.description}</p>

<button onclick="editCourse(${c.id}, \`${c.name}\`, \`${c.description}\`)">Edit</button>
<button onclick="deleteCourse(${c.id})">Delete</button>

</div>
`;

});

document.getElementById("courseList").innerHTML = html;

}


async function editCourse(id,name,desc){

const newName = prompt("New Course Name",name);
const newDesc = prompt("New Description",desc);

if(!newName) return;

await fetch(API+"/admin/courses/"+id,{
method:"PUT",
headers:headers(),
body:JSON.stringify({
name:newName,
description:newDesc
})
});

alert("Course Updated");

loadCourses();

}


async function deleteCourse(id){

if(!confirm("Delete this course?")) return;

await fetch(API+"/admin/courses/"+id,{
method:"DELETE",
headers:headers()
});

alert("Course Deleted");

loadCourses();

}


////////////////////////////////////
// SUBJECT CRUD
////////////////////////////////////

async function createSubject(){

const name = document.getElementById("subjectName").value;
const description = document.getElementById("subjectDesc").value;
const course_id = document.getElementById("courseDropdown").value;

await fetch(API+"/admin/subjects",{
method:"POST",
headers:headers(),
body:JSON.stringify({name,description,course_id})
});

alert("Subject Created");

loadSubjects();

}

async function loadSubjects(){

const res = await fetch(API+"/admin/subjects",{
headers:headers()
});

const subjects = await res.json();

let html="";

subjects.forEach(s=>{

html+=`
<div class="card">

<b>${s.name}</b>
<p>${s.description}</p>
<p>Course: ${s.course_name}</p>

<button onclick="editSubject(${s.id}, \`${s.name}\`, \`${s.description}\`)">Edit</button>
<button onclick="deleteSubject(${s.id})">Delete</button>

</div>
`;

});

document.getElementById("subjectList").innerHTML = html;

}


async function editSubject(id,name,desc){

const newName = prompt("New Subject Name",name);
const newDesc = prompt("New Description",desc);

if(!newName) return;

await fetch(API+"/admin/subjects/"+id,{
method:"PUT",
headers:headers(),
body:JSON.stringify({
name:newName,
description:newDesc
})
});

alert("Subject Updated");

loadSubjects();

}


async function deleteSubject(id){

if(!confirm("Delete this subject?")) return;

await fetch(API+"/admin/subjects/"+id,{
method:"DELETE",
headers:headers()
});

alert("Subject Deleted");

loadSubjects();

}


////////////////////////////////////
// TOPIC CRUD
////////////////////////////////////

async function createTopic(){

const title = document.getElementById("topicTitle").value;
const subject_id = document.getElementById("subjectDropdown").value;

await fetch(API+"/admin/topics",{
method:"POST",
headers:headers(),
body:JSON.stringify({title,subject_id})
});

alert("Topic Created");

loadTopics();

}

async function loadTopics(){

const res = await fetch(API+"/admin/topics",{
headers:headers()
});

const topics = await res.json();

let html="";

topics.forEach(t=>{

html+=`
<div class="card">

<b>${t.title}</b>
<p>Subject ID: ${t.subject_id}</p>

<button onclick="editTopic(${t.id}, \`${t.title}\`)">Edit</button>
<button onclick="deleteTopic(${t.id})">Delete</button>

</div>
`;

});

document.getElementById("topicList").innerHTML = html;

}


async function editTopic(id,title){

const newTitle = prompt("New Topic Title",title);

if(!newTitle) return;

await fetch(API+"/admin/topics/"+id,{
method:"PUT",
headers:headers(),
body:JSON.stringify({
title:newTitle
})
});

alert("Topic Updated");

loadTopics();

}


async function deleteTopic(id){

if(!confirm("Delete this topic?")) return;

await fetch(API+"/admin/topics/"+id,{
method:"DELETE",
headers:headers()
});

alert("Topic Deleted");

loadTopics();

}

async function loadCourseDropdown(){

const res = await fetch(API+"/admin/courses",{
headers:headers()
});

const courses = await res.json();

let options = "<option value=''>Select Course</option>";

courses.forEach(c=>{
options += `<option value="${c.id}">${c.name}</option>`;
});

document.getElementById("courseDropdown").innerHTML = options;

}

async function loadSubjectDropdown(course_id){

const res = await fetch(API+"/admin/subjects",{
headers:headers()
});

const subjects = await res.json();

let options = "<option value=''>Select Subject</option>";

subjects
.filter(s => s.course_id == course_id) // 🔥 FILTER
.forEach(s=>{
options += `<option value="${s.id}">${s.name}</option>`;
});

document.getElementById("subjectDropdown").innerHTML = options;

}

function onCourseChange(){

const course_id = document.getElementById("courseDropdown").value;

loadSubjectDropdown(course_id);

}