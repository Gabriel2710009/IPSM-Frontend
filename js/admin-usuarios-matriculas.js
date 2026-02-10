/**
 * Extensión del Dashboard Admin - Gestión de Usuarios y Matrículas
 * Instituto Privado San Marino
 */

// Variables globales adicionales
let todosLosUsuarios = [];
let usuariosFiltrados = [];
let usuarioSeleccionado = null;
let configuracionesMatriculas = [];
let matriculas = [];
let editingMatriculaConfigId = null;

/**
 * =============================================
 * GESTIÓN DE USUARIOS
 * =============================================
 */

/**
 * Carga todos los usuarios del sistema
 */
async function loadGestionUsuarios() {
    const container = document.getElementById('gestionUsuariosContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        todosLosUsuarios = await API.get('/api/v1/admin/usuarios/todos', true);
        usuariosFiltrados = todosLosUsuarios.slice();
        
        renderUsuariosTable(usuariosFiltrados);
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        Utils.showError('Error al cargar usuarios');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <h3>Error al cargar</h3>
                <p>No se pudieron cargar los usuarios</p>
            </div>
        `;
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Renderiza la tabla de usuarios
 */
function renderUsuariosTable(usuarios) {
    const container = document.getElementById('gestionUsuariosContainer');
    if (!container) return;
    
    if (!usuarios || usuarios.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-users"></i></div>
                <h3>No hay usuarios</h3>
                <p>No se encontraron usuarios con los filtros seleccionados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="usuarios-table-container">
            <table class="usuarios-table">
                <thead>
                    <tr>
                        <th>DNI</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(user => createUsuarioRow(user)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Crea una fila de usuario en la tabla
 */
function createUsuarioRow(user) {
    const estadoBadge = user.activo 
        ? '<span class="badge badge-success">Activo</span>'
        : '<span class="badge badge-error">Inactivo</span>';
    
    const roleBadge = getRoleBadge(user.role);
    const ultimoAcceso = user.ultimo_acceso 
        ? Utils.formatDateTime(user.ultimo_acceso)
        : 'Nunca';
    
    return `
        <tr>
            <td><strong>${user.dni}</strong></td>
            <td>${user.nombre} ${user.apellido}</td>
            <td>${user.email}</td>
            <td>${roleBadge}</td>
            <td>${estadoBadge}</td>
            <td>${ultimoAcceso}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="verPerfilUsuario('${user.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editarUsuario('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="cambiarRolUsuario('${user.id}')">
                        <i class="fas fa-user-tag"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="resetearPasswordUsuario('${user.id}')">
                        <i class="fas fa-key"></i>
                    </button>
                    ${user.activo ? `
                        <button class="btn btn-sm btn-error" onclick="desactivarUsuario('${user.id}', '${user.nombre} ${user.apellido}')">
                            <i class="fas fa-ban"></i>
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-success" onclick="activarUsuario('${user.id}', '${user.nombre} ${user.apellido}')">
                            <i class="fas fa-check"></i>
                        </button>
                    `}
                    <button class="btn btn-sm btn-error" onclick="eliminarUsuario('${user.id}', '${user.nombre} ${user.apellido}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Ver perfil completo de usuario
 */
async function verPerfilUsuario(userId) {
    try {
        Utils.showLoader();
        
        const perfil = await API.get(`/api/v1/admin/usuarios/${userId}/perfil`, true);
        usuarioSeleccionado = perfil;
        
        abrirModalPerfilUsuario(perfil);
        
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        Utils.showError('Error al cargar el perfil del usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Abre modal con perfil completo según rol
 */
function abrirModalPerfilUsuario(perfil) {
    const modal = document.getElementById('perfilUsuarioModal');
    const container = document.getElementById('perfilUsuarioContainer');
    const title = document.getElementById('perfilUsuarioModalTitle');
    
    if (!modal || !container) return;
    
    const role = perfil.usuario.role;
    
    if (title) {
        title.textContent = `Perfil de ${perfil.usuario.nombre} ${perfil.usuario.apellido}`;
    }
    
    let contenido = '';
    
    // Información base
    contenido += `
        <div class="card mb-lg">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-user"></i> Información Personal</h3>
            </div>
            <div class="card-body">
                <div class="perfil-info-grid">
                    <div class="perfil-info-item">
                        <label>DNI:</label>
                        <span>${perfil.usuario.dni}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Email:</label>
                        <span>${perfil.usuario.email}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Teléfono:</label>
                        <span>${perfil.usuario.telefono || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Rol:</label>
                        <span>${getRoleBadge(perfil.usuario.role)}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Estado:</label>
                        <span>${perfil.usuario.activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-error">Inactivo</span>'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Fecha de Registro:</label>
                        <span>${Utils.formatDate(perfil.usuario.fecha_creacion)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Contenido específico por rol
    if (role === 'alumno') {
        contenido += renderPerfilAlumno(perfil);
    } else if (role === 'padre') {
        contenido += renderPerfilPadre(perfil);
    } else if (role === 'docente') {
        contenido += renderPerfilDocente(perfil);
    } else if (role === 'preceptor') {
        contenido += renderPerfilPreceptor(perfil);
    }
    
    container.innerHTML = contenido;
    modal.classList.add('active');
}

/**
 * Renderiza perfil de alumno
 */
function renderPerfilAlumno(perfil) {
    let html = '';
    
    // Info Académica
    html += `
        <div class="card mb-lg">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-graduation-cap"></i> Información Académica</h3>
            </div>
            <div class="card-body">
                <div class="perfil-info-grid">
                    <div class="perfil-info-item">
                        <label>Legajo:</label>
                        <span>${perfil.legajo || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Nivel:</label>
                        <span>${perfil.nivel_nombre || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Curso:</label>
                        <span>${perfil.anio ? `${perfil.anio}° ${perfil.division || ''}` : '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Turno:</label>
                        <span>${perfil.turno || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Orientación:</label>
                        <span>${perfil.orientacion || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Promedio General:</label>
                        <span>${perfil.promedio_general ? perfil.promedio_general.toFixed(2) : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Padres
    if (perfil.padres && perfil.padres.length > 0) {
        html += `
            <div class="card mb-lg">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-users"></i> Padres/Tutores</h3>
                </div>
                <div class="card-body">
                    ${perfil.padres.map(padre => `
                        <div class="padre-info mb-md">
                            <p><strong>${padre.nombre} ${padre.apellido}</strong> - ${padre.parentesco || 'Tutor'}</p>
                            <p class="text-muted">DNI: ${padre.dni} | Email: ${padre.email}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Asistencias
    html += `
        <div class="card mb-lg">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-calendar-check"></i> Asistencias</h3>
            </div>
            <div class="card-body">
                <div class="stats-grid mb-md">
                    <div class="stat-box">
                        <div class="stat-value">${perfil.total_faltas || 0}</div>
                        <div class="stat-label">Total Faltas</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${perfil.faltas_justificadas || 0}</div>
                        <div class="stat-label">Justificadas</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${perfil.faltas_injustificadas || 0}</div>
                        <div class="stat-label">Injustificadas</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${perfil.tardanzas || 0}</div>
                        <div class="stat-label">Tardanzas</div>
                    </div>
                </div>
                
                ${perfil.ultimas_faltas && perfil.ultimas_faltas.length > 0 ? `
                    <h4>Últimas Faltas</h4>
                    <ul class="faltas-list">
                        ${perfil.ultimas_faltas.slice(0, 5).map(falta => `
                            <li>
                                ${Utils.formatDate(falta.fecha)} - 
                                ${falta.ausente ? (falta.ausente_justificado ? 'Ausente (Justificado)' : 'Ausente') : 
                                  falta.tardanza ? 'Tardanza' : 'Presente'}
                                ${falta.observacion ? `<br><small>${falta.observacion}</small>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                ` : '<p class="text-muted">Sin faltas registradas</p>'}
            </div>
        </div>
    `;
    
    // Cuotas
    html += `
        <div class="card mb-lg">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-money-bill-wave"></i> Estado de Cuotas</h3>
            </div>
            <div class="card-body">
                <p><strong>Cuotas Pendientes:</strong> ${perfil.cuotas_pendientes || 0}</p>
                
                ${perfil.cuotas && perfil.cuotas.length > 0 ? `
                    <div class="cuotas-list">
                        ${perfil.cuotas.slice(0, 6).map(cuota => `
                            <div class="cuota-item">
                                <span>${cuota.mes} ${cuota.anio}</span>
                                <span>$${formatMonto(cuota.monto_total)}</span>
                                <span class="badge ${cuota.pagado ? 'badge-success' : 'badge-warning'}">
                                    ${cuota.pagado ? 'Pagado' : 'Pendiente'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-muted">Sin cuotas registradas</p>'}
            </div>
        </div>
    `;
    
    // Matrículas
    if (perfil.matriculas && perfil.matriculas.length > 0) {
        html += `
            <div class="card mb-lg">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-file-invoice-dollar"></i> Matrículas</h3>
                </div>
                <div class="card-body">
                    ${perfil.matriculas.map(matricula => `
                        <div class="matricula-item mb-md">
                            <p><strong>${matricula.ciclo_lectivo}</strong></p>
                            <p>Modalidad: ${getModalidadLabel(matricula.modalidad_pago)}</p>
                            <p>Monto: $${formatMonto(matricula.monto_total)}</p>
                            <p>Estado: ${matricula.pagado ? '<span class="badge badge-success">Pagada</span>' : `<span class="badge badge-warning">Cuotas: ${matricula.cuotas_pagadas}/${matricula.cantidad_cuotas}</span>`}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Renderiza perfil de padre
 */
function renderPerfilPadre(perfil) {
    let html = '';
    
    // Info adicional
    html += `
        <div class="card mb-lg">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-info-circle"></i> Información Adicional</h3>
            </div>
            <div class="card-body">
                <div class="perfil-info-grid">
                    <div class="perfil-info-item">
                        <label>Ocupación:</label>
                        <span>${perfil.ocupacion || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Domicilio:</label>
                        <span>${perfil.domicilio || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Teléfono Alternativo:</label>
                        <span>${perfil.telefono_alternativo || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Email Alternativo:</label>
                        <span>${perfil.email_alternativo || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Parentesco:</label>
                        <span>${perfil.parentesco || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Tutor Legal:</label>
                        <span>${perfil.es_tutor_legal ? 'Sí' : 'No'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Hijos
    if (perfil.hijos && perfil.hijos.length > 0) {
        html += `
            <div class="card mb-lg">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-child"></i> Hijos</h3>
                </div>
                <div class="card-body">
                    ${perfil.hijos.map(hijo => `
                        <div class="hijo-item mb-md">
                            <p><strong>${hijo.nombre} ${hijo.apellido}</strong></p>
                            <p>DNI: ${hijo.dni}</p>
                            <p>Legajo: ${hijo.legajo || '-'}</p>
                            <p>Curso: ${hijo.nivel || ''} ${hijo.anio ? `${hijo.anio}° ${hijo.division || ''}` : '-'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Renderiza perfil de docente
 */
function renderPerfilDocente(perfil) {
    let html = '';
    
    html += `
        <div class="card mb-lg">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-chalkboard-teacher"></i> Información Profesional</h3>
            </div>
            <div class="card-body">
                <div class="perfil-info-grid">
                    <div class="perfil-info-item">
                        <label>Legajo:</label>
                        <span>${perfil.legajo || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Especialidad:</label>
                        <span>${perfil.especialidad || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Título:</label>
                        <span>${perfil.titulo || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Fecha de Ingreso:</label>
                        <span>${perfil.fecha_ingreso ? Utils.formatDate(perfil.fecha_ingreso) : '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (perfil.materias_a_cargo && perfil.materias_a_cargo.length > 0) {
        html += `
            <div class="card mb-lg">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-book"></i> Materias a Cargo</h3>
                </div>
                <div class="card-body">
                    <ul class="materias-list">
                        ${perfil.materias_a_cargo.map(materia => `
                            <li>
                                <strong>${materia.materia_nombre}</strong> - 
                                ${materia.curso} (${materia.nivel}) - 
                                ${materia.ciclo_lectivo}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Renderiza perfil de preceptor
 */
function renderPerfilPreceptor(perfil) {
    let html = '';
    
    html += `
        <div class="card mb-lg">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-clipboard-list"></i> Información Profesional</h3>
            </div>
            <div class="card-body">
                <div class="perfil-info-grid">
                    <div class="perfil-info-item">
                        <label>Legajo:</label>
                        <span>${perfil.legajo || '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Fecha de Ingreso:</label>
                        <span>${perfil.fecha_ingreso ? Utils.formatDate(perfil.fecha_ingreso) : '-'}</span>
                    </div>
                    <div class="perfil-info-item">
                        <label>Autorizado para Editar Notas:</label>
                        <span>${perfil.puede_editar_notas ? 'Sí' : 'No'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (perfil.cursos_a_cargo && perfil.cursos_a_cargo.length > 0) {
        html += `
            <div class="card mb-lg">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-school"></i> Cursos a Cargo</h3>
                </div>
                <div class="card-body">
                    <ul class="cursos-list">
                        ${perfil.cursos_a_cargo.map(curso => `
                            <li>
                                <strong>${curso.nombre}</strong> (${curso.nivel}) - 
                                ${curso.ciclo_lectivo}
                                ${curso.es_tutor ? ' <span class="badge badge-info">Tutor</span>' : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Aplica filtros a usuarios
 */
function aplicarFiltrosUsuarios() {
    const filterRole = document.getElementById('filterUsuariosRole');
    const filterStatus = document.getElementById('filterUsuariosStatus');
    const filterSearch = document.getElementById('filterUsuariosSearch');
    
    let filtrados = todosLosUsuarios.slice();
    
    // Filtro por rol
    if (filterRole && filterRole.value) {
        filtrados = filtrados.filter(u => u.role === filterRole.value);
    }
    
    // Filtro por estado
    if (filterStatus && filterStatus.value) {
        const activo = filterStatus.value === 'activo';
        filtrados = filtrados.filter(u => u.activo === activo);
    }
    
    // Filtro por búsqueda
    if (filterSearch && filterSearch.value) {
        const search = normalizeText(filterSearch.value);
        filtrados = filtrados.filter(u => {
            const dni = normalizeText(u.dni);
            const nombre = normalizeText(u.nombre);
            const apellido = normalizeText(u.apellido);
            const email = normalizeText(u.email);
            
            return dni.includes(search) || 
                   nombre.includes(search) || 
                   apellido.includes(search) || 
                   email.includes(search);
        });
    }
    
    usuariosFiltrados = filtrados;
    renderUsuariosTable(usuariosFiltrados);
}

/**
 * Desactivar usuario
 */
async function desactivarUsuario(userId, userName) {
    if (!confirm(`¿Desactivar a ${userName}?`)) return;
    
    try {
        Utils.showLoader();
        await API.delete(`/api/v1/admin/usuarios/${userId}`, true);
        Utils.showSuccess('Usuario desactivado correctamente');
        await loadGestionUsuarios();
    } catch (error) {
        console.error('Error al desactivar usuario:', error);
        Utils.showError('Error al desactivar el usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Activar usuario
 */
async function activarUsuario(userId, userName) {
    try {
        Utils.showLoader();
        const role = todosLosUsuarios.find(u => u.id === userId)?.role || 'alumno';
        await API.put(`/api/v1/admin/usuarios/${userId}/${role}`, { usuario: { activo: true } }, true);
        Utils.showSuccess('Usuario activado correctamente');
        await loadGestionUsuarios();
    } catch (error) {
        console.error('Error al activar usuario:', error);
        Utils.showError('Error al activar el usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Editar usuario (según rol)
 */
async function editarUsuario(userId) {
    let perfil = null;
    try {
        Utils.showLoader();
        perfil = await API.get(`/api/v1/admin/usuarios/${userId}/perfil`, true);
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        Utils.showError('No se pudo cargar el perfil');
        return;
    } finally {
        Utils.hideLoader();
    }

    const user = (perfil && perfil.usuario) ? perfil.usuario : (todosLosUsuarios || []).find(u => u.id === userId);
    if (!user) {
        Utils.showError('Usuario no encontrado');
        return;
    }

    abrirModalEditarUsuario(user, perfil);
}

/**
 * Cambiar rol de usuario
 */
async function cambiarRolUsuario(userId) {
    const user = (todosLosUsuarios || []).find(u => u.id === userId);
    if (!user) {
        Utils.showError('Usuario no encontrado');
        return;
    }

    const nuevoRol = prompt('Nuevo rol (admin, preceptor, docente, padre, alumno)', user.role || '');
    if (!nuevoRol || nuevoRol.trim() === user.role) return;

    try {
        Utils.showLoader();
        await API.put(`/api/v1/admin/usuarios/${userId}/role`, { role: nuevoRol.trim() }, true);
        Utils.showSuccess('Rol actualizado');
        await loadGestionUsuarios();
    } catch (error) {
        console.error('Error al cambiar rol:', error);
        Utils.showError(error.message || 'Error al cambiar rol');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Resetear contraseña de usuario
 */
async function resetearPasswordUsuario(userId) {
    if (!confirm('¿Resetear contraseña? Se generará una temporal si no ingresas una.')) return;

    const nueva = prompt('Nueva contraseña (dejar vacío para generar automáticamente)', '');
    const payload = {};
    if (nueva && nueva.trim()) payload.password = nueva.trim();

    try {
        Utils.showLoader();
        const resp = await API.post(`/api/v1/admin/usuarios/${userId}/reset-password`, payload, true);
        const temp = resp && resp.password_temporal ? resp.password_temporal : null;
        if (temp) {
            alert(`Contraseña temporal: ${temp}`);
        }
        Utils.showSuccess('Contraseña reseteada');
    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        Utils.showError(error.message || 'Error al resetear contraseña');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Eliminar usuario (soft delete)
 */
async function eliminarUsuario(userId, userName) {
    if (!confirm(`¿Eliminar a ${userName}? Esta acción desactiva y marca como eliminado.`)) return;

    try {
        Utils.showLoader();
        await API.delete(`/api/v1/admin/usuarios/${userId}/eliminar`, true);
        Utils.showSuccess('Usuario eliminado');
        await loadGestionUsuarios();
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        Utils.showError(error.message || 'Error al eliminar usuario');
    } finally {
        Utils.hideLoader();
    }
}

function abrirModalEditarUsuario(user, perfil) {
    const modal = document.getElementById('editarUsuarioModal');
    const form = document.getElementById('editarUsuarioForm');

    if (!modal || !form) return;

    document.getElementById('editarUsuarioId').value = user.id;
    document.getElementById('editDni').value = user.dni || '';
    document.getElementById('editNombre').value = user.nombre || '';
    document.getElementById('editApellido').value = user.apellido || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editTelefono').value = user.telefono || '';
    document.getElementById('editRole').value = user.role || '';

    const alumnoFields = document.getElementById('editAlumnoFields');
    const padreFields = document.getElementById('editPadreFields');
    const docenteFields = document.getElementById('editDocenteFields');
    const preceptorFields = document.getElementById('editPreceptorFields');

    alumnoFields.style.display = 'none';
    padreFields.style.display = 'none';
    docenteFields.style.display = 'none';
    preceptorFields.style.display = 'none';

    if (user.role === 'alumno') {
        alumnoFields.style.display = 'block';
        document.getElementById('editAlumnoLegajo').value = perfil.legajo || '';
        document.getElementById('editAlumnoNivelId').value = perfil.nivel_id || '';
        document.getElementById('editAlumnoAnio').value = perfil.anio || '';
        document.getElementById('editAlumnoDivision').value = perfil.division || '';
        document.getElementById('editAlumnoTurno').value = perfil.turno || '';
        document.getElementById('editAlumnoOrientacion').value = perfil.orientacion || '';
        document.getElementById('editAlumnoPadreId').value = perfil.padre_id || '';
    } else if (user.role === 'padre') {
        padreFields.style.display = 'block';
        document.getElementById('editPadreOcupacion').value = perfil.ocupacion || '';
        document.getElementById('editPadreDomicilio').value = perfil.domicilio || '';
        document.getElementById('editPadreTelefonoAlt').value = perfil.telefono_alternativo || '';
        document.getElementById('editPadreEmailAlt').value = perfil.email_alternativo || '';
        document.getElementById('editPadreParentesco').value = perfil.parentesco || '';
        document.getElementById('editPadreTutorLegal').checked = !!perfil.es_tutor_legal;
    } else if (user.role === 'docente') {
        docenteFields.style.display = 'block';
        document.getElementById('editDocenteLegajo').value = perfil.legajo || '';
        document.getElementById('editDocenteEspecialidad').value = perfil.especialidad || '';
        document.getElementById('editDocenteTitulo').value = perfil.titulo || '';
    } else if (user.role === 'preceptor') {
        preceptorFields.style.display = 'block';
        document.getElementById('editPreceptorLegajo').value = perfil.legajo || '';
    }

    modal.classList.add('active');
}

async function handleEditarUsuarioSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('editarUsuarioId').value;
    if (!userId) return;

    const payload = {
        dni: document.getElementById('editDni').value.trim(),
        nombre: document.getElementById('editNombre').value.trim(),
        apellido: document.getElementById('editApellido').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        telefono: document.getElementById('editTelefono').value.trim()
    };

    const role = (document.getElementById('editRole').value || '').toLowerCase();

    if (role === 'alumno') {
        payload.legajo = document.getElementById('editAlumnoLegajo').value.trim();
        payload.nivel_id = parseInt(document.getElementById('editAlumnoNivelId').value || '0', 10) || undefined;
        payload.anio = parseInt(document.getElementById('editAlumnoAnio').value || '0', 10) || undefined;
        payload.division = document.getElementById('editAlumnoDivision').value.trim();
        payload.turno = document.getElementById('editAlumnoTurno').value.trim();
        payload.orientacion = document.getElementById('editAlumnoOrientacion').value.trim();
        payload.padre_id = parseInt(document.getElementById('editAlumnoPadreId').value || '0', 10) || undefined;
    } else if (role === 'padre') {
        payload.ocupacion = document.getElementById('editPadreOcupacion').value.trim();
        payload.domicilio = document.getElementById('editPadreDomicilio').value.trim();
        payload.telefono_alternativo = document.getElementById('editPadreTelefonoAlt').value.trim();
        payload.email_alternativo = document.getElementById('editPadreEmailAlt').value.trim();
        payload.parentesco = document.getElementById('editPadreParentesco').value.trim();
        payload.es_tutor_legal = document.getElementById('editPadreTutorLegal').checked;
    } else if (role === 'docente') {
        payload.docente_legajo = document.getElementById('editDocenteLegajo').value.trim();
        payload.docente_especialidad = document.getElementById('editDocenteEspecialidad').value.trim();
        payload.docente_titulo = document.getElementById('editDocenteTitulo').value.trim();
    } else if (role === 'preceptor') {
        payload.preceptor_legajo = document.getElementById('editPreceptorLegajo').value.trim();
    }

    Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) {
            delete payload[key];
        }
    });

    try {
        Utils.showLoader();
        await API.put(`/api/v1/admin/usuarios/${userId}`, payload, true);
        Utils.showSuccess('Usuario actualizado correctamente');
        cerrarModal('editarUsuarioModal');
        await loadGestionUsuarios();
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        Utils.showError(error.message || 'Error al actualizar usuario');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * =============================================
 * CONFIGURACIÓN DE MATRÍCULAS
 * =============================================
 */

async function loadConfiguracionMatriculas() {
    try {
        Utils.showLoader();
        
        configuracionesMatriculas = await API.get('/api/v1/admin/matriculas/configuracion', true);
        
        // Separar por nivel
        const inicial = configuracionesMatriculas.filter(c => {
            const nivel = (c.nivel_nombre || '').toLowerCase();
            return nivel.includes('inicial');
        });
        const primario = configuracionesMatriculas.filter(c => {
            const nivel = (c.nivel_nombre || '').toLowerCase();
            return nivel.includes('primari');
        });
        const secundario = configuracionesMatriculas.filter(c => {
            const nivel = (c.nivel_nombre || '').toLowerCase();
            return nivel.includes('secundari');
        });
        
        renderConfigMatriculas('configMatriculaInicialContainer', inicial);
        renderConfigMatriculas('configMatriculaPrimarioContainer', primario);
        renderConfigMatriculas('configMatriculaSecundarioContainer', secundario);
        
    } catch (error) {
        console.error('Error al cargar configuraciones de matrícula:', error);
        Utils.showError('Error al cargar configuraciones');
    } finally {
        Utils.hideLoader();
    }
}

function renderConfigMatriculas(containerId, configs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (configs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-cog"></i></div>
                <p>No hay configuraciones para este nivel</p>
                <button class="btn btn-primary mt-md" onclick="abrirModalNuevaConfigMatricula()">
                    <i class="fas fa-plus"></i> Crear Configuración
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="cuotas-config-grid">
            ${configs.map(config => createConfigMatriculaCard(config)).join('')}
        </div>
    `;
}

function createConfigMatriculaCard(config) {
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
                    <span class="config-detail-label">Pago Único (Verano)</span>
                    <span class="config-detail-value">$${formatMonto(config.monto_pago_unico)}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">3 Cuotas (Diciembre)</span>
                    <span class="config-detail-value">$${formatMonto(config.monto_3_cuotas)}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">2 Cuotas (Enero)</span>
                    <span class="config-detail-value">$${formatMonto(config.monto_2_cuotas)}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">1 Cuota (Febrero)</span>
                    <span class="config-detail-value">$${formatMonto(config.monto_1_cuota)}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Vencimiento</span>
                    <span class="config-detail-value">${config.dia_vencimiento}/${config.mes_vencimiento}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Recargo</span>
                    <span class="config-detail-value">${config.tiene_recargo ? `${config.porcentaje_recargo}%` : 'No'}</span>
                </div>
                <div class="config-detail-item">
                    <span class="config-detail-label">Ciclo</span>
                    <span class="config-detail-value">${config.ciclo_lectivo_nombre || 'N/A'}</span>
                </div>
            </div>
            
            <div class="config-actions">
                <button class="btn btn-sm btn-outline" onclick="editarConfigMatricula(${config.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-error" onclick="eliminarConfigMatricula(${config.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

function abrirModalNuevaConfigMatricula() {
    const modal = document.getElementById('nuevaConfigMatriculaModal');
    const form = document.getElementById('nuevaConfigMatriculaForm');
    const title = document.getElementById('configMatriculaModalTitle');
    const submitBtn = document.getElementById('configMatriculaSubmitBtn');
    
    editingMatriculaConfigId = null;
    
    if (form) form.reset();
    const cicloInput = document.getElementById('configMatriculaCicloAnio');
    if (cicloInput) cicloInput.value = getCurrentYear();
    
    if (title) title.textContent = 'Nueva Configuración de Matrícula';
    if (submitBtn) submitBtn.textContent = 'Crear Configuración';
    
    if (modal) modal.classList.add('active');
}

async function handleNuevaConfigMatricula(e) {
    e.preventDefault();
    
    const data = {
        ciclo_lectivo_anio: parseInt(document.getElementById('configMatriculaCicloAnio').value),
        nivel_id: parseInt(document.getElementById('configMatriculaNivel').value),
        monto_pago_unico: parseFloat(document.getElementById('configMatriculaPagoUnico').value),
        monto_3_cuotas: parseFloat(document.getElementById('configMatricula3Cuotas').value),
        monto_2_cuotas: parseFloat(document.getElementById('configMatricula2Cuotas').value),
        monto_1_cuota: parseFloat(document.getElementById('configMatricula1Cuota').value),
        mes_vencimiento: parseInt(document.getElementById('configMatriculaMesVenc').value) || 3,
        dia_vencimiento: parseInt(document.getElementById('configMatriculaDiaVenc').value) || 10,
        tiene_recargo: document.getElementById('configMatriculaTieneRecargo').checked,
        porcentaje_recargo: parseFloat(document.getElementById('configMatriculaPorcentajeRecargo').value) || 10
    };
    
    try {
        Utils.showLoader();
        
        if (editingMatriculaConfigId) {
            await API.put(`/api/v1/admin/matriculas/configuracion/${editingMatriculaConfigId}`, data, true);
            Utils.showSuccess('Configuración actualizada correctamente');
        } else {
            await API.post('/api/v1/admin/matriculas/configuracion', data, true);
            Utils.showSuccess('Configuración creada correctamente');
        }
        
        cerrarModal('nuevaConfigMatriculaModal');
        await loadConfiguracionMatriculas();
        
    } catch (error) {
        console.error('Error al guardar configuración de matrícula:', error);
        Utils.showError(error.message || 'Error al guardar la configuración');
    } finally {
        Utils.hideLoader();
    }
}

async function editarConfigMatricula(configId) {
    const config = configuracionesMatriculas.find(c => c.id === configId);
    if (!config) {
        Utils.showError('Configuración no encontrada');
        return;
    }
    
    editingMatriculaConfigId = configId;
    
    const modal = document.getElementById('nuevaConfigMatriculaModal');
    const form = document.getElementById('nuevaConfigMatriculaForm');
    const title = document.getElementById('configMatriculaModalTitle');
    const submitBtn = document.getElementById('configMatriculaSubmitBtn');
    
    if (form) form.reset();
    
    document.getElementById('configMatriculaCicloAnio').value = extractYear(config.ciclo_lectivo_nombre) || getCurrentYear();
    document.getElementById('configMatriculaNivel').value = getNivelId(config.nivel_nombre);
    document.getElementById('configMatriculaPagoUnico').value = config.monto_pago_unico;
    document.getElementById('configMatricula3Cuotas').value = config.monto_3_cuotas;
    document.getElementById('configMatricula2Cuotas').value = config.monto_2_cuotas;
    document.getElementById('configMatricula1Cuota').value = config.monto_1_cuota;
    document.getElementById('configMatriculaMesVenc').value = config.mes_vencimiento || 3;
    document.getElementById('configMatriculaDiaVenc').value = config.dia_vencimiento || 10;
    document.getElementById('configMatriculaTieneRecargo').checked = config.tiene_recargo;
    document.getElementById('configMatriculaPorcentajeRecargo').value = config.porcentaje_recargo || 10;
    
    if (title) title.textContent = 'Editar Configuración de Matrícula';
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
    
    if (modal) modal.classList.add('active');
}

async function eliminarConfigMatricula(configId) {
    if (!confirm('¿Está seguro de eliminar esta configuración de matrícula?')) return;
    
    try {
        Utils.showLoader();
        await API.delete(`/api/v1/admin/matriculas/configuracion/${configId}`, true);
        Utils.showSuccess('Configuración eliminada');
        await loadConfiguracionMatriculas();
    } catch (error) {
        console.error('Error al eliminar configuración:', error);
        Utils.showError('Error al eliminar la configuración');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Utilidades
 */
function getRoleBadge(role) {
    const badges = {
        'admin': '<span class="badge badge-error">Administrador</span>',
        'preceptor': '<span class="badge badge-info">Preceptor</span>',
        'docente': '<span class="badge" style="background: #6366f1; color: white;">Docente</span>',
        'padre': '<span class="badge" style="background: #8b5cf6; color: white;">Padre</span>',
        'alumno': '<span class="badge badge-success">Alumno</span>',
        'pendiente': '<span class="badge badge-warning">Pendiente</span>'
    };
    
    return badges[role] || `<span class="badge">${capitalize(role)}</span>`;
}

function getModalidadLabel(modalidad) {
    const labels = {
        'unico': 'Pago Único',
        '3_cuotas': '3 Cuotas',
        '2_cuotas': '2 Cuotas',
        '1_cuota': '1 Cuota'
    };
    
    return labels[modalidad] || modalidad;
}

// Event Listeners adicionales
document.addEventListener('DOMContentLoaded', function() {
    // Filtros de usuarios
    const filterRole = document.getElementById('filterUsuariosRole');
    const filterStatus = document.getElementById('filterUsuariosStatus');
    const filterSearch = document.getElementById('filterUsuariosSearch');
    
    if (filterRole) filterRole.addEventListener('change', aplicarFiltrosUsuarios);
    if (filterStatus) filterStatus.addEventListener('change', aplicarFiltrosUsuarios);
    if (filterSearch) {
        let searchTimeout;
        filterSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(aplicarFiltrosUsuarios, 300);
        });
    }
    
    // Form de configuración de matrícula
    const configMatriculaForm = document.getElementById('nuevaConfigMatriculaForm');
    if (configMatriculaForm) {
        configMatriculaForm.addEventListener('submit', handleNuevaConfigMatricula);
    }

    const editarUsuarioForm = document.getElementById('editarUsuarioForm');
    if (editarUsuarioForm) {
        editarUsuarioForm.addEventListener('submit', handleEditarUsuarioSubmit);
    }
});

console.log('✅ Extensión de Dashboard (Usuarios y Matrículas) cargada');
