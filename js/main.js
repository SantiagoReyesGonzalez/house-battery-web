/* =========================================
   1. LÓGICA DEL MENÚ Y HEADER
   ========================================= */
const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');

function actualizarHeader() {
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

window.addEventListener('scroll', actualizarHeader, { passive: true });

if (navToggle && navList) {
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
   3. ANIMACIÓN AL HACER SCROLL
   ========================================= */
const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target); 
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
            formStatus.textContent = "Error de conexión. Intenta de nuevo.";
            formStatus.classList.add('error');
        }
    });
}

/* =========================================
   5. CALCULADORA DE BATERÍAS
   ========================================= */
const btnCalcular = document.getElementById('btnCalcular');
const inputVoltaje = document.getElementById('voltage');
const inputCapacidad = document.getElementById('capacity');
const resultadoConfig = document.getElementById('configResult');
const resultadoCeldas = document.getElementById('totalCellsResult');
const btnCotizarCalc = document.getElementById('btnCotizarCalc');

if (btnCalcular) {
    btnCalcular.addEventListener('click', () => {
        const voltajeDeseado = parseInt(inputVoltaje.value);
        const capacidadDeseada = parseFloat(inputCapacidad.value);

        if (!capacidadDeseada || capacidadDeseada <= 0) {
            alert("Por favor, ingresa un Amperaje válido (Ej: 10)");
            return;
        }

        const voltajeCelda = 3.6; 
        const amperajeCelda = 2.5; 

        const celdasSerie = Math.ceil(voltajeDeseado / voltajeCelda);
        const celdasParalelo = Math.ceil(capacidadDeseada / amperajeCelda);
        const totalCeldas = celdasSerie * celdasParalelo;

        resultadoConfig.innerText = `${celdasSerie}S${celdasParalelo}P`; 
        resultadoCeldas.innerText = totalCeldas;
        
        resultadoCeldas.style.transform = "scale(1.2)";
        setTimeout(() => resultadoCeldas.style.transform = "scale(1)", 200);

        if (btnCotizarCalc) {
            const mensaje = `Hola House Battery, usé su calculadora web. Me interesa armar un pack de Litio: Configuración ${celdasSerie}S${celdasParalelo}P con ${totalCeldas} celdas en total. ¿Qué precio tendría?`;
            const telefono = "573138019357"; 
            
            btnCotizarCalc.href = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
            btnCotizarCalc.style.display = 'block'; 
        }
    });
}

/* =========================================
   6. HERO SLIDER AUTOMÁTICO & LAZY LOAD
   ========================================= */
// 1. Inicializar rotación
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    const intervalTime = 5000; 
    let currentSlide = 0;

    if (slides.length <= 1) return;

    function nextSlide() {
        window.requestAnimationFrame(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        });
    }

    setInterval(nextSlide, intervalTime);
});

// 2. Carga diferida de imágenes pesadas al terminar de cargar la web
window.addEventListener('load', () => {
    const lazySlides = document.querySelectorAll('.hero-slide[data-bg]');
    lazySlides.forEach(slide => {
        slide.style.backgroundImage = `url('${slide.getAttribute('data-bg')}')`;
        slide.removeAttribute('data-bg');
    });
});