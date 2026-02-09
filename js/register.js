/**
 * JavaScript para Register - Instituto San Marino
 * Con validaciones en tiempo real y animaciones
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Registro inicializado');
    
    initRegisterForm();
    initPasswordValidation();
    initPasswordToggles();
    initDNIValidation();
});

/**
 * Inicializar formulario de registro
 */
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleSubmit();
    });
}

/**
 * Manejar envío del formulario
 */
async function handleSubmit() {
    const formData = {
        dni: document.getElementById('dni').value.trim(),
        password: document.getElementById('password').value,
        confirm_password: document.getElementById('confirmPassword').value,
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        telefono: document.getElementById('telefono').value.trim() || null
    };
    
    // Validar
    if (!validateForm(formData)) {
        return;
    }
    
    // Enviar
    try {
        showLoader();
        
        console.log('📤 Enviando registro...');
        
        const response = await API.post('/api/v1/auth/register', formData, false);
        
        console.log('✅ Registro exitoso:', response);
        
        // Ocultar formulario y mostrar éxito
        document.getElementById('registerContainer').style.display = 'none';
        document.getElementById('successCard').style.display = 'block';
        
        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        let errorMsg = 'Error al crear la cuenta.';
        
        if (error.message) {
            if (error.message.includes('DNI')) {
                errorMsg = 'Ya existe un usuario con este DNI.';
            } else if (error.message.includes('email')) {
                errorMsg = 'Ya existe un usuario con este email.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMsg = 'Error de conexión. Verifica tu internet.';
            }
        }
        
        Utils.showError(errorMsg);
        
    } finally {
        hideLoader();
    }
}

/**
 * Validar formulario
 */
function validateForm(data) {
    // DNI
    if (!Utils.validateDNI(data.dni)) {
        Utils.showError('DNI inválido (7-8 dígitos)');
        document.getElementById('dni').focus();
        return false;
    }
    
    // Nombre y apellido
    if (data.nombre.length < 2) {
        Utils.showError('El nombre debe tener al menos 2 caracteres');
        document.getElementById('nombre').focus();
        return false;
    }
    
    if (data.apellido.length < 2) {
        Utils.showError('El apellido debe tener al menos 2 caracteres');
        document.getElementById('apellido').focus();
        return false;
    }
    
    // Email
    if (!validateEmail(data.email)) {
        Utils.showError('Email inválido');
        document.getElementById('email').focus();
        return false;
    }
    
    // Contraseña
    const pwValidation = validatePassword(data.password);
    if (!pwValidation.valid) {
        Utils.showError(pwValidation.message);
        document.getElementById('password').focus();
        return false;
    }
    
    // Confirmar contraseña
    if (data.password !== data.confirm_password) {
        Utils.showError('Las contraseñas no coinciden');
        document.getElementById('confirmPassword').focus();
        return false;
    }
    
    // Términos
    if (!document.getElementById('terminos').checked) {
        Utils.showError('Debes aceptar los términos y condiciones');
        return false;
    }
    
    return true;
}

/**
 * Inicializar validación de contraseña en tiempo real
 */
function initPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (!passwordInput || !confirmInput) return;
    
    passwordInput.addEventListener('input', function() {
        updatePasswordRequirements(this.value);
        
        if (confirmInput.value) {
            checkPasswordMatch();
        }
    });
    
    confirmInput.addEventListener('input', checkPasswordMatch);
}

/**
 * Actualizar requisitos visuales de contraseña
 */
function updatePasswordRequirements(password) {
    updateReq('req-length', password.length >= 8);
    updateReq('req-uppercase', /[A-Z]/.test(password));
    updateReq('req-lowercase', /[a-z]/.test(password));
    updateReq('req-number', /\d/.test(password));
}

/**
 * Actualizar un requisito individual
 */
function updateReq(id, met) {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (met) {
        el.classList.add('met');
    } else {
        el.classList.remove('met');
    }
}

/**
 * Verificar que las contraseñas coincidan
 */
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const matchEl = document.getElementById('passwordMatch');
    
    if (!matchEl || !confirm) {
        matchEl.style.display = 'none';
        return;
    }
    
    matchEl.style.display = 'flex';
    
    if (password === confirm) {
        matchEl.className = 'password-match match';
        matchEl.innerHTML = '<i class="fas fa-check-circle"></i> Las contraseñas coinciden';
    } else {
        matchEl.className = 'password-match no-match';
        matchEl.innerHTML = '<i class="fas fa-times-circle"></i> Las contraseñas no coinciden';
    }
}

/**
 * Inicializar botones de mostrar/ocultar contraseña
 */
function initPasswordToggles() {
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirm = document.getElementById('toggleConfirm');
    
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, this);
        });
    }
    
    if (toggleConfirm && confirmInput) {
        toggleConfirm.addEventListener('click', function() {
            togglePasswordVisibility(confirmInput, this);
        });
    }
}

/**
 * Alternar visibilidad de contraseña
 */
function togglePasswordVisibility(input, button) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    
    const icon = button.querySelector('i');
    if (icon) {
        icon.className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
    }
}

/**
 * Inicializar validación de DNI
 */
function initDNIValidation() {
    const dniInput = document.getElementById('dni');
    
    if (!dniInput) return;
    
    dniInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        
        if (this.value.length > 8) {
            this.value = this.value.slice(0, 8);
        }
    });
}

/**
 * Validar email
 */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validar contraseña
 */
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Debe contener al menos una mayúscula' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Debe contener al menos una minúscula' };
    }
    
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Debe contener al menos un número' };
    }
    
    return { valid: true };
}

/**
 * Mostrar loader
 */
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('active');
    }
}

/**
 * Ocultar loader
 */
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('active');
    }
}

/**
 * Detectar conexión
 */
window.addEventListener('offline', () => {
    Utils.showError('Sin conexión a internet', 3000);
});

window.addEventListener('online', () => {
    Utils.showSuccess('Conexión restaurada', 2000);
});