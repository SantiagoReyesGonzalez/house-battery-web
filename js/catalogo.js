import productosHouseBattery from './Catalogo_Refactorizado.js';

// --- CONFIGURACIÓN & ESTADO ---
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let filteredProducts = [...productosHouseBattery];
const WHATSAPP_NUMBER = "573138019357";

// --- REFERENCIAS DOM ---
const categoriesGrid = document.getElementById('categoriesGrid');
const catalogGrid = document.getElementById('catalogGrid');
const catalogFilters = document.getElementById('catalogFilters');
const btnViewAll = document.getElementById('btnViewAll');
const btnBackCategories = document.getElementById('btnBackCategories');
const btnLoadMore = document.getElementById('btnLoadMore');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');

const modal = document.getElementById('galleryModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalCategory = document.getElementById('modalCategory');
const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
const btnCloseModal = document.getElementById('closeModal');
const btnPrev = document.getElementById('prevImage');
const btnNext = document.getElementById('nextImage');
const modalIndicators = document.getElementById('modalIndicators');

let currentGallery = [];
let currentImageIndex = 0;

// --- INICIALIZACIÓN ---
function init() {
    renderCategories();
    populateCategories();
    setupEventListeners();
}

// --- CATEGORIZACIÓN SEMÁNTICA (MACRO-CATEGORÍAS) ---
function getMacroCategory(categoriaOriginal) {
    const cat = categoriaOriginal.toLowerCase();
    
    // 1. Prioridad absoluta: Baterías y Celdas (Captura "Baterías recargables", "Pilas para radio", etc.)
    if (cat.includes('batería') || cat.includes('bateria') || cat.includes('pila') || cat.includes('celda') || cat.includes('pack') || cat.includes('recargable')) {
        return 'Baterías y Celdas';
    }

    // 2. Equipos de Tecnología (Excluye accesorios y baterías ya capturadas)
    if (cat.includes('teléfono') || cat.includes('telefono') || cat.includes('radio') || cat.includes('comunicación') || cat.includes('comunicacion') || cat.includes('timbre') || cat.includes('herramienta') || cat.includes('equipo') || cat.includes('soldadura') || cat.includes('tester') || cat.includes('tecnología') || cat.includes('multímetro')) {
        return 'Equipos de Tecnología';
    }

    // 3. Respaldo de Energía
    if (cat.includes('ups') || cat.includes('regulador') || cat.includes('inversor') || cat.includes('respaldo') || cat.includes('planta')) {
        return 'Respaldo de Energía';
    }

    // 4. Accesorios y Componentes
    if (cat.includes('cargador') || cat.includes('cable') || cat.includes('bms') || cat.includes('accesorio') || cat.includes('conector') || cat.includes('componente')) {
        return 'Accesorios y Componentes';
    }

    // 5. Fallback
    return 'Otros Componentes';
}

// --- RENDERIZADO DE CATEGORÍAS ---
function renderCategories() {
    categoriesGrid.innerHTML = '';
    const macroMap = {};

    productosHouseBattery.forEach(prod => {
        const macro = getMacroCategory(prod.categoria);
        if (!macroMap[macro]) {
            macroMap[macro] = { count: 0, image: prod.imagenes[0] };
        }
        macroMap[macro].count++;
    });

    const order = [
        'Baterías y Celdas', 
        'Respaldo de Energía', 
        'Equipos de Tecnología', 
        'Accesorios y Componentes', 
        'Otros Componentes'
    ];

    order.forEach((macro, index) => {
        if (macroMap[macro]) {
            createCategoryCard(macro, macroMap[macro].count, macroMap[macro].image, index, macro);
        }
    });
}

function createCategoryCard(title, count, image, index, filterValue) {
    const card = document.createElement('article');
    card.className = 'category-card product-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        <div class="product-card__image-container">
            <img src="assets/${image}" alt="${title}" class="product-card__img" loading="lazy">
        </div>
        <div class="product-card__content" style="text-align: center; justify-content: center; align-items: center;">
            <h3 class="product-card__title" style="margin-bottom: 8px;">${title}</h3>
            <span class="product-card__category" style="margin-bottom: 0;">${count} Referencias</span>
        </div>
    `;

    card.addEventListener('click', () => {
        categorySelect.value = filterValue;
        searchInput.value = '';
        showProductsView();
        filterCatalog();
    });

    categoriesGrid.appendChild(card);
}

// --- RENDERIZADO DE PRODUCTOS ---
function populateCategories() {
    categorySelect.innerHTML = '<option value="all">Todas las categorías</option>';
    
    const macros = [...new Set(productosHouseBattery.map(p => getMacroCategory(p.categoria)))].sort();
    macros.forEach(macro => {
        const option = document.createElement('option');
        option.value = macro;
        option.textContent = macro;
        categorySelect.appendChild(option);
    });
}

function renderProducts(reset = false) {
    if (reset) {
        catalogGrid.innerHTML = '';
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
        card.style.cursor = 'pointer'; 
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
                <span class="product-card__category">${getMacroCategory(prod.categoria)} - ${prod.categoria}</span>
                <h3 class="product-card__title">${prod.titulo}</h3>
                <p class="product-card__desc" title="Clic para ver más detalles">${prod.descripcion}</p>
                <div class="product-card__tags">${tagsHtml}</div>
                <a href="${generateWhatsAppLink(prod)}" class="btn btn--primary btn-cotizar-card" target="_blank" onclick="event.stopPropagation();">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Cotizar
                </a>
            </div>
        `;

        card.addEventListener('click', () => openModal(prod));

        catalogGrid.appendChild(card);
    });

    if (endIndex >= filteredProducts.length) {
        btnLoadMore.style.display = 'none';
    } else {
        btnLoadMore.style.display = 'inline-block';
    }
}

// --- TRANSICIONES DE VISTA ---
function showProductsView() {
    categoriesGrid.style.display = 'none';
    btnViewAll.style.display = 'none';
    catalogGrid.style.display = 'grid';
    catalogFilters.style.display = 'grid';
    btnBackCategories.style.display = 'inline-block';
}

function showCategoriesView() {
    catalogGrid.style.display = 'none';
    catalogFilters.style.display = 'none';
    btnLoadMore.style.display = 'none';
    btnBackCategories.style.display = 'none';
    categoriesGrid.style.display = 'grid';
    btnViewAll.style.display = 'inline-block';
}

// --- ALGORITMOS DE BÚSQUEDA INTELIGENTE ---
const normalizeString = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

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

function filterCatalog() {
    const rawSearchTerm = searchInput.value.trim();
    const selectedCategory = categorySelect.value;
    const searchKeywords = normalizeString(rawSearchTerm).split(/\s+/).filter(w => w.length > 0);

    filteredProducts = productosHouseBattery.filter(prod => {
        const macro = getMacroCategory(prod.categoria);
        const matchesCategory = selectedCategory === 'all' || macro === selectedCategory;
            
        if (!matchesCategory) return false;
        if (searchKeywords.length === 0) return true;

        const productWords = normalizeString(`${prod.titulo} ${prod.descripcion} ${prod.tags.join(' ')}`).split(/\s+/);

        return searchKeywords.every(keyword => {
            const exactOrPartialMatch = productWords.some(word => word.includes(keyword));
            if (exactOrPartialMatch) return true;

            if (keyword.length > 4) {
                return productWords.some(word => {
                    if (Math.abs(word.length - keyword.length) <= 2) {
                        return getLevenshteinDistance(keyword, word.substring(0, keyword.length)) <= 1;
                    }
                    return false;
                });
            }
            return false;
        });
    });

    renderProducts(true);
}

// --- UTILIDADES ---
function generateWhatsAppLink(producto) {
    const text = `Hola House Battery. Me interesa cotizar este producto del catálogo:%0A%0A*Ref:* [${producto.id}] - ${producto.titulo}%0A%0A¿Tienen disponibilidad?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

// --- LÓGICA DEL MODAL EXTENDIDO ---
function openModal(producto) {
    currentGallery = producto.imagenes;
    currentImageIndex = 0;
    
    modalTitle.textContent = producto.titulo;
    modalDescription.textContent = producto.descripcion;
    modalCategory.textContent = `${getMacroCategory(producto.categoria)} - ${producto.categoria}`;
    modalWhatsappBtn.href = generateWhatsAppLink(producto);

    updateModalView();
    modal.classList.add('active');
    
    const showControls = producto.imagenes.length > 1 ? 'block' : 'none';
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
    btnViewAll.addEventListener('click', () => {
        categorySelect.value = 'all';
        searchInput.value = '';
        showProductsView();
        filterCatalog();
    });

    btnBackCategories.addEventListener('click', showCategoriesView);

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