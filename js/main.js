/* =========================================
   LÓGICA DEL MENÚ Y HEADER (Corregida)
   ========================================= */

// 1. VARIABLES
const header = document.querySelector('.header');
const navToggle = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');

// Función auxiliar para saber si debemos tener el fondo oscuro
function actualizarHeader() {
    // ¿Está el menú abierto?
    const menuAbierto = navList.classList.contains('nav__list--visible');
    // ¿Hemos bajado haciendo scroll?
    const usuarioHizoScroll = window.scrollY > 50;

    // LÓGICA MAESTRA:
    // Si el menú está abierto O el usuario hizo scroll... ponemos el fondo oscuro.
    if (menuAbierto || usuarioHizoScroll) {
        header.classList.add('header--scrolled');
    } else {
        // Si no pasa ninguna de las dos, lo dejamos transparente.
        header.classList.remove('header--scrolled');
    }
}

// 2. EVENTO SCROLL
window.addEventListener('scroll', () => {
    actualizarHeader();
});

// 3. EVENTO MENÚ (Click)
navToggle.addEventListener('click', () => {
    // Alternar menú
    navList.classList.toggle('nav__list--visible');
    
    // Inmediatamente decidir cómo se ve el header
    actualizarHeader();

    // Accesibilidad
    if (navList.classList.contains('nav__list--visible')) {
        navToggle.setAttribute('aria-label', 'Cerrar menú');
    } else {
        navToggle.setAttribute('aria-label', 'Abrir menú');
    }
});

/* =========================================
   4. CERRAR MENÚ AL HACER CLIC EN UN ENLACE
   ========================================= */
// Seleccionamos TODOS los enlaces dentro del menú
const links = document.querySelectorAll('.nav__link');

links.forEach(link => {
    link.addEventListener('click', () => {
        // 1. Cerramos el menú
        navList.classList.remove('nav__list--visible');
        
        // 2. Actualizamos el icono del botón (Accesibilidad)
        navToggle.setAttribute('aria-label', 'Abrir menú');
        
        // 3. Forzamos la revisión del header (para que se quede oscuro si bajó)
        actualizarHeader(); // <--- Reutilizamos tu función maestra
    });
});

/* =========================================
   5. ANIMACIÓN AL HACER SCROLL (Intersection Observer)
   ========================================= */

// 1. Configuramos el "Observador"
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Si el elemento es visible en la pantalla...
        if (entry.isIntersecting) {
            // ...le agregamos la clase 'active' para que suba y aparezca
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1 // Se activa cuando el 10% del elemento ya se ve
});

// 2. Seleccionamos qué elementos queremos animar
// Buscamos todos los elementos que tengan la clase '.reveal'
const hiddenElements = document.querySelectorAll('.reveal');

// 3. Le decimos al observador que los vigile
hiddenElements.forEach((el) => observer.observe(el));

/* =========================================
   6. ENVÍO DE FORMULARIO SIN RECARGAR (AJAX)
   ========================================= */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async function(event) {
        // 1. Evitamos que la página se recargue o cambie de url
        event.preventDefault();

        // 2. Guardamos los datos del formulario
        const data = new FormData(event.target);
        
        // 3. Mostramos estado de "Enviando..."
        formStatus.textContent = "Enviando mensaje...";
        formStatus.className = "form-status"; // Reseteamos clases

        // 4. Enviamos los datos a Formspree usando Fetch (AJAX)
        fetch(event.target.action, {
            method: contactForm.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // ÉXITO: Limpiamos el form y mostramos mensaje verde
                formStatus.textContent = "¡Gracias! Tu mensaje ha sido enviado.";
                formStatus.classList.add('success');
                contactForm.reset(); // Borra lo que escribió el usuario
            } else {
                // ERROR DE SERVIDOR
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
            // ERROR DE RED
            formStatus.textContent = "Error de conexión. Intenta de nuevo.";
            formStatus.classList.add('error');
        });
    });
}