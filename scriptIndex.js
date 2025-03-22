const apiUrl = "https://ar-backend-production.up.railway.app";

particlesJS('particles-js', {
    particles: {
        number: {
            value: 150,
            density: {
                enable: true,
                value_area: 1000
            }
        },
        color: {
            value: "#ffffff"
        },
        shape: {
            type: "circle",
            stroke: {
                width: 0,
                color: "#000000"
            },
            polygon: {
                nb_sides: 5
            }
        },
        opacity: {
            value: 0.5,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.1,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: "window",
        events: {
            onhover: {
                enable: false,
                mode: "repulse"
            },
            onclick: {
                enable: false,
                mode: "push"
            },
            resize: true
        }
    },
    retina_detect: true
});

async function fetchVisitors() {
    try {
        const response = await fetch(`${apiUrl}/api/totalvisitors`);
        const data = await response.json();
        document.getElementById('visitorCount').innerText = data.visitors;
    } catch (error) {
        console.error('Error fetching visitors:', error);
    }
}

async function fetchMarkers() {
    try {
        const response = await fetch(`${apiUrl}/api/totalmarkers`);
        const data = await response.json();
        document.getElementById('markerCount').innerText = data.markers;
    } catch (error) {
        console.error('Error fetching markers:', error);
    }
}

fetchVisitors();
fetchMarkers();

document.getElementById("formRegistrasi").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("userFormLogin").style.display = "none";
    document.getElementById("userFormRegistrasi").style.display = "flex";
});

document.getElementById("openMoreFormRegistrasi").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("userFormRegistrasi").style.display = "flex";
    document.getElementById("userFormLogin").style.display = "none";
});

document.getElementById("closeModalRegistrasi").addEventListener("click", function() {
    document.getElementById("userFormRegistrasi").style.display = "none";
});

document.getElementById("formLogin").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("userFormRegistrasi").style.display = "none";
    document.getElementById("userFormLogin").style.display = "flex";
});

document.getElementById("closeModalLogin").addEventListener("click", function() {
    document.getElementById("userFormLogin").style.display = "none";
});

document.getElementById("submitFormRegistrasi").addEventListener("click", function() {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let birthDate = document.getElementById("birthDate").value.trim();
    let phone = document.getElementById("phone").value.trim();

    let errors = [];

    if (name === "" || name.length < 4) {
        errors.push("Nama harus diisi dan minimal 3 karakter.");
    }

    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        errors.push("Format email tidak valid.");
    }

    if (birthDate === "") {
        errors.push("Tanggal lahir harus diisi.");
    } else {
        let birthDateObj = new Date(birthDate);
        let today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        if (age < 10) {
            errors.push("Usia minimal harus 10 tahun.");
        }
    }

    let phonePattern = /^[0-9]{10,15}$/;
    if (!phonePattern.test(phone)) {
        errors.push("Nomor telepon harus terdiri dari 10 hingga 15 digit angka.");
    }

    if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
    }

    fetch("http://localhost:8080/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, birthDate, phone })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Gagal mengirim data");
        }
        return response.json();
    })
    .then(data => {
        console.log("Registrasi berhasil:", data);
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard.html";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Terjadi kesalahan. Silakan coba lagi.");
    });
});

document.getElementById("submitFormLogin").addEventListener("click", function(event) {
    event.preventDefault();

    let email = document.getElementById("emailLogin").value.trim();
    let errors = [];

    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        errors.push("Format email tidak valid.");
    }

    if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
    }

    fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Login gagal. Periksa kembali email Anda.");
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard.html";
        } else {
            throw new Error("Token tidak ditemukan dalam respons.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert(error.message);
    });
});

document.getElementById("formRegistrasi").addEventListener("click", function () {
    if (localStorage.getItem("token")) {
        window.location.href = "/dashboard.html";
    }
});

const text = "AR Platform";
let index = 0;

function typeEffect() {
  const typingText = document.getElementById("typing-text");
  if (index < text.length) {
    typingText.innerHTML += text.charAt(index);
    index++;
    setTimeout(typeEffect, 200);
  } else {
    setTimeout(() => {
      typingText.innerHTML = "";
      index = 0;
      typeEffect();
    }, 5000);
  }
}



document.addEventListener("DOMContentLoaded", () => {
  typeEffect();
});


typeEffect();

document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.querySelector(".login-btn");
    
    if (loginBtn) {
        loginBtn.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "/admin/login.html";
        });
    }
});

document.querySelectorAll(".faq-container button").forEach(button => {
    button.addEventListener("click", () => {
        const parent = button.parentElement;
        const allItems = document.querySelectorAll(".faq-container div");

        allItems.forEach(item => {
            if (item !== parent) {
                item.classList.remove("active");
            }
        });

        parent.classList.toggle("active");
    });
});


function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    const menuToggle = document.querySelector('.menu-toggle');

    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('open');
}

document.querySelectorAll('#nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('nav-links').classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('open');
    });
});

document.addEventListener("DOMContentLoaded", function() {
    function revealOnScroll() {
        let steps = document.querySelectorAll(".step");
        let windowHeight = window.innerHeight;
        
        steps.forEach((step, index) => {
            let position = step.getBoundingClientRect().top;
            if (position < windowHeight * 0.85) {
                step.style.animation = `slide-up 0.2s ease-out ${index * 0.3}s forwards`;
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();
});