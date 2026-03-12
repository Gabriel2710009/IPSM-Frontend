/**
 * JavaScript para Detalle de Noticia
 * Instituto Privado San Marino
 */

let currentNoticia = null;
function isPreviewMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('preview') === '1';
}

function initPreviewMode() {
    const raw = localStorage.getItem('news_preview_payload');
    if (raw) {
        try {
            const parsed = normalizeNoticia(JSON.parse(raw));
            currentNoticia = parsed;
            mostrarNoticia(parsed);
            updateMetaTags(parsed);
        } catch (e) {
            console.error('Preview localStorage inválido:', e);
        }
    }

    window.addEventListener('message', async function (event) {
        const data = event && event.data;
        if (!data || data.type !== 'NEWS_PREVIEW_UPDATE' || !data.payload) return;

        try {
            const noticia = normalizeNoticia(data.payload);
            currentNoticia = noticia;
            await mostrarNoticia(noticia);
            updateMetaTags(noticia);
        } catch (err) {
            console.error('Error actualizando preview:', err);
        }
    });
}

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
    if (isPreviewMode()) {
        initPreviewMode();
        return;
    }

    initMobileMenu();
    loadNoticiaFromURL();
    initShareButtons();
});

/**
 * Inicializa el menu movil
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const nivelesDropdown = document.getElementById('nivelesDropdown');
    const nivelesBtn = document.getElementById('nivelesBtn');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            const isOpen = mainNav.classList.toggle('active');
            document.body.classList.toggle('menu-open', isOpen);
        });

        if (nivelesBtn && nivelesDropdown) {
            nivelesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                nivelesDropdown.classList.toggle('open');
            });
        }

        const navLinks = mainNav.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                document.body.classList.remove('menu-open');
                if (nivelesDropdown) nivelesDropdown.classList.remove('open');
            });
        });

        document.addEventListener('click', function(event) {
            if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
                mainNav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
            if (nivelesDropdown && !nivelesDropdown.contains(event.target)) {
                nivelesDropdown.classList.remove('open');
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                mainNav.classList.remove('active');
                document.body.classList.remove('menu-open');
                if (nivelesDropdown) nivelesDropdown.classList.remove('open');
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
    const rawQuery = decodeURIComponent((window.location.search || '').replace(/^\?/, '')).trim();
    const titleQuery = (!slug && !id && rawQuery && !rawQuery.includes('=')) ? rawQuery : null;

    if (!slug && !id && !titleQuery) {
        window.location.href = 'noticias.html';
        return;
    }

    try {
        showLoader();

        let noticia;

        if (id) {
            noticia = normalizeNoticia(await API.get(`${CONFIG.ENDPOINTS.PUBLICO.NOTICIAS}/${id}`, false));
        } else {
            const noticias = (await API.get(CONFIG.ENDPOINTS.PUBLICO.NOTICIAS, false)).map(normalizeNoticia);
            if (titleQuery) {
                noticia = noticias.find(n => (n.titulo || '').toLowerCase() === titleQuery.toLowerCase())
                    || noticias.find(n => slugify(n.titulo) === slugify(titleQuery));
            } else {
                noticia = noticias.find(n => slugify(n.titulo) === slug);
            }
        }

        if (noticia) {
            currentNoticia = noticia;
            await mostrarNoticia(noticia);
            loadNoticiasRelacionadas(noticia.id, noticia.categorias);
            updateMetaTags(noticia);
        } else {
            await mostrarNoticiaEjemplo(slug, id);
        }
    } catch (error) {
        console.error('Error al cargar noticia:', error);
        await mostrarNoticiaEjemplo(slug, id);
    } finally {
        hideLoader();
    }
}

/**
 * Muestra la noticia completa
 */
async function mostrarNoticia(noticia) {
    const articulo = document.getElementById('noticiaArticulo');
    const breadcrumbTitle = document.getElementById('breadcrumbTitle');

    if (!articulo) return;

    // Actualizar breadcrumb
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = noticia.titulo || 'Noticia';
    }

    const contenidoHTML = await renderNoticiaCompleta(noticia);
    articulo.innerHTML = construirArticulo(noticia, contenidoHTML);
    enhanceMediaEmbeds(articulo);
}

/**
 * Escapa HTML basico para evitar inyecciones en texto de bloques.
 */
function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Ajusta blockquote de Quill: "texto | autor" => cita estilizada.
 */
function transformarCitasQuill(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    wrapper.querySelectorAll('blockquote').forEach((node) => {
        const raw = (node.textContent || '').replace(/\s+/g, ' ').trim();
        if (!raw) return;

        const parts = raw.split('|');
        const quoteText = (parts[0] || '').trim();
        const quoteAuthor = parts.slice(1).join('|').trim();

        node.classList.add('nota-quote');
        node.innerHTML = `<p class="quote-text">“${escapeHTML(quoteText)}”</p>${quoteAuthor ? `<cite class="quote-author">| ${escapeHTML(quoteAuthor)}</cite>` : ''}`;
    });

    return wrapper.innerHTML;
}

/**
 * Formatea contenido Quill HTML (sin fallback a editor viejo).
 */
function formatearContenido(contenido) {
    if (!contenido) return '<p>Contenido no disponible.</p>';

    const contenidoStr = String(contenido).trim();
    if (!contenidoStr || contenidoStr === '<p><br></p>') {
        return '<p>Contenido no disponible.</p>';
    }

    return transformarCitasQuill(contenidoStr);
}

/**
 * Render exclusivo Quill: solo usa campo contenido.
 */
async function renderNoticiaCompleta(noticia) {
    return formatearContenido(noticia && noticia.contenido);
}

/**
 * Construye el articulo principal con estructura editorial.
 */
function construirArticulo(noticia, contenidoHTML) {
    const imagenPrincipal = noticia.imagen || getDefaultNewsImage();
    const titulo = escapeHTML(noticia.titulo || 'Noticia');
    const resumen = noticia.resumen ? escapeHTML(noticia.resumen) : '';
    const autor = escapeHTML(noticia.autor || 'Redaccion');
    const fecha = formatDate(noticia.fecha);
    const imagenAlt = escapeHTML(noticia.imagen_alt || noticia.titulo || 'Imagen de la noticia');

    return `
        <div class="noticia-header">
            <img src="${imagenPrincipal}" alt="${imagenAlt}" class="noticia-header-imagen">
            <div class="noticia-header-overlay">
                ${noticia.categorias && noticia.categorias.length > 0 ? `
                    <div class="noticia-categorias">
                        ${noticia.categorias.map(cat => `<span class="categoria-badge">${escapeHTML(cat)}</span>`).join('')}
                    </div>
                ` : ''}
                <h1 class="noticia-titulo">${titulo}</h1>
                <div class="noticia-meta">
                    <div class="noticia-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${fecha}</span>
                    </div>
                    <div class="noticia-meta-item">
                        <i class="fas fa-user"></i>
                        <span>${autor}</span>
                    </div>
                    ${noticia.tiempo_lectura ? `
                        <div class="noticia-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${escapeHTML(noticia.tiempo_lectura)} min de lectura</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <div class="noticia-contenido">
            ${resumen ? `
                <div class="noticia-bajada">${resumen}</div>
            ` : ''}

            <div class="noticia-cuerpo">
                ${contenidoHTML || '<p>Contenido no disponible.</p>'}
            </div>

            ${noticia.etiquetas && noticia.etiquetas.length > 0 ? `
                <div class="noticia-etiquetas">
                    <h3><i class="fas fa-tags"></i> Etiquetas</h3>
                    <div class="etiquetas-list">
                        ${noticia.etiquetas.map(tag => `
                            <span class="etiqueta-badge">
                                <i class="fas fa-tag"></i> ${escapeHTML(tag)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}



function enhanceMediaEmbeds(container) {
    if (!container) return;

    const pdfLinks = Array.from(container.querySelectorAll('a')).filter((link) => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        return link.classList.contains('pdf-embed') || href.endsWith('.pdf') || href.includes('.pdf?');
    });

    pdfLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        const wrap = document.createElement('div');
        wrap.className = 'pdf-mini-embed';

        const frame = document.createElement('iframe');
        frame.className = 'pdf-mini-frame';
        frame.loading = 'lazy';
        frame.src = `../reglamento.html?mini=1&pdf=${encodeURIComponent(href)}`;
        frame.title = 'Vista previa PDF';

        wrap.appendChild(frame);
        link.replaceWith(wrap);
    });

    const videos = container.querySelectorAll('video, iframe.ql-video, iframe.video-embed-youtube');
    videos.forEach((media) => {
        media.classList.add('video-embed');
        const wrapper = document.createElement('div');
        wrapper.className = 'video-frame';
        media.parentNode.insertBefore(wrapper, media);
        wrapper.appendChild(media);
    });
}
/**
 * Carga noticias relacionadas
 */
async function loadNoticiasRelacionadas(currentId, categorias) {
    const container = document.getElementById('noticiasRelacionadas');

    try {
        const noticias = (await API.get(CONFIG.ENDPOINTS.PUBLICO.NOTICIAS, false)).map(normalizeNoticia);

        let relacionadas = noticias.filter(n => {
            if (n.id === currentId) return false;
            if (!categorias || !n.categorias) return false;
            return categorias.some(cat => n.categorias.includes(cat));
        });

        if (relacionadas.length === 0) {
            relacionadas = noticias
                .filter(n => n.id !== currentId)
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        }

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
        <div class="noticia-relacionada-item" onclick="verNoticia('${encodeURIComponent(noticia.titulo || '')}')">
            <div class="noticia-relacionada-imagen">
                <img src="${noticia.imagen || getDefaultNewsImage()}" alt="${escapeHTML(noticia.titulo)}" loading="lazy">
            </div>
            <div class="noticia-relacionada-contenido">
                <div class="noticia-relacionada-titulo">${truncateText(escapeHTML(noticia.titulo || ''), 60)}</div>
                <div class="noticia-relacionada-fecha">${formatDate(noticia.fecha)}</div>
            </div>
        </div>
    `;
}

/**
 * Muestra noticia de ejemplo si falla la API
 */
async function mostrarNoticiaEjemplo(slug, id) {
    const noticiasEjemplo = {
        'inicio-del-ciclo-lectivo-2025': {
            id: 1,
            titulo: 'Inicio del Ciclo Lectivo 2025',
            resumen: 'Este lunes 4 de marzo damos inicio al nuevo ciclo lectivo con renovadas energias y proyectos innovadores para todos nuestros estudiantes.',
            contenido: `Con gran alegria damos la bienvenida al ciclo lectivo 2025. Este ano trae importantes novedades pedagogicas y tecnologicas que beneficiaran a toda nuestra comunidad educativa.\n\nEl acto de inicio se realizara el lunes 4 de marzo a las 8:00hs en el patio principal del instituto. Se solicita puntualidad y la presencia de todos los estudiantes con su uniforme completo.\n\nRecordamos a las familias que pueden consultar los horarios y materias en nuestra plataforma virtual, accesible desde la web institucional.\n\nLes deseamos un excelente ano lectivo lleno de aprendizajes y logros!`,
            fecha: '2025-02-28',
            imagen: 'https://ebmbaeuwvigvlxvyvqwc.supabase.co/storage/v1/object/public/LOGOS%20IPSM/Inicial.jpg',
            autor: 'Direccion',
            categorias: ['Institucional', 'Academico'],
            etiquetas: ['ciclo lectivo', 'bienvenida', '2025'],
            tiempo_lectura: 3
        }
    };

    const noticia = normalizeNoticia(noticiasEjemplo[slug] || noticiasEjemplo['inicio-del-ciclo-lectivo-2025']);
    currentNoticia = noticia;
    await mostrarNoticia(noticia);
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

    const texto = `Noticia: ${currentNoticia.titulo}\n\n${currentNoticia.resumen || ''}\n\n${window.location.href}`;
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
    showToast('Instagram no permite compartir enlaces directamente. Copia el enlace y compartelo en tu historia o publicacion.', 'info');
    copiarEnlace();
}

/**
 * Copiar enlace
 */
function copiarEnlace() {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Enlace copiado al portapapeles.', 'success');
        }).catch(err => {
            console.error('Error al copiar:', err);
            showToast('Error al copiar el enlace', 'error');
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            showToast('Enlace copiado al portapapeles.', 'success');
        } catch (err) {
            showToast('Error al copiar el enlace', 'error');
        }

        document.body.removeChild(textarea);
    }
}

/**
 * Muestra un toast de notificacion
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
    const pageTitle = document.getElementById('pageTitle');
    const metaDescription = document.getElementById('metaDescription');
    const ogTitle = document.getElementById('ogTitle');
    const ogDescription = document.getElementById('ogDescription');
    const ogImage = document.getElementById('ogImage');

    if (pageTitle) pageTitle.textContent = `${noticia.titulo} - Instituto San Marino`;
    if (metaDescription) metaDescription.setAttribute('content', noticia.resumen || noticia.titulo || 'Noticia');
    if (ogTitle) ogTitle.setAttribute('content', noticia.titulo || 'Noticia');
    if (ogDescription) ogDescription.setAttribute('content', noticia.resumen || noticia.titulo || 'Noticia');
    if (ogImage) ogImage.setAttribute('content', noticia.imagen || '');
}

/**
 * Redirige a ver otra noticia
 */
function verNoticia(encodedTitulo) {
    const q = (encodedTitulo || '').trim();
    window.location.href = `noticia-detalle.html?${q}`;
}

/**
 * Convierte texto a slug
 */
function slugify(text) {
    return (text || '')
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
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-AR', options);
}

/**
 * Trunca texto
 */
function truncateText(text, maxLength) {
    if (!text) return '';
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


