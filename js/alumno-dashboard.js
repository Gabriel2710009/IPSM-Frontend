/**
 * JavaScript para Dashboard de Alumno
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!Auth.isAuthenticated()) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }
    
    // Verificar que sea alumno
    if (!Auth.hasRole(CONFIG.ROLES.ALUMNO)) {
        Utils.showError('No tiene permisos para acceder a esta sección');
        Auth.logout();
        return;
    }
    
    // Inicializar dashboard
    initDashboard();
    initNavigation();
    initLogout();
    
    // Cargar datos iniciales
    loadUserData();
    loadDashboardData();
});

/**
 * Inicializa el dashboard
 */
function initDashboard() {
    const user = Auth.getUser();
    
    // Mostrar nombre del usuario
    const userNameElements = document.querySelectorAll('#userName, #welcomeName');
    userNameElements.forEach(el => {
        if (el) {
            el.textContent = user.nombre || 'Alumno';
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
            
            // Remover clase active de todos los links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al link clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostrar la sección seleccionada
            const targetSection = document.getElementById(`section-${sectionName}`);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Cargar datos específicos de la sección
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
        case 'notas':
            await loadNotas();
            break;
        case 'comunicados':
            await loadComunicados();
            break;
        case 'mensajes':
            await loadMensajes();
            break;
    }
}

/**
 * Inicializa el botón de logout
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
 * Carga los datos del usuario
 */
async function loadUserData() {
    try {
        const perfil = await API.get(CONFIG.ENDPOINTS.ALUMNOS.PROFILE, true);
        
        // Actualizar información del usuario si es necesario
        if (perfil) {
            Auth.saveUser(perfil);
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
}

/**
 * Carga los datos del dashboard inicial
 */
async function loadDashboardData() {
    try {
        Utils.showLoader();
        
        // Cargar estadísticas
        await Promise.all([
            loadEstadisticas(),
            loadUltimasNotas(),
            loadComunicadosRecientes()
        ]);
        
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        Utils.showError('Error al cargar los datos del dashboard');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga las estadísticas del alumno
 */
async function loadEstadisticas() {
    try {
        const notas = await API.get(CONFIG.ENDPOINTS.ALUMNOS.NOTAS, true);
        
        if (notas) {
            // Calcular estadísticas
            const materias = notas.length;
            const promedio = calcularPromedio(notas);
            const asistencia = '95%'; // Esto debería venir de la API
            
            // Actualizar UI
            document.getElementById('statMaterias').textContent = materias;
            document.getElementById('statPromedio').textContent = promedio.toFixed(2);
            document.getElementById('statAsistencia').textContent = asistencia;
        }
        
        // Contar mensajes no leídos
        const mensajes = await API.get(CONFIG.ENDPOINTS.ALUMNOS.MENSAJES, true);
        const noLeidos = mensajes ? mensajes.filter(m => !m.leido).length : 0;
        
        document.getElementById('statMensajes').textContent = noLeidos;
        
        if (noLeidos > 0) {
            const badge = document.getElementById('mensajesBadge');
            if (badge) {
                badge.textContent = noLeidos;
                badge.style.display = 'inline';
            }
        }
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Calcula el promedio de notas
 */
function calcularPromedio(notas) {
    if (!notas || notas.length === 0) return 0;
    
    const notasValidas = notas.filter(n => n.nota !== null && n.nota !== undefined);
    if (notasValidas.length === 0) return 0;
    
    const suma = notasValidas.reduce((acc, n) => acc + parseFloat(n.nota), 0);
    return suma / notasValidas.length;
}

/**
 * Carga las últimas notas
 */
async function loadUltimasNotas() {
    const container = document.getElementById('ultimasNotasContainer');
    if (!container) return;
    
    try {
        const notas = await API.get(CONFIG.ENDPOINTS.ALUMNOS.NOTAS + '?limit=5', true);
        
        if (notas && notas.length > 0) {
            container.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Materia</th>
                            <th>Trimestre</th>
                            <th>Nota</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${notas.map(nota => `
                            <tr>
                                <td>${nota.materia}</td>
                                <td>${nota.trimestre}°</td>
                                <td>
                                    <span class="nota-value ${nota.nota >= 6 ? 'nota-aprobado' : 'nota-desaprobado'}">
                                        ${nota.nota}
                                    </span>
                                </td>
                                <td>${Utils.formatDateShort(nota.fecha)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay notas registradas aún.</p>';
        }
    } catch (error) {
        console.error('Error al cargar últimas notas:', error);
        container.innerHTML = '<p class="text-center text-error">Error al cargar las notas.</p>';
    }
}

/**
 * Carga comunicados recientes
 */
async function loadComunicadosRecientes() {
    const container = document.getElementById('comunicadosRecentesContainer');
    if (!container) return;
    
    try {
        const comunicados = await API.get(CONFIG.ENDPOINTS.ALUMNOS.COMUNICADOS + '?limit=3', true);
        
        if (comunicados && comunicados.length > 0) {
            container.innerHTML = `
                <div class="comunicados-list">
                    ${comunicados.map(com => `
                        <div class="comunicado-item">
                            <div class="comunicado-header">
                                <strong>${com.titulo}</strong>
                                <span class="comunicado-fecha">${Utils.formatDateShort(com.fecha)}</span>
                            </div>
                            <p class="comunicado-mensaje">${com.mensaje.substring(0, 100)}...</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay comunicados recientes.</p>';
        }
    } catch (error) {
        console.error('Error al cargar comunicados:', error);
        container.innerHTML = '<p class="text-center">No hay comunicados disponibles.</p>';
    }
}

/**
 * Carga el perfil completo del alumno
 */
async function loadPerfil() {
    const container = document.getElementById('perfilContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        const perfil = await API.get(CONFIG.ENDPOINTS.ALUMNOS.PROFILE, true);
        
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
                            <div class="profile-label">Fecha de nacimiento</div>
                            <div class="profile-value">${Utils.formatDate(perfil.fecha_nacimiento)}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Email</div>
                            <div class="profile-value">${perfil.email || 'No registrado'}</div>
                        </div>
                    </div>
                    <div>
                        <div class="profile-item">
                            <div class="profile-label">Nivel</div>
                            <div class="profile-value">${perfil.nivel}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Año</div>
                            <div class="profile-value">${perfil.anio}°</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">División</div>
                            <div class="profile-value">${perfil.division}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-label">Legajo</div>
                            <div class="profile-value">${perfil.legajo}</div>
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
 * Carga todas las notas del alumno
 */
async function loadNotas() {
    const container = document.getElementById('notasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        const notas = await API.get(CONFIG.ENDPOINTS.ALUMNOS.NOTAS, true);
        
        if (notas && notas.length > 0) {
            // Agrupar notas por materia
            const notasPorMateria = agruparNotasPorMateria(notas);
            
            container.innerHTML = `
                <div class="notas-table-wrapper">
                    <table class="notas-table">
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th>1° Trimestre</th>
                                <th>2° Trimestre</th>
                                <th>3° Trimestre</th>
                                <th>Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(notasPorMateria).map(materia => {
                                const notas = notasPorMateria[materia];
                                const promedio = calcularPromedio(notas);
                                
                                return `
                                    <tr>
                                        <td><strong>${materia}</strong></td>
                                        <td>${getNota(notas, 1)}</td>
                                        <td>${getNota(notas, 2)}</td>
                                        <td>${getNota(notas, 3)}</td>
                                        <td>
                                            <span class="nota-value ${promedio >= 6 ? 'nota-aprobado' : 'nota-desaprobado'}">
                                                ${promedio > 0 ? promedio.toFixed(2) : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay notas registradas aún.</p>';
        }
    } catch (error) {
        console.error('Error al cargar notas:', error);
        Utils.showError('Error al cargar las notas');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Agrupa notas por materia
 */
function agruparNotasPorMateria(notas) {
    return notas.reduce((acc, nota) => {
        if (!acc[nota.materia]) {
            acc[nota.materia] = [];
        }
        acc[nota.materia].push(nota);
        return acc;
    }, {});
}

/**
 * Obtiene la nota de un trimestre específico
 */
function getNota(notas, trimestre) {
    const nota = notas.find(n => n.trimestre === trimestre);
    if (!nota || nota.nota === null || nota.nota === undefined) {
        return '-';
    }
    const valor = parseFloat(nota.nota);
    const clase = valor >= 6 ? 'nota-aprobado' : 'nota-desaprobado';
    return `<span class="nota-value ${clase}">${valor}</span>`;
}

/**
 * Carga los comunicados
 */
async function loadComunicados() {
    const container = document.getElementById('comunicadosContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        const comunicados = await API.get(CONFIG.ENDPOINTS.ALUMNOS.COMUNICADOS, true);
        
        if (comunicados && comunicados.length > 0) {
            container.innerHTML = `
                <div class="comunicados-list">
                    ${comunicados.map(com => `
                        <div class="comunicado-item">
                            <div class="comunicado-header">
                                <h4 class="comunicado-titulo">${com.titulo}</h4>
                                <span class="comunicado-fecha">${Utils.formatDate(com.fecha)}</span>
                            </div>
                            <p class="comunicado-mensaje">${com.mensaje}</p>
                            ${com.adjunto ? `<a href="${com.adjunto}" class="btn btn-sm btn-outline mt-sm" target="_blank">Ver adjunto</a>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay comunicados disponibles.</p>';
        }
    } catch (error) {
        console.error('Error al cargar comunicados:', error);
        Utils.showError('Error al cargar los comunicados');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga los mensajes
 */
async function loadMensajes() {
    const container = document.getElementById('mensajesContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        const mensajes = await API.get(CONFIG.ENDPOINTS.ALUMNOS.MENSAJES, true);
        
        if (mensajes && mensajes.length > 0) {
            container.innerHTML = `
                <div class="mensajes-list">
                    ${mensajes.map(msg => `
                        <div class="mensaje-item ${!msg.leido ? 'no-leido' : ''}" onclick="verMensaje(${msg.id})">
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
 * Ver detalle de un mensaje
 */
async function verMensaje(mensajeId) {
    try {
        // Marcar como leído
        await API.put(`${CONFIG.ENDPOINTS.ALUMNOS.MENSAJES}/${mensajeId}/leer`, {}, true);
        
        // Recargar mensajes
        await loadMensajes();
        await loadEstadisticas();
        
    } catch (error) {
        console.error('Error al marcar mensaje como leído:', error);
    }
}
