/**
 * Configuración Global del Sistema
 * Instituto Privado San Marino
 */

const CONFIG = {
    // URL Base de la API (FastAPI)
    API_BASE_URL: 'https://ipsm-backend.onrender.com',
    
    // Endpoints principales
    // Endpoints principales (con prefijo /api/v1 del backend)
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            LOGOUT: '/api/v1/auth/logout',
            REFRESH: '/api/v1/auth/refresh',
            VERIFY: '/api/v1/auth/verify',
            ME: '/api/v1/auth/me',
            CHANGE_PASSWORD: '/api/v1/auth/change-password'
        },
        ALUMNOS: {
            PROFILE: '/api/v1/alumnos/perfil',
            NOTAS: '/api/v1/alumnos/notas',
            COMUNICADOS: '/api/v1/alumnos/comunicados',
            MENSAJES: '/api/v1/alumnos/mensajes'
        },
        PADRES: {
            PROFILE: '/api/v1/padres/perfil',
            HIJOS: '/api/v1/padres/hijos',
            CUOTAS: '/api/v1/padres/cuotas',
            PAGAR_CUOTA: '/api/v1/padres/cuotas/{id}/pagar',
            SUBIR_COMPROBANTE: '/api/v1/padres/cuotas/{id}/comprobante',
            LIBRETA: '/api/v1/padres/libreta/{hijo_id}/{trimestre}'
        },
        DOCENTES: {
            PROFILE: '/api/v1/docentes/perfil',
            CURSOS: '/api/v1/docentes/cursos',
            NOTAS: '/api/v1/docentes/notas',
            MENSAJES: '/api/v1/docentes/mensajes'
        },
        PRECEPTORES: {
            PROFILE: '/api/v1/preceptores/perfil',
            CURSOS: '/api/v1/preceptores/cursos',
            COMUNICADOS: '/api/v1/preceptores/comunicados'
        },
        ADMIN: {
            USUARIOS: '/api/v1/admin/usuarios',
            CUOTAS_CONFIG: '/api/v1/admin/cuotas/configuracion',
            COMUNICADOS: '/api/v1/admin/comunicados',
            PAGOS: '/api/v1/admin/pagos'
        },
        PUBLICO: {
            NOTICIAS: '/api/v1/publico/noticias',
            CURSOS: '/api/v1/publico/cursos',
            CONTACTO: '/api/v1/publico/contacto'
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
