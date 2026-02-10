/**
 * JavaScript para la página principal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initMobileMenu();
    loadNoticias();
    initContactForm();
    initSmoothScroll();
    initNivelesDropdown();
});

/**
 * Inicializa el menú móvil
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const overlay = document.querySelector('.menu-overlay');

    if (!menuToggle || !mainNav) return;

    const dropdowns = mainNav.querySelectorAll('.dropdown');

    function openMenu() {
        mainNav.classList.add('active');
        document.body.classList.add('menu-open');
        menuToggle.textContent = '✕';
    }

    function closeMenu() {
        mainNav.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.textContent = '☰';

        // cerrar dropdowns al cerrar menú
        dropdowns.forEach(d => d.classList.remove('open'));
    }

    /* =========================
       TOGGLE MENÚ
       ========================= */
    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        mainNav.classList.contains('active') ? closeMenu() : openMenu();
    });

    /* =========================
       DROPDOWNS (NIVELES)
       ========================= */
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');

        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // cerrar otros dropdowns
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });

            // abrir/cerrar este
            dropdown.classList.toggle('open');
        });
    });

    /* =========================
       CERRAR AL TOCAR LINKS
       ========================= */
    mainNav
        .querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link')
        .forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

    /* =========================
       OVERLAY
       ========================= */
    overlay?.addEventListener('click', closeMenu);

    /* =========================
       CLICK FUERA
       ========================= */
    document.addEventListener('click', function (event) {
        if (
            mainNav.classList.contains('active') &&
            !mainNav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    /* =========================
       ESC
       ========================= */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMenu();
        }
    });
}



/**
 * Carga las noticias desde la API
 */
async function loadNoticias() {
    try {
        const noticiasContainer = document.getElementById('noticiasContainer') ||
            document.getElementById('noticias-container');
        const fallbackImage = (typeof CONFIG !== 'undefined' && CONFIG.ASSETS && CONFIG.ASSETS.DEFAULT_NEWS_IMAGE) ?
            CONFIG.ASSETS.DEFAULT_NEWS_IMAGE :
            './images/placeholder.jpg';

        if (!noticiasContainer) {
            console.warn('No se encontrÃ³ el contenedor de noticias en la pÃ¡gina.');
            return;
        }
        
        let noticias;
        
        try {
            noticias = await API.get('/api/v1/publico/noticias?limit=3');
        } catch (error) {
            console.warn('API no disponible, usando datos de respaldo');
            
            // Datos de respaldo
            noticias = [
                {
                    id: 1,
                    titulo: 'Inauguración de Nueva Sala de Informática',
                    resumen: 'El IPSM estrena modernas instalaciones.',
                    imagen_url: fallbackImage,
                    fecha_publicacion: new Date().toISOString()
                },
                {
                    id: 2,
                    titulo: 'Inicio del Ciclo Lectivo 2026',
                    resumen: 'Bienvenidos al nuevo año académico.',
                    imagen_url: fallbackImage,
                    fecha_publicacion: new Date().toISOString()
                },
                {
                    id: 3,
                    titulo: 'Olimpiadas Deportivas',
                    resumen: 'Excelentes resultados de nuestros estudiantes.',
                    imagen_url: fallbackImage,
                    fecha_publicacion: new Date().toISOString()
                }
            ];
        }
        
        if (noticias && noticias.length > 0) {
            noticiasContainer.innerHTML = noticias.map(noticia => `
                <article class="noticia-card" onclick="verNoticia('${noticia.id}')">
                    <img src="${noticia.imagen_url || noticia.imagen || fallbackImage}" 
                         alt="${noticia.titulo}"
                         onerror="this.src='${fallbackImage}'">
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
        const container = document.getElementById('noticiasContainer') ||
            document.getElementById('noticias-container');
        if (container) {
            container.innerHTML = '<p>Las noticias se cargarán próximamente.</p>';
        }
    }
}

/**
 * Crea el HTML de una tarjeta de noticia
 */
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


/**
 * Redirige a la página de detalle de noticia
 */
function verNoticia(noticiaId) {
    window.location.href = `pages/noticia-detalle.html?id=${noticiaId}`;
}

/**
 * Inicializa el formulario de contacto
 */
function initContactForm() {
    const form = document.getElementById('contactoForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            mensaje: document.getElementById('mensaje').value
        };
        
        // Validar datos
        if (!Utils.validateEmail(formData.email)) {
            Utils.showError('Por favor, ingrese un email válido.');
            return;
        }
        
        try {
            Utils.showLoader();
            
            // Enviar formulario a la API
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

/**
 * Inicializa el scroll suave
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignorar enlaces de tipo "#" sin destino
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Animaciones al hacer scroll
 */
window.addEventListener('scroll', function() {
    // Resaltar enlace activo en la navegación
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

/**
 * Dropdown Niveles (hover en PC / click en móvil)
 */
function initNivelesDropdown() {
    const btn = document.getElementById('nivelesBtn');
    const menu = document.getElementById('nivelesMenu');

    if (!btn || !menu) return;

    btn.addEventListener('click', function (e) {
        // Solo móvil
        if (window.innerWidth < 768) {
            e.preventDefault();
            e.stopPropagation();
            menu.classList.toggle('open');
        }
    });

    // Cerrar al tocar una opción (móvil)
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
        });
    });

    // Cerrar si tocás fuera (móvil)
    document.addEventListener('click', function (e) {
        if (window.innerWidth < 768) {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('open');
            }
        }
    });
}
