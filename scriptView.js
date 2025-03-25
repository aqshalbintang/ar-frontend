document.addEventListener("DOMContentLoaded", () => {
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

        if (hasAudio) {
            video.muted = false;
            video.controls = true;
        } else {
            video.muted = true;
            video.autoplay = true;
        }

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

    document.getElementById("closeButton").addEventListener("click", () => {
        window.location.href = "/camera.html";
    });
});
