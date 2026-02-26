/**
 * Menu movil para Reglamento (copiado de home.js para evitar choques)
 */
document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
});

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

        // cerrar dropdowns al cerrar menu
        dropdowns.forEach(d => d.classList.remove('open'));
    }

    menuToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        mainNav.classList.contains('active') ? closeMenu() : openMenu();
    });

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });

            dropdown.classList.toggle('open');
        });
    });

    mainNav
        .querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-link')
        .forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

    overlay?.addEventListener('click', closeMenu);

    document.addEventListener('click', function (event) {
        if (
            mainNav.classList.contains('active') &&
            !mainNav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMenu();
        }
    });
}
