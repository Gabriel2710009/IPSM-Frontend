/**
 * JavaScript para Dashboard de Docente
 */

let cursosData = [];
let cursoSeleccionado = null;
let alumnoSeleccionado = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!Auth.isAuthenticated()) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }
    
    // Verificar que sea docente
    const user = Auth.getUser();
    if (!user || user.role !== 'docente') {
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
    
    // Establecer fecha actual en selector de asistencia
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
            el.textContent = user.nombre || 'Docente';
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
        case 'notas':
            await loadNotasSection();
            break;
        case 'asistencia':
            await loadAsistenciaSection();
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
 * Inicializa los modales
 */
function initModals() {
    // Modal de notas
    const notasModal = document.getElementById('notasModal');
    const closeNotasModal = document.getElementById('closeNotasModal');
    
    if (closeNotasModal) {
        closeNotasModal.addEventListener('click', () => {
            notasModal.classList.remove('active');
        });
    }
    
    if (notasModal) {
        notasModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // Modal de mensajes
    const mensajeModal = document.getElementById('mensajeModal');
    const closeMensajeModal = document.getElementById('closeMensajeModal');
    const nuevoMensajeBtn = document.getElementById('nuevoMensajeBtn');
    
    if (closeMensajeModal) {
        closeMensajeModal.addEventListener('click', () => {
            mensajeModal.classList.remove('active');
        });
    }
    
    if (mensajeModal) {
        mensajeModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    if (nuevoMensajeBtn) {
        nuevoMensajeBtn.addEventListener('click', () => {
            mensajeModal.classList.add('active');
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
    
    // Formulario de notas
    const notasForm = document.getElementById('notasForm');
    if (notasForm) {
        notasForm.addEventListener('submit', handleNotasSubmit);
    }
    
    // Formulario de mensajes
    const mensajeForm = document.getElementById('mensajeForm');
    if (mensajeForm) {
        mensajeForm.addEventListener('submit', handleMensajeSubmit);
    }
    
    // Botón cargar asistencia
    const cargarAsistenciaBtn = document.getElementById('cargarAsistenciaBtn');
    if (cargarAsistenciaBtn) {
        cargarAsistenciaBtn.addEventListener('click', cargarAsistencia);
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
            loadEstadisticas()
        ]);
        
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        Utils.showError('Error al cargar los datos del dashboard');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga los cursos del docente
 */
async function loadCursos() {
    try {
        // TODO: Reemplazar con endpoint real cuando esté disponible
        // cursosData = await API.get('/api/v1/docentes/cursos', true);
        
        // Datos de ejemplo mientras no esté el endpoint
        cursosData = [
            {
                id: 1,
                nivel: 'Secundario',
                anio: 5,
                division: 'A',
                turno: 'Mañana',
                materia: 'Matemática',
                cantidad_alumnos: 28,
                horarios: 'Lun, Mié, Vie - 8:00-9:40'
            },
            {
                id: 2,
                nivel: 'Secundario',
                anio: 5,
                division: 'B',
                turno: 'Tarde',
                materia: 'Matemática',
                cantidad_alumnos: 25,
                horarios: 'Mar, Jue - 14:00-15:40'
            }
        ];
        
        // Actualizar resumen en inicio
        const resumenContainer = document.getElementById('resumenCursosContainer');
        if (resumenContainer && cursosData.length > 0) {
            resumenContainer.innerHTML = `
                <div class="cursos-resumen-list">
                    ${cursosData.map(curso => `
                        <div class="curso-resumen-item">
                            <h4>${curso.nivel} - ${curso.anio}° ${curso.division}</h4>
                            <p><i class="fas fa-book"></i> ${curso.materia} | <i class="fas fa-users"></i> ${curso.cantidad_alumnos} alumnos</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Poblar selects
        const cursoSelectNotas = document.getElementById('cursoSelectNotas');
        const cursoSelectAsistencia = document.getElementById('cursoSelectAsistencia');
        
        const options = cursosData.map(curso => 
            `<option value="${curso.id}">${curso.nivel} ${curso.anio}° ${curso.division} - ${curso.materia}</option>`
        ).join('');
        
        if (cursoSelectNotas) {
            cursoSelectNotas.innerHTML = '<option value="">Seleccione un curso</option>' + options;
            cursoSelectNotas.addEventListener('change', loadMateriasPorCurso);
        }
        
        if (cursoSelectAsistencia) {
            cursoSelectAsistencia.innerHTML = '<option value="">Seleccione un curso</option>' + options;
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
        // Calcular estadísticas desde los cursos
        const totalAlumnos = cursosData.reduce((acc, c) => acc + c.cantidad_alumnos, 0);
        
        document.getElementById('statCursos').textContent = cursosData.length;
        document.getElementById('statAlumnos').textContent = totalAlumnos;
        document.getElementById('statNotasPendientes').textContent = '12'; // TODO: Obtener de API
        document.getElementById('statMensajes').textContent = '0'; // TODO: Obtener de API
        
        // Cargar tareas pendientes
        const tareasPendientesContainer = document.getElementById('tareasPendientesContainer');
        if (tareasPendientesContainer) {
            tareasPendientesContainer.innerHTML = `
                <div class="tareas-list">
                    <div class="tarea-item">
                        <i class="fas fa-exclamation-circle tarea-icon"></i>
                        <span class="tarea-texto">Cargar notas de 5° A - Matemática (2° Trimestre)</span>
                    </div>
                    <div class="tarea-item">
                        <i class="fas fa-exclamation-circle tarea-icon"></i>
                        <span class="tarea-texto">Registrar asistencia de hoy - 5° B</span>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Carga el perfil del docente
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
                            <div class="profile-value">Docente</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Materias</div>
                            <div class="profile-value">Matemática</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Cursos asignados</div>
                            <div class="profile-value">${cursosData.length}</div>
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
                            <p class="curso-nivel">${curso.materia}</p>
                        </div>
                        <span class="curso-badge badge badge-info">${curso.turno}</span>
                    </div>
                    
                    <div class="curso-info">
                        <div class="curso-info-item">
                            <i class="fas fa-users"></i>
                            <span>${curso.cantidad_alumnos} alumnos</span>
                        </div>
                        <div class="curso-info-item">
                            <i class="fas fa-clock"></i>
                            <span>${curso.horarios}</span>
                        </div>
                    </div>
                    
                    <div class="curso-actions">
                        <button class="btn btn-primary btn-sm" onclick="verAlumnos(${curso.id})">
                            <i class="fas fa-users"></i> Ver Alumnos
                        </button>
                        <button class="btn btn-accent btn-sm" onclick="cargarNotasCurso(${curso.id})">
                            <i class="fas fa-edit"></i> Cargar Notas
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Carga sección de notas
 */
async function loadNotasSection() {
    const cursoSelect = document.getElementById('cursoSelectNotas');
    if (cursoSelect && cursoSelect.value) {
        await cargarNotasCurso(cursoSelect.value);
    }
}

/**
 * Carga materias por curso
 */
function loadMateriasPorCurso() {
    const cursoSelect = document.getElementById('cursoSelectNotas');
    const materiaSelect = document.getElementById('materiaSelect');
    
    if (!cursoSelect || !materiaSelect) return;
    
    const cursoId = cursoSelect.value;
    const curso = cursosData.find(c => c.id == cursoId);
    
    if (curso) {
        materiaSelect.innerHTML = `<option value="${curso.materia}">${curso.materia}</option>`;
    } else {
        materiaSelect.innerHTML = '<option value="">Seleccione materia</option>';
    }
}

/**
 * Carga notas de un curso
 */
async function cargarNotasCurso(cursoId) {
    const container = document.getElementById('notasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Obtener alumnos y notas del curso desde API
        const alumnos = [
            { id: 1, nombre: 'Juan Pérez', nota1: 8, nota2: 7, nota3: null },
            { id: 2, nombre: 'María García', nota1: 9, nota2: 8, nota3: null },
            { id: 3, nombre: 'Carlos López', nota1: 6, nota2: 7, nota3: null }
        ];
        
        const trimestreSelect = document.getElementById('trimestreSelect');
        const trimestre = trimestreSelect ? trimestreSelect.value : 1;
        
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="notas-table-container">
                        <table class="notas-table">
                            <thead>
                                <tr>
                                    <th>Alumno</th>
                                    <th>Nota</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alumnos.map(alumno => {
                                    const nota = alumno[`nota${trimestre}`];
                                    const estado = nota === null ? 'pendiente' : (nota >= 6 ? 'aprobado' : 'desaprobado');
                                    
                                    return `
                                        <tr>
                                            <td>${alumno.nombre}</td>
                                            <td>
                                                ${nota !== null ? nota : '-'}
                                            </td>
                                            <td>
                                                <span class="nota-status ${estado}">
                                                    ${estado === 'pendiente' ? 'Pendiente' : (estado === 'aprobado' ? 'Aprobado' : 'Desaprobado')}
                                                </span>
                                            </td>
                                            <td>
                                                <button class="btn btn-sm btn-primary" onclick="editarNota(${alumno.id}, '${alumno.nombre}', ${nota})">
                                                    <i class="fas fa-edit"></i> ${nota !== null ? 'Editar' : 'Cargar'}
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error al cargar notas:', error);
        Utils.showError('Error al cargar las notas');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Editar nota de un alumno
 */
function editarNota(alumnoId, alumnoNombre, notaActual) {
    alumnoSeleccionado = alumnoId;
    
    document.getElementById('alumnoNota').value = alumnoNombre;
    document.getElementById('notaValor').value = notaActual || '';
    document.getElementById('observaciones').value = '';
    
    document.getElementById('notasModal').classList.add('active');
}

/**
 * Maneja el envío del formulario de notas
 */
async function handleNotasSubmit(e) {
    e.preventDefault();
    
    const nota = parseFloat(document.getElementById('notaValor').value);
    const observaciones = document.getElementById('observaciones').value;
    
    if (nota < 1 || nota > 10) {
        Utils.showError('La nota debe estar entre 1 y 10');
        return;
    }
    
    try {
        Utils.showLoader();
        
        // TODO: Enviar a API
        // await API.post('/api/v1/docentes/notas', { alumno_id: alumnoSeleccionado, nota, observaciones }, true);
        
        Utils.showSuccess('Nota guardada correctamente');
        document.getElementById('notasModal').classList.remove('active');
        
        // Recargar notas
        const cursoSelect = document.getElementById('cursoSelectNotas');
        if (cursoSelect && cursoSelect.value) {
            await cargarNotasCurso(cursoSelect.value);
        }
        
    } catch (error) {
        console.error('Error al guardar nota:', error);
        Utils.showError('Error al guardar la nota');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga sección de asistencia
 */
async function loadAsistenciaSection() {
    // Se carga cuando el usuario hace clic en "Cargar Asistencia"
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
            { id: 2, nombre: 'María García', asistencia: null },
            { id: 3, nombre: 'Carlos López', asistencia: null }
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
                                    <th>Alumno</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alumnos.map(alumno => `
                                    <tr>
                                        <td>${alumno.nombre}</td>
                                        <td id="estado-${alumno.id}">
                                            ${alumno.asistencia ? 
                                                `<span class="badge badge-${alumno.asistencia === 'presente' ? 'success' : 'error'}">${alumno.asistencia}</span>` : 
                                                '<span class="badge badge-warning">Sin registrar</span>'}
                                        </td>
                                        <td>
                                            <div class="asistencia-controls">
                                                <button class="asistencia-btn ${alumno.asistencia === 'presente' ? 'presente' : ''}" 
                                                        onclick="marcarAsistencia(${alumno.id}, 'presente')">
                                                    <i class="fas fa-check"></i> Presente
                                                </button>
                                                <button class="asistencia-btn ${alumno.asistencia === 'ausente' ? 'ausente' : ''}" 
                                                        onclick="marcarAsistencia(${alumno.id}, 'ausente')">
                                                    <i class="fas fa-times"></i> Ausente
                                                </button>
                                                <button class="asistencia-btn ${alumno.asistencia === 'tardanza' ? 'tardanza' : ''}" 
                                                        onclick="marcarAsistencia(${alumno.id}, 'tardanza')">
                                                    <i class="fas fa-clock"></i> Tarde
                                                </button>
                                                <button class="asistencia-btn ${alumno.asistencia === 'justificado' ? 'justificado' : ''}" 
                                                        onclick="marcarAsistencia(${alumno.id}, 'justificado')">
                                                    <i class="fas fa-file-medical"></i> Justificado
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-lg text-center">
                        <button class="btn btn-success btn-lg" onclick="guardarAsistencia()">
                            <i class="fas fa-save"></i> Guardar Asistencia
                        </button>
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
 * Marca asistencia de un alumno
 */
function marcarAsistencia(alumnoId, estado) {
    // Actualizar visualmente
    const estadoCell = document.getElementById(`estado-${alumnoId}`);
    if (estadoCell) {
        let badgeClass = '';
        let estadoTexto = '';
        
        switch(estado) {
            case 'presente':
                badgeClass = 'success';
                estadoTexto = 'Presente';
                break;
            case 'ausente':
                badgeClass = 'error';
                estadoTexto = 'Ausente';
                break;
            case 'tardanza':
                badgeClass = 'warning';
                estadoTexto = 'Tardanza';
                break;
            case 'justificado':
                badgeClass = 'info';
                estadoTexto = 'Justificado';
                break;
        }
        
        estadoCell.innerHTML = `<span class="badge badge-${badgeClass}">${estadoTexto}</span>`;
    }
    
    // Actualizar botones
    const row = estadoCell.closest('tr');
    row.querySelectorAll('.asistencia-btn').forEach(btn => {
        btn.classList.remove('presente', 'ausente', 'tardanza', 'justificado');
    });
    
    row.querySelector(`button[onclick*="'${estado}'"]`).classList.add(estado);
}

/**
 * Guarda la asistencia
 */
async function guardarAsistencia() {
    try {
        Utils.showLoader();
        
        // TODO: Enviar a API
        // await API.post('/api/v1/docentes/asistencia', { ... }, true);
        
        Utils.showSuccess('Asistencia guardada correctamente');
        
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        Utils.showError('Error al guardar la asistencia');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga mensajes
 */
async function loadMensajes() {
    const container = document.getElementById('mensajesContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        // TODO: Obtener mensajes desde API
        const mensajes = [];
        
        if (mensajes.length > 0) {
            container.innerHTML = `
                <div class="mensajes-list">
                    ${mensajes.map(msg => `
                        <div class="mensaje-item ${!msg.leido ? 'no-leido' : ''}">
                            <div class="mensaje-header">
                                <span class="mensaje-remitente">${msg.remitente}</span>
                                <span class="mensaje-fecha">${Utils.formatDate(msg.fecha)}</span>
                            </div>
                            <p class="mensaje-asunto">${msg.asunto}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay mensajes en tu bandeja.</p>';
        }
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
        Utils.showError('Error al cargar los mensajes');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Maneja el envío de mensajes
 */
async function handleMensajeSubmit(e) {
    e.preventDefault();
    
    const destinatario = document.getElementById('destinatarioSelect').value;
    const asunto = document.getElementById('asuntoMensaje').value;
    const contenido = document.getElementById('contenidoMensaje').value;
    
    try {
        Utils.showLoader();
        
        // TODO: Enviar a API
        // await API.post('/api/v1/docentes/mensajes', { destinatario, asunto, contenido }, true);
        
        Utils.showSuccess('Mensaje enviado correctamente');
        document.getElementById('mensajeModal').classList.remove('active');
        document.getElementById('mensajeForm').reset();
        
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        Utils.showError('Error al enviar el mensaje');
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
 * Ver alumnos de un curso
 */
function verAlumnos(cursoId) {
    // Cambiar a sección de cursos con detalle
    Utils.showWarning('Funcionalidad en desarrollo. Próximamente podrá ver el listado completo de alumnos.');
}