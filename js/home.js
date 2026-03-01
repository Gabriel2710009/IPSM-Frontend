/**
 * JavaScript para la página principal
 */

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    loadNoticias();
    initContactForm();
    initSmoothScroll();
    initNivelesDropdown();
});

function ensureAnimatedMenuIcon(menuToggle) {
    if (!menuToggle) return;
    if (menuToggle.querySelector('.menu-bar')) return;
    menuToggle.innerHTML = '<span class="menu-bar bar-1"></span><span class="menu-bar bar-2"></span><span class="menu-bar bar-3"></span>';
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const overlay = document.querySelector('.menu-overlay');

    if (!menuToggle || !mainNav) return;

    ensureAnimatedMenuIcon(menuToggle);

    const dropdowns = mainNav.querySelectorAll('.dropdown');

    function openMenu() {
        mainNav.classList.add('active');
        document.body.classList.add('menu-open');
        menuToggle.classList.add('is-open');
    }

    function closeMenu() {
        mainNav.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.classList.remove('is-open');
        dropdowns.forEach((d) => d.classList.remove('open'));
    }

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        mainNav.classList.contains('active') ? closeMenu() : openMenu();
    });

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            dropdowns.forEach((d) => {
                if (d !== dropdown) d.classList.remove('open');
            });

            dropdown.classList.toggle('open');
        });
    });

    mainNav.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link').forEach((link) => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) closeMenu();
        });
    });

    overlay?.addEventListener('click', closeMenu);

    document.addEventListener('click', function(event) {
        if (
            mainNav.classList.contains('active') &&
            !mainNav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }

        dropdowns.forEach((dropdown) => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('open');
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (mainNav.classList.contains('active')) closeMenu();
            dropdowns.forEach((d) => d.classList.remove('open'));
        }
    });
}

async function loadNoticias() {
    try {
        const noticiasContainer = document.getElementById('noticiasContainer') || document.getElementById('noticias-container');
        const fallbackImage = (typeof CONFIG !== 'undefined' && CONFIG.ASSETS && CONFIG.ASSETS.DEFAULT_NEWS_IMAGE)
            ? CONFIG.ASSETS.DEFAULT_NEWS_IMAGE
            : './images/placeholder.jpg';

        if (!noticiasContainer) {
            console.warn('No se encontró el contenedor de noticias en la página.');
            return;
        }

        let noticias;

        try {
            noticias = await API.get('/api/v1/publico/noticias?limit=3');
        } catch (error) {
            console.warn('API no disponible, usando datos de respaldo');
            noticias = [
                { id: 1, titulo: 'Inauguración de Nueva Sala de Informática', resumen: 'El IPSM estrena modernas instalaciones.', imagen_url: fallbackImage, fecha_publicacion: new Date().toISOString() },
                { id: 2, titulo: 'Inicio del Ciclo Lectivo 2026', resumen: 'Bienvenidos al nuevo año académico.', imagen_url: fallbackImage, fecha_publicacion: new Date().toISOString() },
                { id: 3, titulo: 'Olimpiadas Deportivas', resumen: 'Excelentes resultados de nuestros estudiantes.', imagen_url: fallbackImage, fecha_publicacion: new Date().toISOString() }
            ];
        }

        if (noticias && noticias.length > 0) {
            noticiasContainer.innerHTML = noticias.map((noticia) => `
                <article class="noticia-card" onclick="verNoticia('${noticia.id}')">
                    <img src="${noticia.imagen_url || noticia.imagen || fallbackImage}" alt="${noticia.titulo}" onerror="this.src='${fallbackImage}'">
                    <div class="noticia-content">
                        <h3>${noticia.titulo}</h3>
                        <p>${noticia.resumen || noticia.contenido?.substring(0, 150) + '...'}</p>
                        <span class="fecha">${new Date(noticia.fecha_publicacion || noticia.fecha).toLocaleDateString('es-AR')}</span>
                    </div>
                </article>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        const container = document.getElementById('noticiasContainer') || document.getElementById('noticias-container');
        if (container) container.innerHTML = '<p>Las noticias se cargarán próximamente.</p>';
    }
}

function createNoticiaCard(noticia) {
    return `
        <div class="noticia-card" onclick="verNoticia('${noticia.id}')">
            <img src="${noticia.imagen || noticia.imagen_url || (CONFIG && CONFIG.ASSETS && CONFIG.ASSETS.DEFAULT_NEWS_IMAGE) || 'images/noticias/default.jpg'}" alt="${noticia.titulo}" class="noticia-image">
            <div class="noticia-content">
                <div class="noticia-fecha">${Utils.formatDate(noticia.fecha_publicacion || noticia.fecha)}</div>
                <h3 class="noticia-titulo">${noticia.titulo}</h3>
                <p class="noticia-resumen">${noticia.resumen}</p>
                <a href="#" class="noticia-leer-mas">Leer más →</a>
            </div>
        </div>
    `;
}

function verNoticia(noticiaId) {
    window.location.href = `pages/noticia-detalle.html?id=${noticiaId}`;
}

function initContactForm() {
    const form = document.getElementById('contactoForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            nombre: document.getElementById('nombre')?.value,
            email: document.getElementById('email')?.value,
            telefono: document.getElementById('telefono')?.value,
            mensaje: document.getElementById('mensaje')?.value
        };

        if (!Utils.validateEmail(formData.email)) {
            Utils.showError('Por favor, ingrese un email válido.');
            return;
        }

        try {
            Utils.showLoader();
            await API.post(CONFIG.ENDPOINTS.PUBLICO.CONTACTO, formData);
            Utils.showSuccess('¡Mensaje enviado correctamente! Nos pondremos en contacto a la brevedad.');
            form.reset();
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            Utils.showError('Hubo un error al enviar el mensaje. Por favor, intente nuevamente.');
        } finally {
            Utils.hideLoader();
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();

            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });
}

window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 100) current = section.getAttribute('id');
    });

    navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
    });
});

function initNivelesDropdown() {
    const btn = document.getElementById('nivelesBtn');
    const menu = document.getElementById('nivelesMenu');
    const dropdown = btn?.closest('.dropdown');

    if (!btn || !menu) return;

    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (dropdown) {
            dropdown.classList.toggle('open');
        } else {
            menu.classList.toggle('open');
        }
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            dropdown?.classList.remove('open');
        });
    });

    document.addEventListener('click', function(e) {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('open');
            dropdown?.classList.remove('open');
        }
    });
}
