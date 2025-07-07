document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
        return;
    }

    let arActive = false;

    const scene = document.querySelector("a-scene");
    if (!scene) {
        console.error("Elemen <a-scene> tidak ditemukan! Pastikan ada dalam HTML.");
        return;
    }

    try {
        const response = await fetch("https://ar-backend-production.up.railway.app/api/targets");
        const targets = await response.json();

        if (!targets || !Array.isArray(targets) || targets.length === 0) {
            console.error("Data marker kosong atau tidak valid:", targets);
            return;
        }

        targets.forEach(target => {
            if (target.patternFileUrl && target.objectUrl) {
                const marker = document.createElement("a-marker");
                marker.setAttribute("type", "pattern");
                marker.setAttribute("url", target.patternFileUrl);

                marker.addEventListener("markerFound", () => {
                    if (arActive) return;

                    arActive = true;

                    loadARContent(
                        target.objectUrl,
                        target.hasAudio,
                        target.title,
                        target.description,
                        () => { }
                    );
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
        var videoEl = document.querySelector("video");
        if (!videoEl) return;
        this.el.object3D.visible = true;
        videoEl.play().catch(err => console.warn("Autoplay gagal, user harus klik:", err));
    }
});

function loadARContent(objectUrl, hasAudio, title, description, onDone) {
    const arContent = document.getElementById("arContent");
    const closeButton = document.getElementById("closeButton");
    const backButton = document.getElementById("backButton");
    const overlay = document.getElementById("overlay");

    arContent.innerHTML = "";
    closeButton.style.display = "block";
    backButton.style.display = "none";
    overlay.style.display = "block";

    const arType = objectUrl.split(".").pop().toLowerCase();

    const titleText = document.createElement("a-text");
    titleText.setAttribute("value", "Judul : " + (title || "Judul"));
    titleText.setAttribute("position", "0 0.6 -1");
    titleText.setAttribute("align", "center");
    titleText.setAttribute("width", "1");
    arContent.appendChild(titleText);

    const descText = document.createElement("a-text");
    descText.setAttribute("value", "Deskripsi : " + (description || "Deskripsi"));
    descText.setAttribute("position", "0 0.5 -1");
    descText.setAttribute("align", "center");
    descText.setAttribute("width", "0.8");
    arContent.appendChild(descText);

    if (["mp4", "webm", "ogg"].includes(arType)) {
        const videoElement = document.createElement("video");
        videoElement.src = objectUrl;
        videoElement.loop = true;
        videoElement.crossOrigin = "anonymous";
        videoElement.playsInline = true;
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.style.display = "none";

        arContent.appendChild(videoElement);

        videoElement.onloadeddata = () => {
            videoElement.play().then(() => {
                console.log("Video autoplay berhasil");

                if (hasAudio) {
                    setTimeout(() => {
                        videoElement.muted = false;
                        videoElement.volume = 1.0;
                    }, 500);
                }
            }).catch(e => {
                console.warn("Autoplay gagal, meminta user action:", e);
            });

            const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
            const video = document.createElement("a-video");
            video.setAttribute("src", objectUrl);
            video.setAttribute("width", "1");
            video.setAttribute("height", (1 / aspectRatio).toFixed(2));
            video.setAttribute("position", "0 -0.2 -1");
            video.setAttribute("play-on-click", "");
            arContent.appendChild(video);
        };

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
            image.setAttribute("width", "1");
            image.setAttribute("height", (1 / aspectRatio).toFixed(2));
            image.setAttribute("position", "0 -0.2 -1");
            arContent.appendChild(image);
        };
    }
    if (typeof onDone === "function") {
        onDone();
    }
}

document.getElementById("closeButton").addEventListener("click", () => {
    arActive = false;
    location.reload();
});

document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "/dashboard.html";
});