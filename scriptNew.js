const apiUrl = "https://ar-backend-production.up.railway.app";

// Simpan stream kamera global agar tidak terputus
let cameraStream = null;

// Fungsi Logout
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("cameraAccess");
    window.location.href = "/";
});

// Navigasi ke kamera
document.getElementById("kameraBtn").addEventListener("click", function () {
    window.location.href = "/camera.html";
});

// Navigasi ke dashboard
// document.getElementById("backButton").addEventListener("click", function () {
//     window.location.href = "/dashboard.html";
// });

// Format tanggal lahir
const formatBirthDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
};

// Fungsi untuk mengambil data user
async function fetchData() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Anda belum login!");
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
            throw new Error("Gagal mengambil data");
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
    }
}

// Fungsi untuk mengecek atau meminta akses kamera
async function checkCameraAccess() {
    const cameraAccess = localStorage.getItem("cameraAccess");

    if (cameraAccess === "granted" && cameraStream) {
        console.log("Akses kamera sudah diberikan dan stream aktif.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        localStorage.setItem("cameraAccess", "granted");
        cameraStream = stream; // Simpan stream agar tidak terputus
        console.log("Akses kamera berhasil:", stream.getVideoTracks());
    } catch (error) {
        console.error("Akses kamera ditolak:", error);
        localStorage.setItem("cameraAccess", "denied");
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
                    window.location.href = "/view.html";
                });

                scene.appendChild(marker);
            }
        });

    } catch (error) {
        console.error("Gagal mengambil data marker:", error);
    }
}

// Jalankan semua fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", async function () {
    await fetchData();      // Ambil data user
    await checkCameraAccess(); // Periksa akses kamera
    await loadMarkers();    // Muat marker untuk AR
});
