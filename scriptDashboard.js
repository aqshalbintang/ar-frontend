const apiUrl = "http://localhost:8080";

document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/';
});

document.getElementById('kameraBtn').addEventListener('click', function() {
    window.location.href = '/camera.html';
});

const formatBirthDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    
    return `${day}-${month}-${year}`;
};

async function fetchData() {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
        return;
    }

    try {
        let response = await fetch(`${apiUrl}/api/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data.");
        }

        let user = await response.json();

        let container = document.getElementById("dataContainer");
        container.innerHTML = `
            <div class="profile-item"><span class="profile-label">Nama :</span><span class="profile-value">${user.name}</span></div>
            <div class="profile-item"><span class="profile-label">Email :</span><span class="profile-value">${user.email}</span></div>
            <div class="profile-item"><span class="profile-label">Tanggal Lahir :</span><span class="profile-value">${formatBirthDate(user.birthDate)}</span></div>
            <div class="profile-item"><span class="profile-label">No HP :</span><span class="profile-value">${user.phone}</span></div>
        `;

    } catch (error) {
        console.error("Error:", error);

        alert("Sesi Anda telah berakhir, silahkan login ulang.");
        localStorage.removeItem("token");
        window.location.href = "/";
    }
}

document.addEventListener("DOMContentLoaded", fetchData);