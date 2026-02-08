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
    initRegistroButton();
    initRegistroForm();
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
        
        console.log('Intentando login con:', { dni, password: '***' });
        console.log('URL de API:', CONFIG.API_BASE_URL);
        
        // Llamar a la API de autenticación
        const response = await Auth.login(dni, password);
        
        console.log('Respuesta de login:', response);
        
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
        
        if (error.message) {
            if (error.message.includes('401') || error.message.includes('credenciales')) {
                errorMessage = 'DNI o contraseña incorrectos. Por favor, verifique sus datos.';
            } else if (error.message.includes('403') || error.message.includes('pendiente')) {
                errorMessage = 'Tu cuenta está pendiente de aprobación por un administrador. Por favor, espera la confirmación.';
            } else if (error.message.includes('inactiv')) {
                errorMessage = 'Tu cuenta ha sido desactivada. Contacta con secretaría.';
            } else if (error.message.includes('conexión') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
            }
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
        const icon = toggleBtn.querySelector('i');
        if (type === 'password') {
            icon.className = 'far fa-eye';
        } else {
            icon.className = 'far fa-eye-slash';
        }
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
        Utils.showWarning('Por favor, comuníquese con secretaría para restablecer su contraseña: +54 (266) 4431659', 8000);
    });
}

/**
 * Inicializa el botón de registro
 */
function initRegistroButton() {
    const btnRegistro = document.getElementById('btnRegistro');
    
    if (!btnRegistro) return;
    
    btnRegistro.addEventListener('click', function() {
        abrirModalRegistro();
    });
}

/**
 * Abre el modal de registro
 */
function abrirModalRegistro() {
    const modal = document.getElementById('registroModal');
    const form = document.getElementById('registroForm');
    
    if (!modal || !form) return;
    
    // Limpiar formulario
    form.reset();
    
    // Mostrar modal
    modal.classList.add('active');
}

/**
 * Cierra el modal de registro
 */
function cerrarModalRegistro() {
    const modal = document.getElementById('registroModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Inicializa el formulario de registro
 */
function initRegistroForm() {
    const form = document.getElementById('registroForm');
    
    if (!form) return;
    
    // Solo números en DNI
    const dniInput = document.getElementById('regDNI');
    if (dniInput) {
        dniInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
    
    // Validación en tiempo real de contraseñas
    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (this.value && password.value !== this.value) {
                this.setCustomValidity('Las contraseñas no coinciden');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleRegistro();
    });
}

/**
 * Maneja el proceso de registro
 */
async function handleRegistro() {
    const dni = document.getElementById('regDNI').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const nombre = document.getElementById('regNombre').value.trim();
    const apellido = document.getElementById('regApellido').value.trim();
    const telefono = document.getElementById('regTelefono').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const terminos = document.getElementById('regTerminos').checked;
    
    // Validaciones
    if (!Utils.validateDNI(dni)) {
        Utils.showError('Por favor, ingrese un DNI válido (7 u 8 dígitos)');
        return;
    }
    
    if (!validateEmail(email)) {
        Utils.showError('Por favor, ingrese un email válido');
        return;
    }
    
    if (nombre.length < 2 || apellido.length < 2) {
        Utils.showError('El nombre y apellido deben tener al menos 2 caracteres');
        return;
    }
    
    if (!validatePassword(password)) {
        Utils.showError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números');
        return;
    }
    
    if (password !== confirmPassword) {
        Utils.showError('Las contraseñas no coinciden');
        return;
    }
    
    if (!terminos) {
        Utils.showError('Debe aceptar los términos y condiciones');
        return;
    }
    
    // Preparar datos
    const registroData = {
        dni: dni,
        password: password,
        confirm_password: confirmPassword,
        nombre: nombre,
        apellido: apellido,
        email: email,
        telefono: telefono || null
    };
    
    try {
        Utils.showLoader();
        
        console.log('Registrando usuario:', { ...registroData, password: '***', confirm_password: '***' });
        
        // Llamar al endpoint de registro
        const response = await API.post('/api/v1/auth/register', registroData, false);
        
        console.log('Respuesta de registro:', response);
        
        // Cerrar modal
        cerrarModalRegistro();
        
        // Mostrar mensaje de éxito
        Utils.showSuccess(
            'Cuenta creada exitosamente. Tu solicitud está pendiente de aprobación por un administrador. ' +
            'Recibirás una notificación cuando tu cuenta sea activada.',
            10000
        );
        
        // Limpiar formulario
        document.getElementById('registroForm').reset();
        
    } catch (error) {
        console.error('Error en registro:', error);
        
        let errorMessage = 'Error al crear la cuenta. Por favor, intente nuevamente.';
        
        if (error.message) {
            if (error.message.includes('DNI')) {
                errorMessage = 'Ya existe un usuario registrado con este DNI';
            } else if (error.message.includes('email')) {
                errorMessage = 'Ya existe un usuario registrado con este email';
            } else if (error.message.includes('password') || error.message.includes('contraseña')) {
                errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
            } else if (error.message.includes('conexión') || error.message.includes('network')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
            }
        }
        
        Utils.showError(errorMessage);
        
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Valida formato de email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida fortaleza de contraseña
 */
function validatePassword(password) {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
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


/**
 * Inicializa el botón de registro
 */
function initRegistroButton() {
    const btnRegistro = document.getElementById('btnRegistro');
    
    if (!btnRegistro) return;
    
    btnRegistro.addEventListener('click', function() {
        abrirModalRegistro();
    });
}

/**
 * Abre el modal de registro
 */
function abrirModalRegistro() {
    const modal = document.getElementById('registroModal');
    const form = document.getElementById('registroForm');
    
    if (!modal || !form) return;
    
    // Limpiar formulario
    form.reset();
    
    // Mostrar modal
    modal.classList.add('active');
}

/**
 * Cierra el modal de registro
 */
function cerrarModalRegistro() {
    const modal = document.getElementById('registroModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Inicializa el formulario de registro
 */
function initRegistroForm() {
    const form = document.getElementById('registroForm');
    
    if (!form) return;
    
    // Solo números en DNI
    const dniInput = document.getElementById('regDNI');
    if (dniInput) {
        dniInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
    
    // Validación en tiempo real de contraseñas
    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (this.value && password.value !== this.value) {
                this.setCustomValidity('Las contraseñas no coinciden');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleRegistro();
    });
}

/**
 * Maneja el proceso de registro
 */
async function handleRegistro() {
    const dni = document.getElementById('regDNI').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const nombre = document.getElementById('regNombre').value.trim();
    const apellido = document.getElementById('regApellido').value.trim();
    const telefono = document.getElementById('regTelefono').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const terminos = document.getElementById('regTerminos').checked;
    
    // Validaciones
    if (!Utils.validateDNI(dni)) {
        Utils.showError('Por favor, ingrese un DNI válido (7 u 8 dígitos)');
        return;
    }
    
    if (!validateEmail(email)) {
        Utils.showError('Por favor, ingrese un email válido');
        return;
    }
    
    if (nombre.length < 2 || apellido.length < 2) {
        Utils.showError('El nombre y apellido deben tener al menos 2 caracteres');
        return;
    }
    
    if (!validatePassword(password)) {
        Utils.showError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números');
        return;
    }
    
    if (password !== confirmPassword) {
        Utils.showError('Las contraseñas no coinciden');
        return;
    }
    
    if (!terminos) {
        Utils.showError('Debe aceptar los términos y condiciones');
        return;
    }
    
    // Preparar datos
    const registroData = {
        dni: dni,
        password: password,
        confirm_password: confirmPassword,
        nombre: nombre,
        apellido: apellido,
        email: email,
        telefono: telefono || null
    };
    
    try {
        Utils.showLoader();
        
        console.log('Registrando usuario:', { ...registroData, password: '***', confirm_password: '***' });
        
        // Llamar al endpoint de registro
        const response = await API.post('/api/v1/auth/register', registroData, false);
        
        console.log('Respuesta de registro:', response);
        
        // Cerrar modal
        cerrarModalRegistro();
        
        // Mostrar mensaje de éxito
        Utils.showSuccess(
            'Cuenta creada exitosamente. Tu solicitud está pendiente de aprobación por un administrador. ' +
            'Recibirás una notificación cuando tu cuenta sea activada.',
            10000
        );
        
        // Limpiar formulario
        document.getElementById('registroForm').reset();
        
    } catch (error) {
        console.error('Error en registro:', error);
        
        let errorMessage = 'Error al crear la cuenta. Por favor, intente nuevamente.';
        
        if (error.message) {
            if (error.message.includes('DNI')) {
                errorMessage = 'Ya existe un usuario registrado con este DNI';
            } else if (error.message.includes('email')) {
                errorMessage = 'Ya existe un usuario registrado con este email';
            } else if (error.message.includes('password') || error.message.includes('contraseña')) {
                errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
            } else if (error.message.includes('conexión') || error.message.includes('network')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
            }
        }
        
        Utils.showError(errorMessage);
        
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Valida formato de email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida fortaleza de contraseña
 */
function validatePassword(password) {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}
