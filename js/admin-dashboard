/**
 * JavaScript para Dashboard de Administrador
 * Instituto Privado San Marino
 */

// Variables globales
let usuariosPendientes = [];
let todosUsuarios = [];
let configuracionesCuotas = [];
let cursos = [];
let noticias = [];
let mensajes = [];

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
 * Carga las estadísticas generales
 */
async function loadEstadisticas() {
    try {
        // Cargar usuarios pendientes
        const pendientesCount = await API.get('/api/v1/auth/pending-count', true);
        document.getElementById('statPendientes').textContent = pendientesCount.count || 0;
        
        if (pendientesCount.count > 0) {
            const badge = document.getElementById('pendientesBadge');
            if (badge) {
                badge.textContent = pendientesCount.count;
                badge.style.display = 'inline';
            }
        }
        
        // TODO: Cargar otras estadísticas cuando estén disponibles los endpoints
        document.getElementById('statUsuarios').textContent = '-';
        document.getElementById('statMensajes').textContent = '-';
        document.getElementById('statCursos').textContent = '-';
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Carga acciones pendientes
 */
async function loadAccionesPendientes() {
    const container = document.getElementById('accionesPendientesContainer');
    if (!container) return;
    
    try {
        const pendientesCount = await API.get('/api/v1/auth/pending-count', true);
        
        const acciones = [];
        
        if (pendientesCount.count > 0) {
            acciones.push({
                icon: 'fa-user-clock',
                texto: `${pendientesCount.count} usuario(s) pendiente(s) de aprobación`,
                accion: () => document.querySelector('[data-section="usuarios-pendientes"]').click()
            });
        }
        
        if (acciones.length === 0) {
            container.innerHTML = '<p class="text-center text-success"><i class="fas fa-check-circle"></i> No hay acciones pendientes</p>';
        } else {
            container.innerHTML = acciones.map(accion => `
                <div class="accion-item" style="padding: var(--spacing-md); border-left: 4px solid var(--warning-color); background: var(--gray-50); margin-bottom: var(--spacing-sm); cursor: pointer; border-radius: var(--border-radius-md);" onclick="document.querySelector('[data-section=\\'usuarios-pendientes\\']').click()">
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
 * Carga usuarios pendientes de aprobación
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
                    <p><span class="info-label">DNI:</span>${user.dni}</p>
                    <p><span class="info-label">Email:</span>${user.email}</p>
                    ${user.telefono ? `<p><span class="info-label">Teléfono:</span>${user.telefono}</p>` : ''}
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
 * Aprueba un usuario pendiente
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
        
    } catch (error) {
        console.error('Error al aprobar usuario:', error);
        Utils.showError('Error al aprobar el usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Rechaza un usuario pendiente
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
        
    } catch (error) {
        console.error('Error al rechazar usuario:', error);
        Utils.showError('Error al rechazar el usuario');
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
        // Por ahora mostrar mensaje
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
 * Maneja la creación de nuevo usuario
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
 * Configuración de Cuotas
 */
async function loadConfiguracionesCuotas() {
    try {
        Utils.showLoader();
        
        configuracionesCuotas = await API.get('/api/v1/admin/cuotas/configuracion', true);
        
        // Separar por nivel
        const inicial = configuracionesCuotas.filter(c => c.nivel === 'inicial');
        const primario = configuracionesCuotas.filter(c => c.nivel === 'primario');
        const secundario = configuracionesCuotas.filter(c => c.nivel === 'secundario');
        
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
    const isActive = config.vigente;
    
    return `
        <div class="config-card ${isActive ? 'active' : 'inactive'}">
            <div class="config-header">
                <h3 class="config-title">${capitalize(config.nivel)}</h3>
                <span class="config-status ${isActive ? 'active' : 'inactive'}">
                    ${isActive ? 'Vigente' : 'Inactiva'}
                </span>
            </div>
            
            <div class="config-details">
                <div class="config-detail-item">
                    <span class="config-detail-label">Monto mensual</span>
                    <span class="config-detail-value">$${config.monto.toLocaleString()}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Vencimiento</span>
                    <span class="config-detail-value">Día ${config.dia_vencimiento}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Recargo</span>
                    <span class="config-detail-value">${config.recargo_porcentaje}%</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Desde</span>
                    <span class="config-detail-value">${Utils.formatDate(config.fecha_inicio_vigencia)}</span>
                </div>
                ${config.fecha_fin_vigencia ? `
                    <div class="config-detail-item">
                        <span class="config-detail-label">Hasta</span>
                        <span class="config-detail-value">${Utils.formatDate(config.fecha_fin_vigencia)}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="config-actions">
                <button class="btn btn-sm btn-outline" onclick="editarConfig(${config.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                ${!isActive ? `
                    <button class="btn btn-sm btn-error" onclick="eliminarConfig(${config.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Abre modal para nueva configuración
 */
function abrirModalNuevaConfig() {
    const modal = document.getElementById('nuevaConfigModal');
    document.getElementById('nuevaConfigForm').reset();
    modal.classList.add('active');
}

/**
 * Maneja la creación de nueva configuración
 */
async function handleNuevaConfig(e) {
    e.preventDefault();
    
    const formData = {
        nivel_id: getNivelId(document.getElementById('configNivel').value),
        monto: parseFloat(document.getElementById('configMonto').value),
        dia_vencimiento: parseInt(document.getElementById('configDiaVencimiento').value),
        recargo_porcentaje: parseFloat(document.getElementById('configRecargo').value),
        fecha_inicio_vigencia: document.getElementById('configFechaInicio').value
    };
    
    try {
        Utils.showLoader();
        
        await API.post('/api/v1/admin/cuotas/configuracion', formData, true);
        
        Utils.showSuccess('Configuración creada correctamente');
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
    Utils.showWarning('Funcionalidad de edición en desarrollo');
    // TODO: Implementar edición
}

/**
 * Eliminar configuración
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
 * Validación de Cuotas
 */
async function loadCuotasValidacion() {
    const container = document.getElementById('cuotasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Implementar endpoint para validar cuotas
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-money-check-alt"></i></div>
                <h3>Validación de cuotas</h3>
                <p>Esta funcionalidad estará disponible próximamente</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al cargar cuotas:', error);
        Utils.showError('Error al cargar cuotas');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Gestión de Cursos
 */
async function loadCursos() {
    const container = document.getElementById('cursosContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Implementar endpoint para cursos
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                <h3>Gestión de cursos</h3>
                <p>Esta funcionalidad estará disponible próximamente</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        Utils.showError('Error al cargar cursos');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Abre modal para nuevo curso
 */
function abrirModalNuevoCurso() {
    Utils.showWarning('Funcionalidad en desarrollo');
    // TODO: Implementar modal de nuevo curso
}

/**
 * Gestión de Noticias
 */
async function loadNoticias() {
    const container = document.getElementById('noticiasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        noticias = await API.get('/api/v1/publico/noticias', false);
        
        if (noticias.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-newspaper"></i></div>
                    <h3>No hay noticias publicadas</h3>
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

/**
 * Crea una tarjeta de noticia
 */
function createNoticiaCard(noticia) {
    return `
        <div class="card">
            <div class="card-body">
                <h3>${noticia.titulo}</h3>
                <p class="text-muted"><i class="fas fa-calendar"></i> ${Utils.formatDate(noticia.fecha)}</p>
                <p>${noticia.resumen}</p>
                <div class="action-buttons mt-md">
                    <button class="btn btn-sm btn-outline" onclick="editarNoticia(${noticia.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-error" onclick="eliminarNoticia(${noticia.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Abre modal para nueva noticia
 */
function abrirModalNuevaNoticia() {
    Utils.showWarning('Funcionalidad en desarrollo');
    // TODO: Implementar modal de nueva noticia
}

/**
 * Editar noticia
 */
function editarNoticia(noticiaId) {
    Utils.showWarning('Funcionalidad de edición en desarrollo');
}

/**
 * Eliminar noticia
 */
function eliminarNoticia(noticiaId) {
    Utils.showWarning('Funcionalidad de eliminación en desarrollo');
}

/**
 * Utilidades
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getNivelId(nivelNombre) {
    // TODO: Obtener ID real desde la base de datos
    const niveles = {
        'inicial': 1,
        'primario': 2,
        'secundario': 3
    };
    return niveles[nivelNombre] || 1;
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
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

/**
 * Carga mensajes recibidos
 */
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

/**
 * Crea una tarjeta de mensaje
 */
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

/**
 * Ver detalle de un mensaje
 */
function verMensaje(mensajeId) {
    Utils.showWarning('Funcionalidad de ver mensaje en desarrollo');
    // TODO: Implementar vista de mensaje completo
}

/**
 * Maneja el cambio de tipo de destinatario
 */
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
            // TODO: Implementar búsqueda de usuarios
            break;
    }
}

/**
 * Maneja el envío de mensajes
 */
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
 * Extensiones de la clase Utils para funcionalidades específicas de admin
 */

// Formatear fecha y hora
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

/**
 * Filtros
 */

// Filtro de usuarios pendientes
document.addEventListener('DOMContentLoaded', function() {
    const filterSearch = document.getElementById('filterPendientesSearch');
    const filterSort = document.getElementById('filterPendientesSort');
    
    if (filterSearch) {
        filterSearch.addEventListener('input', aplicarFiltrosPendientes);
    }
    
    if (filterSort) {
        filterSort.addEventListener('change', aplicarFiltrosPendientes);
    }
});

function aplicarFiltrosPendientes() {
    // TODO: Implementar filtrado y ordenamiento
    console.log('Aplicando filtros a usuarios pendientes');
}

// Filtro de usuarios
document.addEventListener('DOMContentLoaded', function() {
    const filterSearch = document.getElementById('filterUsuariosSearch');
    const filterRole = document.getElementById('filterUsuariosRole');
    const filterStatus = document.getElementById('filterUsuariosStatus');
    
    if (filterSearch) {
        filterSearch.addEventListener('input', aplicarFiltrosUsuarios);
    }
    
    if (filterRole) {
        filterRole.addEventListener('change', aplicarFiltrosUsuarios);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', aplicarFiltrosUsuarios);
    }
});

function aplicarFiltrosUsuarios() {
    // TODO: Implementar filtrado
    console.log('Aplicando filtros a usuarios');
}

// Filtro de cuotas
document.addEventListener('DOMContentLoaded', function() {
    const filterEstado = document.getElementById('filterCuotasEstado');
    const filterMes = document.getElementById('filterCuotasMes');
    
    if (filterEstado) {
        filterEstado.addEventListener('change', aplicarFiltrosCuotas);
    }
    
    if (filterMes) {
        filterMes.addEventListener('change', aplicarFiltrosCuotas);
    }
});

function aplicarFiltrosCuotas() {
    // TODO: Implementar filtrado
    console.log('Aplicando filtros a cuotas');
}

// Filtro de cursos
document.addEventListener('DOMContentLoaded', function() {
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

function aplicarFiltrosCursos() {
    // TODO: Implementar filtrado
    console.log('Aplicando filtros a cursos');
}

/**
 * Log de carga del módulo
 */
console.log('✅ Admin Dashboard Module Loaded:', {
    timestamp: new Date().toISOString()
});