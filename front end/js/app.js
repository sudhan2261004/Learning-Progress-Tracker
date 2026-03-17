const API="http://localhost:5000"

async function register(){

const email=document.getElementById("email").value
const password=document.getElementById("password").value

const res=await fetch(API+"/auth/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({email,password})

})

alert("Registered")

window.location="login.html"

}


async function login(){

const email=document.getElementById("email").value
const password=document.getElementById("password").value

const res=await fetch(API+"/auth/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({email,password})

})

const data=await res.json()

localStorage.setItem("token",data.token)

window.location="index.html"

}



function logout(){

localStorage.removeItem("token")

window.location="login.html"

}



async function addSubject(){

const name=document.getElementById("subjectName").value
const description=document.getElementById("subjectDesc").value

const token=localStorage.getItem("token")

await fetch(API+"/subjects",{

method:"POST",

headers:{

"Content-Type":"application/json",
"Authorization":token

},

body:JSON.stringify({name,description})

})

loadSubjects()

}



async function loadSubjects(){

const token=localStorage.getItem("token")

const res=await fetch(API+"/subjects",{

headers:{

"Authorization":token

}

})

const subjects=await res.json()

const container=document.getElementById("subjects")

container.innerHTML=""

subjects.forEach(s=>{

container.innerHTML+=`

<div class="subject">

<b>${s.name}</b>

<p>${s.description}</p>

</div>

`

})

}


if(document.getElementById("subjects")){

loadSubjects()

}