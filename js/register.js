/**
 * Sistema de Registro de Usuarios
 * Instituto Privado San Marino
 */

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');

    // ============================================================
    // VALIDACIÓN EN TIEMPO REAL DE CONTRASEÑA
    // ============================================================
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        
        // Verificar longitud
        updateRequirement('req-length', password.length >= 8);
        
        // Verificar mayúscula
        updateRequirement('req-uppercase', /[A-Z]/.test(password));
        
        // Verificar minúscula
        updateRequirement('req-lowercase', /[a-z]/.test(password));
        
        // Verificar número
        updateRequirement('req-number', /\d/.test(password));
        
        // Verificar coincidencia si ya escribió la confirmación
        if (confirmPasswordInput.value) {
            checkPasswordMatch();
        }
    });

    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    function updateRequirement(id, met) {
        const element = document.getElementById(id);
        if (met) {
            element.classList.remove('requirement-unmet');
            element.classList.add('requirement-met');
            element.innerHTML = element.innerHTML.replace('✗', '✓');
        } else {
            element.classList.remove('requirement-met');
            element.classList.add('requirement-unmet');
            element.innerHTML = element.innerHTML.replace('✓', '✗');
        }
    }

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const matchElement = document.getElementById('passwordMatch');

        if (confirmPassword.length === 0) {
            matchElement.style.display = 'none';
            return;
        }

        matchElement.style.display = 'block';
        
        if (password === confirmPassword) {
            matchElement.textContent = '✓ Las contraseñas coinciden';
            matchElement.style.color = '#28a745';
        } else {
            matchElement.textContent = '✗ Las contraseñas no coinciden';
            matchElement.style.color = '#dc3545';
        }
    }

    // ============================================================
    // VALIDACIÓN DE DNI
    // ============================================================
    
    const dniInput = document.getElementById('dni');
    
    dniInput.addEventListener('input', function() {
        // Solo permitir números
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Limitar a 9 dígitos
        if (this.value.length > 9) {
            this.value = this.value.slice(0, 9);
        }
    });

    // ============================================================
    // ENVÍO DEL FORMULARIO
    // ============================================================
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Limpiar mensajes previos
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';

        // Obtener datos del formulario
        const formData = {
            dni: document.getElementById('dni').value.trim(),
            password: document.getElementById('password').value,
            confirm_password: document.getElementById('confirmPassword').value,
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            telefono: document.getElementById('telefono').value.trim() || null
        };

        // Validaciones del lado del cliente
        if (!validateForm(formData)) {
            return;
        }

        // Deshabilitar botón mientras se procesa
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

        try {
            console.log('📝 Enviando solicitud de registro...');
            
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Registro exitoso:', data);
                
                // Ocultar formulario y mostrar mensaje de éxito
                registerForm.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Scroll al inicio
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
            } else {
                console.error('❌ Error en registro:', data);
                showError(data.detail || 'Error al procesar el registro');
            }

        } catch (error) {
            console.error('❌ Error en la solicitud:', error);
            showError('Error de conexión con el servidor. Por favor, intenta nuevamente.');
        } finally {
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Registrarse';
        }
    });

    // ============================================================
    // FUNCIONES AUXILIARES
    // ============================================================
    
    function validateForm(data) {
        // Validar DNI
        if (!/^\d{7,9}$/.test(data.dni)) {
            showError('El DNI debe contener entre 7 y 9 dígitos');
            return false;
        }

        // Validar nombre y apellido
        if (data.nombre.length < 2) {
            showError('El nombre debe tener al menos 2 caracteres');
            return false;
        }

        if (data.apellido.length < 2) {
            showError('El apellido debe tener al menos 2 caracteres');
            return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('El email no tiene un formato válido');
            return false;
        }

        // Validar contraseña
        if (data.password.length < 8) {
            showError('La contraseña debe tener al menos 8 caracteres');
            return false;
        }

        if (!/[A-Z]/.test(data.password)) {
            showError('La contraseña debe contener al menos una letra mayúscula');
            return false;
        }

        if (!/[a-z]/.test(data.password)) {
            showError('La contraseña debe contener al menos una letra minúscula');
            return false;
        }

        if (!/\d/.test(data.password)) {
            showError('La contraseña debe contener al menos un número');
            return false;
        }

        // Validar que las contraseñas coincidan
        if (data.password !== data.confirm_password) {
            showError('Las contraseñas no coinciden');
            return false;
        }

        // Validar teléfono (si está presente)
        if (data.telefono) {
            const cleanPhone = data.telefono.replace(/[^\d+]/g, '');
            if (cleanPhone.length < 8) {
                showError('El teléfono debe tener al menos 8 dígitos');
                return false;
            }
        }

        return true;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        window.scrollTo({ top: errorMessage.offsetTop - 100, behavior: 'smooth' });
    }
});