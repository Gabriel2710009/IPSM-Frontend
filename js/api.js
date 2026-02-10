/**
 * API Helper - Funciones para comunicación con el backend
 * Con debugging mejorado y soporte para autenticación
 */

// Clase para manejar las peticiones HTTP
class API {
    /**
     * Realiza una petición GET al backend
     * @param {string} endpoint - Endpoint de la API
     * @param {boolean} requireAuth - Si requiere autenticación (default: true)
     */
    static async get(endpoint, requireAuth = true) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API GET Request:', {
            endpoint,
            fullUrl: url,
            requireAuth,
            timestamp: new Date().toISOString()
        });
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Agregar headers de autenticación si es necesario
            if (requireAuth) {
                const authHeaders = this.getAuthHeaders();
                Object.assign(headers, authHeaders);
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            
            console.log('📡 API GET Response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ API GET Error:', {
                endpoint,
                error: error.message,
                stack: error.stack
            });
            throw this.handleError(error, url);
        }
    }
    
    /**
     * Realiza una petición POST al backend
     * @param {string} endpoint - Endpoint de la API
     * @param {object} data - Datos a enviar
     * @param {boolean} requireAuth - Si requiere autenticación (default: true)
     */
    static async post(endpoint, data, requireAuth = true) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API POST Request:', {
            endpoint,
            fullUrl: url,
            requireAuth,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (requireAuth) {
                const authHeaders = this.getAuthHeaders();
                Object.assign(headers, authHeaders);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            console.log('📡 API POST Response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ API POST Error:', {
                endpoint,
                error: error.message,
                stack: error.stack
            });
            throw this.handleError(error, url);
        }
    }
    
    /**
     * Realiza una petición PUT al backend
     * @param {string} endpoint - Endpoint de la API
     * @param {object} data - Datos a enviar
     * @param {boolean} requireAuth - Si requiere autenticación (default: true)
     */
    static async put(endpoint, data, requireAuth = true) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API PUT Request:', {
            endpoint,
            fullUrl: url,
            requireAuth,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (requireAuth) {
                const authHeaders = this.getAuthHeaders();
                Object.assign(headers, authHeaders);
            }
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data)
            });
            
            console.log('📡 API PUT Response:', {
                status: response.status,
                statusText: response.statusText
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ API PUT Error:', {
                endpoint,
                error: error.message
            });
            throw this.handleError(error, url);
        }
    }
    
    /**
     * Realiza una petición DELETE al backend
     * @param {string} endpoint - Endpoint de la API
     * @param {boolean} requireAuth - Si requiere autenticación (default: true)
     */
    static async delete(endpoint, dataOrRequireAuth = true, maybeRequireAuth = true) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API DELETE Request:', {
            endpoint,
            fullUrl: url,
            requireAuth,
            timestamp: new Date().toISOString()
        });
        
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            let data = null;
            let requireAuth = true;

            if (typeof dataOrRequireAuth === 'boolean') {
                requireAuth = dataOrRequireAuth;
            } else {
                data = dataOrRequireAuth;
                requireAuth = typeof maybeRequireAuth === 'boolean' ? maybeRequireAuth : true;
            }

            if (requireAuth) {
                const authHeaders = this.getAuthHeaders();
                Object.assign(headers, authHeaders);
            }
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
                body: data ? JSON.stringify(data) : undefined
            });
            
            console.log('📡 API DELETE Response:', {
                status: response.status,
                statusText: response.statusText
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ API DELETE Error:', {
                endpoint,
                error: error.message
            });
            throw this.handleError(error, url);
        }
    }
    
    /**
     * Obtiene los headers de autenticación
     */
    static getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        
        console.log('🔒 Getting auth headers:', {
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + '...' : null
        });
        
        if (token) {
            return {
                'Authorization': `Bearer ${token}`
            };
        }
        
        return {};
    }
    
    /**
     * Maneja la respuesta del servidor
     */
    static async handleResponse(response) {
        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        // Si es 401, el token expiró
        if (response.status === 401) {
            console.warn('⚠️ Token expirado o inválido - redirigiendo al login');
            
            // Limpiar localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            
            // Redirigir al login
            window.location.href = '../../pages/auth/login.html';
            
            throw new Error('Token inválido o expirado');
        }
        
        // Intentar parsear JSON si el content-type es JSON
        if (contentType && contentType.includes('application/json')) {
            if (contentLength === '0') {
                if (!response.ok) {
                    const error = new Error(`Error ${response.status}`);
                    error.status = response.status;
                    throw error;
                }
                return null;
            }

            const raw = await response.text();
            if (!raw) {
                if (!response.ok) {
                    const error = new Error(`Error ${response.status}`);
                    error.status = response.status;
                    throw error;
                }
                return null;
            }

            const data = JSON.parse(raw);
            
            console.log('📦 Response Data:', data);
            
            if (!response.ok) {
                const error = new Error(data.detail || data.message || `Error ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }
            
            return data;
        }
        
        // Si no es JSON, intentar obtener texto
        const text = await response.text();
        
        if (!response.ok) {
            const error = new Error(text || `Error ${response.status}`);
            error.status = response.status;
            throw error;
        }
        
        // Intentar parsear el texto como JSON
        try {
            return JSON.parse(text);
        } catch {
            return text || null;
        }
    }
    
    /**
     * Maneja errores de la API
     */
    static handleError(error, url) {
        console.error('🚨 API Error Handler:', {
            message: error.message,
            url: url,
            timestamp: new Date().toISOString()
        });
        
        // Error de red
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            const networkError = new Error(
                `No se pudo conectar con el servidor. Verifique su conexión a internet.`
            );
            networkError.isNetworkError = true;
            return networkError;
        }
        
        // Error de CORS
        if (error.message.includes('CORS')) {
            const corsError = new Error(
                'Error de CORS. Contacte al administrador del sistema.'
            );
            corsError.isCorsError = true;
            return corsError;
        }
        
        return error;
    }
    
    /**
     * Verifica la conectividad con el backend
     */
    static async checkHealth() {
        console.log('🏥 Checking backend health...');
        
        try {
            const response = await this.get('/', false); // Sin auth para health check
            console.log('✅ Backend is healthy:', response);
            return true;
        } catch (error) {
            console.error('❌ Backend health check failed:', error);
            return false;
        }
    }
}

// Clase para manejar autenticación
class Auth {
    /**
     * Inicia sesión
     */
    static async login(dni, password) {
        console.log('🔐 Login attempt:', {
            dni: dni,
            passwordLength: password.length,
            apiUrl: CONFIG.API_BASE_URL,
            timestamp: new Date().toISOString()
        });
        
        try {
            // Primero verificar conectividad
            const isHealthy = await API.checkHealth();
            if (!isHealthy) {
                throw new Error('El servidor no está disponible. Intente nuevamente en unos momentos.');
            }
            
            const requestBody = {
                dni: dni,
                password: password
            };
            
            console.log('📤 Sending login request to:', `${CONFIG.API_BASE_URL}/api/v1/auth/login`);
            
            // Login NO requiere auth
            const data = await API.post('/api/v1/auth/login', requestBody, false);
            
            console.log('✅ Login successful:', {
                hasToken: !!data.access_token,
                tokenType: data.token_type
            });
            
            // Guardar token
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('token_type', data.token_type || 'bearer');
                
                if (data.refresh_token) {
                    localStorage.setItem('refresh_token', data.refresh_token);
                }
                
                if (data.user) {
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                }
            }
            
            return data;
        } catch (error) {
            console.error('🚨 Login error:', {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
    
    /**
     * Obtiene los datos del usuario actual
     */
    static async getCurrentUser() {
        console.log('Fetching current user data...');
        
        try {
            const userData = await API.get('/api/v1/auth/me', true);
            console.log('User data retrieved:', userData);
            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }
    
    /**
     * Cierra sesión
     */
    static logout() {
        console.log('🚪 Logging out...');
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user_dni')
        localStorage.removeItem('user_data');
        
        window.location.href = '../../pages/auth/login.html';
    }
    
    /**
     * Verifica si el usuario está autenticado
     */
    static isAuthenticated() {
        const token = localStorage.getItem('access_token');
        const isAuth = !!token;
        
        console.log('🔒 Authentication check:', {
            hasToken: isAuth,
            tokenPreview: token ? token.substring(0, 20) + '...' : null
        });
        
        return isAuth;
    }
    
    /**
     * Obtiene el token de acceso
     */
    static getToken() {
        return localStorage.getItem('access_token');
    }

    /**
     * Obtiene los datos del usuario desde localStorage
     */
    static getUser() {
        const userDataStr = localStorage.getItem('user_data');
        if (!userDataStr) return null;
        try {
            return JSON.parse(userDataStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Verifica si el usuario tiene un rol especifico
     */
    static hasRole(role) {
        const user = this.getUser();
        return !!(user && user.role === role);
    }
    
    /**
     * Redirige al dashboard según el rol del usuario
     */
    static redirectToDashboard() {
        console.log('🔀 Redirecting to dashboard...');
        
        const userDataStr = localStorage.getItem('user_data');
        
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                console.log('📊 User role:', userData.role);
                
                // Redirigir según rol
                switch (userData.role) {
                    case 'admin':
                        window.location.href = '../../pages/admin/dashboard.html';
                        break;
                    case 'preceptor':
                        window.location.href = '../../pages/preceptor/dashboard.html';
                        break;
                    case 'profesor':
                    case 'docente':
                        window.location.href = '../../pages/profesor/dashboard.html';
                        break;
                    case 'alumno':
                        window.location.href = '../../pages/alumno/dashboard.html';
                        break;
                    case 'padre':
                        window.location.href = '../../pages/padre/dashboard.html';
                        break;
                    default:
                        console.warn('⚠️ Unknown role, redirecting to login');
                        window.location.href = '../../pages/auth/login.html';
                }
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                window.location.href = '../../pages/auth/login.html';
            }
        } else {
            console.warn('⚠️ No user data found, redirecting to login');
            window.location.href = '../../pages/auth/login.html';
        }
    }
}

// Clase de utilidades
class Utils {
    /**
     * Muestra un loader
     */
    static showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('active');
        }
    }
    
    /**
     * Oculta el loader
     */
    static hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('active');
        }
    }
    
    /**
     * Muestra una notificación de éxito
     */
    static showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    }
    
    /**
     * Muestra una notificación de error
     */
    static showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    }
    
    /**
     * Muestra una notificación de advertencia
     */
    static showWarning(message, duration = 4000) {
        this.showNotification(message, 'warning', duration);
    }
    
    /**
     * Muestra una notificación
     */
    static showNotification(message, type = 'info', duration = 3000) {
        // Crear notificación si no existe
        let notification = document.querySelector('.notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Configurar notificación
        notification.textContent = message;
        notification.className = `notification notification-${type}`;
        
        // Mostrar
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar después del duration
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
    
    /**
     * Valida un DNI argentino
     */
    static validateDNI(dni) {
        const dniStr = String(dni).trim();
        return /^[0-9]{7,8}$/.test(dniStr);
    }
    
    /**
     * Formatea un DNI con puntos
     */
    static formatDNI(dni) {
        const dniStr = String(dni).replace(/\D/g, '');
        return dniStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    /**
     * Formatea una fecha
     */
    static formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    }
    
    /**
     * Formatea una fecha y hora
     */
    static formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-AR');
    }

    /**
     * Formatea fecha para input type="date" (YYYY-MM-DD)
     */
    static formatDateInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Log de inicio
console.log('✅ API Module Loaded:', {
    apiBaseUrl: CONFIG.API_BASE_URL,
    timestamp: new Date().toISOString()
});
