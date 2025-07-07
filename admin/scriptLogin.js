const apiUrl = "http://localhost:8080";

window.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem("token");
    if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.role === "admin") {
            window.location.href = "/admin/dashboard.html";
        }
    }
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error("Login gagal! Periksa kembali username dan password.");
        }

        const result = await response.json();
        if (result.token) {
            localStorage.setItem("token", result.token);
            window.location.href = "dashboard.html";
        } else {
            alert("Login gagal! Periksa kembali username dan password.");
        }
    } catch (error) {
        alert(error.message);
    }
});