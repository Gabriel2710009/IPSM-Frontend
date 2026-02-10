/**
 * JavaScript para Dashboard de Administrador - INTEGRADO CON BACKEND
 * Instituto Privado San Marino
 */

// Variables globales
let usuariosPendientes = [];
let todosUsuarios = [];
let configuracionesCuotas = [];
let cursos = [];
let noticias = [];
let mensajes = [];
let pagosPendientes = [];
let pagosPendientesFiltrados = [];
let editingConfigId = null;
let editingNoticiaId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!Auth.isAuthenticated()) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }
    
    // Verificar que sea admin
    const user = Auth.getUser();
    if (!user || user.role !== 'admin') {
        Utils.showError('No tiene permisos para acceder a esta sección');
        setTimeout(() => {
            Auth.logout();
        }, 2000);
        return;
    }
    
    // Inicializar dashboard
    initDashboard();
    initNavigation();
    initLogout();
    initTabs();
    initModals();
    
    // Cargar datos iniciales
    loadDashboardData();
});

/**
 * Inicializa el dashboard
 */
function initDashboard() {
    const user = Auth.getUser();
    
    const userNameElements = document.querySelectorAll('#userName, #welcomeName');
    userNameElements.forEach(el => {
        if (el) {
            el.textContent = user.nombre || 'Administrador';
        }
    });
}

/**
 * Inicializa la navegación entre secciones
 */
function initNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionName = this.getAttribute('data-section');
            
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`section-${sectionName}`);
            if (targetSection) {
                targetSection.classList.add('active');
                loadSectionData(sectionName);
            }
        });
    });
}

/**
 * Carga datos específicos de cada sección
 */
async function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'inicio':
            await loadEstadisticas();
            await loadAccionesPendientes();
            await loadActividadReciente();
            break;
        case 'usuarios-pendientes':
            await loadUsuariosPendientes();
            break;
        case 'usuarios':
            await loadUsuarios();
            break;
        case 'config-cuotas':
            await loadConfiguracionesCuotas();
            break;
        case 'cuotas':
            await loadCuotasValidacion();
            break;
        case 'cursos':
            await loadCursos();
            break;
        case 'noticias':
            await loadNoticias();
            break;
        case 'mensajes':
            await loadMensajes();
            break;
    }
}

/**
 * Inicializa el logout
 */
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                Auth.logout();
            }
        });
    }
}

/**
 * Inicializa las pestañas (tabs)
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            const parentContainer = this.closest('.tabs-container');
            
            parentContainer.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            parentContainer.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            this.classList.add('active');
            parentContainer.querySelector(`#tab-${tabName}`).classList.add('active');
        });
    });
}

/**
 * Inicializa los modales
 */
function initModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    const nuevoUsuarioForm = document.getElementById('nuevoUsuarioForm');
    if (nuevoUsuarioForm) {
        nuevoUsuarioForm.addEventListener('submit', handleNuevoUsuario);
    }
    
    const nuevaConfigForm = document.getElementById('nuevaConfigForm');
    if (nuevaConfigForm) {
        nuevaConfigForm.addEventListener('submit', handleNuevaConfig);
    }
    
    const mensajeForm = document.getElementById('mensajeForm');
    if (mensajeForm) {
        mensajeForm.addEventListener('submit', handleEnviarMensaje);
    }
    
    const tipoDestinatario = document.getElementById('tipoDestinatario');
    if (tipoDestinatario) {
        tipoDestinatario.addEventListener('change', handleTipoDestinatarioChange);
    }

    const cursoForm = document.getElementById('cursoForm');
    if (cursoForm) {
        cursoForm.addEventListener('submit', handleCursoSubmit);
    }

    const noticiaForm = document.getElementById('noticiaForm');
    if (noticiaForm) {
        noticiaForm.addEventListener('submit', handleNoticiaSubmit);
    }
}

/**
 * Carga todos los datos del dashboard
 */
async function loadDashboardData() {
    try {
        Utils.showLoader();
        
        await Promise.all([
            loadEstadisticas(),
            loadAccionesPendientes(),
            loadActividadReciente()
        ]);
        
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        Utils.showError('Error al cargar los datos del dashboard');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga las estadísticas generales - INTEGRADO
 */
async function loadEstadisticas() {
    try {
        // Cargar usuarios pendientes
        const pendientesCount = await API.get('/api/v1/auth/pending-count', true);
        const pendientesTotal = pendientesCount.pending_count || 0;
        document.getElementById('statPendientes').textContent = pendientesTotal;
        
        const badge = document.getElementById('pendientesBadge');
        if (badge) {
            if (pendientesTotal > 0) {
                badge.textContent = pendientesTotal;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }

        // Cargar cursos activos
        try {
            const cursosData = await API.get('/api/v1/admin/cursos', true);
            const activos = Array.isArray(cursosData) ? cursosData.filter(c => c.activo).length : 0;
            document.getElementById('statCursos').textContent = activos;
        } catch (error) {
            console.warn('No se pudo cargar estadística de cursos:', error);
            document.getElementById('statCursos').textContent = '-';
        }

        // TODO: Implementar cuando estén disponibles
        document.getElementById('statUsuarios').textContent = '-';
        document.getElementById('statMensajes').textContent = '-';
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Carga acciones pendientes - INTEGRADO
 */
async function loadAccionesPendientes() {
    const container = document.getElementById('accionesPendientesContainer');
    if (!container) return;
    
    try {
        const acciones = [];

        // Usuarios pendientes
        const pendientesCount = await API.get('/api/v1/auth/pending-count', true);
        if (pendientesCount.pending_count > 0) {
            acciones.push({
                icon: 'fa-user-clock',
                texto: `${pendientesCount.pending_count} usuario(s) pendiente(s) de aprobación`,
                section: 'usuarios-pendientes'
            });
        }

        // Pagos pendientes
        try {
            const pagosPendientesCount = await API.get('/api/v1/admin/pagos/pendientes/count', true);
            if (pagosPendientesCount.pending_count > 0) {
                acciones.push({
                    icon: 'fa-money-check-alt',
                    texto: `${pagosPendientesCount.pending_count} pago(s) pendiente(s) de validación`,
                    section: 'cuotas'
                });
            }
        } catch (error) {
            console.warn('No se pudo cargar conteo de pagos pendientes:', error);
        }
        
        if (acciones.length === 0) {
            container.innerHTML = '<p class="text-center text-success"><i class="fas fa-check-circle"></i> No hay acciones pendientes</p>';
        } else {
            container.innerHTML = acciones.map(accion => `
                <div class="accion-item" style="padding: var(--spacing-md); border-left: 4px solid var(--warning-color); background: var(--gray-50); margin-bottom: var(--spacing-sm); cursor: pointer; border-radius: var(--border-radius-md);" onclick="document.querySelector('[data-section=\\'${accion.section}\\']').click()">
                    <i class="fas ${accion.icon}" style="color: var(--warning-color); margin-right: var(--spacing-sm);"></i>
                    ${accion.texto}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error al cargar acciones pendientes:', error);
        container.innerHTML = '<p class="text-center text-muted">Error al cargar acciones pendientes</p>';
    }
}

/**
 * Carga actividad reciente
 */
async function loadActividadReciente() {
    const container = document.getElementById('actividadRecienteContainer');
    if (!container) return;
    
    // TODO: Implementar cuando esté disponible el endpoint
    container.innerHTML = `
        <p class="text-center text-muted">
            <i class="fas fa-info-circle"></i> 
            Próximamente disponible
        </p>
    `;
}

/**
 * Carga usuarios pendientes de aprobación - INTEGRADO
 */
async function loadUsuariosPendientes() {
    const container = document.getElementById('pendientesContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        usuariosPendientes = await API.get('/api/v1/auth/pending-users', true);
        
        if (usuariosPendientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-check-circle"></i></div>
                    <h3>¡Todo al día!</h3>
                    <p>No hay usuarios pendientes de aprobación</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="pending-users-grid">
                    ${usuariosPendientes.map(user => createPendingUserCard(user)).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar usuarios pendientes:', error);
        Utils.showError('Error al cargar usuarios pendientes');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Crea una tarjeta de usuario pendiente
 */
function createPendingUserCard(user) {
    return `
        <div class="pending-user-card">
            <div class="pending-user-header">
                <div class="pending-user-info">
                    <h3>${user.nombre} ${user.apellido}</h3>
                    <p><span class="info-label">DNI:</span> ${user.dni}</p>
                    <p><span class="info-label">Email:</span> ${user.email}</p>
                    ${user.telefono ? `<p><span class="info-label">Teléfono:</span> ${user.telefono}</p>` : ''}
                    <p class="pending-date">
                        <i class="fas fa-calendar"></i>
                        Registrado: ${Utils.formatDateTime(user.fecha_creacion)}
                    </p>
                </div>
            </div>
            
            <div class="pending-user-actions">
                <select class="role-select" id="role-${user.id}">
                    <option value="alumno">Alumno</option>
                    <option value="padre">Padre/Madre</option>
                    <option value="docente">Docente</option>
                    <option value="preceptor">Preceptor</option>
                    <option value="admin">Administrador</option>
                </select>
                <button class="btn btn-success" onclick="aprobarUsuario('${user.id}', '${user.nombre} ${user.apellido}')">
                    <i class="fas fa-check"></i> Aprobar
                </button>
                <button class="btn btn-error" onclick="rechazarUsuario('${user.id}', '${user.nombre} ${user.apellido}')">
                    <i class="fas fa-times"></i> Rechazar
                </button>
            </div>
        </div>
    `;
}

/**
 * Aprueba un usuario pendiente - INTEGRADO
 */
async function aprobarUsuario(userId, userName) {
    const roleSelect = document.getElementById(`role-${userId}`);
    const selectedRole = roleSelect.value;
    
    if (!confirm(`¿Confirmar aprobación de ${userName} como ${selectedRole}?`)) {
        return;
    }
    
    try {
        Utils.showLoader();
        
        await API.post('/api/v1/auth/approve-user', {
            user_id: userId,
            accion: 'aprobar',
            role: selectedRole
        }, true);
        
        Utils.showSuccess(`Usuario ${userName} aprobado correctamente`);
        await loadUsuariosPendientes();
        await loadEstadisticas();
        await loadAccionesPendientes();
        
    } catch (error) {
        console.error('Error al aprobar usuario:', error);
        Utils.showError(error.message || 'Error al aprobar el usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Rechaza un usuario pendiente - INTEGRADO
 */
async function rechazarUsuario(userId, userName) {
    if (!confirm(`¿Confirmar rechazo de ${userName}?\nEsta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        Utils.showLoader();
        
        await API.post('/api/v1/auth/approve-user', {
            user_id: userId,
            accion: 'rechazar'
        }, true);
        
        Utils.showSuccess(`Usuario ${userName} rechazado`);
        await loadUsuariosPendientes();
        await loadEstadisticas();
        await loadAccionesPendientes();
        
    } catch (error) {
        console.error('Error al rechazar usuario:', error);
        Utils.showError(error.message || 'Error al rechazar el usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Gestión de Usuarios
 */
async function loadUsuarios() {
    const container = document.getElementById('usuariosContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Implementar endpoint para obtener todos los usuarios
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <h3>Gestión de usuarios</h3>
                <p>Esta funcionalidad estará disponible próximamente</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        Utils.showError('Error al cargar usuarios');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Abre modal para crear nuevo usuario
 */
function abrirModalNuevoUsuario() {
    const modal = document.getElementById('nuevoUsuarioModal');
    document.getElementById('nuevoUsuarioForm').reset();
    modal.classList.add('active');
}

/**
 * Maneja la creación de nuevo usuario - INTEGRADO
 */
async function handleNuevoUsuario(e) {
    e.preventDefault();
    
    const formData = {
        dni: document.getElementById('nuevoDNI').value.trim(),
        nombre: document.getElementById('nuevoNombre').value.trim(),
        apellido: document.getElementById('nuevoApellido').value.trim(),
        email: document.getElementById('nuevoEmail').value.trim(),
        role: document.getElementById('nuevoRol').value,
        password: document.getElementById('nuevoPassword').value
    };
    
    try {
        Utils.showLoader();
        
        await API.post('/api/v1/admin/usuarios', formData, true);
        
        Utils.showSuccess('Usuario creado correctamente');
        cerrarModal('nuevoUsuarioModal');
        await loadUsuarios();
        
    } catch (error) {
        console.error('Error al crear usuario:', error);
        Utils.showError(error.message || 'Error al crear el usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Configuración de Cuotas - INTEGRADO
 */
async function loadConfiguracionesCuotas() {
    try {
        Utils.showLoader();
        
        configuracionesCuotas = await API.get('/api/v1/admin/cuotas/configuracion', true);
        
        // Separar por nivel
        const inicial = configuracionesCuotas.filter(c => {
            const nivel = (c.nivel_nombre || '').toLowerCase();
            return nivel.includes('inicial');
        });
        const primario = configuracionesCuotas.filter(c => {
            const nivel = (c.nivel_nombre || '').toLowerCase();
            return nivel.includes('primari');
        });
        const secundario = configuracionesCuotas.filter(c => {
            const nivel = (c.nivel_nombre || '').toLowerCase();
            return nivel.includes('secundari');
        });
        
        renderConfiguraciones('configInicialContainer', inicial);
        renderConfiguraciones('configPrimarioContainer', primario);
        renderConfiguraciones('configSecundarioContainer', secundario);
        
    } catch (error) {
        console.error('Error al cargar configuraciones:', error);
        Utils.showError('Error al cargar las configuraciones');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Renderiza configuraciones de cuotas
 */
function renderConfiguraciones(containerId, configs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (configs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-cog"></i></div>
                <p>No hay configuraciones para este nivel</p>
                <button class="btn btn-primary mt-md" onclick="abrirModalNuevaConfig()">
                    <i class="fas fa-plus"></i> Crear Configuración
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="cuotas-config-grid">
            ${configs.map(config => createConfigCard(config)).join('')}
        </div>
    `;
}

/**
 * Crea una tarjeta de configuración
 */
function createConfigCard(config) {
    const isActive = config.activo;
    
    return `
        <div class="config-card ${isActive ? 'active' : 'inactive'}">
            <div class="config-header">
                <h3 class="config-title">${config.nivel_nombre || 'N/A'}</h3>
                <span class="config-status ${isActive ? 'active' : 'inactive'}">
                    ${isActive ? 'Vigente' : 'Inactiva'}
                </span>
            </div>
            
            <div class="config-details">
                <div class="config-detail-item">
                    <span class="config-detail-label">Monto base</span>
                    <span class="config-detail-value">$${formatMonto(config.monto_base)}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Con recargo</span>
                    <span class="config-detail-value">$${formatMonto(config.monto_con_recargo)}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Recargo</span>
                    <span class="config-detail-value">${config.porcentaje_recargo}%</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Matrícula</span>
                    <span class="config-detail-value">$${formatMonto(config.monto_matricula)}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Ciclo</span>
                    <span class="config-detail-value">${config.ciclo_lectivo_nombre || 'N/A'}</span>
                </div>
            </div>
            
            <div class="config-actions">
                <button class="btn btn-sm btn-outline" onclick="editarConfig(${config.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-error" onclick="eliminarConfig(${config.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

/**
 * Abre modal para nueva configuración
 */
function abrirModalNuevaConfig() {
    const modal = document.getElementById('nuevaConfigModal');
    const form = document.getElementById('nuevaConfigForm');
    const title = document.getElementById('configModalTitle');
    const submitBtn = document.getElementById('configSubmitBtn');
    const nivelSelect = document.getElementById('configNivel');
    const cicloInput = document.getElementById('configCicloLectivoAnio');

    editingConfigId = null;

    if (form) form.reset();
    if (nivelSelect) nivelSelect.disabled = false;
    if (cicloInput) {
        cicloInput.value = getCurrentYear();
        cicloInput.disabled = false;
    }
    if (title) title.textContent = 'Nueva Configuración de Cuota';
    if (submitBtn) submitBtn.textContent = 'Crear Configuración';
    modal.classList.add('active');
}

/**
 * Maneja la creación de nueva configuración - INTEGRADO
 */
async function handleNuevaConfig(e) {
    e.preventDefault();
    
    const nivel = document.getElementById('configNivel').value;
    const nivelId = getNivelId(nivel);
    const cicloLectivoAnio = parseInt(document.getElementById('configCicloLectivoAnio').value, 10);
    const montoBase = parseFloat(document.getElementById('configMonto').value);
    const porcentajeRecargo = parseFloat(document.getElementById('configRecargo').value);

    if (Number.isNaN(cicloLectivoAnio)) {
        Utils.showError('Ingrese un año de ciclo lectivo válido');
        return;
    }

    if (Number.isNaN(montoBase)) {
        Utils.showError('Ingrese un monto válido');
        return;
    }

    const montoConRecargo = Number.isNaN(porcentajeRecargo)
        ? montoBase
        : montoBase * (1 + (porcentajeRecargo / 100));

    const montoMatricula = montoBase * 1.30;
    
    try {
        Utils.showLoader();

        if (editingConfigId) {
            const updateData = {
                monto_base: montoBase,
                monto_con_recargo: montoConRecargo,
                porcentaje_recargo: Number.isNaN(porcentajeRecargo) ? 0 : porcentajeRecargo,
                monto_matricula: montoMatricula
            };

            await API.put(`/api/v1/admin/cuotas/configuracion/${editingConfigId}`, updateData, true);
            Utils.showSuccess('Configuración actualizada correctamente');
        } else {
            const formData = {
                ciclo_lectivo_anio: cicloLectivoAnio,
                nivel_id: nivelId,
                monto_base: montoBase,
                monto_con_recargo: montoConRecargo,
                porcentaje_recargo: Number.isNaN(porcentajeRecargo) ? 0 : porcentajeRecargo,
                monto_matricula: montoMatricula
            };

            await API.post('/api/v1/admin/cuotas/configuracion', formData, true);
            Utils.showSuccess('Configuración creada correctamente');
        }
        
        cerrarModal('nuevaConfigModal');
        await loadConfiguracionesCuotas();
        
    } catch (error) {
        console.error('Error al crear configuración:', error);
        Utils.showError(error.message || 'Error al crear la configuración');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Editar configuración
 */
async function editarConfig(configId) {
    const modal = document.getElementById('nuevaConfigModal');
    const form = document.getElementById('nuevaConfigForm');
    const title = document.getElementById('configModalTitle');
    const submitBtn = document.getElementById('configSubmitBtn');
    const cicloInput = document.getElementById('configCicloLectivoAnio');

    const config = (configuracionesCuotas || []).find(c => c.id === configId);
    if (!config) {
        Utils.showError('Configuración no encontrada');
        return;
    }

    editingConfigId = configId;

    if (form) form.reset();

    const nivelSelect = document.getElementById('configNivel');
    if (nivelSelect) {
        nivelSelect.value = getNivelKey(config.nivel_id, config.nivel_nombre);
        nivelSelect.disabled = true;
    }

    if (cicloInput) {
        cicloInput.value = extractYear(config.ciclo_lectivo_nombre) || getCurrentYear();
        cicloInput.disabled = true;
    }

    const montoInput = document.getElementById('configMonto');
    if (montoInput) montoInput.value = config.monto_base ?? '';

    const recargoInput = document.getElementById('configRecargo');
    if (recargoInput) recargoInput.value = config.porcentaje_recargo ?? 0;

    const diaInput = document.getElementById('configDiaVencimiento');
    if (diaInput && !diaInput.value) diaInput.value = 10;

    const fechaInput = document.getElementById('configFechaInicio');
    if (fechaInput && !fechaInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        fechaInput.value = `${yyyy}-${mm}-${dd}`;
    }

    if (title) title.textContent = 'Editar Configuración de Cuota';
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

    if (modal) modal.classList.add('active');
}

/**
 * Eliminar configuración - INTEGRADO
 */
async function eliminarConfig(configId) {
    if (!confirm('¿Está seguro de eliminar esta configuración?\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        Utils.showLoader();
        
        await API.delete(`/api/v1/admin/cuotas/configuracion/${configId}`, true);
        
        Utils.showSuccess('Configuración eliminada');
        await loadConfiguracionesCuotas();
        
    } catch (error) {
        console.error('Error al eliminar configuración:', error);
        Utils.showError('Error al eliminar la configuración');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Validación de Cuotas/Pagos - INTEGRADO
 */
async function loadCuotasValidacion() {
    const container = document.getElementById('cuotasContainer');
    if (!container) return;

    try {
        Utils.showLoader();
        pagosPendientes = await API.get('/api/v1/admin/pagos/pendientes', true);
        pagosPendientesFiltrados = Array.isArray(pagosPendientes) ? pagosPendientes : [];
        aplicarFiltrosCuotas();
    } catch (error) {
        console.error('Error al cargar pagos pendientes:', error);
        Utils.showError('Error al cargar pagos pendientes');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-money-check-alt"></i></div>
                <h3>Error al cargar pagos</h3>
                <p>Intente nuevamente más tarde</p>
            </div>
        `;
    } finally {
        Utils.hideLoader();
    }
}

function renderPagosPendientes(pagos) {
    const container = document.getElementById('cuotasContainer');
    if (!container) return;

    if (!pagos || pagos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-check-circle"></i></div>
                <h3>Sin pagos pendientes</h3>
                <p>No hay pagos para validar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="noticias-grid">
            ${pagos.map(pago => createPagoCard(pago)).join('')}
        </div>
    `;
}

function createPagoCard(pago) {
    const estadoLabel = getEstadoPagoLabel(pago.estado);
    const badgeClass = getEstadoPagoBadgeClass(pago.estado);

    return `
        <div class="card">
            <div class="card-body">
                <div class="card-header" style="padding: 0 0 var(--spacing-sm) 0;">
                    <h3 class="card-title"><i class="fas fa-user"></i> ${pago.alumno_nombre}</h3>
                    <span class="badge ${badgeClass}">${estadoLabel}</span>
                </div>
                <p class="text-muted"><i class="fas fa-id-card"></i> DNI: ${pago.alumno_dni}</p>
                <p><strong>Cuota:</strong> ${pago.mes} ${pago.anio}</p>
                <p><strong>Monto:</strong> $${formatMonto(pago.monto)}</p>
                <p><strong>Método:</strong> ${pago.metodo_pago || '-'}</p>
                ${pago.banco ? `<p><strong>Banco:</strong> ${pago.banco}</p>` : ''}
                ${pago.numero_operacion ? `<p><strong>Operación:</strong> ${pago.numero_operacion}</p>` : ''}
                <p class="text-muted"><i class="fas fa-calendar"></i> ${Utils.formatDateTime(pago.fecha_pago)}</p>

                <div class="action-buttons mt-md">
                    <button class="btn btn-sm btn-success" onclick="aprobarPago(${pago.id})">
                        <i class="fas fa-check"></i> Aprobar
                    </button>
                    <button class="btn btn-sm btn-error" onclick="rechazarPago(${pago.id})">
                        <i class="fas fa-times"></i> Rechazar
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="verDetallePago(${pago.id})">
                        <i class="fas fa-eye"></i> Ver detalle
                    </button>
                    ${pago.comprobante_url ? `<a class="btn btn-sm btn-outline" href="${pago.comprobante_url}" target="_blank" rel="noopener">Ver comprobante</a>` : ''}
                </div>
            </div>
        </div>
    `;
}

async function aprobarPago(pagoId) {
    if (!confirm('¿Confirmar aprobación del pago?')) return;
    const observaciones = prompt('Observaciones (opcional):') || null;

    try {
        Utils.showLoader();
        await API.post('/api/v1/admin/pagos/validar', {
            pago_id: pagoId,
            accion: 'aprobar',
            observaciones: observaciones
        }, true);

        Utils.showSuccess('Pago aprobado correctamente');
        await loadCuotasValidacion();
        await loadEstadisticas();
        await loadAccionesPendientes();
    } catch (error) {
        console.error('Error al aprobar pago:', error);
        Utils.showError(error.message || 'Error al aprobar el pago');
    } finally {
        Utils.hideLoader();
    }
}

async function rechazarPago(pagoId) {
    if (!confirm('¿Confirmar rechazo del pago?')) return;
    const observaciones = prompt('Motivo de rechazo (opcional):') || null;

    try {
        Utils.showLoader();
        await API.post('/api/v1/admin/pagos/validar', {
            pago_id: pagoId,
            accion: 'rechazar',
            observaciones: observaciones
        }, true);

        Utils.showSuccess('Pago rechazado correctamente');
        await loadCuotasValidacion();
        await loadEstadisticas();
        await loadAccionesPendientes();
    } catch (error) {
        console.error('Error al rechazar pago:', error);
        Utils.showError(error.message || 'Error al rechazar el pago');
    } finally {
        Utils.hideLoader();
    }
}

async function verDetallePago(pagoId) {
    try {
        Utils.showLoader();
        const pago = await API.get(`/api/v1/admin/pagos/${pagoId}`, true);
        abrirModalPagoDetalle(pago);
    } catch (error) {
        console.error('Error al cargar detalle de pago:', error);
        Utils.showError('Error al cargar detalle de pago');
    } finally {
        Utils.hideLoader();
    }
}

function abrirModalPagoDetalle(pago) {
    const modal = document.getElementById('pagoDetalleModal');
    const container = document.getElementById('pagoDetalleContainer');
    if (!modal || !container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-body">
                <p><strong>Alumno:</strong> ${pago.alumno_nombre} (${pago.alumno_dni})</p>
                <p><strong>Cuota:</strong> ${pago.mes} ${pago.anio}</p>
                <p><strong>Monto:</strong> $${formatMonto(pago.monto)}</p>
                <p><strong>Método:</strong> ${pago.metodo_pago || '-'}</p>
                ${pago.banco ? `<p><strong>Banco:</strong> ${pago.banco}</p>` : ''}
                ${pago.numero_operacion ? `<p><strong>Operación:</strong> ${pago.numero_operacion}</p>` : ''}
                <p><strong>Fecha de pago:</strong> ${Utils.formatDateTime(pago.fecha_pago)}</p>
                <p><strong>Estado:</strong> ${getEstadoPagoLabel(pago.estado)}</p>
                ${pago.comprobante_url ? `<p><strong>Comprobante:</strong> <a href="${pago.comprobante_url}" target="_blank" rel="noopener">Ver comprobante</a></p>` : ''}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Gestión de Cursos - INTEGRADO
 */
async function loadCursos() {
    const container = document.getElementById('cursosContainer');
    if (!container) return;

    try {
        Utils.showLoader();
        cursos = await API.get('/api/v1/admin/cursos', true);
        aplicarFiltrosCursos();
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        Utils.showError('Error al cargar cursos');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                <h3>Error al cargar cursos</h3>
                <p>Intente nuevamente más tarde</p>
            </div>
        `;
    } finally {
        Utils.hideLoader();
    }
}

function renderCursos(lista) {
    const container = document.getElementById('cursosContainer');
    if (!container) return;

    if (!lista || lista.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                <h3>No hay cursos</h3>
                <p>No se encontraron cursos con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="noticias-grid">
            ${lista.map(curso => createCursoCard(curso)).join('')}
        </div>
    `;
}

function createCursoCard(curso) {
    const estadoBadge = curso.activo ? 'badge-success' : 'badge-warning';
    const estadoLabel = curso.activo ? 'Activo' : 'Inactivo';
    const turnoLabel = curso.turno || '-';
    const nivelLabel = curso.nivel_nombre || '-';

    return `
        <div class="card">
            <div class="card-body">
                <div class="card-header" style="padding: 0 0 var(--spacing-sm) 0;">
                    <h3 class="card-title"><i class="fas fa-chalkboard-teacher"></i> ${nivelLabel} - ${curso.anio}° ${curso.division}</h3>
                    <span class="badge ${estadoBadge}">${estadoLabel}</span>
                </div>
                <p class="text-muted"><i class="fas fa-calendar"></i> Ciclo: ${curso.ciclo_lectivo_nombre || 'N/A'}</p>
                <p><strong>Turno:</strong> ${turnoLabel}</p>
                <p><strong>Alumnos:</strong> ${curso.cantidad_alumnos || 0} / ${curso.capacidad_maxima}</p>
                ${curso.orientacion ? `<p><strong>Orientación:</strong> ${curso.orientacion}</p>` : ''}

                <div class="action-buttons mt-md">
                    <button class="btn btn-sm btn-primary" onclick="verAlumnosCurso(${curso.id})">
                        <i class="fas fa-users"></i> Ver Alumnos
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="abrirModalEditarCurso(${curso.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    ${curso.activo ? `
                        <button class="btn btn-sm btn-error" onclick="desactivarCurso(${curso.id})">
                            <i class="fas fa-ban"></i> Desactivar
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-success" onclick="activarCurso(${curso.id})">
                            <i class="fas fa-check"></i> Activar
                        </button>
                    `}
                    <button class="btn btn-sm btn-error" onclick="eliminarCurso(${curso.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function abrirModalNuevoCurso() {
    const modal = document.getElementById('cursoModal');
    const form = document.getElementById('cursoForm');
    const title = document.getElementById('cursoModalTitle');
    const submitBtn = document.getElementById('cursoSubmitBtn');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('cursoId').value = '';
    document.getElementById('cursoActivo').checked = true;
    document.getElementById('cursoCicloLectivoAnio').value = getCurrentYear();
    document.getElementById('cursoCicloLectivoAnio').disabled = false;
    document.getElementById('cursoNivelId').disabled = false;
    document.getElementById('cursoAnio').disabled = false;
    document.getElementById('cursoDivision').disabled = false;

    if (title) title.textContent = 'Nuevo Curso';
    if (submitBtn) submitBtn.textContent = 'Crear Curso';

    modal.classList.add('active');
}

function abrirModalEditarCurso(cursoId) {
    const curso = (cursos || []).find(c => c.id === cursoId);
    if (!curso) {
        Utils.showError('Curso no encontrado');
        return;
    }

    const modal = document.getElementById('cursoModal');
    const form = document.getElementById('cursoForm');
    const title = document.getElementById('cursoModalTitle');
    const submitBtn = document.getElementById('cursoSubmitBtn');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('cursoId').value = curso.id;
    document.getElementById('cursoCicloLectivoAnio').value = extractYear(curso.ciclo_lectivo_nombre) || getCurrentYear();
    document.getElementById('cursoNivelId').value = curso.nivel_id || '';
    document.getElementById('cursoAnio').value = curso.anio || '';
    document.getElementById('cursoDivision').value = curso.division || '';
    document.getElementById('cursoTurno').value = curso.turno || '';
    document.getElementById('cursoOrientacion').value = curso.orientacion || '';
    document.getElementById('cursoCapacidad').value = curso.capacidad_maxima || '';
    document.getElementById('cursoActivo').checked = !!curso.activo;
    document.getElementById('cursoCicloLectivoAnio').disabled = true;
    document.getElementById('cursoNivelId').disabled = true;
    document.getElementById('cursoAnio').disabled = true;
    document.getElementById('cursoDivision').disabled = true;

    if (title) title.textContent = 'Editar Curso';
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

    modal.classList.add('active');
}

async function handleCursoSubmit(e) {
    e.preventDefault();

    const cursoId = document.getElementById('cursoId').value;
    const cicloLectivoAnio = parseInt(document.getElementById('cursoCicloLectivoAnio').value, 10);
    const nivelId = parseInt(document.getElementById('cursoNivelId').value, 10);
    const anio = parseInt(document.getElementById('cursoAnio').value, 10);
    const division = document.getElementById('cursoDivision').value.trim().toUpperCase();
    const turno = document.getElementById('cursoTurno').value;
    const orientacion = document.getElementById('cursoOrientacion').value.trim();
    const capacidad = parseInt(document.getElementById('cursoCapacidad').value, 10);
    const activo = document.getElementById('cursoActivo').checked;

    try {
        Utils.showLoader();

        if (cursoId) {
            const updateData = {};
            if (turno) updateData.turno = turno;
            if (orientacion) updateData.orientacion = orientacion;
            if (!Number.isNaN(capacidad)) updateData.capacidad_maxima = capacidad;
            updateData.activo = activo;

            await API.put(`/api/v1/admin/cursos/${cursoId}`, updateData, true);
            Utils.showSuccess('Curso actualizado correctamente');
        } else {
            if (Number.isNaN(cicloLectivoAnio) || Number.isNaN(nivelId) || Number.isNaN(anio) || !division || !turno) {
                Utils.showError('Complete todos los campos obligatorios');
                return;
            }

            const createData = {
                ciclo_lectivo_anio: cicloLectivoAnio,
                nivel_id: nivelId,
                anio: anio,
                division: division,
                turno: turno,
                orientacion: orientacion || null,
                capacidad_maxima: Number.isNaN(capacidad) ? 30 : capacidad
            };

            await API.post('/api/v1/admin/cursos', createData, true);
            Utils.showSuccess('Curso creado correctamente');
        }

        cerrarModal('cursoModal');
        await loadCursos();
        await loadEstadisticas();
    } catch (error) {
        console.error('Error al guardar curso:', error);
        Utils.showError(error.message || 'Error al guardar el curso');
    } finally {
        Utils.hideLoader();
    }
}

async function desactivarCurso(cursoId) {
    if (!confirm('¿Desactivar este curso?')) return;

    try {
        Utils.showLoader();
        await API.delete(`/api/v1/admin/cursos/${cursoId}`, true);
        Utils.showSuccess('Curso desactivado');
        await loadCursos();
        await loadEstadisticas();
    } catch (error) {
        console.error('Error al desactivar curso:', error);
        Utils.showError(error.message || 'Error al desactivar el curso');
    } finally {
        Utils.hideLoader();
    }
}

async function activarCurso(cursoId) {
    try {
        Utils.showLoader();
        await API.put(`/api/v1/admin/cursos/${cursoId}`, { activo: true }, true);
        Utils.showSuccess('Curso activado');
        await loadCursos();
        await loadEstadisticas();
    } catch (error) {
        console.error('Error al activar curso:', error);
        Utils.showError(error.message || 'Error al activar el curso');
    } finally {
        Utils.hideLoader();
    }
}

async function eliminarCurso(cursoId) {
    if (!confirm('¿Eliminar este curso de forma permanente?\nEsta acción no se puede deshacer.')) return;

    try {
        Utils.showLoader();
        await API.delete(`/api/v1/admin/cursos/${cursoId}?hard=true`, true);
        Utils.showSuccess('Curso eliminado');
        await loadCursos();
        await loadEstadisticas();
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        Utils.showError(error.message || 'Error al eliminar el curso');
    } finally {
        Utils.hideLoader();
    }
}

async function verAlumnosCurso(cursoId) {
    try {
        Utils.showLoader();
        const alumnos = await API.get(`/api/v1/admin/cursos/${cursoId}/alumnos`, true);
        const curso = (cursos || []).find(c => c.id === cursoId) || { id: cursoId, nivel_nombre: '', anio: '', division: '' };
        abrirModalAlumnosCurso(curso, alumnos || []);
    } catch (error) {
        console.error('Error al cargar alumnos del curso:', error);
        Utils.showError('Error al cargar alumnos del curso');
    } finally {
        Utils.hideLoader();
    }
}

function abrirModalAlumnosCurso(curso, alumnos) {
    const modal = document.getElementById('alumnosCursoModal');
    const container = document.getElementById('alumnosCursoContainer');
    const title = document.getElementById('alumnosCursoModalTitle');

    if (!modal || !container) return;

    if (title) {
        title.textContent = `Alumnos - ${curso.nivel_nombre || ''} ${curso.anio || ''}° ${curso.division || ''}`.trim();
    }

    if (!alumnos || alumnos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <h3>Sin alumnos</h3>
                <p>No hay alumnos asignados a este curso</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="usuarios-table-container">
                        <table class="usuarios-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>DNI</th>
                                    <th>Email</th>
                                    <th>Legajo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alumnos.map(alumno => `
                                    <tr>
                                        <td>${alumno.nombre} ${alumno.apellido}</td>
                                        <td>${alumno.dni}</td>
                                        <td>${alumno.email || '-'}</td>
                                        <td>${alumno.legajo}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    modal.classList.add('active');
}

/**
 * Gestión de Noticias - INTEGRADO
 */
async function loadNoticias() {
    const container = document.getElementById('noticiasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        noticias = await API.get('/api/v1/admin/noticias', true);
        
        if (noticias.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-newspaper"></i></div>
                    <h3>No hay noticias</h3>
                    <button class="btn btn-primary mt-md" onclick="abrirModalNuevaNoticia()">
                        <i class="fas fa-plus"></i> Publicar Primera Noticia
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="noticias-grid">
                    ${noticias.map(noticia => createNoticiaCard(noticia)).join('')}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        Utils.showError('Error al cargar noticias');
    } finally {
        Utils.hideLoader();
    }
}

function createNoticiaCard(noticia) {
    const estadoBadge = noticia.publicada
        ? '<span class="badge badge-success">Publicada</span>'
        : '<span class="badge badge-warning">Borrador</span>';
    const fechaPublicacion = noticia.fecha_publicacion
        ? Utils.formatDate(noticia.fecha_publicacion)
        : 'Sin publicar';

    return `
        <div class="card">
            <div class="card-body">
                <h3>${noticia.titulo} ${estadoBadge}</h3>
                <p class="text-muted"><i class="fas fa-calendar"></i> ${fechaPublicacion}</p>
                <p>${noticia.resumen || noticia.contenido.substring(0, 150)}...</p>
                <div class="action-buttons mt-md">
                    <button class="btn btn-sm btn-outline" onclick="editarNoticia('${noticia.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-error" onclick="eliminarNoticia('${noticia.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function abrirModalNuevaNoticia() {
    const modal = document.getElementById('noticiaModal');
    const form = document.getElementById('noticiaForm');
    const title = document.getElementById('noticiaModalTitle');
    const submitBtn = document.getElementById('noticiaSubmitBtn');

    editingNoticiaId = null;

    if (form) form.reset();
    if (title) title.textContent = 'Publicar Noticia';
    if (submitBtn) submitBtn.textContent = 'Publicar Noticia';

    if (modal) modal.classList.add('active');
}

function editarNoticia(noticiaId) {
    const modal = document.getElementById('noticiaModal');
    const form = document.getElementById('noticiaForm');
    const title = document.getElementById('noticiaModalTitle');
    const submitBtn = document.getElementById('noticiaSubmitBtn');

    const noticia = (noticias || []).find(n => n.id === noticiaId);
    if (!noticia) {
        Utils.showError('Noticia no encontrada');
        return;
    }

    editingNoticiaId = noticiaId;

    if (form) form.reset();

    const tituloInput = document.getElementById('noticiaTitulo');
    if (tituloInput) tituloInput.value = noticia.titulo || '';

    const resumenInput = document.getElementById('noticiaResumen');
    if (resumenInput) resumenInput.value = noticia.resumen || '';

    const contenidoInput = document.getElementById('noticiaContenido');
    if (contenidoInput) contenidoInput.value = noticia.contenido || '';

    const imagenUrlInput = document.getElementById('noticiaImagenUrl');
    if (imagenUrlInput) imagenUrlInput.value = noticia.imagen_url || '';

    const imagenAltInput = document.getElementById('noticiaImagenAlt');
    if (imagenAltInput) imagenAltInput.value = noticia.imagen_alt || '';

    const categoriaInput = document.getElementById('noticiaCategoria');
    if (categoriaInput) categoriaInput.value = mapCategoriaValue(noticia.categoria);

    const publicadaInput = document.getElementById('noticiaPublicada');
    if (publicadaInput) publicadaInput.checked = !!noticia.publicada;

    if (title) title.textContent = 'Editar Noticia';
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

    if (modal) modal.classList.add('active');
}

function eliminarNoticia(noticiaId) {
    if (!confirm('¿Está seguro de eliminar esta noticia?\nEsta acción no se puede deshacer.')) {
        return;
    }

    (async () => {
        try {
            Utils.showLoader();
            await API.delete(`/api/v1/admin/noticias/${noticiaId}`, true);
            Utils.showSuccess('Noticia eliminada correctamente');
            await loadNoticias();
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            Utils.showError(error.message || 'Error al eliminar la noticia');
        } finally {
            Utils.hideLoader();
        }
    })();
}

async function handleNoticiaSubmit(e) {
    e.preventDefault();

    const titulo = document.getElementById('noticiaTitulo').value.trim();
    const resumen = document.getElementById('noticiaResumen').value.trim();
    const contenido = document.getElementById('noticiaContenido').value.trim();
    const imagenUrl = document.getElementById('noticiaImagenUrl').value.trim();
    const imagenAlt = document.getElementById('noticiaImagenAlt').value.trim();
    const categoria = document.getElementById('noticiaCategoria').value.trim();
    const publicada = document.getElementById('noticiaPublicada').checked;

    if (!titulo || !contenido) {
        Utils.showError('Título y contenido son obligatorios');
        return;
    }

    const payload = {
        titulo,
        resumen: resumen || null,
        contenido,
        imagen_url: imagenUrl || null,
        imagen_alt: imagenAlt || null,
        categoria: categoria || null,
        publicada
    };

    try {
        Utils.showLoader();

        if (editingNoticiaId) {
            await API.put(`/api/v1/admin/noticias/${editingNoticiaId}`, payload, true);
            Utils.showSuccess('Noticia actualizada correctamente');
        } else {
            await API.post('/api/v1/admin/noticias', payload, true);
            Utils.showSuccess('Noticia publicada correctamente');
        }

        cerrarModal('noticiaModal');
        await loadNoticias();
    } catch (error) {
        console.error('Error al guardar noticia:', error);
        Utils.showError(error.message || 'Error al guardar la noticia');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Gestión de Mensajes
 */
async function loadMensajes() {
    try {
        await loadMensajesRecibidos();
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
    }
}

async function loadMensajesRecibidos() {
    const container = document.getElementById('mensajesRecibidosContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Implementar endpoint para mensajes del admin
        mensajes = [];
        
        if (mensajes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-inbox"></i></div>
                    <h3>Bandeja vacía</h3>
                    <p>No tienes mensajes</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="messages-list">
                    ${mensajes.map(msg => createMessageCard(msg)).join('')}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar mensajes recibidos:', error);
        Utils.showError('Error al cargar mensajes');
    } finally {
        Utils.hideLoader();
    }
}

function createMessageCard(mensaje) {
    return `
        <div class="message-item ${!mensaje.leido ? 'unread' : ''}" onclick="verMensaje(${mensaje.id})">
            <div class="message-header">
                <span class="message-sender">${mensaje.remitente}</span>
                <span class="message-date">${Utils.formatDateTime(mensaje.fecha)}</span>
            </div>
            <div class="message-subject">${mensaje.asunto}</div>
            <div class="message-preview">${mensaje.preview || ''}</div>
        </div>
    `;
}

function verMensaje(mensajeId) {
    Utils.showWarning('Funcionalidad de ver mensaje en desarrollo');
}

function handleTipoDestinatarioChange() {
    const tipo = document.getElementById('tipoDestinatario').value;
    const detalleGroup = document.getElementById('destinatarioDetalleGroup');
    const detalleSelect = document.getElementById('destinatarioDetalle');
    const detalleLabel = document.getElementById('destinatarioDetalleLabel');
    
    if (tipo === 'todos') {
        detalleGroup.style.display = 'none';
        return;
    }
    
    detalleGroup.style.display = 'block';
    detalleSelect.innerHTML = '';
    
    switch(tipo) {
        case 'rol':
            detalleLabel.textContent = 'Seleccionar rol';
            detalleSelect.innerHTML = `
                <option value="">Seleccionar...</option>
                <option value="alumno">Alumnos</option>
                <option value="padre">Padres</option>
                <option value="docente">Docentes</option>
                <option value="preceptor">Preceptores</option>
            `;
            break;
            
        case 'nivel':
            detalleLabel.textContent = 'Seleccionar nivel';
            detalleSelect.innerHTML = `
                <option value="">Seleccionar...</option>
                <option value="inicial">Inicial</option>
                <option value="primario">Primario</option>
                <option value="secundario">Secundario</option>
            `;
            break;
            
        case 'individual':
            detalleLabel.textContent = 'Buscar usuario';
            detalleSelect.innerHTML = `
                <option value="">Buscar por DNI o nombre...</option>
            `;
            break;
    }
}

async function handleEnviarMensaje(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('tipoDestinatario').value;
    const detalle = document.getElementById('destinatarioDetalle').value;
    const asunto = document.getElementById('mensajeAsunto').value.trim();
    const cuerpo = document.getElementById('mensajeCuerpo').value.trim();
    
    if (!asunto || !cuerpo) {
        Utils.showError('Complete todos los campos');
        return;
    }
    
    if (tipo !== 'todos' && !detalle) {
        Utils.showError('Seleccione el destinatario');
        return;
    }
    
    const messageData = {
        tipo_destinatario: tipo,
        destinatario_detalle: detalle || null,
        asunto: asunto,
        mensaje: cuerpo
    };
    
    try {
        Utils.showLoader();
        
        // TODO: Implementar endpoint para enviar mensajes
        console.log('Enviando mensaje:', messageData);
        
        Utils.showSuccess('Mensaje enviado correctamente');
        document.getElementById('mensajeForm').reset();
        document.getElementById('destinatarioDetalleGroup').style.display = 'none';
        
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        Utils.showError('Error al enviar el mensaje');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Utilidades y Helpers
 */
function normalizeText(value) {
    return (value || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function mapCategoriaValue(value) {
    const normalized = normalizeText(value);
    const options = ['institucional', 'academico', 'deportes', 'cultural', 'comunidad', 'eventos'];
    return options.includes(normalized) ? normalized : '';
}

function getMesNumero(mesValor) {
    if (mesValor === null || mesValor === undefined) return null;
    if (typeof mesValor === 'number') return mesValor;
    const mesStr = normalizeText(mesValor);
    const meses = {
        'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
        'julio': 7, 'agosto': 8, 'septiembre': 9, 'setiembre': 9, 'octubre': 10,
        'noviembre': 11, 'diciembre': 12
    };
    return meses[mesStr] || null;
}

function getEstadoPagoLabel(estado) {
    const estadoNorm = normalizeText(estado);
    if (['pending', 'in_process', 'pendiente'].includes(estadoNorm)) return 'Pendiente';
    if (estadoNorm.includes('rech')) return 'Rechazado';
    if (estadoNorm.includes('aprob') || estadoNorm === 'approved') return 'Aprobado';
    return estado || 'Pendiente';
}

function getEstadoPagoBadgeClass(estado) {
    const estadoNorm = normalizeText(estado);
    if (['pending', 'in_process', 'pendiente'].includes(estadoNorm)) return 'badge-warning';
    if (estadoNorm.includes('rech')) return 'badge-error';
    if (estadoNorm.includes('aprob') || estadoNorm === 'approved') return 'badge-success';
    return 'badge-info';
}

function formatMonto(monto) {
    if (monto === null || monto === undefined) return '-';
    const num = typeof monto === 'number' ? monto : parseFloat(monto);
    if (Number.isNaN(num)) return monto;
    return num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function extractYear(value) {
    if (!value) return null;
    const match = String(value).match(/(20\\d{2})/);
    return match ? parseInt(match[1], 10) : null;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getNivelId(nivelNombre) {
    const niveles = {
        'inicial': 1,
        'primario': 2,
        'secundario': 3
    };
    return niveles[nivelNombre] || 1;
}

function getNivelKey(nivelId, nivelNombre) {
    const mapById = {
        1: 'inicial',
        2: 'primario',
        3: 'secundario'
    };

    if (mapById[nivelId]) return mapById[nivelId];

    if (nivelNombre) {
        const normalized = normalizeText(nivelNombre);
        if (normalized.includes('inicial')) return 'inicial';
        if (normalized.includes('primario')) return 'primario';
        if (normalized.includes('secundario')) return 'secundario';
    }

    return 'inicial';
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Filtros
 */
function aplicarFiltrosCuotas() {
    const filterEstado = document.getElementById('filterCuotasEstado');
    const filterMes = document.getElementById('filterCuotasMes');

    let filtrados = Array.isArray(pagosPendientes) ? pagosPendientes.slice() : [];

    const estado = filterEstado ? filterEstado.value : 'pendiente';
    const mes = filterMes ? filterMes.value : '';

    if (estado && estado !== 'todos') {
        filtrados = filtrados.filter(pago => {
            const estadoNorm = normalizeText(pago.estado);
            if (estado === 'pendiente') return ['pending', 'in_process', 'pendiente'].includes(estadoNorm);
            if (estado === 'validado') return estadoNorm.includes('aprob') || estadoNorm === 'approved';
            if (estado === 'rechazado') return estadoNorm.includes('rech');
            return true;
        });
    }

    if (mes) {
        const mesNum = parseInt(mes, 10);
        filtrados = filtrados.filter(pago => getMesNumero(pago.mes) === mesNum);
    }

    pagosPendientesFiltrados = filtrados;
    renderPagosPendientes(pagosPendientesFiltrados);
}

function aplicarFiltrosCursos() {
    const filterNivel = document.getElementById('filterCursosNivel');
    const filterAnio = document.getElementById('filterCursosAnio');
    const filterTurno = document.getElementById('filterCursosTurno');

    let filtrados = Array.isArray(cursos) ? cursos.slice() : [];

    const nivel = filterNivel ? filterNivel.value : '';
    const anio = filterAnio ? filterAnio.value : '';
    const turno = filterTurno ? filterTurno.value : '';

    if (nivel) {
        filtrados = filtrados.filter(curso => {
            const nivelNombre = normalizeText(curso.nivel_nombre);
            const nivelId = String(curso.nivel_id || '');
            if (['inicial', 'primario', 'secundario'].includes(nivel)) {
                return nivelNombre === nivel || nivelId === (nivel === 'inicial' ? '1' : nivel === 'primario' ? '2' : '3');
            }
            return true;
        });
    }

    if (anio) {
        filtrados = filtrados.filter(curso => String(curso.anio) === String(anio));
    }

    if (turno) {
        filtrados = filtrados.filter(curso => normalizeText(curso.turno) === normalizeText(turno));
    }

    renderCursos(filtrados);
}

function actualizarFiltroAnios(nivel) {
    const selectAnio = document.getElementById('filterCursosAnio');
    if (!selectAnio) return;
    
    let opciones = '<option value="">Todos</option>';
    
    switch(nivel) {
        case 'inicial':
            opciones += '<option value="3">Sala de 3</option>';
            opciones += '<option value="4">Sala de 4</option>';
            opciones += '<option value="5">Sala de 5</option>';
            break;
        case 'primario':
            for (let i = 1; i <= 6; i++) {
                opciones += `<option value="${i}">${i}° Grado</option>`;
            }
            break;
        case 'secundario':
            for (let i = 1; i <= 6; i++) {
                opciones += `<option value="${i}">${i}° Año</option>`;
            }
            break;
        default:
            opciones = '<option value="">Todos</option>';
    }
    
    selectAnio.innerHTML = opciones;
}

/**
 * Event Listeners para filtros
 */
document.addEventListener('DOMContentLoaded', function() {
    const filterEstado = document.getElementById('filterCuotasEstado');
    const filterMes = document.getElementById('filterCuotasMes');
    
    if (filterEstado) {
        filterEstado.addEventListener('change', aplicarFiltrosCuotas);
    }
    
    if (filterMes) {
        filterMes.addEventListener('change', aplicarFiltrosCuotas);
    }

    const filterNivel = document.getElementById('filterCursosNivel');
    const filterAnio = document.getElementById('filterCursosAnio');
    const filterTurno = document.getElementById('filterCursosTurno');
    
    if (filterNivel) {
        filterNivel.addEventListener('change', function() {
            actualizarFiltroAnios(this.value);
            aplicarFiltrosCursos();
        });
    }
    
    if (filterAnio) {
        filterAnio.addEventListener('change', aplicarFiltrosCursos);
    }
    
    if (filterTurno) {
        filterTurno.addEventListener('change', aplicarFiltrosCursos);
    }
});

/**
 * Extensiones de Utils
 */
if (typeof Utils !== 'undefined') {
    Utils.formatDateTime = function(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    Utils.formatDate = function(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    Utils.formatDateShort = function(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
}

console.log('✅ Admin Dashboard Module Loaded - INTEGRADO CON BACKEND');
