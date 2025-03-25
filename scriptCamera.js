const apiUrl = "https://ar-backend-production.up.railway.app";

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
        return;
    }

    try {
        // Minta akses kamera hanya sekali
        await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Akses kamera diberikan.");
    } catch (error) {
        console.error("Izin kamera ditolak:", error);
        return;
    }

    loadMarkers();
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
                    localStorage.setItem("arHasAudio", target.hasAudio ? "true" : "false");

                    window.location.href = "/view.html";
                });

                scene.appendChild(marker);
            }
        });

    } catch (error) {
        console.error("Gagal mengambil data marker:", error);
    }
}

document.getElementById("backButton").addEventListener("click", function () {
    window.location.href = "/dashboard.html";
});
