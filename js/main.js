/* =========================================
   1. LÓGICA DEL MENÚ Y HEADER
   ========================================= */
const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');

function actualizarHeader() {
    // Usar requestAnimationFrame para evitar layout thrashing
    window.requestAnimationFrame(() => {
        const menuAbierto = navList && navList.classList.contains('nav__list--visible');
        const usuarioHizoScroll = window.scrollY > 50;

        if (menuAbierto || usuarioHizoScroll) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });
}

// Evento Scroll optimizado pasivo
window.addEventListener('scroll', actualizarHeader, { passive: true });

// Evento Menú
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navList.classList.toggle('nav__list--visible');
        actualizarHeader();
        if (navList.classList.contains('nav__list--visible')) {
            navToggle.setAttribute('aria-label', 'Cerrar menú');
        } else {
            navToggle.setAttribute('aria-label', 'Abrir menú');
        }
    });
}

/* =========================================
   2. CERRAR MENÚ AL HACER CLIC EN UN ENLACE
   ========================================= */
const links = document.querySelectorAll('.nav__link');
links.forEach(link => {
    link.addEventListener('click', () => {
        if(navList) navList.classList.remove('nav__list--visible');
        if(navToggle) navToggle.setAttribute('aria-label', 'Abrir menú');
        actualizarHeader();
    });
});

/* =========================================
   3. ANIMACIÓN AL HACER SCROLL (Intersection Observer)
   ========================================= */
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target); // Dejar de observar una vez animado mejora rendimiento
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* =========================================
   4. ENVÍO DE FORMULARIO (AJAX)
   ========================================= */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const data = new FormData(event.target);
        
        formStatus.textContent = "Enviando mensaje...";
        formStatus.className = "form-status";
        formStatus.style.display = "block";

        try {
            const response = await fetch(event.target.action, {
                method: contactForm.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = "¡Gracias! Tu mensaje ha sido enviado.";
                formStatus.classList.add('success');
                contactForm.reset();
            } else {
                const resData = await response.json();
                if (Object.hasOwn(resData, 'errors')) {
                    formStatus.textContent = resData["errors"].map(error => error["message"]).join(", ");
                } else {
                    formStatus.textContent = "Ups! Hubo un problema al enviar.";
                }
                formStatus.classList.add('error');
            }
        } catch (error) {
            formStatus.textContent = "Ups! Hubo un problema al enviar su formulario.";
            formStatus.classList.add('error');
        }
    });
}

/* =========================================
   HERO SLIDER AUTOMÁTICO (Intervalo: 5s)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    const intervalTime = 5000;
    let currentSlide = 0;

    if (slides.length === 0) return;

    function nextSlide() {
        window.requestAnimationFrame(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        });
    }
    
    // Iniciar slider solo si hay múltiples slides
    if(slides.length > 1) {
        setInterval(nextSlide, intervalTime);
    }
});