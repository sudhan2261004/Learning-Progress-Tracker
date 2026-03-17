async function login(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch("http://localhost:5000/auth/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({email,password})
});

const data = await res.json();


// ❌ Login failed
if(res.status !== 200){
alert(data.error || "Login failed. Please check email or password.");
return;
}


// ✅ Login success
localStorage.setItem("token",data.token);
localStorage.setItem("role",data.role);

alert("Login successful");


if(data.role === "admin"){
window.location="admin.html";
}else{
window.location="student.html";
}

}