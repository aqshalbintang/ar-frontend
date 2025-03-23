const apiUrl = "https://ar-backend-production.up.railway.app";

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
    }
});

document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("cameraAccess")) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                console.log("Akses kamera diberikan");
                localStorage.setItem("cameraAccess", "granted");
            })
            .catch(error => {
                console.error("Akses kamera ditolak:", error);
            });
    } else {
        console.log("Akses kamera sudah diberikan sebelumnya.");
    }
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