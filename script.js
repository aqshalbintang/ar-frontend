const apiUrl = "https://ar-backend-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    loadPage('camera');
});

function loadPage(page) {
    const app = document.getElementById('app');
    if (page === 'camera') {
        app.innerHTML = `
            <a-scene embedded arjs="sourceType: webcam; debugUIEnabled: false" vr-mode-ui="enabled: false">
                <a-marker preset="custom"></a-marker>
            </a-scene>
            <a-entity camera></a-entity>
            <button id="backButton">Back</button>
        `;
        document.getElementById("backButton").addEventListener("click", () => {
            loadPage('dashboard');
        });
        loadMarkers();
    } else if (page === 'view') {
        app.innerHTML = `
            <div id="overlay"></div>
            <a-scene embedded arjs="debugUIEnabled: false" vr-mode-ui="enabled: false">
                <a-marker-camera preset="custom"></a-marker-camera>
                <a-entity id="arContent"></a-entity>
                <a-light type="directional" intensity="0.8" position="1 1 1"></a-light>
            </a-scene>
            <button id="closeButton">Close</button>
        `;
        document.getElementById("closeButton").addEventListener("click", () => {
            loadPage('camera');
        });
        loadARContent();
    }
}

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
                    loadPage('view');
                });

                scene.appendChild(marker);
            }
        });

    } catch (error) {
        console.error("Gagal mengambil data marker:", error);
    }
}

async function loadARContent() {
    const arContent = document.getElementById("arContent");
    const objectUrl = localStorage.getItem("arObjectUrl");
    const arType = localStorage.getItem("arType");
    const hasAudio = localStorage.getItem("arHasAudio") === "true";

    if (!objectUrl || !arType) {
        console.error("Data AR tidak ditemukan!");
        return;
    }

    let object;
    let video;

    if (["mp4", "webm", "ogg"].includes(arType)) {
        video = document.createElement("video");
        video.src = objectUrl;
        video.loop = true;
        video.crossOrigin = "anonymous";
        video.muted = !hasAudio;
        video.autoplay = !hasAudio;

        video.onloadedmetadata = () => {
            const aspectRatio = video.videoWidth / video.videoHeight;
            object = document.createElement("a-video");
            object.setAttribute("src", objectUrl);
            object.setAttribute("width", "1");
            object.setAttribute("height", (1 / aspectRatio).toFixed(2));
            object.setAttribute("position", "0 1.2 -3");
            arContent.appendChild(object);

            if (hasAudio) {
                video.play().catch(() => {
                    console.warn("Autoplay dengan suara diblokir. Klik layar untuk memutar.");
                });
            }
        };

        document.body.addEventListener("click", () => {
            if (hasAudio && video.paused) {
                video.play();
            }
        });
    } else if (["jpg", "jpeg", "png", "gif"].includes(arType)) {
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            object = document.createElement("a-image");
            object.setAttribute("src", objectUrl);
            object.setAttribute("width", "1");
            object.setAttribute("height", (1 / aspectRatio).toFixed(2));
            object.setAttribute("position", "0 1.2 -3");
            arContent.appendChild(object);
        };
    }
}