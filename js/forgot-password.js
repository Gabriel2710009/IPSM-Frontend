/**
 * Solicitud de restablecimiento de contrasena
 */

document.addEventListener('DOMContentLoaded', function() {
    initResetRequestForm();
    initDNIInput();
});

function initResetRequestForm() {
    const form = document.getElementById('resetRequestForm');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleResetRequest();
    });
}

async function handleResetRequest() {
    const dni = document.getElementById('dni').value.trim();

    if (!Utils.validateDNI(dni)) {
        Utils.showError('Por favor, ingrese un DNI valido (7 u 8 digitos).');
        document.getElementById('dni').focus();
        return;
    }

    try {
        const response = await API.post('/api/v1/auth/password-reset/request', { dni }, false);
        console.log('Reset request response:', response);

        const container = document.getElementById('resetRequestContainer');
        const success = document.getElementById('resetRequestSuccess');

        if (container) container.style.display = 'none';
        if (success) success.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error requesting reset:', error);
        Utils.showError(error.message || 'No se pudo enviar el enlace. Intente nuevamente.');
    }
}

function initDNIInput() {
    const dniInput = document.getElementById('dni');

    if (!dniInput) return;

    dniInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 8) {
            this.value = this.value.slice(0, 8);
        }
    });
}

window.addEventListener('offline', () => {
    Utils.showError('Sin conexion a internet', 3000);
});

window.addEventListener('online', () => {
    Utils.showSuccess('Conexion restaurada', 2000);
});
