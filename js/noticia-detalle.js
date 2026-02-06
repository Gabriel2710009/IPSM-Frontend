/**
 * JavaScript para Detalle de Noticia
 * Instituto Privado San Marino
 */

let currentNoticia = null;

function getDefaultNewsImage() {
    if (typeof CONFIG !== 'undefined' && CONFIG.ASSETS && CONFIG.ASSETS.DEFAULT_NEWS_IMAGE) {
        return CONFIG.ASSETS.DEFAULT_NEWS_IMAGE;
    }
    return '../images/noticias/default.jpg';
}

function normalizeNoticia(noticia) {
    if (!noticia) return noticia;
    const imagen = noticia.imagen || noticia.imagen_url;
    const fecha = noticia.fecha || noticia.fecha_publicacion;
    const categorias = noticia.categorias || (noticia.categoria ? [noticia.categoria] : []);
    return { ...noticia, imagen, fecha, categorias };
}

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    loadNoticiaFromURL();
    initShareButtons();
});

/**
 * Inicializa el menú móvil
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            const isOpen = mainNav.classList.toggle('active');
            document.body.classList.toggle('menu-open', isOpen);
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(event) {
            if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
                mainNav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}


/**
 * Carga la noticia desde la URL
 */
async function loadNoticiaFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const id = urlParams.get('id');
    
    if (!slug && !id) {
        window.location.href = 'noticias.html';
        return;
    }
    
    try {
        showLoader();
        
        // Intentar cargar desde la API
        let noticia;
        
        if (id) {
            noticia = normalizeNoticia(await API.get(`${CONFIG.ENDPOINTS.PUBLICO.NOTICIAS}/${id}`));
        } else {
            // Si solo tenemos slug, buscar todas y filtrar
            const noticias = (await API.get(CONFIG.ENDPOINTS.PUBLICO.NOTICIAS)).map(normalizeNoticia);
            noticia = noticias.find(n => slugify(n.titulo) === slug);
        }
        
        if (noticia) {
            currentNoticia = noticia;
            mostrarNoticia(noticia);
            loadNoticiasRelacionadas(noticia.id, noticia.categorias);
            updateMetaTags(noticia);
        } else {
            mostrarNoticiaEjemplo(slug, id);
        }
    } catch (error) {
        console.error('Error al cargar noticia:', error);
        mostrarNoticiaEjemplo(slug, id);
    } finally {
        hideLoader();
    }
}

/**
 * Muestra la noticia completa
 */
function mostrarNoticia(noticia) {
    const articulo = document.getElementById('noticiaArticulo');
    const breadcrumbTitle = document.getElementById('breadcrumbTitle');
    
    // Actualizar breadcrumb
    breadcrumbTitle.textContent = noticia.titulo;
    
    // Construir HTML
    const html = `
        <div class="noticia-header">
            <img src="${noticia.imagen || getDefaultNewsImage()}" 
                 alt="${noticia.titulo}" 
                 class="noticia-header-imagen">
            <div class="noticia-header-overlay">
                ${noticia.categorias ? `
                    <div class="noticia-categorias">
                        ${noticia.categorias.map(cat => `<span class="categoria-badge">${cat}</span>`).join('')}
                    </div>
                ` : ''}
                <h1 class="noticia-titulo">${noticia.titulo}</h1>
                <div class="noticia-meta">
                    <div class="noticia-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(noticia.fecha)}</span>
                    </div>
                    <div class="noticia-meta-item">
                        <i class="fas fa-user"></i>
                        <span>${noticia.autor || 'Redacción'}</span>
                    </div>
                    ${noticia.tiempo_lectura ? `
                        <div class="noticia-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${noticia.tiempo_lectura} min de lectura</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <div class="noticia-contenido">
            ${noticia.resumen ? `
                <div class="noticia-resumen">
                    ${noticia.resumen}
                </div>
            ` : ''}
            
            <div class="noticia-cuerpo">
                ${formatearContenido(noticia.contenido)}
            </div>
            
            ${noticia.etiquetas && noticia.etiquetas.length > 0 ? `
                <div class="noticia-etiquetas">
                    <h3><i class="fas fa-tags"></i> Etiquetas</h3>
                    <div class="etiquetas-list">
                        ${noticia.etiquetas.map(tag => `
                            <span class="etiqueta-badge">
                                <i class="fas fa-tag"></i> ${tag}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    articulo.innerHTML = html;
}

/**
 * Formatea el contenido de la noticia
 */
function formatearContenido(contenido) {
    if (!contenido) return '<p>Contenido no disponible.</p>';
    
    // Convertir saltos de línea a párrafos
    let formatted = contenido
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('');
    
    return formatted;
}

/**
 * Carga noticias relacionadas
 */
async function loadNoticiasRelacionadas(currentId, categorias) {
    const container = document.getElementById('noticiasRelacionadas');
    
    try {
        const noticias = (await API.get(CONFIG.ENDPOINTS.PUBLICO.NOTICIAS)).map(normalizeNoticia);
        
        // Filtrar noticias relacionadas (misma categoría, pero diferente ID)
        let relacionadas = noticias.filter(n => {
            if (n.id === currentId) return false;
            if (!categorias || !n.categorias) return false;
            return categorias.some(cat => n.categorias.includes(cat));
        });
        
        // Si no hay relacionadas por categoría, mostrar las más recientes
        if (relacionadas.length === 0) {
            relacionadas = noticias
                .filter(n => n.id !== currentId)
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        }
        
        // Tomar solo las primeras 3
        relacionadas = relacionadas.slice(0, 3);
        
        if (relacionadas.length > 0) {
            container.innerHTML = relacionadas.map(n => createRelacionadaCard(n)).join('');
        } else {
            container.innerHTML = '<p style="color: var(--gray-500); font-size: var(--text-sm);">No hay noticias relacionadas.</p>';
        }
    } catch (error) {
        console.error('Error al cargar noticias relacionadas:', error);
        container.innerHTML = '<p style="color: var(--gray-500); font-size: var(--text-sm);">Error al cargar noticias.</p>';
    }
}

/**
 * Crea una card de noticia relacionada
 */
function createRelacionadaCard(noticia) {
    return `
        <div class="noticia-relacionada-item" onclick="verNoticia('${slugify(noticia.titulo)}', '${noticia.id}')">
            <div class="noticia-relacionada-imagen">
                <img src="${noticia.imagen || getDefaultNewsImage()}" alt="${noticia.titulo}">
            </div>
            <div class="noticia-relacionada-contenido">
                <div class="noticia-relacionada-titulo">${truncateText(noticia.titulo, 60)}</div>
                <div class="noticia-relacionada-fecha">${formatDate(noticia.fecha)}</div>
            </div>
        </div>
    `;
}

/**
 * Muestra noticia de ejemplo si falla la API
 */
function mostrarNoticiaEjemplo(slug, id) {
    const noticiasEjemplo = {
        'inicio-del-ciclo-lectivo-2025': {
            id: 1,
            titulo: 'Inicio del Ciclo Lectivo 2025',
            resumen: 'Este lunes 4 de marzo damos inicio al nuevo ciclo lectivo con renovadas energías y proyectos innovadores para todos nuestros estudiantes.',
            contenido: `Con gran alegría damos la bienvenida al ciclo lectivo 2025. Este año trae importantes novedades pedagógicas y tecnológicas que beneficiarán a toda nuestra comunidad educativa.

El acto de inicio se realizará el lunes 4 de marzo a las 8:00hs en el patio principal del instituto. Se solicita puntualidad y la presencia de todos los estudiantes con su uniforme completo.

Recordamos a las familias que pueden consultar los horarios y materias en nuestra plataforma virtual, accesible desde la web institucional.

¡Les deseamos un excelente año lectivo lleno de aprendizajes y logros!`,
            fecha: '2025-02-28',
            imagen: 'https://ebmbaeuwvigvlxvyvqwc.supabase.co/storage/v1/object/public/LOGOS%20IPSM/Inicial.jpg',
            autor: 'Dirección',
            categorias: ['Institucional', 'Académico'],
            etiquetas: ['ciclo lectivo', 'bienvenida', '2025'],
            tiempo_lectura: 3
        }
    };
    
    const noticia = normalizeNoticia(noticiasEjemplo[slug] || noticiasEjemplo['inicio-del-ciclo-lectivo-2025']);
    currentNoticia = noticia;
    mostrarNoticia(noticia);
    updateMetaTags(noticia);
}

/**
 * Inicializa botones de compartir
 */
function initShareButtons() {
    const shareWhatsapp = document.getElementById('shareWhatsapp');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareInstagram = document.getElementById('shareInstagram');
    const shareLink = document.getElementById('shareLink');
    
    if (shareWhatsapp) {
        shareWhatsapp.addEventListener('click', () => compartirWhatsApp());
    }
    
    if (shareFacebook) {
        shareFacebook.addEventListener('click', () => compartirFacebook());
    }
    
    if (shareInstagram) {
        shareInstagram.addEventListener('click', () => compartirInstagram());
    }
    
    if (shareLink) {
        shareLink.addEventListener('click', () => copiarEnlace());
    }
}

/**
 * Compartir en WhatsApp
 */
function compartirWhatsApp() {
    if (!currentNoticia) return;
    
    const texto = `📰 ${currentNoticia.titulo}\n\n${currentNoticia.resumen}\n\n🔗 ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank');
}

/**
 * Compartir en Facebook
 */
function compartirFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

/**
 * Compartir en Instagram (abre Instagram con instrucciones)
 */
function compartirInstagram() {
    showToast('Instagram no permite compartir enlaces directamente. Copia el enlace y compártelo en tu historia o publicación.', 'info');
    copiarEnlace();
}

/**
 * Copiar enlace
 */
function copiarEnlace() {
    const url = window.location.href;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('¡Enlace copiado al portapapeles!', 'success');
        }).catch(err => {
            console.error('Error al copiar:', err);
            showToast('Error al copiar el enlace', 'error');
        });
    } else {
        // Fallback para navegadores antiguos
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showToast('¡Enlace copiado al portapapeles!', 'success');
        } catch (err) {
            showToast('Error al copiar el enlace', 'error');
        }
        
        document.body.removeChild(textarea);
    }
}

/**
 * Muestra un toast de notificación
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Actualiza las meta tags para SEO y redes sociales
 */
function updateMetaTags(noticia) {
    // Title
    document.getElementById('pageTitle').textContent = `${noticia.titulo} - Instituto San Marino`;
    
    // Meta description
    document.getElementById('metaDescription').setAttribute('content', noticia.resumen || noticia.titulo);
    
    // Open Graph
    document.getElementById('ogTitle').setAttribute('content', noticia.titulo);
    document.getElementById('ogDescription').setAttribute('content', noticia.resumen || noticia.titulo);
    document.getElementById('ogImage').setAttribute('content', noticia.imagen || '');
}

/**
 * Redirige a ver otra noticia
 */
function verNoticia(slug, id) {
    window.location.href = `noticia-detalle.html?slug=${slug}&id=${id}`;
}

/**
 * Convierte texto a slug
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
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
