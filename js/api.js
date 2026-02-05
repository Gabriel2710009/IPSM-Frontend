/**
 * API Helper - Funciones para comunicación con el backend
 * Con debugging mejorado
 */

// Clase para manejar las peticiones HTTP
class API {
    /**
     * Realiza una petición GET al backend
     */
    static async get(endpoint) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API GET Request:', {
            endpoint,
            fullUrl: url,
            timestamp: new Date().toISOString()
        });
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
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
     */
    static async post(endpoint, data) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API POST Request:', {
            endpoint,
            fullUrl: url,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(data)
            });
            
            console.log('📡 API POST Response:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                headers: Object.fromEntries(response.headers)
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
     */
    static async put(endpoint, data) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API PUT Request:', {
            endpoint,
            fullUrl: url,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
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
     */
    static async delete(endpoint) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('🌐 API DELETE Request:', {
            endpoint,
            fullUrl: url,
            timestamp: new Date().toISOString()
        });
        
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
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
        const contentType = response.headers.get('content-type');
        
        // Intentar parsear JSON si el content-type es JSON
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
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
            return text;
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
                `No se pudo conectar con el servidor en ${url}. ` +
                `Verifique que el backend esté corriendo y que la URL sea correcta.`
            );
            networkError.isNetworkError = true;
            return networkError;
        }
        
        // Error de CORS
        if (error.message.includes('CORS')) {
            const corsError = new Error(
                'Error de CORS. Verifique la configuración del backend para permitir peticiones desde el frontend.'
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
            const response = await this.get('/');
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
                throw new Error('El servidor no está disponible. Verifique que el backend esté corriendo.');
            }
            
            // Crear FormData para el login (FastAPI espera form-data para OAuth2)
            const requestBody = {
                dni: dni,
                password: password
                    };
            
            
            console.log('📤 Sending login request to:', `${CONFIG.API_BASE_URL}/api/v1/auth/login`);
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('📥 Login response received:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }));
                console.error('❌ Login failed:', errorData);
                throw new Error(errorData.detail || 'Credenciales incorrectas');
            }
            
            const data = await response.json();
            console.log('✅ Login successful:', {
                hasToken: !!data.access_token,
                tokenType: data.token_type
            });
            
            // Guardar token
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('token_type', data.token_type || 'bearer');
                localStorage.setItem('user_dni', dni);
                
                // Obtener datos del usuario
                try {
                    const userData = await this.getCurrentUser();
                    localStorage.setItem('user_data', JSON.stringify(userData));
                } catch (error) {
                    console.warn('⚠️ Could not fetch user data:', error);
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
            const userData = await API.get('/api/v1/auth/me');
            console.log('User data retrieved:', userData);
            return userData;
        } catch (error) {
            // Fallback para compatibilidad con backends antiguos
            if (error && (error.status === 404 || /not found/i.test(error.message || ''))) {
                try {
                    console.warn('/api/v1/auth/me not found, trying /users/me');
                    const legacyUserData = await API.get('/users/me');
                    console.log('User data retrieved (legacy):', legacyUserData);
                    return legacyUserData;
                } catch (legacyError) {
                    console.error('Error fetching user data (legacy):', legacyError);
                    throw legacyError;
                }
            }
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    }
    
    /**
     * Cierra sesión
     */
    static logout() {
        console.log('🚪 Logging out...');
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user_dni');
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
                    case 'director':
                        window.location.href = '../../pages/dashboards/director.html';
                        break;
                    case 'preceptor':
                        window.location.href = '../../pages/preceptor/dashboard.html';
                        break;
                    case 'profesor':
                        window.location.href = '../../pages/profesor/dashboard.html';
                        break;
                    case 'alumno':
                        window.location.href = '../../pages/alumno/dashboard.html';
                        break;
                    default:
                        console.warn('⚠️ Unknown role, redirecting to default dashboard');
                        window.location.href = '../../pages/alumno/dashboard.html';
                }
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                window.location.href = '../../pages/alumno/dashboard.html';
            }
        } else {
            console.warn('⚠️ No user data found, redirecting to default dashboard');
            window.location.href = '../../pages/alumno/dashboard.html';
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
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR');
    }
    
    /**
     * Formatea una fecha y hora
     */
    static formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-AR');
    }
}

// Log de inicio
console.log('✅ API Module Loaded:', {
    apiBaseUrl: CONFIG.API_BASE_URL,
    timestamp: new Date().toISOString()
});