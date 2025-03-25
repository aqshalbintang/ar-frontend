const apiUrl = "https://ar-backend-production.up.railway.app";

// Fungsi untuk meminta akses kamera jika belum diberikan
async function requestCameraAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        localStorage.setItem("cameraAccess", "granted");
        return stream;
    } catch (error) {
        console.error("Akses kamera ditolak:", error);
        localStorage.setItem("cameraAccess", "denied");
    }
}

// Mengecek status kamera saat halaman dimuat
async function checkCameraAccess() {
    const cameraAccess = localStorage.getItem("cameraAccess");
    if (cameraAccess !== "granted") {
        await requestCameraAccess();
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
    }

    await checkCameraAccess(); // Pastikan akses kamera tetap ada
});

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

document.addEventListener("DOMContentLoaded", loadMarkers);

document.getElementById("backButton").addEventListener("click", function () {
    window.location.href = "/dashboard.html";
});