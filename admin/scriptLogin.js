const apiUrl = "https://ar-frontend-six.vercel.app";

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
            localStorage.setItem("authToken", result.token);
            window.location.href = "dashboard.html";
        } else {
            alert("Login gagal! Periksa kembali username dan password.");
        }
    } catch (error) {
        alert(error.message);
    }
});