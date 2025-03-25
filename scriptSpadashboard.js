const apiUrl = "https://ar-backend-production.up.railway.app";

// Elemen halaman
const dashboardPage = document.getElementById("dashboardPage");
const cameraPage = document.getElementById("cameraPage");
const viewPage = document.getElementById("viewPage");

// Tombol Navigasi
const logoutBtn = document.getElementById("logoutBtn");
const kameraBtn = document.getElementById("kameraBtn");
const backButton = document.getElementById("backButton");

// Simpan stream kamera global agar tidak terputus
let cameraStream = null;

// Fungsi untuk memformat tanggal lahir
const formatBirthDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    
    return `${day}-${month}-${year}`;
};

// Fungsi untuk mengecek atau meminta akses kamera
async function checkCameraAccess() {
    if (cameraStream) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        localStorage.setItem("cameraAccess", "granted");
        cameraStream = stream;
        console.log("Akses kamera berhasil:", stream.getVideoTracks());
    } catch (error) {
        console.error("Akses kamera ditolak:", error);
        localStorage.setItem("cameraAccess", "denied");
    }
}

// Fungsi untuk mengambil data pengguna
async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Anda belum login!");
        navigateTo("dashboard");
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
            throw new Error("Gagal mengambil data");
        }

        let user = await response.json();

        document.getElementById("dataContainer").innerHTML = `
            <div class="profile-item"><span class="profile-label">Nama :</span><span class="profile-value">${user.name}</span></div>
            <div class="profile-item"><span class="profile-label">Email :</span><span class="profile-value">${user.email}</span></div>
            <div class="profile-item"><span class="profile-label">Tanggal Lahir :</span><span class="profile-value">${formatBirthDate(user.birthDate)}</span></div>
            <div class="profile-item"><span class="profile-label">No HP :</span><span class="profile-value">${user.phone}</span></div>
        `;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Fungsi untuk memuat marker ke dalam AR scene
async function loadMarkers() {
    try {
        const response = await fetch(`${apiUrl}/api/targets`);
        const targets = await response.json();
        const scene = document.querySelector("a-scene");

        targets.forEach(target => {
            if (target.patternFileUrl && target.objectUrl) {
                const marker = document.createElement("a-marker");
                marker.setAttribute("type", "pattern");
                marker.setAttribute("url", target.patternFileUrl);

                marker.addEventListener("markerFound", () => {
                    localStorage.setItem("arObjectUrl", target.objectUrl);
                    localStorage.setItem("arType", target.objectUrl.split(".").pop().toLowerCase());
                    navigateTo("view");
                });

                scene.appendChild(marker);
            }
        });

    } catch (error) {
        console.error("Gagal mengambil data marker:", error);
    }
}

// Fungsi navigasi SPA
function navigateTo(page) {
    dashboardPage.style.display = "none";
    cameraPage.style.display = "none";
    viewPage.style.display = "none";

    if (page === "dashboard") {
        dashboardPage.style.display = "block";
        fetchData();
    } else if (page === "camera") {
        cameraPage.style.display = "block";
        checkCameraAccess().then(loadMarkers);
    } else if (page === "view") {
        viewPage.style.display = "block";
    }

    localStorage.setItem("currentPage", page);
}

// Event Listener untuk tombol
logoutBtn.addEventListener("click", function() {
    localStorage.removeItem("token");
    localStorage.removeItem("cameraAccess");
    alert("Anda telah logout.");
    navigateTo("dashboard");
});

kameraBtn.addEventListener("click", function() {
    navigateTo("camera");
});

backButton.addEventListener("click", function() {
    navigateTo("dashboard");
});

// Saat halaman dimuat, cek halaman terakhir yang dibuka
document.addEventListener("DOMContentLoaded", function () {
    const lastPage = localStorage.getItem("currentPage") || "dashboard";
    navigateTo(lastPage);
});
