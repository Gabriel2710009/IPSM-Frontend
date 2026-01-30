/**
 * JavaScript para Dashboard de Padre
 */

let hijosData = [];
let cuotasData = [];
let hijoSeleccionado = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!Auth.isAuthenticated()) {
        window.location.href = '../../pages/auth/login.html';
        return;
    }
    
    // Verificar que sea padre
    if (!Auth.hasRole(CONFIG.ROLES.PADRE)) {
        Utils.showError('No tiene permisos para acceder a esta sección');
        Auth.logout();
        return;
    }
    
    // Inicializar dashboard
    initDashboard();
    initNavigation();
    initLogout();
    initModals();
    
    // Cargar datos iniciales
    loadUserData();
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
            el.textContent = user.nombre || 'Padre/Madre';
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
        case 'hijos':
            await loadHijosDetalle();
            break;
        case 'cuotas':
            await loadCuotas();
            break;
        case 'libretas':
            await loadLibretas();
            break;
        case 'comunicados':
            await loadComunicados();
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
    // Modal de pago
    const pagoModal = document.getElementById('pagoModal');
    const closeModal = document.getElementById('closeModal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            pagoModal.classList.remove('active');
        });
    }
    
    if (pagoModal) {
        pagoModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // Modal de comprobante
    const comprobanteModal = document.getElementById('comprobanteModal');
    const closeComprobanteModal = document.getElementById('closeComprobanteModal');
    
    if (closeComprobanteModal) {
        closeComprobanteModal.addEventListener('click', () => {
            comprobanteModal.classList.remove('active');
        });
    }
    
    if (comprobanteModal) {
        comprobanteModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // Form de comprobante
    const comprobanteForm = document.getElementById('comprobanteForm');
    if (comprobanteForm) {
        comprobanteForm.addEventListener('submit', handleComprobanteSubmit);
    }
}

/**
 * Carga datos del usuario
 */
async function loadUserData() {
    try {
        const perfil = await API.get(CONFIG.ENDPOINTS.PADRES.PROFILE, true);
        
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
            loadHijos(),
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
 * Carga la lista de hijos
 */
async function loadHijos() {
    try {
        hijosData = await API.get(CONFIG.ENDPOINTS.PADRES.HIJOS, true);
        
        if (hijosData && hijosData.length > 0) {
            // Actualizar resumen en inicio
            const resumenContainer = document.getElementById('resumenHijosContainer');
            if (resumenContainer) {
                resumenContainer.innerHTML = hijosData.map(hijo => `
                    <div class="hijo-card" style="margin-bottom: var(--spacing-lg);">
                        <div class="hijo-header">
                            <div class="hijo-avatar">${hijo.nombre.charAt(0)}</div>
                            <div class="hijo-info">
                                <h3>${hijo.nombre} ${hijo.apellido}</h3>
                                <div class="hijo-detalles">
                                    ${hijo.nivel} - ${hijo.anio}° ${hijo.division} | DNI: ${hijo.dni}
                                </div>
                            </div>
                        </div>
                        <div class="hijo-stats">
                            <div class="hijo-stat">
                                <div class="hijo-stat-value">${hijo.promedio || '-'}</div>
                                <div class="hijo-stat-label">Promedio</div>
                            </div>
                            <div class="hijo-stat">
                                <div class="hijo-stat-value">${hijo.asistencia || '-'}%</div>
                                <div class="hijo-stat-label">Asistencia</div>
                            </div>
                            <div class="hijo-stat">
                                <div class="hijo-stat-value">${hijo.cuotas_pendientes || 0}</div>
                                <div class="hijo-stat-label">Cuotas Pendientes</div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            // Poblar selects
            const hijoSelect = document.getElementById('hijoSelect');
            const hijoLibretaSelect = document.getElementById('hijoLibretaSelect');
            
            const options = hijosData.map(hijo => 
                `<option value="${hijo.id}">${hijo.nombre} ${hijo.apellido}</option>`
            ).join('');
            
            if (hijoSelect) {
                hijoSelect.innerHTML = options;
                hijoSelect.addEventListener('change', () => loadCuotasPorHijo(hijoSelect.value));
                
                // Cargar cuotas del primer hijo
                if (hijosData.length > 0) {
                    loadCuotasPorHijo(hijosData[0].id);
                }
            }
            
            if (hijoLibretaSelect) {
                hijoLibretaSelect.innerHTML = options;
                hijoLibretaSelect.addEventListener('change', () => loadLibretasPorHijo(hijoLibretaSelect.value));
            }
        }
    } catch (error) {
        console.error('Error al cargar hijos:', error);
    }
}

/**
 * Carga estadísticas
 */
async function loadEstadisticas() {
    try {
        // Total de hijos
        document.getElementById('statHijos').textContent = hijosData.length;
        
        // Cargar cuotas para calcular pendientes
        cuotasData = await API.get(CONFIG.ENDPOINTS.PADRES.CUOTAS, true);
        
        if (cuotasData) {
            const pendientes = cuotasData.filter(c => !c.pagado);
            const alDia = cuotasData.filter(c => c.pagado);
            
            document.getElementById('statCuotasPendientes').textContent = pendientes.length;
            document.getElementById('statCuotasAlDia').textContent = alDia.length;
            
            // Badge de cuotas pendientes
            if (pendientes.length > 0) {
                const badge = document.getElementById('cuotasPendientesBadge');
                if (badge) {
                    badge.textContent = pendientes.length;
                    badge.style.display = 'inline';
                }
            }
        }
        
        // Promedio general
        if (hijosData.length > 0) {
            const promedioGeneral = hijosData.reduce((acc, h) => acc + (parseFloat(h.promedio) || 0), 0) / hijosData.length;
            document.getElementById('statPromedioGeneral').textContent = promedioGeneral.toFixed(2);
        }
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Carga detalle de hijos
 */
async function loadHijosDetalle() {
    const container = document.getElementById('hijosContainer');
    if (!container) return;
    
    if (hijosData.length === 0) {
        container.innerHTML = '<p class="text-center">No hay hijos registrados.</p>';
        return;
    }
    
    container.innerHTML = hijosData.map(hijo => `
        <div class="hijo-card">
            <div class="hijo-header">
                <div class="hijo-avatar">${hijo.nombre.charAt(0)}${hijo.apellido.charAt(0)}</div>
                <div class="hijo-info">
                    <h3>${hijo.nombre} ${hijo.apellido}</h3>
                    <div class="hijo-detalles">
                        ${hijo.nivel} - ${hijo.anio}° ${hijo.division} | DNI: ${hijo.dni}
                    </div>
                </div>
            </div>
            
            <div class="hijo-stats">
                <div class="hijo-stat">
                    <div class="hijo-stat-value">${hijo.promedio || '-'}</div>
                    <div class="hijo-stat-label">Promedio General</div>
                </div>
                <div class="hijo-stat">
                    <div class="hijo-stat-value">${hijo.asistencia || '-'}%</div>
                    <div class="hijo-stat-label">Asistencia</div>
                </div>
                <div class="hijo-stat">
                    <div class="hijo-stat-value">${hijo.cuotas_pendientes || 0}</div>
                    <div class="hijo-stat-label">Cuotas Pendientes</div>
                </div>
            </div>
            
            <div class="mt-lg" style="display: flex; gap: var(--spacing-sm);">
                <button class="btn btn-primary" onclick="verNotas(${hijo.id})">Ver Notas</button>
                <button class="btn btn-outline" onclick="verCuotas(${hijo.id})">Ver Cuotas</button>
            </div>
        </div>
    `).join('');
}

/**
 * Carga cuotas por hijo
 */
async function loadCuotasPorHijo(hijoId) {
    const container = document.getElementById('cuotasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        const cuotas = await API.get(`${CONFIG.ENDPOINTS.PADRES.CUOTAS}?hijo_id=${hijoId}`, true);
        
        if (cuotas && cuotas.length > 0) {
            container.innerHTML = `
                <div class="cuotas-grid">
                    ${cuotas.map(cuota => createCuotaCard(cuota)).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay cuotas registradas.</p>';
        }
    } catch (error) {
        console.error('Error al cargar cuotas:', error);
        Utils.showError('Error al cargar las cuotas');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Crea una tarjeta de cuota
 */
function createCuotaCard(cuota) {
    const status = Utils.getCuotaStatus(cuota.fecha_vencimiento, cuota.pagado);
    const statusText = Utils.getCuotaStatusText(status);
    
    return `
        <div class="cuota-card ${status}">
            <div class="cuota-header">
                <h3 class="cuota-mes">${cuota.mes} ${cuota.anio}</h3>
                <span class="badge badge-${status}">${statusText}</span>
            </div>
            
            <div class="cuota-info">
                <div class="cuota-info-item">
                    <span class="cuota-label">Monto:</span>
                    <span class="cuota-value cuota-monto">$${cuota.monto.toLocaleString()}</span>
                </div>
                <div class="cuota-info-item">
                    <span class="cuota-label">Vencimiento:</span>
                    <span class="cuota-value">${Utils.formatDateShort(cuota.fecha_vencimiento)}</span>
                </div>
                ${cuota.pagado ? `
                    <div class="cuota-info-item">
                        <span class="cuota-label">Fecha de pago:</span>
                        <span class="cuota-value">${Utils.formatDateShort(cuota.fecha_pago)}</span>
                    </div>
                    <div class="cuota-info-item">
                        <span class="cuota-label">Método:</span>
                        <span class="cuota-value">${cuota.metodo_pago}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="cuota-actions">
                ${!cuota.pagado ? `
                    <button class="btn btn-success btn-sm" onclick="pagarCuota(${cuota.id})">
                        💳 Pagar con Mercado Pago
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="subirComprobante(${cuota.id})">
                        📎 Subir Comprobante
                    </button>
                ` : `
                    ${cuota.comprobante_url ? `
                        <a href="${cuota.comprobante_url}" target="_blank" class="btn btn-outline btn-sm">
                            📄 Ver Comprobante
                        </a>
                    ` : ''}
                `}
            </div>
        </div>
    `;
}

/**
 * Muestra modal para pagar cuota
 */
function pagarCuota(cuotaId) {
    const cuota = cuotasData.find(c => c.id === cuotaId);
    if (!cuota) return;
    
    const modal = document.getElementById('pagoModal');
    const modalBody = document.getElementById('pagoModalBody');
    
    modalBody.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h4>Cuota ${cuota.mes} ${cuota.anio}</h4>
                <p><strong>Monto:</strong> $${cuota.monto.toLocaleString()}</p>
                <p><strong>Vencimiento:</strong> ${Utils.formatDate(cuota.fecha_vencimiento)}</p>
                
                <div class="pago-options mt-lg">
                    <div class="pago-option" onclick="procesarPagoMercadoPago(${cuotaId})">
                        <h4>💳 Mercado Pago</h4>
                        <p>Pago instantáneo con tarjeta de crédito/débito</p>
                    </div>
                    
                    <div class="pago-option" onclick="mostrarDatosTransferencia()">
                        <h4>🏦 Transferencia Bancaria</h4>
                        <p>Ver datos para transferencia manual</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

/**
 * Procesa pago con Mercado Pago
 */
async function procesarPagoMercadoPago(cuotaId) {
    try {
        Utils.showLoader();
        
        const response = await API.post(
            `${CONFIG.ENDPOINTS.PADRES.CUOTAS}/${cuotaId}/pagar`,
            { metodo: 'mercadopago' },
            true
        );
        
        if (response.payment_url) {
            window.location.href = response.payment_url;
        } else {
            Utils.showError('Error al generar el link de pago');
        }
    } catch (error) {
        console.error('Error al procesar pago:', error);
        Utils.showError('Error al procesar el pago');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Muestra datos para transferencia
 */
function mostrarDatosTransferencia() {
    Utils.showWarning(`
        Datos para transferencia:
        Banco: Banco Nación
        CBU: 0110593520000012345678
        Alias: SANMARINO.INST
        Titular: Instituto Privado San Marino
        
        Una vez realizada la transferencia, suba el comprobante.
    `, 15000);
}

/**
 * Muestra modal para subir comprobante
 */
function subirComprobante(cuotaId) {
    hijoSeleccionado = cuotaId;
    
    const modal = document.getElementById('comprobanteModal');
    modal.classList.add('active');
    
    // Limpiar formulario
    document.getElementById('comprobanteForm').reset();
}

/**
 * Maneja el envío del comprobante
 */
async function handleComprobanteSubmit(e) {
    e.preventDefault();
    
    const file = document.getElementById('comprobanteFile').files[0];
    const numero = document.getElementById('comprobanteNumero').value;
    
    if (!file) {
        Utils.showError('Por favor seleccione un archivo');
        return;
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        Utils.showError('El archivo no debe superar los 5MB');
        return;
    }
    
    try {
        Utils.showLoader();
        
        const response = await API.uploadFile(
            `${CONFIG.ENDPOINTS.PADRES.CUOTAS}/${hijoSeleccionado}/comprobante`,
            file,
            true
        );
        
        Utils.showSuccess('Comprobante subido correctamente. Será verificado en breve.');
        
        // Cerrar modal
        document.getElementById('comprobanteModal').classList.remove('active');
        
        // Recargar cuotas
        const hijoSelect = document.getElementById('hijoSelect');
        if (hijoSelect) {
            loadCuotasPorHijo(hijoSelect.value);
        }
        
    } catch (error) {
        console.error('Error al subir comprobante:', error);
        Utils.showError('Error al subir el comprobante');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga libretas por hijo
 */
async function loadLibretasPorHijo(hijoId) {
    const container = document.getElementById('libretasContainer');
    if (!container) return;
    
    try {
        Utils.showLoader();
        
        const libretas = await API.get(`${CONFIG.ENDPOINTS.PADRES.LIBRETA}?hijo_id=${hijoId}`, true);
        
        if (libretas && libretas.length > 0) {
            container.innerHTML = `
                <div class="libretas-list">
                    ${libretas.map(libreta => `
                        <div class="libreta-item">
                            <div class="libreta-info">
                                <h4>${libreta.trimestre}° Trimestre ${libreta.anio}</h4>
                                <p>Generada el ${Utils.formatDate(libreta.fecha_generacion)}</p>
                            </div>
                            <a href="${libreta.pdf_url}" target="_blank" class="btn btn-primary">
                                📄 Descargar PDF
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p class="text-center">No hay libretas disponibles aún.</p>';
        }
    } catch (error) {
        console.error('Error al cargar libretas:', error);
        Utils.showError('Error al cargar las libretas');
    } finally {
        Utils.hideLoader();
    }
}

/**
 * Carga libretas
 */
async function loadLibretas() {
    const hijoLibretaSelect = document.getElementById('hijoLibretaSelect');
    if (hijoLibretaSelect && hijoLibretaSelect.value) {
        await loadLibretasPorHijo(hijoLibretaSelect.value);
    } else if (hijosData.length > 0) {
        await loadLibretasPorHijo(hijosData[0].id);
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
        
        const comunicados = await API.get(CONFIG.ENDPOINTS.PADRES.PROFILE + '/comunicados', true);
        
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
 * Carga cuotas (wrapper)
 */
async function loadCuotas() {
    const hijoSelect = document.getElementById('hijoSelect');
    if (hijoSelect && hijoSelect.value) {
        await loadCuotasPorHijo(hijoSelect.value);
    } else if (hijosData.length > 0) {
        await loadCuotasPorHijo(hijosData[0].id);
    }
}

/**
 * Ver notas de un hijo
 */
function verNotas(hijoId) {
    // Cambiar a sección de hijos con filtro
    Utils.showWarning('Funcionalidad en desarrollo. Próximamente podrá ver las notas detalladas de cada hijo.');
}

/**
 * Ver cuotas de un hijo
 */
function verCuotas(hijoId) {
    // Cambiar a sección de cuotas
    document.querySelector('[data-section="cuotas"]').click();
    
    setTimeout(() => {
        const hijoSelect = document.getElementById('hijoSelect');
        if (hijoSelect) {
            hijoSelect.value = hijoId;
            loadCuotasPorHijo(hijoId);
        }
    }, 100);
}
