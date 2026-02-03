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
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
            });
        });
        
        // Cerrar menú al hacer clic fuera
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
    const container = document.getElementById('noticiasContainer');
    
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // Llamada a la API para obtener las últimas noticias
        const noticias = await API.get(CONFIG.ENDPOINTS.PUBLICO.NOTICIAS + '?limit=3');
        
        if (noticias && noticias.length > 0) {
            container.innerHTML = noticias.map(noticia => createNoticiaCard(noticia)).join('');
        } else {
            container.innerHTML = '<p class="text-center">No hay noticias disponibles en este momento.</p>';
        }
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        // Mostrar noticias de ejemplo si falla la API
        mostrarNoticiasEjemplo(container);
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Crea el HTML de una tarjeta de noticia
 */
function createNoticiaCard(noticia) {
    return `
        <div class="noticia-card" onclick="verNoticia(${noticia.id})">
            <img src="${noticia.imagen || 'images/noticias/default.jpg'}" alt="${noticia.titulo}" class="noticia-image">
            <div class="noticia-content">
                <div class="noticia-fecha">${Utils.formatDate(noticia.fecha)}</div>
                <h3 class="noticia-titulo">${noticia.titulo}</h3>
                <p class="noticia-resumen">${noticia.resumen}</p>
                <a href="#" class="noticia-leer-mas">Leer más →</a>
            </div>
        </div>
    `;
}

/**
 * Muestra noticias de ejemplo
 */
function mostrarNoticiasEjemplo(container) {
    const noticiasEjemplo = [
        {
            id: 1,
            titulo: 'Inicio del Ciclo Lectivo 2025',
            resumen: 'Este lunes 4 de marzo damos inicio al nuevo ciclo lectivo con renovadas energías y proyectos innovadores.',
            fecha: '2025-02-28',
            imagen: 'images/noticias/inicio-ciclo.jpg'
        },
        {
            id: 2,
            titulo: 'Nuestros alumnos destacados en las Olimpíadas de Matemática',
            resumen: 'Felicitamos a nuestros estudiantes por su excelente desempeño en las Olimpíadas Provinciales de Matemática.',
            fecha: '2025-02-20',
            imagen: 'images/noticias/olimpiadas.jpg'
        },
        {
            id: 3,
            titulo: 'Nueva Sala de Informática',
            resumen: 'Inauguramos nuestra nueva sala de informática equipada con tecnología de última generación.',
            fecha: '2025-02-15',
            imagen: 'images/noticias/sala-informatica.jpg'
        }
    ];
    
    container.innerHTML = noticiasEjemplo.map(noticia => createNoticiaCard(noticia)).join('');
}

/**
 * Redirige a la página de detalle de noticia
 */
function verNoticia(noticiaId) {
    window.location.href = `pages/noticia.html?id=${noticiaId}`;
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
