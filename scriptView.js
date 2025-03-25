document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Silahkan registrasi atau login dahulu");
        window.location.href = "/";
    }
});

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
    
    // Menampilkan Video jika formatnya cocok
    if (["mp4", "webm", "ogg"].includes(arType)) {
        object = document.createElement("a-video");
        object.setAttribute("src", objectUrl);
        object.setAttribute("width", "1");
        object.setAttribute("height", "0.56"); // Default aspect ratio (16:9)
        object.setAttribute("position", "0 1.2 -3");

        if (hasAudio) {
            object.setAttribute("sound", `src: ${objectUrl}; autoplay: true; loop: true`);
        }

        arContent.appendChild(object);
    }
    // Menampilkan Gambar jika formatnya cocok
    else if (["jpg", "jpeg", "png", "gif"].includes(arType)) {
        object = document.createElement("a-image");
        object.setAttribute("src", objectUrl);
        object.setAttribute("width", "1");
        object.setAttribute("height", "1");
        object.setAttribute("position", "0 1.2 -3");

        arContent.appendChild(object);
    }

    // Tombol kembali ke halaman sebelumnya
    document.getElementById("closeButton").addEventListener("click", () => {
        window.location.href = "/camera.html";
    });
});
