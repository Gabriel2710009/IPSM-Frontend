/**
 * JavaScript para la página de login
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya está autenticado
    if (Auth.isAuthenticated()) {
        Auth.redirectToDashboard();
        return;
    }
    
    // Inicializar componentes
    initLoginForm();
    initPasswordToggle();
    initRememberMe();
    initForgotPassword();
});

/**
 * Inicializa el formulario de login
 */
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const dniInput = document.getElementById('dni');
    const passwordInput = document.getElementById('password');
    
    if (!form) return;
    
    // Solo permitir números en el campo DNI
    dniInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const dni = dniInput.value.trim();
        const password = passwordInput.value;
        
        // Validaciones
        if (!Utils.validateDNI(dni)) {
            Utils.showError('Por favor, ingrese un DNI válido (7 u 8 dígitos).');
            dniInput.focus();
            return;
        }
        
        if (password.length < 4) {
            Utils.showError('La contraseña debe tener al menos 4 caracteres.');
            passwordInput.focus();
            return;
        }
        
        // Intentar login
        await performLogin(dni, password);
    });
}

/**
 * Realiza el proceso de login
 */
async function performLogin(dni, password) {
    try {
        Utils.showLoader();
        
        // Llamar a la API de autenticación
        const response = await Auth.login(dni, password);
        
        Utils.showSuccess('¡Bienvenido/a al sistema!');
        
        // Guardar datos si "Recordarme" está marcado
        if (document.getElementById('rememberMe').checked) {
            saveCredentials(dni);
        } else {
            clearCredentials();
        }
        
        // Esperar un momento para que el usuario vea el mensaje
        setTimeout(() => {
            Auth.redirectToDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('Error en login:', error);
        
        // Mostrar error específico
        let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
        
        if (error.message.includes('401') || error.message.includes('credenciales')) {
            errorMessage = 'DNI o contraseña incorrectos. Por favor, verifique sus datos.';
        } else if (error.message.includes('conexión') || error.message.includes('network')) {
            errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
        }
        
        Utils.showError(errorMessage);
        
        // Limpiar contraseña por seguridad
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Inicializa el toggle de mostrar/ocultar contraseña
 */
function initPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (!toggleBtn || !passwordInput) return;
    
    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        // Cambiar icono
        toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
}

/**
 * Inicializa la funcionalidad de "Recordarme"
 */
function initRememberMe() {
    const rememberCheckbox = document.getElementById('rememberMe');
    const dniInput = document.getElementById('dni');
    
    if (!rememberCheckbox || !dniInput) return;
    
    // Cargar DNI guardado si existe
    const savedDNI = localStorage.getItem('remembered_dni');
    if (savedDNI) {
        dniInput.value = savedDNI;
        rememberCheckbox.checked = true;
        document.getElementById('password').focus();
    }
}

/**
 * Guarda las credenciales en localStorage
 */
function saveCredentials(dni) {
    localStorage.setItem('remembered_dni', dni);
}

/**
 * Limpia las credenciales guardadas
 */
function clearCredentials() {
    localStorage.removeItem('remembered_dni');
}

/**
 * Inicializa el enlace de "Olvidé mi contraseña"
 */
function initForgotPassword() {
    const forgotLink = document.getElementById('forgotPassword');
    
    if (!forgotLink) return;
    
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Mostrar modal o redirigir a página de recuperación
        Utils.showWarning('Por favor, comuníquese con secretaría para restablecer su contraseña: +54 (266) 4XX-XXXX', 8000);
    });
}

/**
 * Manejo de errores de red
 */
window.addEventListener('offline', function() {
    Utils.showError('Sin conexión a internet. Verifique su conexión.', 5000);
});

window.addEventListener('online', function() {
    Utils.showSuccess('Conexión restaurada.', 3000);
});
