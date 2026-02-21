/* =========================================
   1. LÓGICA DEL MENÚ Y HEADER
   ========================================= */
const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');

// Función auxiliar para saber si debemos tener el fondo oscuro
function actualizarHeader() {
    const menuAbierto = navList.classList.contains('nav__list--visible');
    const usuarioHizoScroll = window.scrollY > 50;

    if (menuAbierto || usuarioHizoScroll) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
}

// Evento Scroll
window.addEventListener('scroll', () => {
    actualizarHeader();
});

// Evento Menú (Click)
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navList.classList.toggle('nav__list--visible');
        actualizarHeader();

        // Accesibilidad
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
        navList.classList.remove('nav__list--visible');
        navToggle.setAttribute('aria-label', 'Abrir menú');
        actualizarHeader();
    });
});

/* =========================================
   3. ANIMACIÓN AL HACER SCROLL (Intersection Observer)
   ========================================= */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1
});

const hiddenElements = document.querySelectorAll('.reveal');
hiddenElements.forEach((el) => observer.observe(el));

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

        fetch(event.target.action, {
            method: contactForm.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        }).then(response => {
            if (response.ok) {
                formStatus.textContent = "¡Gracias! Tu mensaje ha sido enviado.";
                formStatus.classList.add('success');
                contactForm.reset();
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formStatus.textContent = "Ups! Hubo un problema al enviar.";
                    }
                    formStatus.classList.add('error');
                });
            }
        }).catch(error => {
            formStatus.textContent = "Error de conexión. Intenta de nuevo.";
            formStatus.classList.add('error');
        });
    });
}

/* =========================================
   5. CALCULADORA DE BATERÍAS (Lógica Corregida)
   ========================================= */

// Seleccionamos los elementos UNA SOLA VEZ
const btnCalcular = document.getElementById('btnCalcular');
const inputVoltaje = document.getElementById('voltage');
const inputCapacidad = document.getElementById('capacity');
const resultadoConfig = document.getElementById('configResult');
const resultadoCeldas = document.getElementById('totalCellsResult');
const btnCotizarCalc = document.getElementById('btnCotizarCalc');

// Verificamos que el botón exista antes de agregar el evento
if (btnCalcular) {
    btnCalcular.addEventListener('click', () => {
        
        // 1. Obtener valores
        const voltajeDeseado = parseInt(inputVoltaje.value);
        const capacidadDeseada = parseFloat(inputCapacidad.value);

        // 2. Validación
        if (!capacidadDeseada || capacidadDeseada <= 0) {
            alert("Por favor, ingresa un Amperaje válido (Ej: 10)");
            return;
        }

        // 3. Constantes (Celdas 18650 genéricas)
        const voltajeCelda = 3.6; 
        const amperajeCelda = 2.5; 

        // 4. Matemáticas
        const celdasSerie = Math.ceil(voltajeDeseado / voltajeCelda);
        const celdasParalelo = Math.ceil(capacidadDeseada / amperajeCelda);
        const totalCeldas = celdasSerie * celdasParalelo;

        // 5. Mostrar en pantalla
        resultadoConfig.innerText = `${celdasSerie}S${celdasParalelo}P`; 
        resultadoCeldas.innerText = totalCeldas;
        
        // Animación visual
        resultadoCeldas.style.transform = "scale(1.2)";
        setTimeout(() => resultadoCeldas.style.transform = "scale(1)", 200);

        // 6. Activar botón de WhatsApp
        if (btnCotizarCalc) {
            const mensaje = `Hola House Battery, usé su calculadora web. Me interesa armar un pack de Litio: Configuración ${celdasSerie}S${celdasParalelo}P con ${totalCeldas} celdas en total. ¿Qué precio tendría?`;
            const telefono = "573138019357"; 
            
            btnCotizarCalc.href = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
            btnCotizarCalc.style.display = 'block'; // Mostrar botón
        }
    });
}

/* =========================================
   HERO SLIDER AUTOMÁTICO (Intervalo: 5s)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slide');
    const intervalTime = 5000; // 5 segundos exactos
    let currentSlide = 0;

    if (slides.length === 0) return;

    function nextSlide() {
        // Reset de estado
        slides[currentSlide].classList.remove('active');
        
        // Incremento circular
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Activación del nuevo slide
        slides[currentSlide].classList.add('active');
    }

    // Inicio de la secuencia
    setInterval(nextSlide, intervalTime);
});