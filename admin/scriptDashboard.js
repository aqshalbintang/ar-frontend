let currentPageImage = 1;
let currentPageVideo = 1;
let currentPageVisitor = 1;
const rowsPerPage = 5;
const rowsPerPageVisitor = 10;
let totalMarker = [];
let totalVisitors = [];
const apiUrl = "https://ar-backend-production.up.railway.app";

document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.querySelector("#btn");
    const cardContents = document.querySelectorAll(".home-section .card > *:not(h2)");

    if (window.innerWidth <= 768) {
        sidebar.classList.add("closed");
        cardContents.forEach(content => content.classList.remove("hidden"));
    }

    toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("closed");

        if (window.innerWidth <= 768) {
            if (sidebar.classList.contains("closed")) {
                cardContents.forEach(content => content.classList.remove("hidden"));
            } else {
                cardContents.forEach(content => content.classList.add("hidden"));
            }
        } else {
            cardContents.forEach(content => content.classList.remove("hidden"));
        }
    });
});

function toggleSubmenu(event) {
    event.preventDefault();

    let menuItem = event.target.closest(".marker-menu");
    let dropdownIcon = menuItem.querySelector(".dropdown-icon");

    menuItem.classList.toggle("active");

    if (menuItem.classList.contains("active")) {
        dropdownIcon.classList.replace("bx-chevron-down", "bx-minus");
    } else {
        dropdownIcon.classList.replace("bx-minus", "bx-chevron-down");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Token tidak ditemukan, silakan login.");
        window.location.href = "login.html";
        return;
    }

    try {
        let response = await fetch(`${apiUrl}/api/admin/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data.");
        }

    } catch (error) {
        console.error("Error:", error);

        alert("Sesi Anda telah berakhir, silahkan login ulang.");
        localStorage.removeItem("token");
        window.location.href = "/admin/login.html";
    }
})

document.addEventListener("DOMContentLoaded", () => {
    displayMarker();
});

function prevPageImage() {
    if (currentPageImage > 1) {
        currentPageImage--;
        displayImageMarkers();
    }
}

function nextPageImage() {
    currentPageImage++;
    displayImageMarkers();
}

function prevPageVideo() {
    if (currentPageVideo > 1) {
        currentPageVideo--;
        displayVideoMarkers();
    }
}

function nextPageVideo() {
    currentPageVideo++;
    displayVideoMarkers();
}

function createRow(target, index, isVideo) {
    const row = document.createElement("tr");

    const createdAt = new Date(target.createdAt);
    const formattedDate = createdAt.toLocaleDateString("id-ID");

    let previewElement = isVideo
        ? `<video class="preview-img" src="${target.objectUrl}" controls
            style="width:100px; height:100px; object-fit: cover;"></video>`
        : `<img class="preview-img" src="${target.objectUrl}" 
            style="width:100px; height:100px; object-fit: cover;">`;

    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${formattedDate}</td>
        <td><strong>Judul:</strong> ${target.title}</br><strong>Deskripsi:</strong> ${target.description}</td>
        <td><img src="${target.markerUrl}" width="100"></td>
        <td>${previewElement || "No preview available"}</td>
        <td>
            <button onclick="downloadFile('${target.markerUrl}')" class="button-download">
                <i class='bx bx-download'></i> Download
            </button></br>
            <button onclick="deleteFile('${target._id}')" class="button-delete">
                <i class='bx bx-trash-alt'></i> Delete
            </button>
        </td>
    `;
    return row;
}

displayMarker();

const searchInputImage = document.getElementById("search-box-marker-image");
const searchInputVideo = document.getElementById("search-box-marker-video");

function searchImageMarkers() {
    const query = searchInputImage.value.toLowerCase();
    if (!query) {
        displayImageMarkers();
        return;
    }

    const filteredMarkers = totalMarker.filter(marker =>
        marker.objectUrl && /\.(png|jpg|jpeg)$/i.test(marker.objectUrl) &&
        (marker.title.toLowerCase().includes(query) || marker.description.toLowerCase().includes(query))
    );

    displayFilteredImageMarkers(filteredMarkers);
}

function searchVideoMarkers() {
    const query = searchInputVideo.value.toLowerCase();
    if (!query) {
        displayVideoMarkers();
        return;
    }

    const filteredMarkers = totalMarker.filter(marker =>
        marker.objectUrl && /\.(mp4|webm)$/i.test(marker.objectUrl) &&
        (marker.title.toLowerCase().includes(query) || marker.description.toLowerCase().includes(query))
    );

    displayFilteredVideoMarkers(filteredMarkers);
}

function displayFilteredImageMarkers(filteredData) {
    const imageTableBody = document.getElementById("table-marker-image");
    imageTableBody.innerHTML = "";

    filteredData.forEach((marker, index) => {
        imageTableBody.appendChild(createRow(marker, index, false));
    });
}

function displayFilteredVideoMarkers(filteredData) {
    const videoTableBody = document.getElementById("table-marker-video");
    videoTableBody.innerHTML = "";

    filteredData.forEach((marker, index) => {
        videoTableBody.appendChild(createRow(marker, index, true));
    });
}

searchInputImage.addEventListener("input", searchImageMarkers);
searchInputVideo.addEventListener("input", searchVideoMarkers);

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("table-visitor")) {
        fetchVisitor();
    }
    if (document.getElementById("table-marker-image") || document.getElementById("table-marker-video")) {
        fetchMarker();
    }
});

async function fetchVisitor() {
    try {
        const response = await fetch(`${apiUrl}/api/visitors`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        totalVisitors = await response.json();
    } catch (error) {
        console.error("Gagal mengambil data visitor:", error);
        totalVisitors = [];
    }
    displayVisitors();
}

function displayVisitors() {
    const tableBody = document.getElementById("table-visitor");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const startIndex = (currentPageVisitor - 1) * rowsPerPageVisitor;
    const endIndex = startIndex + rowsPerPageVisitor;
    const paginatedData = totalVisitors.slice(startIndex, endIndex);

    paginatedData.forEach((visitor, index) => {
        const row = document.createElement("tr");
        const formattedDate = new Date(visitor.createdAt).toLocaleDateString("id-ID");

        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${formattedDate}</td>
            <td>${visitor.name}</td>
            <td>${visitor.email}</td>
            <td>${visitor.birthDate}</td>
            <td>${visitor.phone}</td>
        `;
        tableBody.appendChild(row);
    });

    const prevButton = document.getElementById("prevPageVisitor");
    const nextButton = document.getElementById("nextPageVisitor");
    if (prevButton && nextButton) {
        prevButton.disabled = currentPageVisitor === 1;
        nextButton.disabled = endIndex >= totalVisitors.length;
    }
}

async function fetchMarker() {
    try {
        const response = await fetch(`${apiUrl}/api/targets`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        totalMarker = await response.json();
    } catch (error) {
        console.error("Gagal mengambil data marker:", error);
        totalMarker = [];
    }
    displayMarker();
}

function displayMarker() {
    displayImageMarkers();
    displayVideoMarkers();
}

function displayImageMarkers() {
    const imageTableBody = document.getElementById("table-marker-image");
    if (!imageTableBody) return;
    imageTableBody.innerHTML = "";

    const imageData = totalMarker.filter(target => target.objectUrl && /\.(png|jpg|jpeg)$/i.test(target.objectUrl));
    const startIndex = (currentPageImage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedImageData = imageData.slice(startIndex, endIndex);

    paginatedImageData.forEach((target, index) => {
        imageTableBody.appendChild(createRow(target, index, false));
    });

    const prevButton = document.getElementById("prevButtonImage");
    const nextButton = document.getElementById("nextButtonImage");
    if (prevButton && nextButton) {
        prevButton.disabled = currentPageImage === 1;
        nextButton.disabled = endIndex >= imageData.length;
    }
}

function displayVideoMarkers() {
    const videoTableBody = document.getElementById("table-marker-video");
    if (!videoTableBody) return;
    videoTableBody.innerHTML = "";

    const videoData = totalMarker.filter(target => target.objectUrl && /\.(mp4|webm)$/i.test(target.objectUrl));
    const startIndex = (currentPageVideo - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedVideoData = videoData.slice(startIndex, endIndex);

    paginatedVideoData.forEach((target, index) => {
        videoTableBody.appendChild(createRow(target, index, true));
    });

    const prevButton = document.getElementById("prevButtonVideo");
    const nextButton = document.getElementById("nextButtonVideo");
    if (prevButton && nextButton) {
        prevButton.disabled = currentPageVideo === 1;
        nextButton.disabled = endIndex >= videoData.length;
    }
}

const prevButtonVisitor = document.getElementById("prevPageVisitor");
const nextButtonVisitor = document.getElementById("nextPageVisitor");

const searchInputVisitor = document.getElementById("search-box-visitor");

function searchVisitors() {
    const query = searchInputVisitor.value.toLowerCase();
    if (!query) {
        displayVisitors();
        return;
    }

    const filteredVisitors = totalVisitors.filter(visitor =>
        visitor.name.toLowerCase().includes(query)
    );

    displayFilteredVisitors(filteredVisitors);
}

function displayFilteredVisitors(filteredData) {
    const tableBody = document.getElementById("table-visitor");
    tableBody.innerHTML = "";

    filteredData.forEach((visitor, index) => {
        const row = document.createElement("tr");
        const createdAt = new Date(visitor.createdAt);
        const formattedDate = createdAt.toLocaleDateString("id-ID");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formattedDate}</td>
            <td>${visitor.name}</td>
            <td>${visitor.email}</td>
            <td>${visitor.birthDate}</td>
            <td>${visitor.phone}</td>
        `;

        tableBody.appendChild(row);
    });
}

searchInputVisitor.addEventListener("input", searchVisitors);

prevButtonVisitor.addEventListener("click", function () {
    if (currentPageVisitor > 1) {
        currentPageVisitor--;
        displayVisitors();
    }
});

nextButtonVisitor.addEventListener("click", function () {
    if (currentPageVisitor * rowsPerPageVisitor < totalVisitors.length) {
        currentPageVisitor++;
        displayVisitors();
    }
});

var innerMarkerURL = null;
var innerObjectURL = null;
var fullMarkerURL = null;
var imageName = null;

document.querySelector('#buttonSubmit').addEventListener('click', async function () {
    const markerInput = document.querySelector('#fileinputMarker');
    const objectInput = document.querySelector('#fileinputObject');
    const titleInput = document.querySelector('#titleInput').value.trim();
    const descriptionInput = document.querySelector('#descriptionInput').value.trim();

    if (!markerInput.files[0] || !objectInput.files[0]) {
        alert('Silahkan generate QR dan upload object');
        return;
    }

    if (!titleInput || !descriptionInput) {
        alert('Silahkan isi judul dan deskripsi object');
        return;
    }

    const markerFile = markerInput.files[0];
    const objectFile = objectInput.files[0];

    const imageName = markerFile.name.replace(/\.[^/.]+$/, "");
    const reader = new FileReader();

    reader.onload = async function (event) {
        const innerMarkerURL = event.target.result;

        THREEx.ArPatternFile.buildFullMarker(innerMarkerURL, 0.5, 400, "black", async function onComplete(markerUrl) {
            THREEx.ArPatternFile.encodeImageURL(innerMarkerURL, async function onComplete(patternFileString) {
                const formData = new FormData();

                const markerBlob = await fetch(markerUrl).then(res => res.blob());
                formData.append("marker", markerBlob, imageName + ".png");

                const patternBlob = new Blob([patternFileString], { type: 'text/plain' });
                formData.append("patternFile", patternBlob, "pattern-" + imageName + ".patt");
                formData.append("object", objectFile);
                formData.append("title", titleInput);
                formData.append("description", descriptionInput);

                for (const pair of formData.entries()) {
                    console.log(pair[0], pair[1]);
                }

                try {
                    const uploadResponse = await fetch(`${apiUrl}/api/upload`, {
                        method: "POST",
                        body: formData
                    });
                    const result = await uploadResponse.json();

                    if (result.success) {
                        console.log("Files and data saved to database:", result);

                        var domElement = window.document.createElement('a');
                        domElement.href = markerUrl;
                        domElement.download = (imageName || 'marker') + '.png';
                        document.body.appendChild(domElement);
                        domElement.click();
                        document.body.removeChild(domElement);

                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                    } else {
                        alert("Failed to save files and data to the database.");
                    }
                } catch (error) {
                    console.error("Error uploading files:", error);
                }
            });
        });
    };
    reader.readAsDataURL(markerFile);
});

document.querySelector('#fileinputMarker').addEventListener('change', function () {
    var file = this.files[0];
    imageName = file.name;

    imageName = imageName.substring(0, imageName.lastIndexOf('.')) || imageName;

    var reader = new FileReader();
    reader.onload = function (event) {
        innerMarkerURL = event.target.result;
        updateFullMarkerImage();
    };
    reader.readAsDataURL(file);
});

function generateQR() {
    document.getElementById("qrcode").innerHTML = "";
    let barcodeId = Math.floor(Math.random() * 1023) + 1;

    new QRCode(document.getElementById("qrcode"), {
        text: barcodeId.toString(),
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.H
    });
    setTimeout(() => {
        let qrCanvas = document.querySelector("#qrcode canvas");
        if (qrCanvas) {
            qrCanvas.toBlob(blob => {
                let file = new File([blob], "qrcode.png", { type: "image/png" });
                let dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                document.getElementById('fileinputMarker').files = dataTransfer.files;
                document.getElementById('fileinputMarker').dispatchEvent(new Event('change'));
            }, "image/png");
        }
    }, 500);
}

function updateFullMarkerImage() {
    var patternRatio = 0.5;
    var imageSize = 400;
    var borderColor = "black";

    THREEx.ArPatternFile.buildFullMarker(innerMarkerURL, patternRatio, imageSize, borderColor, function onComplete(markerUrl) {
        fullMarkerURL = markerUrl;

        var fullMarkerImage = document.createElement('img');
        fullMarkerImage.src = fullMarkerURL;

        var container = document.querySelector('#markerContainer');
        while (container.firstChild) container.removeChild(container.firstChild);
        container.appendChild(fullMarkerImage);
    });
}

document.getElementById('fileinputObject').addEventListener('change', function (event) {
    const files = event.target.files;
    const objectContainer = document.querySelector('#objectContainer');
    objectContainer.innerHTML = '';

    for (const file of files) {
        const fileSize = file.size / 1024;
        if (fileSize < 500 || fileSize > 20480) {
            alert(`File harus berukuran minimal 500kb sampai 20MB. Silakan pilih file lain.`);
            event.target.value = '';
            objectContainer.innerHTML = '';
            return;
        }

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '256px';
                img.style.maxHeight = '256px';
                objectContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.controls = true;
            video.style.maxWidth = '256px';
            video.style.maxHeight = '256px';
            video.src = URL.createObjectURL(file);
            objectContainer.appendChild(video);
        }
    }
});

function updateObjectPreview() {
    var objectContainer = document.querySelector('#objectContainer');
    objectContainer.innerHTML = '';

    var videoElement = document.createElement('video');
    videoElement.src = innerObjectURL;
    videoElement.controls = true;
    videoElement.style.maxWidth = '400px';
    videoElement.style.maxHeight = '400px';

    objectContainer.appendChild(videoElement);
}

document.addEventListener("DOMContentLoaded", function () {
    fetchMarker();
    fetchVisitor();

    const savedSection = localStorage.getItem("selectedSection");
    if (savedSection) {
        showSection(savedSection, false);
    } else {
        showSection("dashboard-admin", true);
    }
});

function showSection(sectionId, save = true) {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');

    if (save) {
        localStorage.setItem("selectedSection", sectionId);
    }
}

function downloadFile(fileUrl) {
    fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileUrl.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error("Gagal mengunduh file:", error));
}

async function deleteFile(fileId) {
    const isConfirmed = confirm("Apakah Anda yakin ingin menghapus file ini?");
    if (!isConfirmed) return;

    try {
        const response = await fetch(`${apiUrl}/api/targets/${fileId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log("File deleted successfully");

        location.reload();
    } catch (error) {
        console.error("Failed to delete file:", error);
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', function () {
    async function fetchVisitors() {
        try {
            let visitorElement = document.getElementById('visitorCount');

            const response = await fetch(`${apiUrl}/api/totalvisitors`);
            const data = await response.json();

            visitorElement.innerText = `Total Visitor : ${data.visitors}`;
        } catch (error) {
            console.error('Error fetching visitors:', error);
        }
    }

    async function fetchMarkerCounts() {
        try {
            let imageElement = document.getElementById('imageCount');
            let videoElement = document.getElementById('videoCount');

            const response = await fetch(`${apiUrl}/api/marker-count`);
            const data = await response.json();

            imageElement.innerText = `Total Image : ${data.imageCount}`;
            videoElement.innerText = `Total Video : ${data.videoCount}`;
        } catch (error) {
            console.error('Error fetching marker counts:', error);
        }
    }

    fetchVisitors();
    fetchMarkerCounts();
});