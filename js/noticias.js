/**
 * JavaScript para Página de Noticias
 * Instituto Privado San Marino
 */

// Variables globales
let todasLasNoticias = [];
let noticiasMostradas = [];
let currentPage = 1;
const noticiasPerPage = 6; // Cuántas cargar cada vez (sin contar la destacada)

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    loadNoticias();
    initFiltros();
});

/**
 * Inicializa el menú móvil
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
        
        document.addEventListener('click', function(event) {
            if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
                mainNav.classList.remove('active');
            }
        });
    }
}

/**
 * Carga las noticias desde la API
 */
async function loadNoticias() {
    const destacadaSection = document.getElementById('noticiaDestacadaSection');
    const noticiasGrid = document.getElementById('noticiasGrid');
    
    try {
        showLoader();
        
        // Llamada a la API
        const response = await API.get(CONFIG.ENDPOINTS.PUBLICO.NOTICIAS);
        
        if (response && response.length > 0) {
            todasLasNoticias = response;
            noticiasMostradas = [...todasLasNoticias];
            
            // Mostrar la primera como destacada
            mostrarNoticiaDestacada(todasLasNoticias[0]);
            
            // Mostrar el resto en el grid
            mostrarNoticias(1);
        } else {
            mostrarNoticiasEjemplo();
        }
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        mostrarNoticiasEjemplo();
    } finally {
        hideLoader();
    }
}

/**
 * Muestra la noticia destacada
 */
function mostrarNoticiaDestacada(noticia) {
    const section = document.getElementById('noticiaDestacadaSection');
    
    const html = `
        <div class="container">
            <div class="noticia-destacada" onclick="verNoticia('${slugify(noticia.titulo)}', ${noticia.id})">
                <div class="noticia-destacada-imagen">
                    <img src="${noticia.imagen || '../images/noticias/default.jpg'}" alt="${noticia.titulo}">
                    <div class="badge-destacada">⭐ Destacada</div>
                </div>
                <div class="noticia-destacada-contenido">
                    <div class="noticia-destacada-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(noticia.fecha)}</span>
                        <span><i class="fas fa-user"></i> ${noticia.autor || 'Redacción'}</span>
                    </div>
                    <h2 class="noticia-destacada-titulo">${noticia.titulo}</h2>
                    <p class="noticia-destacada-resumen">${noticia.resumen}</p>
                    
                    ${noticia.categorias ? `
                        <div class="noticia-categorias">
                            ${noticia.categorias.map(cat => `<span class="categoria-badge">${cat}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${noticia.etiquetas ? `
                        <div class="noticia-etiquetas">
                            ${noticia.etiquetas.map(tag => `<span class="etiqueta-badge"><i class="fas fa-tag"></i> ${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <a href="#" class="btn btn-primary btn-lg" onclick="verNoticia('${slugify(noticia.titulo)}', ${noticia.id}); return false;">
                        Leer noticia completa <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    section.innerHTML = html;
}

/**
 * Muestra noticias en el grid
 */
function mostrarNoticias(page = 1) {
    const grid = document.getElementById('noticiasGrid');
    const loadMoreBtn = document.getElementById('btnLoadMore');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    const noResults = document.getElementById('noResults');
    
    // Las noticias a mostrar (excluyendo la destacada)
    const noticiasParaGrid = noticiasMostradas.slice(1);
    
    const startIndex = (page - 1) * noticiasPerPage;
    const endIndex = startIndex + noticiasPerPage;
    const noticiasToShow = noticiasParaGrid.slice(startIndex, endIndex);
    
    if (page === 1) {
        grid.innerHTML = '';
    }
    
    if (noticiasToShow.length === 0 && page === 1) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    noResults.style.display = 'none';
    
    noticiasToShow.forEach(noticia => {
        const card = createNoticiaCard(noticia);
        grid.insertAdjacentHTML('beforeend', card);
    });
    
    // Mostrar/ocultar botón "Cargar más"
    if (endIndex >= noticiasParaGrid.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'block';
    }
    
    currentPage = page;
}

/**
 * Crea una tarjeta de noticia
 */
function createNoticiaCard(noticia) {
    return `
        <div class="noticia-card" onclick="verNoticia('${slugify(noticia.titulo)}', ${noticia.id})">
            <div class="noticia-card-imagen">
                <img src="${noticia.imagen || '../images/noticias/default.jpg'}" alt="${noticia.titulo}">
                ${noticia.categorias && noticia.categorias[0] ? 
                    `<div class="noticia-card-categoria">${noticia.categorias[0]}</div>` : ''
                }
            </div>
            <div class="noticia-card-contenido">
                <div class="noticia-card-fecha">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(noticia.fecha)}
                </div>
                <h3 class="noticia-card-titulo">${noticia.titulo}</h3>
                <p class="noticia-card-resumen">${truncateText(noticia.resumen, 120)}</p>
                <div class="noticia-card-footer">
                    <div class="noticia-card-autor">
                        <i class="fas fa-user"></i>
                        ${noticia.autor || 'Redacción'}
                    </div>
                    <span class="noticia-card-leer-mas">Leer más →</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Muestra noticias de ejemplo si falla la API
 */
function mostrarNoticiasEjemplo() {
    const noticiasEjemplo = [
        {
            id: 1,
            titulo: 'Inicio del Ciclo Lectivo 2025',
            resumen: 'Este lunes 4 de marzo damos inicio al nuevo ciclo lectivo con renovadas energías y proyectos innovadores para todos nuestros estudiantes.',
            contenido: 'Con gran alegría damos la bienvenida al ciclo lectivo 2025...',
            fecha: '2025-02-28',
            imagen: 'https://ebmbaeuwvigvlxvyvqwc.supabase.co/storage/v1/object/public/LOGOS%20IPSM/Inicial.jpg',
            autor: 'Dirección',
            categorias: ['Institucional', 'Académico'],
            etiquetas: ['ciclo lectivo', 'bienvenida', '2025']
        },
        {
            id: 2,
            titulo: 'Olimpíadas de Matemática: Grandes resultados',
            resumen: 'Nuestros estudiantes obtuvieron medallas de oro y plata en las Olimpíadas Provinciales de Matemática.',
            contenido: 'Los alumnos Juan Pérez, María López y Carlos García...',
            fecha: '2025-02-20',
            imagen: 'https://ebmbaeuwvigvlxvyvqwc.supabase.co/storage/v1/object/public/LOGOS%20IPSM/Primario.jpg',
            autor: 'Depto. Matemática',
            categorias: ['Deportes', 'Académico'],
            etiquetas: ['olimpíadas', 'matemática', 'medallas']
        },
        {
            id: 3,
            titulo: 'Nueva Sala de Informática de Última Generación',
            resumen: 'El instituto inauguró una moderna sala de informática equipada con 30 computadoras de última tecnología.',
            contenido: 'El instituto invirtió en 30 nuevas computadoras...',
            fecha: '2025-02-15',
            imagen: 'https://ebmbaeuwvigvlxvyvqwc.supabase.co/storage/v1/object/public/LOGOS%20IPSM/secundario.jpg',
            autor: 'Dirección',
            categorias: ['Institucional', 'Tecnología'],
            etiquetas: ['informática', 'tecnología', 'inversión']
        },
        {
            id: 4,
            titulo: 'Acto del Día de la Bandera',
            resumen: 'Celebramos el Día de la Bandera con un emotivo acto escolar que contó con la participación de todos los niveles.',
            fecha: '2025-02-10',
            autor: 'Área de Ceremonial',
            categorias: ['Eventos'],
            etiquetas: ['acto', 'bandera', 'patria']
        }
    ];
    
    todasLasNoticias = noticiasEjemplo;
    noticiasMostradas = [...noticiasEjemplo];
    
    mostrarNoticiaDestacada(noticiasEjemplo[0]);
    mostrarNoticias(1);
}

/**
 * Inicializa los filtros
 */
function initFiltros() {
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroBusqueda = document.getElementById('filtroBusqueda');
    const btnLoadMore = document.getElementById('btnLoadMore');
    
    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', aplicarFiltros);
    }
    
    if (filtroBusqueda) {
        filtroBusqueda.addEventListener('input', debounce(aplicarFiltros, 500));
    }
    
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', function() {
            mostrarNoticias(currentPage + 1);
        });
    }
}

/**
 * Aplica los filtros seleccionados
 */
function aplicarFiltros() {
    const categoria = document.getElementById('filtroCategoria').value.toLowerCase();
    const busqueda = document.getElementById('filtroBusqueda').value.toLowerCase();
    
    noticiasMostradas = todasLasNoticias.filter(noticia => {
        const matchCategoria = !categoria || 
            (noticia.categorias && noticia.categorias.some(cat => cat.toLowerCase().includes(categoria)));
        
        const matchBusqueda = !busqueda || 
            noticia.titulo.toLowerCase().includes(busqueda) ||
            noticia.resumen.toLowerCase().includes(busqueda);
        
        return matchCategoria && matchBusqueda;
    });
    
    // Resetear y mostrar
    currentPage = 1;
    const grid = document.getElementById('noticiasGrid');
    grid.innerHTML = '';
    
    if (noticiasMostradas.length > 0) {
        mostrarNoticiaDestacada(noticiasMostradas[0]);
        mostrarNoticias(1);
    } else {
        document.getElementById('noticiaDestacadaSection').innerHTML = '';
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('loadMoreContainer').style.display = 'none';
    }
}

/**
 * Redirige a la página de detalle de noticia con URL amigable
 */
function verNoticia(slug, id) {
    // URL amigable: /pages/noticia-detalle.html?slug=titulo-de-la-noticia
    window.location.href = `noticia-detalle.html?slug=${slug}&id=${id}`;
}

/**
 * Convierte texto a slug URL-friendly
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
        .trim()
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/-+/g, '-'); // Múltiples guiones a uno solo
}

/**
 * Formatea fecha
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-AR', options);
}

/**
 * Trunca texto
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Muestra el loader
 */
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('active');
}

/**
 * Oculta el loader
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('active');
}