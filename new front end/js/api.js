const BASE_URL = "http://localhost:5000";

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