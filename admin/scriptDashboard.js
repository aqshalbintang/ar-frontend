let currentPageImage = 1;
let currentPageVideo = 1;
let currentPageVisitor = 1;
const rowsPerPage = 5;
const rowsPerPageVisitor = 10;
let totalMarker = [];
let totalVisitors = [];
const apiUrl = "https://ar-backend-production.up.railway.app";

let sidebar = document.querySelector(".sidebar");
let toggleBtn = document.querySelector("#btn");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("closed");
    menuBtnChange();
});

// function toggleSubmenu() {
//     let markerMenu = document.querySelector('.marker-menu');
//     markerMenu.classList.toggle('active');
// }

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

function handleResizeSidebar() {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('closed');
    } else {
        sidebar.classList.remove('closed');
    }
}

window.addEventListener('resize', handleResizeSidebar);
window.addEventListener('load', handleResizeSidebar);

async function fetchMarker() {
    try {
        const response = await fetch(`${apiUrl}/api/targets`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        totalMarker = await response.json();
    } catch (error) {
        console.error("Gagal mengambil data:", error);
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
    const prevButtonImage = document.getElementById("prevButtonImage");
    const nextButtonImage = document.getElementById("nextButtonImage");

    imageTableBody.innerHTML = "";

    const imageData = totalMarker.filter(target => target.objectUrl && /\.(png|jpg|jpeg)$/i.test(target.objectUrl));
    const startIndex = (currentPageImage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedImageData = imageData.slice(startIndex, endIndex);

    paginatedImageData.forEach((target, index) => {
        imageTableBody.appendChild(createRow(target, index, false));
    });

    prevButtonImage.disabled = currentPageImage === 1;
    nextButtonImage.disabled = endIndex >= imageData.length;
}

function displayVideoMarkers() {
    const videoTableBody = document.getElementById("table-marker-video");
    const prevButtonVideo = document.getElementById("prevButtonVideo");
    const nextButtonVideo = document.getElementById("nextButtonVideo");

    videoTableBody.innerHTML = "";

    const videoData = totalMarker.filter(target => target.objectUrl && /\.(mp4|webm)$/i.test(target.objectUrl));
    const startIndex = (currentPageVideo - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedVideoData = videoData.slice(startIndex, endIndex);

    paginatedVideoData.forEach((target, index) => {
        videoTableBody.appendChild(createRow(target, index, true));
    });

    prevButtonVideo.disabled = currentPageVideo === 1;
    nextButtonVideo.disabled = endIndex >= videoData.length;
}

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

const searchInputMarker = document.getElementById("search-box-marker");

function searchMarkers() {
    const query = searchInputMarker.value.toLowerCase();
    if (!query) {
        displayMarker();
        return;
    }
    
    const filteredMarkers = totalMarker.filter(marker => 
        marker.title.toLowerCase().includes(query) || 
        marker.description.toLowerCase().includes(query)
    );
    
    displayFilteredMarkers(filteredMarkers);
}

function displayFilteredMarkers(filteredData) {
    const imageTableBody = document.getElementById("table-marker-image");
    const videoTableBody = document.getElementById("table-marker-video");
    
    imageTableBody.innerHTML = "";
    videoTableBody.innerHTML = "";
    
    filteredData.forEach((marker, index) => {
        const row = document.createElement("tr");
        const createdAt = new Date(marker.createdAt);
        const formattedDate = createdAt.toLocaleDateString("id-ID");
        
        let previewElement = marker.objectUrl && /\.(mp4|webm)$/i.test(marker.objectUrl) 
            ? `<video class="preview-img" src="${marker.objectUrl}" controls
                style="width:100px; height:100px; object-fit: cover;"></video>`
            : `<img class="preview-img" src="${marker.objectUrl}" 
                style="width:100px; height:100px; object-fit: cover;">`;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formattedDate}</td>
            <td><strong>Judul:</strong> ${marker.title}</br><strong>Deskripsi:</strong> ${marker.description}</td>
            <td><img src="${marker.markerUrl}" width="100"></td>
            <td>${previewElement || "No preview available"}</td>
            <td>
                <button onclick="downloadFile('${marker.markerUrl}')" class="button-download">
                    <i class='bx bx-download'></i> Download
                </button></br>
                <button onclick="deleteFile('${marker._id}')" class="button-delete">
                    <i class='bx bx-trash-alt'></i> Delete
                </button>
            </td>
        `;
        
        if (marker.objectUrl && /\.(png|jpg|jpeg)$/i.test(marker.objectUrl)) {
            imageTableBody.appendChild(row);
        } else {
            videoTableBody.appendChild(row);
        }
    });
}

searchInputMarker.addEventListener("input", searchMarkers);

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

const prevButtonVisitor = document.getElementById("prevPageVisitor");
const nextButtonVisitor = document.getElementById("nextPageVisitor");

function displayVisitors() {
    const tableBody = document.getElementById("table-visitor");
    tableBody.innerHTML = "";

    const startIndex = (currentPageVisitor - 1) * rowsPerPageVisitor;
    const endIndex = startIndex + rowsPerPageVisitor;
    const paginatedData = totalVisitors.slice(startIndex, endIndex);

    paginatedData.forEach((visitor, index) => {
        const row = document.createElement("tr");

        const createdAt = new Date(visitor.createdAt);
        const formattedDate = createdAt.toLocaleDateString("id-ID");

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

    prevButtonVisitor.disabled = currentPageVisitor === 1;
    nextButtonVisitor.disabled = endIndex >= totalVisitors.length;
}

const searchInputVisitor = document.getElementById("search-box-visitor");

function searchVisitors() {
    const query = searchInputVisitor.value.toLowerCase();
    if (!query) {
        displayVisitors();
        return;
    }
    
    const filteredVisitors = totalVisitors.filter(visitor =>  
        visitor.email.toLowerCase().includes(query)
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
        if (fileSize < 1024 || fileSize > 20480) {
            alert(`File harus berukuran 1MB sampai 20MB. Silakan pilih file lain.`);
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

window.onload = function () {
    fetchMarker();
    fetchVisitor();

    const savedSection = localStorage.getItem("selectedSection");
    if (savedSection) {
        showSection(savedSection);
    } else {
        showSection("generate-marker");
    }
};

function showSection(sectionId) {
    document.querySelectorAll('.card').forEach(section => {
        section.classList.add('hidden');
    });

    document.getElementById(sectionId).classList.remove('hidden');

    localStorage.setItem("selectedSection", sectionId);
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

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("selectedSection");

    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("token")) {
        if (!sessionStorage.getItem("loginChecked")) {
            alert("Anda harus login terlebih dahulu!");
            sessionStorage.setItem("loginChecked", "true");
            window.location.href = "login.html";
        }
    }
});

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
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

async function fetchVisitors() {
    try {
        const response = await fetch(`${apiUrl}/api/totalvisitors`);
        const data = await response.json();
        document.getElementById('visitorCount').innerText = `Total Visitor : ${data.visitors}`;
    } catch (error) {
        console.error('Error fetching visitors:', error);
    }
}

async function fetchMarkerCounts() {
    try {
        const response = await fetch(`${apiUrl}/api/marker-count`);
        const data = await response.json();

        document.getElementById('imageCount').innerText = `Total Image : ${data.imageCount}`;
        document.getElementById('videoCount').innerText = `Total Video : ${data.videoCount}`;
    } catch (error) {
        console.error('Error fetching marker counts:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchMarkerCounts);

fetchVisitors();
fetchMarkerCounts();