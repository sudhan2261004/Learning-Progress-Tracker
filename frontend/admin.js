const API="http://127.0.0.1:5000"

const token=localStorage.getItem("token")

function createCourse(){

const name=document.getElementById("courseName").value
const description=document.getElementById("courseDesc").value

fetch(API+"/admin/courses",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body:JSON.stringify({
name:name,
description:description
})

})

.then(res=>res.json())

.then(data=>alert(JSON.stringify(data)))

}


function createSubject(){

const name=document.getElementById("subjectName").value
const description=document.getElementById("subjectDesc").value
const course_id=document.getElementById("courseId").value

fetch(API+"/admin/subjects",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body:JSON.stringify({
name:name,
description:description,
course_id:course_id
})

})

.then(res=>res.json())

.then(data=>alert(JSON.stringify(data)))

}


function createTopic(){

const title=document.getElementById("topicTitle").value
const subject_id=document.getElementById("subjectId").value

fetch(API+"/admin/topics",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body:JSON.stringify({
title:title,
subject_id:subject_id
})

})

.then(res=>res.json())

.then(data=>alert(JSON.stringify(data)))

}
