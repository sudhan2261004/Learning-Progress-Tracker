const API="http://127.0.0.1:5000"
const token=localStorage.getItem("token")

// ---------------- LOAD COURSES ----------------

function loadCourses(){

fetch(API+"/student/courses")
.then(res=>res.json())
.then(data=>{

let html=""

data.forEach(course=>{

html+=`
<div>
<h3>${course.name}</h3>
<p>${course.description}</p>
<button onclick="enrollCourse(${course.id})">Enroll</button>
<button onclick="loadSubjects(${course.id})">View Subjects</button>
</div>
`

})

document.getElementById("courses").innerHTML=html

})
}


// ---------------- ENROLL ----------------

function enrollCourse(course_id){

fetch(API+"/student/enroll",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body:JSON.stringify({
course_id:course_id
})

})
.then(res=>res.json())
.then(data=>alert(data.message))

}


// ---------------- SUBJECTS ----------------

function loadSubjects(course_id){

fetch(API+"/student/subjects/"+course_id,{
headers:{
"Authorization":"Bearer "+token
}
})
.then(res=>res.json())
.then(data=>{

let html=""

data.forEach(subject=>{

html+=`
<button onclick="loadTopics(${subject.id})">
${subject.name}
</button><br>
`

})

document.getElementById("subjects").innerHTML=html

})
}
