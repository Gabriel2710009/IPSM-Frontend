/**
 * Configuración Global del Sistema
 * Instituto Privado San Marino
 */

const CONFIG = {
    // URL Base de la API (FastAPI)
    API_BASE_URL: 'https://ipsm-backend.onrender.com',
    
    // Endpoints principales
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            VERIFY: '/auth/verify'
        },
        ALUMNOS: {
            PROFILE: '/alumnos/perfil',
            NOTAS: '/alumnos/notas',
            COMUNICADOS: '/alumnos/comunicados',
            MENSAJES: '/alumnos/mensajes'
        },
        PADRES: {
            PROFILE: '/padres/perfil',
            HIJOS: '/padres/hijos',
            CUOTAS: '/padres/cuotas',
            LIBRETA: '/padres/libreta'
        },
        DOCENTES: {
            PROFILE: '/docentes/perfil',
            CURSOS: '/docentes/cursos',
            NOTAS: '/docentes/notas',
            MENSAJES: '/docentes/mensajes'
        },
        PRECEPTORES: {
            PROFILE: '/preceptores/perfil',
            CURSOS: '/preceptores/cursos',
            COMUNICADOS: '/preceptores/comunicados'
        },
        ADMIN: {
            USUARIOS: '/admin/usuarios',
            CUOTAS: '/admin/cuotas',
            COMUNICADOS: '/admin/comunicados',
            PAGOS: '/admin/pagos'
        },
        PUBLICO: {
            NOTICIAS: '/publico/noticias',
            CURSOS: '/publico/cursos',
            CONTACTO: '/publico/contacto'
        }
    },
    
    // Configuración de almacenamiento
    STORAGE_KEYS: {
        TOKEN: 'san_marino_token',
        USER: 'san_marino_user',
        ROLE: 'san_marino_role'
    },
    
    // Roles del sistema
    ROLES: {
        ALUMNO: 'alumno',
        PADRE: 'padre',
        DOCENTE: 'docente',
        PRECEPTOR: 'preceptor',
        ADMIN: 'admin'
    },
    
    // Páginas por rol
    DASHBOARD_PAGES: {
        alumno: '/pages/alumno/dashboard.html',
        padre: '/pages/padre/dashboard.html',
        docente: '/pages/docente/dashboard.html',
        preceptor: '/pages/preceptor/dashboard.html',
        admin: '/pages/admin/dashboard.html'
    },
    
    // Configuración de cuotas
    CUOTAS: {
        DIA_VENCIMIENTO: 10,
        RECARGO_DIAS: 3
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
