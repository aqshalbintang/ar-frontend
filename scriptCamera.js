const apiUrl = "https://ar-backend-production.up.railway.app";

// Simpan stream kamera global agar tidak terputus
let cameraStream = null;

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

// Pastikan akses kamera terlebih dahulu sebelum memuat marker
document.addEventListener("DOMContentLoaded", async function () {
    await checkCameraAccess();
    await loadMarkers();
});

document.getElementById("backButton").addEventListener("click", function () {
    window.location.href = "/dashboard.html";
});