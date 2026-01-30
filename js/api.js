/**
 * Módulo de utilidades para API
 * Manejo de peticiones HTTP y autenticación
 */

const API = {
    /**
     * Realiza una petición GET a la API
     */
    async get(endpoint, requiresAuth = false) {
        try {
            const headers = this.getHeaders(requiresAuth);
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    },
    
    /**
     * Realiza una petición POST a la API
     */
    async post(endpoint, data, requiresAuth = false) {
        try {
            const headers = this.getHeaders(requiresAuth);
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    },
    
    /**
     * Realiza una petición PUT a la API
     */
    async put(endpoint, data, requiresAuth = false) {
        try {
            const headers = this.getHeaders(requiresAuth);
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en PUT:', error);
            throw error;
        }
    },
    
    /**
     * Realiza una petición DELETE a la API
     */
    async delete(endpoint, requiresAuth = false) {
        try {
            const headers = this.getHeaders(requiresAuth);
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: headers
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    },
    
    /**
     * Sube un archivo a la API
     */
    async uploadFile(endpoint, file, requiresAuth = true) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const headers = {};
            if (requiresAuth) {
                const token = Auth.getToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error al subir archivo:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene los headers necesarios para la petición
     */
    getHeaders(requiresAuth) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (requiresAuth) {
            const token = Auth.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },
    
    /**
     * Maneja la respuesta de la API
     */
    async handleResponse(response) {
        // Si el token expiró, redirigir al login
        if (response.status === 401) {
            Auth.logout();
            window.location.href = '/pages/auth/login.html';
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
        
        // Si hay error del servidor
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Intentar parsear JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        // Si no es JSON, devolver la respuesta cruda
        return response;
    }
};

/**
 * Módulo de Autenticación
 */
const Auth = {
    /**
     * Inicia sesión con DNI y contraseña
     */
    async login(dni, password) {
        try {
            const response = await API.post(CONFIG.ENDPOINTS.AUTH.LOGIN, {
                dni: dni,
                password: password
            });
            
            // Guardar token y datos del usuario
            this.saveToken(response.access_token);
            this.saveUser(response.user);
            this.saveRole(response.user.role);
            
            return response;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },
    
    /**
     * Cierra la sesión del usuario
     */
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ROLE);
        window.location.href = '/index.html';
    },
    
    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        const token = this.getToken();
        return token !== null && token !== undefined;
    },
    
    /**
     * Obtiene el token almacenado
     */
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },
    
    /**
     * Guarda el token en localStorage
     */
    saveToken(token) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
    },
    
    /**
     * Obtiene los datos del usuario
     */
    getUser() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    },
    
    /**
     * Guarda los datos del usuario
     */
    saveUser(user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    },
    
    /**
     * Obtiene el rol del usuario
     */
    getRole() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.ROLE);
    },
    
    /**
     * Guarda el rol del usuario
     */
    saveRole(role) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ROLE, role);
    },
    
    /**
     * Redirige al dashboard correspondiente según el rol
     */
    redirectToDashboard() {
        const role = this.getRole();
        const dashboardPage = CONFIG.DASHBOARD_PAGES[role];
        
        if (dashboardPage) {
            window.location.href = dashboardPage;
        } else {
            console.error('Rol no reconocido:', role);
            this.logout();
        }
    },
    
    /**
     * Verifica si el usuario tiene un rol específico
     */
    hasRole(role) {
        return this.getRole() === role;
    }
};

/**
 * Utilidades generales
 */
const Utils = {
    /**
     * Formatea una fecha
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-AR', options);
    },
    
    /**
     * Formatea una fecha corta
     */
    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    },
    
    /**
     * Muestra un mensaje de éxito
     */
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    },
    
    /**
     * Muestra un mensaje de error
     */
    showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    },
    
    /**
     * Muestra un mensaje de advertencia
     */
    showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    },
    
    /**
     * Muestra una notificación
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remover después del tiempo especificado
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },
    
    /**
     * Muestra un loader
     */
    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('active');
        }
    },
    
    /**
     * Oculta el loader
     */
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('active');
        }
    },
    
    /**
     * Valida un DNI
     */
    validateDNI(dni) {
        const dniPattern = /^\d{7,8}$/;
        return dniPattern.test(dni);
    },
    
    /**
     * Valida un email
     */
    validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    },
    
    /**
     * Determina el estado de una cuota según la fecha
     */
    getCuotaStatus(fechaVencimiento, pagado) {
        if (pagado) return 'pagado';
        
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);
        
        return hoy > vencimiento ? 'vencido' : 'pendiente';
    },
    
    /**
     * Obtiene el texto de estado de una cuota
     */
    getCuotaStatusText(status) {
        const statusTexts = {
            pagado: 'Pagado',
            pendiente: 'Pendiente',
            vencido: 'Vencido'
        };
        return statusTexts[status] || 'Desconocido';
    }
};
