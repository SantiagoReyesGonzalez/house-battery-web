import productosHouseBattery from './Catalogo_Refactorizado.js';

// --- CONFIGURACIÓN & ESTADO ---
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let filteredProducts = [...productosHouseBattery];
const WHATSAPP_NUMBER = "573138019357";

// --- REFERENCIAS DOM ---
const grid = document.getElementById('catalogGrid');
const btnLoadMore = document.getElementById('btnLoadMore');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');

const modal = document.getElementById('galleryModal');
const modalImage = document.getElementById('modalImage');
const btnCloseModal = document.getElementById('closeModal');
const btnPrev = document.getElementById('prevImage');
const btnNext = document.getElementById('nextImage');
const modalIndicators = document.getElementById('modalIndicators');

let currentGallery = [];
let currentImageIndex = 0;

// --- INICIALIZACIÓN ---
function init() {
    populateCategories();
    renderProducts();
    setupEventListeners();
}

// --- RENDERIZADO ---
function populateCategories() {
    const categories = [...new Set(productosHouseBattery.map(p => p.categoria))].sort();
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function renderProducts(reset = false) {
    if (reset) {
        grid.innerHTML = '';
        currentPage = 1;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const productsToRender = filteredProducts.slice(startIndex, endIndex);

    productsToRender.forEach((prod, index) => {
        const hasMultipleImages = prod.imagenes.length > 1;
        const mainImage = `assets/${prod.imagenes[0]}`; 
        const tagsHtml = prod.tags.slice(0, 4).map(tag => `<span class="product-card__tag">${tag}</span>`).join('');
        
        const card = document.createElement('article');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
            <div class="product-card__image-container" data-id="${prod.id}">
                <img src="${mainImage}" alt="${prod.alt}" class="product-card__img" loading="lazy">
                ${hasMultipleImages ? `
                    <div class="product-card__gallery-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        ${prod.imagenes.length}
                    </div>
                ` : ''}
            </div>
            <div class="product-card__content">
                <span class="product-card__category">${prod.categoria}</span>
                <h3 class="product-card__title">${prod.titulo}</h3>
                <div class="product-card__tags">${tagsHtml}</div>
                <a href="${generateWhatsAppLink(prod)}" class="btn btn--primary" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Cotizar
                </a>
            </div>
        `;

        const imgContainer = card.querySelector('.product-card__image-container');
        imgContainer.addEventListener('click', () => openModal(prod.imagenes));

        grid.appendChild(card);
    });

    if (endIndex >= filteredProducts.length) {
        btnLoadMore.style.display = 'none';
    } else {
        btnLoadMore.style.display = 'inline-block';
    }
}

// --- ALGORITMOS DE BÚSQUEDA INTELIGENTE ---

// 1. Quitar tildes y pasar a minúsculas
const normalizeString = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// 2. Medir similitud de palabras (Distancia de Levenshtein)
const getLevenshteinDistance = (a, b) => {
    if(a.length === 0) return b.length; 
    if(b.length === 0) return a.length; 
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
    for(let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for(let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for(let i = 1; i <= a.length; i++){
        for(let j = 1; j <= b.length; j++){
            const indicator = a[i-1] === b[j-1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i][j-1] + 1, 
                matrix[i-1][j] + 1, 
                matrix[i-1][j-1] + indicator
            );
        }
    }
    return matrix[a.length][b.length];
};

// 3. Lógica principal de filtrado
function filterCatalog() {
    const rawSearchTerm = searchInput.value.trim();
    const selectedCategory = categorySelect.value;
    
    // Convertimos la búsqueda en un array de palabras clave normalizadas
    const searchKeywords = normalizeString(rawSearchTerm).split(/\s+/).filter(w => w.length > 0);

    filteredProducts = productosHouseBattery.filter(prod => {
        // Validación de categoría
        const matchesCategory = selectedCategory === 'all' || prod.categoria === selectedCategory;
        if (!matchesCategory) return false;

        // Si no hay texto de búsqueda, muestra todo lo de esa categoría
        if (searchKeywords.length === 0) return true;

        // Preparamos el texto del producto (Array de palabras del Título + Tags)
        const productWords = normalizeString(`${prod.titulo} ${prod.tags.join(' ')}`).split(/\s+/);

        // Validamos que CADA palabra buscada coincida con el producto (sin importar el orden)
        return searchKeywords.every(keyword => {
            
            // A. Coincidencia exacta o parcial directa (Ej: "bat" hace match en "bateria")
            const exactOrPartialMatch = productWords.some(word => word.includes(keyword));
            if (exactOrPartialMatch) return true;

            // B. Tolerancia a errores (Typo-Tolerance). Permite 1 letra errónea en palabras de >4 letras
            if (keyword.length > 4) {
                return productWords.some(word => {
                    // Solo comparamos con palabras de longitud similar para evitar falsos positivos
                    if (Math.abs(word.length - keyword.length) <= 2) {
                        return getLevenshteinDistance(keyword, word.substring(0, keyword.length)) <= 1;
                    }
                    return false;
                });
            }
            
            return false; // Si no cumple ninguna, descarta el producto
        });
    });

    renderProducts(true);
}

// --- UTILIDADES ---
function generateWhatsAppLink(producto) {
    const text = `Hola House Battery. Me interesa cotizar este producto del catálogo:%0A%0A*Ref:* [${producto.id}] - ${producto.titulo}%0A%0A¿Tienen disponibilidad?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

// --- LÓGICA DEL MODAL GALERÍA ---
function openModal(imagenes) {
    currentGallery = imagenes;
    currentImageIndex = 0;
    updateModalView();
    modal.classList.add('active');
    
    const showControls = imagenes.length > 1 ? 'block' : 'none';
    btnPrev.style.display = showControls;
    btnNext.style.display = showControls;
}

function closeModal() {
    modal.classList.remove('active');
}

function updateModalView() {
    modalImage.src = `assets/${currentGallery[currentImageIndex]}`;
    
    modalIndicators.innerHTML = '';
    if(currentGallery.length > 1) {
        currentGallery.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `modal__dot ${idx === currentImageIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                currentImageIndex = idx;
                updateModalView();
            });
            modalIndicators.appendChild(dot);
        });
    }
}

function nextImg() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    updateModalView();
}

function prevImg() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    updateModalView();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    btnLoadMore.addEventListener('click', () => {
        currentPage++;
        renderProducts();
    });

    searchInput.addEventListener('input', filterCatalog);
    categorySelect.addEventListener('change', filterCatalog);

    btnCloseModal.addEventListener('click', closeModal);
    btnNext.addEventListener('click', nextImg);
    btnPrev.addEventListener('click', prevImg);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Ejecutar
init();