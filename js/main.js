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