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