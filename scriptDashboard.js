document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");

    if (!token && window.location.pathname !== "/") {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
    }
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/';
});

document.getElementById('kameraBtn').addEventListener('click', function() {
    window.location.href = '/camera.html';
});