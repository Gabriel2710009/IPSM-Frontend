/**
 * Confirmacion de restablecimiento de contrasena
 */

let resetToken = null;

document.addEventListener('DOMContentLoaded', function() {
    initToken();
    initResetForm();
    initPasswordToggles();
});

function initToken() {
    const params = new URLSearchParams(window.location.search);
    resetToken = params.get('token');

    if (!resetToken) {
        Utils.showError('El enlace es invalido o expiro.');
        disableResetForm();
    }
}

function initResetForm() {
    const form = document.getElementById('resetPasswordForm');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handlePasswordReset();
    });
}

async function handlePasswordReset() {
    if (!resetToken) {
        Utils.showError('El enlace es invalido o expiro.');
        return;
    }

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
        Utils.showError(pwValidation.message);
        document.getElementById('password').focus();
        return;
    }

    if (password !== confirmPassword) {
        Utils.showError('Las contrasenas no coinciden');
        document.getElementById('confirmPassword').focus();
        return;
    }

    try {
        const response = await API.post('/api/v1/auth/password-reset/confirm', {
            token: resetToken,
            password: password,
            confirm_password: confirmPassword
        }, false);

        console.log('Reset confirm response:', response);

        const container = document.getElementById('resetContainer');
        const success = document.getElementById('resetSuccess');

        if (container) container.style.display = 'none';
        if (success) success.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error confirming reset:', error);
        Utils.showError(error.message || 'No se pudo actualizar la contrasena.');
    }
}

function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'La contrasena debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Debe contener al menos una mayuscula' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Debe contener al menos una minuscula' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Debe contener al menos un numero' };
    }

    return { valid: true };
}

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

function togglePasswordVisibility(input, button) {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;

    const icon = button.querySelector('i');
    if (icon) {
        icon.className = type === 'password' ? 'far fa-eye' : 'far fa-eye-slash';
    }
}

function disableResetForm() {
    const form = document.getElementById('resetPasswordForm');
    const submitBtn = document.getElementById('submitBtn');

    if (form) {
        Array.from(form.elements).forEach((el) => {
            el.disabled = true;
        });
    }

    if (submitBtn) {
        submitBtn.disabled = true;
    }
}

window.addEventListener('offline', () => {
    Utils.showError('Sin conexion a internet', 3000);
});

window.addEventListener('online', () => {
    Utils.showSuccess('Conexion restaurada', 2000);
});
