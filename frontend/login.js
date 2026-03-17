const API = "http://127.0.0.1:5000"

function login(){

const email = document.getElementById("loginEmail").value
const password = document.getElementById("loginPassword").value

fetch(API + "/auth/login", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
email: email,
password: password
})
})
.then(res => res.json())
.then(data => {

localStorage.setItem("token", data.token)

if(data.role === "admin"){
window.location = "admin.html"
}else{
window.location = "student.html"
}

})
.catch(err => console.log(err))

}


function register(){

const email = document.getElementById("registerEmail").value
const password = document.getElementById("registerPassword").value
const role = document.getElementById("role").value

fetch(API + "/auth/register", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
email: email,
password: password,
role: role
})
})
.then(res => res.json())
.then(data => {
alert("Registration successful. You can now login.")
})
.catch(err => console.log(err))

}
