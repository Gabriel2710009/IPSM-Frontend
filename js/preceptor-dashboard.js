/**
 * JavaScript para Dashboard de Preceptor
 */

let cursosData = [];
let incidentesData = [];
let comunicadosData = [];
let usuariosData = [];
let noticiasData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!Auth.isAuthenticated()) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }
    
    // Verificar que sea preceptor
    const user = Auth.getUser();
    if (!user || user.role !== 'preceptor') {
        Utils.showError('No tiene permisos para acceder a esta sección');
        Auth.logout();
        return;
    }
    
    // Inicializar dashboard
    initDashboard();
    initNavigation();
    initLogout();
    initModals();
    initForms();
    
    // Cargar datos iniciales
    loadUserData();
    loadDashboardData();
    
    // Establecer fecha actual
    document.getElementById('fechaAsistencia').valueAsDate = new Date();
});

/**
 * Inicializa el dashboard
 */
function initDashboard() {
    const user = Auth.getUser();
    
    const userNameElements = document.querySelectorAll('#userName, #welcomeName');
    userNameElements.forEach(el => {
        if (el) {
            el.textContent = user.nombre || 'Preceptor';
        }
    });
}

/**
 * Inicializa la navegación
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
        case 'perfil':
            await loadPerfil();
            break;
        case 'cursos':
            await loadCursosDetalle();
            break;
        case 'asistencia':
            // Se carga cuando el usuario hace clic en "Ver Asistencia"
            break;
        case 'disciplina':
            await loadDisciplina();
            break;
        case 'comunicados':
            await loadComunicados();
            break;
        case 'usuarios':
            await loadUsuarios();
            break;
        case 'noticias':
            await loadNoticias();
            break;
        case 'promocion':
            await loadPromocionSection();
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
 * Inicializa los modales
 */
function initModals() {
    // Modal de incidente
    const incidenteModal = document.getElementById('incidenteModal');
    const closeIncidenteModal = document.getElementById('closeIncidenteModal');
    const nuevoIncidenteBtn = document.getElementById('nuevoIncidenteBtn');
    
    if (closeIncidenteModal) {
        closeIncidenteModal.addEventListener('click', () => {
            incidenteModal.classList.remove('active');
        });
    }
    
    if (incidenteModal) {
        incidenteModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    if (nuevoIncidenteBtn) {
        nuevoIncidenteBtn.addEventListener('click', () => {
            incidenteModal.classList.add('active');
            cargarAlumnosEnSelect();
        });
    }
    
    // Modal de comunicado
    const comunicadoModal = document.getElementById('comunicadoModal');
    const closeComunicadoModal = document.getElementById('closeComunicadoModal');
    const nuevoComunicadoBtn = document.getElementById('nuevoComunicadoBtn');
    
    if (closeComunicadoModal) {
        closeComunicadoModal.addEventListener('click', () => {
            comunicadoModal.classList.remove('active');
        });
    }
    
    if (comunicadoModal) {
        comunicadoModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    if (nuevoComunicadoBtn) {
        nuevoComunicadoBtn.addEventListener('click', () => {
            comunicadoModal.classList.add('active');
        });
    }
}

/**
 * Inicializa los formularios
 */
function initForms() {
    // Formulario de cambio de contraseña
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // Formulario de incidente
    const incidenteForm = document.getElementById('incidenteForm');
    if (incidenteForm) {
        incidenteForm.addEventListener('submit', handleIncidenteSubmit);
    }
    
    // Formulario de comunicado
    const comunicadoForm = document.getElementById('comunicadoForm');
    if (comunicadoForm) {
        comunicadoForm.addEventListener('submit', handleComunicadoSubmit);
    }
    
    // Botón cargar asistencia
    const cargarAsistenciaBtn = document.getElementById('cargarAsistenciaBtn');
    if (cargarAsistenciaBtn) {
        cargarAsistenciaBtn.addEventListener('click', cargarAsistencia);
    }
    
    // Botón cargar alumnos para promoción
    const cargarAlumnosPromocionBtn = document.getElementById('cargarAlumnosPromocionBtn');
    if (cargarAlumnosPromocionBtn) {
        cargarAlumnosPromocionBtn.addEventListener('click', cargarAlumnosPromocion);
    }
}

/**
 * Carga datos del usuario
 */
async function loadUserData() {
    try {
        const perfil = await API.get('/api/v1/auth/me', true);
        
        if (perfil) {
            Auth.saveUser(perfil);
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
}

/**
 * Carga datos del dashboard
 */
async function loadDashboardData() {
    try {
        Utils.showLoader();
        
        await Promise.all([
            loadCursos(),
            loadEstadisticas(),
            loadIncidentes()
        ]);
        
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        Utils.showError('Error al cargar los datos del dashboard');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga los cursos del preceptor
 */
async function loadCursos() {
    try {
        // TODO: Reemplazar con endpoint real cuando esté disponible
        // cursosData = await API.get('/api/v1/preceptores/cursos', true);
        
        // Datos de ejemplo
        cursosData = [
            {
                id: 1,
                nivel: 'Secundario',
                anio: 5,
                division: 'A',
                turno: 'Mañana',
                cantidad_alumnos: 28,
                tutor: 'Prof. María García'
            },
            {
                id: 2,
                nivel: 'Secundario',
                anio: 5,
                division: 'B',
                turno: 'Tarde',
                cantidad_alumnos: 25,
                tutor: 'Prof. Carlos López'
            },
            {
                id: 3,
                nivel: 'Secundario',
                anio: 6,
                division: 'A',
                turno: 'Mañana',
                cantidad_alumnos: 22,
                tutor: 'Prof. Ana Martínez'
            }
        ];
        
        // Poblar selects
        const cursoSelectAsistencia = document.getElementById('cursoSelectAsistencia');
        const cursoPromocion = document.getElementById('cursoPromocion');
        
        const options = cursosData.map(curso => 
            `<option value="${curso.id}">${curso.nivel} ${curso.anio}° ${curso.division} - ${curso.turno}</option>`
        ).join('');
        
        if (cursoSelectAsistencia) {
            cursoSelectAsistencia.innerHTML = '<option value="">Seleccione un curso</option>' + options;
        }
        
        if (cursoPromocion) {
            cursoPromocion.innerHTML = '<option value="">Seleccione un curso</option>' + options;
        }
        
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    }
}

/**
 * Carga estadísticas
 */
async function loadEstadisticas() {
    try {
        const totalAlumnos = cursosData.reduce((acc, c) => acc + c.cantidad_alumnos, 0);
        
        document.getElementById('statCursos').textContent = cursosData.length;
        document.getElementById('statAlumnos').textContent = totalAlumnos;
        document.getElementById('statAusencias').textContent = '5'; // TODO: Obtener de API
        document.getElementById('statIncidentes').textContent = incidentesData.length;
        
        // Cargar resumen de asistencia
        const resumenContainer = document.getElementById('resumenAsistenciaContainer');
        if (resumenContainer) {
            resumenContainer.innerHTML = `
                <div class="asistencia-resumen">
                    <div class="asistencia-stat">
                        <div class="asistencia-stat-value">92%</div>
                        <div class="asistencia-stat-label">Asistencia promedio</div>
                    </div>
                    <div class="asistencia-stat">
                        <div class="asistencia-stat-value">5</div>
                        <div class="asistencia-stat-label">Ausentes hoy</div>
                    </div>
                    <div class="asistencia-stat">
                        <div class="asistencia-stat-value">3</div>
                        <div class="asistencia-stat-label">Tardanzas</div>
                    </div>
                    <div class="asistencia-stat">
                        <div class="asistencia-stat-value">2</div>
                        <div class="asistencia-stat-label">Justificados</div>
                    </div>
                </div>
            `;
        }
        
        // Cargar alertas
        const alertasContainer = document.getElementById('alertasContainer');
        if (alertasContainer) {
            alertasContainer.innerHTML = `
                <div class="alertas-list">
                    <div class="alerta-item">
                        <i class="fas fa-exclamation-circle alerta-icon"></i>
                        <span class="alerta-texto">Juan Pérez acumula 3 ausencias esta semana</span>
                        <span class="alerta-fecha">Hoy</span>
                    </div>
                    <div class="alerta-item">
                        <i class="fas fa-exclamation-circle alerta-icon"></i>
                        <span class="alerta-texto">Incidente sin resolver en 5° B</span>
                        <span class="alerta-fecha">Ayer</span>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Carga incidentes
 */
async function loadIncidentes() {
    try {
        // TODO: Obtener desde API
        incidentesData = [
            {
                id: 1,
                alumno: 'Juan Pérez',
                tipo: 'leve',
                descripcion: 'Llegó tarde sin justificación',
                sancion: 'Amonestación verbal',
                fecha: '2025-02-04',
                resuelto: true
            },
            {
                id: 2,
                alumno: 'María García',
                tipo: 'moderado',
                descripcion: 'Comportamiento disruptivo en clase',
                sancion: 'Comunicación a los padres',
                fecha: '2025-02-04',
                resuelto: false
            }
        ];
    } catch (error) {
        console.error('Error al cargar incidentes:', error);
    }
}

/**
 * Carga el perfil del preceptor
 */
async function loadPerfil() {
    const container = document.getElementById('perfilContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        const perfil = await API.get('/api/v1/auth/me', true);
        
        if (perfil) {
            container.innerHTML = `
                <div class="profile-grid">
                    <div>
                        <div class="profile-item">
                            <div class="profile-label">Nombre completo</div>
                            <div class="profile-value">${perfil.nombre} ${perfil.apellido}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">DNI</div>
                            <div class="profile-value">${perfil.dni}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Email</div>
                            <div class="profile-value">${perfil.email || 'No registrado'}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Teléfono</div>
                            <div class="profile-value">${perfil.telefono || 'No registrado'}</div>
                        </div>
                    </div>
                    <div>
                        <div class="profile-item">
                            <div class="profile-label">Rol</div>
                            <div class="profile-value">Preceptor</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Cursos a cargo</div>
                            <div class="profile-value">${cursosData.length}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Total alumnos</div>
                            <div class="profile-value">${cursosData.reduce((acc, c) => acc + c.cantidad_alumnos, 0)}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        Utils.showError('Error al cargar el perfil');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga detalle de cursos
 */
async function loadCursosDetalle() {
    const container = document.getElementById('cursosContainer');
    if (!container) return;
    
    if (cursosData.length === 0) {
        container.innerHTML = '<p class="text-center">No tiene cursos asignados.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="cursos-grid">
            ${cursosData.map(curso => `
                <div class="curso-card">
                    <div class="curso-header">
                        <div>
                            <h3 class="curso-titulo">${curso.nivel} - ${curso.anio}° ${curso.division}</h3>
                            <p class="curso-nivel">Tutor: ${curso.tutor}</p>
                        </div>
                        <span class="curso-badge badge badge-info">${curso.turno}</span>
                    </div>
                    
                    <div class="curso-info">
                        <div class="curso-info-item">
                            <i class="fas fa-users"></i>
                            <span>${curso.cantidad_alumnos} alumnos</span>
                        </div>
                    </div>
                    
                    <div class="curso-actions">
                        <button class="btn btn-primary btn-sm" onclick="verAlumnosCurso(${curso.id})">
                            <i class="fas fa-users"></i> Ver Alumnos
                        </button>
                        <button class="btn btn-accent btn-sm" onclick="verAsistenciaCurso(${curso.id})">
                            <i class="fas fa-clipboard-check"></i> Asistencia
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Carga asistencia de un curso
 */
async function cargarAsistencia() {
    const cursoSelect = document.getElementById('cursoSelectAsistencia');
    const fechaInput = document.getElementById('fechaAsistencia');
    const container = document.getElementById('asistenciaContainer');
    
    if (!cursoSelect.value) {
        Utils.showWarning('Seleccione un curso');
        return;
    }
    
    if (!fechaInput.value) {
        Utils.showWarning('Seleccione una fecha');
        return;
    }
    
    try {
        Utils.showLoader();
        
        // TODO: Obtener alumnos y asistencia del curso desde API
        const alumnos = [
            { id: 1, nombre: 'Juan Pérez', asistencia: 'presente' },
            { id: 2, nombre: 'María García', asistencia: 'ausente' },
            { id: 3, nombre: 'Carlos López', asistencia: 'presente' },
            { id: 4, nombre: 'Ana Martínez', asistencia: 'tardanza' },
            { id: 5, nombre: 'Luis Rodríguez', asistencia: 'justificado' }
        ];
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <i class="fas fa-calendar"></i> Asistencia del ${Utils.formatDate(fechaInput.value)}
                    </h3>
                </div>
                <div class="card-body">
                    <div class="asistencia-table-container">
                        <table class="asistencia-table">
                            <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Alumno</th>
                                    <th>Estado</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alumnos.map((alumno, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${alumno.nombre}</td>
                                        <td>
                                            <span class="asistencia-badge ${alumno.asistencia}">
                                                ${alumno.asistencia.charAt(0).toUpperCase() + alumno.asistencia.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            ${alumno.asistencia === 'ausente' ? 
                                                '<button class="btn btn-sm btn-primary" onclick="justificarAusencia(' + alumno.id + ')"><i class="fas fa-file-medical"></i> Justificar</button>' : 
                                                '-'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-lg">
                        <div class="asistencia-resumen">
                            <div class="asistencia-stat">
                                <div class="asistencia-stat-value">${alumnos.filter(a => a.asistencia === 'presente').length}</div>
                                <div class="asistencia-stat-label">Presentes</div>
                            </div>
                            <div class="asistencia-stat">
                                <div class="asistencia-stat-value">${alumnos.filter(a => a.asistencia === 'ausente').length}</div>
                                <div class="asistencia-stat-label">Ausentes</div>
                            </div>
                            <div class="asistencia-stat">
                                <div class="asistencia-stat-value">${alumnos.filter(a => a.asistencia === 'tardanza').length}</div>
                                <div class="asistencia-stat-label">Tardanzas</div>
                            </div>
                            <div class="asistencia-stat">
                                <div class="asistencia-stat-value">${alumnos.filter(a => a.asistencia === 'justificado').length}</div>
                                <div class="asistencia-stat-label">Justificados</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al cargar asistencia:', error);
        Utils.showError('Error al cargar la asistencia');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga disciplina
 */
async function loadDisciplina() {
    const container = document.getElementById('disciplinaContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        if (incidentesData.length > 0) {
            container.innerHTML = `
                <div class="incidentes-grid">
                    ${incidentesData.map(incidente => `
                        <div class="incidente-card ${incidente.tipo}">
                            <div class="incidente-header">
                                <div>
                                    <h3 class="incidente-alumno">${incidente.alumno}</h3>
                                    <p class="incidente-fecha">${Utils.formatDate(incidente.fecha)}</p>
                                </div>
                                <span class="incidente-tipo ${incidente.tipo}">
                                    ${incidente.tipo.charAt(0).toUpperCase() + incidente.tipo.slice(1)}
                                </span>
                            </div>
                            
                            <p class="incidente-descripcion">${incidente.descripcion}</p>
                            
                            <div class="incidente-sancion">
                                <strong>Sanción:</strong> ${incidente.sancion}
                            </div>
                            
                            <div class="incidente-actions">
                                <button class="btn btn-sm ${incidente.resuelto ? 'btn-success' : 'btn-warning'}" 
                                        onclick="toggleIncidenteResuelto(${incidente.id})">
                                    <i class="fas fa-${incidente.resuelto ? 'check' : 'clock'}"></i> 
                                    ${incidente.resuelto ? 'Resuelto' : 'Pendiente'}
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="editarIncidente(${incidente.id})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay incidentes registrados.</p>';
        }
    } catch (error) {
        console.error('Error al cargar disciplina:', error);
        Utils.showError('Error al cargar los incidentes');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga alumnos en el select del formulario de incidente
 */
async function cargarAlumnosEnSelect() {
    const select = document.getElementById('alumnoIncidente');
    if (!select) return;
    
    // TODO: Obtener alumnos desde API
    const alumnos = [
        { id: 1, nombre: 'Juan Pérez' },
        { id: 2, nombre: 'María García' },
        { id: 3, nombre: 'Carlos López' }
    ];
    
    select.innerHTML = '<option value="">Seleccione alumno</option>' + 
        alumnos.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
}

/**
 * Maneja el envío del formulario de incidente
 */
async function handleIncidenteSubmit(e) {
    e.preventDefault();
    
    const alumnoId = document.getElementById('alumnoIncidente').value;
    const tipo = document.getElementById('tipoIncidente').value;
    const descripcion = document.getElementById('descripcionIncidente').value;
    const sancion = document.getElementById('sancion').value;
    
    try {
        Utils.showLoader();
        
        // TODO: Enviar a API
        // await API.post('/api/v1/preceptores/incidentes', { alumnoId, tipo, descripcion, sancion }, true);
        
        Utils.showSuccess('Incidente registrado correctamente');
        document.getElementById('incidenteModal').classList.remove('active');
        document.getElementById('incidenteForm').reset();
        
        await loadDisciplina();
        await loadEstadisticas();
        
    } catch (error) {
        console.error('Error al registrar incidente:', error);
        Utils.showError('Error al registrar el incidente');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga comunicados
 */
async function loadComunicados() {
    const container = document.getElementById('comunicadosContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Obtener desde API
        // comunicadosData = await API.get('/api/v1/preceptores/comunicados', true);
        
        comunicadosData = [
            {
                id: 1,
                titulo: 'Reunión de padres',
                mensaje: 'Se convoca a reunión de padres el próximo viernes a las 18:00hs.',
                destinatario: 'Todos',
                fecha: '2025-02-01'
            }
        ];
        
        if (comunicadosData.length > 0) {
            container.innerHTML = `
                <div class="comunicados-list">
                    ${comunicadosData.map(com => `
                        <div class="comunicado-item">
                            <div class="comunicado-header">
                                <h4 class="comunicado-titulo">${com.titulo}</h4>
                                <span class="comunicado-fecha">${Utils.formatDate(com.fecha)}</span>
                            </div>
                            <span class="comunicado-destinatario">${com.destinatario}</span>
                            <p class="comunicado-mensaje">${com.mensaje}</p>
                            <div class="comunicado-actions">
                                <button class="btn btn-sm btn-primary" onclick="editarComunicado(${com.id})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="btn btn-sm btn-error" onclick="eliminarComunicado(${com.id})">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay comunicados publicados.</p>';
        }
    } catch (error) {
        console.error('Error al cargar comunicados:', error);
        Utils.showError('Error al cargar los comunicados');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Maneja el envío del formulario de comunicado
 */
async function handleComunicadoSubmit(e) {
    e.preventDefault();
    
    const destinatario = document.getElementById('destinatarioComunicado').value;
    const titulo = document.getElementById('tituloComunicado').value;
    const mensaje = document.getElementById('mensajeComunicado').value;
    
    try {
        Utils.showLoader();
        
        // TODO: Enviar a API
        // await API.post('/api/v1/preceptores/comunicados', { destinatario, titulo, mensaje }, true);
        
        Utils.showSuccess('Comunicado publicado correctamente');
        document.getElementById('comunicadoModal').classList.remove('active');
        document.getElementById('comunicadoForm').reset();
        
        await loadComunicados();
        
    } catch (error) {
        console.error('Error al publicar comunicado:', error);
        Utils.showError('Error al publicar el comunicado');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga usuarios
 */
async function loadUsuarios() {
    const container = document.getElementById('usuariosContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Obtener desde API
        // usuariosData = await API.get('/api/v1/admin/usuarios', true);
        
        usuariosData = [
            { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678', role: 'alumno', email: 'juan@test.com' },
            { id: 2, nombre: 'María', apellido: 'García', dni: '87654321', role: 'docente', email: 'maria@test.com' }
        ];
        
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
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${usuariosData.map(usuario => `
                                    <tr>
                                        <td>${usuario.nombre} ${usuario.apellido}</td>
                                        <td>${usuario.dni}</td>
                                        <td>${usuario.email}</td>
                                        <td><span class="role-badge ${usuario.role}">${usuario.role}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="editarUsuario(${usuario.id})">
                                                <i class="fas fa-edit"></i> Editar
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        Utils.showError('Error al cargar los usuarios');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga noticias
 */
async function loadNoticias() {
    const container = document.getElementById('noticiasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Obtener desde API
        noticiasData = [];
        
        if (noticiasData.length > 0) {
            container.innerHTML = `
                <div class="noticias-grid">
                    ${noticiasData.map(noticia => `
                        <div class="noticia-card">
                            <img src="${noticia.imagen}" alt="${noticia.titulo}" class="noticia-image">
                            <div class="noticia-content">
                                <div class="noticia-fecha">${Utils.formatDate(noticia.fecha)}</div>
                                <h3 class="noticia-titulo">${noticia.titulo}</h3>
                                <p class="noticia-resumen">${noticia.resumen}</p>
                                <div class="noticia-actions">
                                    <button class="btn btn-sm btn-primary" onclick="editarNoticia(${noticia.id})">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-sm btn-error" onclick="eliminarNoticia(${noticia.id})">
                                        <i class="fas fa-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay noticias publicadas. Use el botón "Nueva Noticia" para crear una.</p>';
        }
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        Utils.showError('Error al cargar las noticias');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga sección de promoción
 */
async function loadPromocionSection() {
    // Se carga cuando el usuario hace clic en "Ver Alumnos"
}

/**
 * Carga alumnos para promoción
 */
async function cargarAlumnosPromocion() {
    const cursoSelect = document.getElementById('cursoPromocion');
    const container = document.getElementById('promocionContainer');
    
    if (!cursoSelect.value) {
        Utils.showWarning('Seleccione un curso');
        return;
    }
    
    try {
        Utils.showLoader();
        
        // TODO: Obtener alumnos desde API
        const alumnos = [
            { id: 1, nombre: 'Juan Pérez', promedio: 8.5, estado: 'aprobado' },
            { id: 2, nombre: 'María García', promedio: 9.2, estado: 'aprobado' },
            { id: 3, nombre: 'Carlos López', promedio: 5.8, estado: 'desaprobado' }
        ];
        
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-users"></i> Alumnos del curso</h3>
                </div>
                <div class="card-body">
                    <div class="promocion-table-container">
                        <table class="promocion-table">
                            <thead>
                                <tr>
                                    <th>Alumno</th>
                                    <th>Promedio</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alumnos.map(alumno => `
                                    <tr>
                                        <td>${alumno.nombre}</td>
                                        <td>${alumno.promedio}</td>
                                        <td>
                                            <span class="estado-academico ${alumno.estado}">
                                                ${alumno.estado === 'aprobado' ? 'Aprobado' : 'Desaprobado'}
                                            </span>
                                        </td>
                                        <td>
                                            ${alumno.estado === 'aprobado' ? 
                                                `<button class="btn btn-sm btn-success" onclick="promoverAlumno(${alumno.id})">
                                                    <i class="fas fa-graduation-cap"></i> Promover
                                                </button>` : 
                                                `<button class="btn btn-sm btn-warning" onclick="verDetalleAlumno(${alumno.id})">
                                                    <i class="fas fa-info-circle"></i> Ver Detalle
                                                </button>`}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-lg text-center">
                        <button class="btn btn-success btn-lg" onclick="promoverTodosCurso()">
                            <i class="fas fa-users"></i> Promover Todos los Aprobados
                        </button>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        Utils.showError('Error al cargar los alumnos');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Maneja el cambio de contraseña
 */
async function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        Utils.showError('Las contraseñas no coinciden');
        return;
    }
    
    if (newPassword.length < 8) {
        Utils.showError('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    try {
        Utils.showLoader();
        
        await API.post('/api/v1/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        }, true);
        
        Utils.showSuccess('Contraseña cambiada correctamente');
        document.getElementById('changePasswordForm').reset();
        
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        Utils.showError(error.message || 'Error al cambiar la contraseña');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Funciones auxiliares
 */
function verAlumnosCurso(cursoId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function verAsistenciaCurso(cursoId) {
    document.querySelector('[data-section="asistencia"]').click();
    setTimeout(() => {
        document.getElementById('cursoSelectAsistencia').value = cursoId;
    }, 100);
}

function justificarAusencia(alumnoId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function toggleIncidenteResuelto(incidenteId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function editarIncidente(incidenteId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function editarComunicado(comunicadoId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function eliminarComunicado(comunicadoId) {
    if (confirm('¿Está seguro que desea eliminar este comunicado?')) {
        Utils.showWarning('Funcionalidad en desarrollo');
    }
}

function editarUsuario(usuarioId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function editarNoticia(noticiaId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function eliminarNoticia(noticiaId) {
    if (confirm('¿Está seguro que desea eliminar esta noticia?')) {
        Utils.showWarning('Funcionalidad en desarrollo');
    }
}

function promoverAlumno(alumnoId) {
    if (confirm('¿Está seguro que desea promover a este alumno?')) {
        Utils.showWarning('Funcionalidad en desarrollo');
    }
}

function verDetalleAlumno(alumnoId) {
    Utils.showWarning('Funcionalidad en desarrollo');
}

function promoverTodosCurso() {
    if (confirm('¿Está seguro que desea promover a todos los alumnos aprobados?')) {
        Utils.showWarning('Funcionalidad en desarrollo');
    }
}