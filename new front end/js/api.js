const BASE_URL = "https://learning-progress-tracker-gova-backend.onrender.com";

function getToken() {
    return localStorage.getItem("token");
}

async function apiRequest(url, method="GET", data=null) {

    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        }
    };

    if(data){
        options.body = JSON.stringify(data);
    }

    const res = await fetch(BASE_URL + url, options);

    return res.json();
}