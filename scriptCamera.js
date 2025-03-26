document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
        return;
    }

    try {
        const response = await fetch("https://ar-backend-production.up.railway.app/api/targets");
        const targets = await response.json();
        const scene = document.querySelector("a-scene");
        const arContent = document.getElementById("arContent");

        targets.forEach(target => {
            if (target.patternFileUrl && target.objectUrl) {
                const marker = document.createElement("a-marker");
                marker.setAttribute("type", "pattern");
                marker.setAttribute("url", target.patternFileUrl);

                marker.addEventListener("markerFound", () => {
                    loadARContent(target.objectUrl, target.hasAudio);
                });

                scene.appendChild(marker);
            }
        });

    } catch (error) {
        console.error("Gagal mengambil data marker:", error);
    }
});

let videoElement = null;

AFRAME.registerComponent('play-on-click', {
    init: function () {
        this.onClick = this.onClick.bind(this);
    },
    play: function () {
        window.addEventListener('click', this.onClick);
    },
    pause: function () {
        window.removeEventListener('click', this.onClick);
    },
    onClick: function () {
        var videoEl = this.el.getAttribute('material').src;
        if (!videoEl) return;
        this.el.object3D.visible = true;
        videoEl.play().catch(err => console.warn("Autoplay gagal, user harus klik:", err));
    }
});

function loadARContent(objectUrl, hasAudio) {
    const arContent = document.getElementById("arContent");
    const closeButton = document.getElementById("closeButton");
    const backButton = document.getElementById("backButton");
    const overlay = document.getElementById("overlay");

    arContent.innerHTML = "";
    closeButton.style.display = "block";
    backButton.style.display = "none";
    overlay.style.display = "block";

    const arType = objectUrl.split(".").pop().toLowerCase();

    if (["mp4", "webm", "ogg"].includes(arType)) {
        const videoElement = document.createElement("video");
        videoElement.src = objectUrl;
        videoElement.loop = true;
        videoElement.crossOrigin = "anonymous";
        videoElement.playsInline = true;
        videoElement.autoplay = true;
        videoElement.muted = true; // Mulai dengan mute untuk bypass autoplay policy
        videoElement.style.display = "none"; // Sembunyikan elemen video asli

        // Tambahkan video ke DOM sebelum pemutaran
        arContent.appendChild(videoElement);

        videoElement.onloadeddata = () => {
            videoElement.play().then(() => {
                console.log("Video autoplay berhasil");

                // Aktifkan audio setelah video mulai
                if (hasAudio) {
                    setTimeout(() => {
                        videoElement.muted = false;
                        videoElement.volume = 1.0;
                    }, 500);
                }
            }).catch(e => {
                console.warn("Autoplay gagal, meminta user action:", e);
            });

            // Tambahkan video ke AR
            const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            const video = document.createElement("a-video");
            video.setAttribute("src", objectUrl);
            video.setAttribute("width", "1.2");
            video.setAttribute("height", (1.2 / aspectRatio).toFixed(2));
            video.setAttribute("position", "0 0 -1");
            video.setAttribute("look-at", "[camera]");
            video.setAttribute("play-on-click", ""); // Tambahkan komponen play-on-click
            arContent.appendChild(video);
        };

        // Trik tambahan: Sentuhan pertama memaksa video play
        function enableAutoplay() {
            videoElement.play();
            document.removeEventListener("click", enableAutoplay);
            document.removeEventListener("touchstart", enableAutoplay);
        }

        document.addEventListener("click", enableAutoplay);
        document.addEventListener("touchstart", enableAutoplay);
    } else if (["jpg", "jpeg", "png", "gif"].includes(arType)) {
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const image = document.createElement("a-image");
            image.setAttribute("src", objectUrl);
            image.setAttribute("width", "1.2");
            image.setAttribute("height", (1.2 / aspectRatio).toFixed(2));
            image.setAttribute("position", "0 0 -1");
            image.setAttribute("look-at", "[camera]");
            arContent.appendChild(image);
        };
    }
}
document.getElementById("closeButton").addEventListener("click", () => {
    location.reload();
});

document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
});