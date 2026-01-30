# Sistema Web Escolar - Instituto Privado San Marino

## 📋 Descripción

Sistema web completo para la gestión escolar del Instituto Privado San Marino, diseñado para ser desplegado en GitHub Pages y consumir una API REST desarrollada en FastAPI.

## 🏗️ Estructura del Proyecto

```
san-marino-escolar/
├── index.html                 # Página principal pública
├── favicon.ico               # Favicon del instituto
├── css/
│   ├── styles.css           # Estilos globales
│   ├── home.css             # Estilos página principal
│   ├── login.css            # Estilos página de login
│   ├── dashboard.css        # Estilos dashboards
│   └── padre.css            # Estilos específicos padre
├── js/
│   ├── config.js            # Configuración API
│   ├── api.js               # Utilidades API y auth
│   ├── home.js              # JavaScript página principal
│   ├── login.js             # JavaScript login
│   ├── alumno-dashboard.js  # Dashboard alumno
│   └── padre-dashboard.js   # Dashboard padre
├── images/
│   ├── institucional/       # Logo, frente, etc.
│   ├── noticias/           # Imágenes de noticias
│   └── cursos/             # Imágenes de niveles
└── pages/
    ├── auth/
    │   └── login.html       # Página de login
    ├── alumno/
    │   └── dashboard.html   # Dashboard alumno
    ├── padre/
    │   └── dashboard.html   # Dashboard padre
    ├── docente/
    │   └── dashboard.html   # Dashboard docente
    ├── preceptor/
    │   └── dashboard.html   # Dashboard preceptor
    ├── admin/
    │   └── dashboard.html   # Dashboard administración
    └── niveles/
        ├── inicial.html     # Página nivel inicial
        ├── primario.html    # Página nivel primario
        └── secundario.html  # Página nivel secundario
```

## 🎨 Diseño y Estética

### Paleta de Colores
- **Azul Institucional**: #1a4d7a (principal)
- **Rojo Institucional**: #c8102e (secundario)
- **Amarillo Dorado**: #f7b32b (acentos)
- **Grises**: Escala completa para textos y fondos

### Tipografía
- **Headings**: Crimson Text (serif elegante)
- **Body**: Lato (sans-serif moderna)
- **Código**: JetBrains Mono

### Características de Diseño
- Diseño responsive (móvil, tablet, desktop)
- Animaciones suaves en interacciones
- Sombras y profundidad para elementos
- Iconos emoji para mejor UX
- Gradientes en headers y elementos destacados

## 🔐 Autenticación

### Flujo de Login
1. Usuario ingresa DNI (7-8 dígitos) y contraseña
2. Sistema valida credenciales contra API
3. API devuelve JWT token + datos del usuario
4. Token se guarda en localStorage
5. Redirección automática según rol

### Ejemplo de llamada API Login
```javascript
// POST /api/v1/auth/login
{
  "dni": "12345678",
  "password": "password123"
}

// Respuesta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "role": "alumno",
    "email": "juan@example.com"
  }
}
```

## 👨‍🎓 Panel Alumno

### Funcionalidades
- ✅ Ver información personal
- ✅ Consultar notas por trimestre
- ✅ Leer comunicados del instituto
- ✅ Ver mensajes (inbox interno)
- ✅ Estadísticas de rendimiento
- ✅ Promedio general y por materia

### Endpoints API Utilizados
```
GET /api/v1/alumnos/perfil
GET /api/v1/alumnos/notas
GET /api/v1/alumnos/comunicados
GET /api/v1/alumnos/mensajes
PUT /api/v1/alumnos/mensajes/{id}/leer
```

## 👨‍👩‍👧 Panel Padre

### Funcionalidades
- ✅ Listado de hijos inscriptos
- ✅ Acceso al perfil de cada hijo
- ✅ Visualización de notas por hijo
- ✅ Gestión de cuotas mensuales
- ✅ Estado de pagos (pendiente/pagado/vencido)
- ✅ Descarga de libretas en PDF
- ✅ Pago online (integración Mercado Pago)
- ✅ Subida de comprobantes con OCR
- ✅ Notificaciones de vencimiento

### Sistema de Cuotas

#### Estados de Cuota
- **Pendiente**: No pagada, dentro de fecha
- **Pagado**: Cuota abonada
- **Vencido**: Pasó la fecha de vencimiento (día 10)

#### Ejemplo de estructura de cuota
```javascript
{
  "id": 1,
  "hijo_id": 5,
  "mes": "Marzo",
  "anio": 2025,
  "monto": 15000,
  "fecha_vencimiento": "2025-03-10",
  "pagado": false,
  "fecha_pago": null,
  "metodo_pago": null,
  "comprobante_url": null
}
```

#### Proceso de Pago
1. Padre selecciona cuota a pagar
2. Opciones:
   - **Mercado Pago**: Redirección a checkout
   - **Transferencia**: Subir comprobante
3. Sistema actualiza estado
4. Confirmación por email

### Endpoints API Utilizados
```
GET /api/v1/padres/perfil
GET /api/v1/padres/hijos
GET /api/v1/padres/cuotas
GET /api/v1/padres/cuotas/{id}/pagar
POST /api/v1/padres/cuotas/{id}/comprobante
GET /api/v1/padres/libreta/{hijo_id}/{trimestre}
```

## 👨‍🏫 Panel Docente

### Funcionalidades
- ✅ Listado de cursos y materias asignadas
- ✅ Selección por año y división
- ✅ Carga de notas (solo materias propias)
- ✅ Edición de notas existentes
- ✅ Envío de mensajes a alumnos/padres
- ✅ Visualización de asistencias
- ✅ Generación de reportes

### Endpoints API
```
GET /api/v1/docentes/perfil
GET /api/v1/docentes/cursos
GET /api/v1/docentes/notas/{curso_id}
POST /api/v1/docentes/notas
PUT /api/v1/docentes/notas/{id}
POST /api/v1/docentes/mensajes
```

## 👨‍💼 Panel Preceptor

### Funcionalidades
- ✅ Vista general de alumnos por curso
- ✅ Lectura de notas (sin edición)
- ✅ Envío de comunicados generales
- ✅ Comunicación con administración
- ✅ Control de asistencias
- ✅ Generación de reportes

### Endpoints API
```
GET /api/v1/preceptores/perfil
GET /api/v1/preceptores/cursos
GET /api/v1/preceptores/alumnos/{curso_id}
POST /api/v1/preceptores/comunicados
GET /api/v1/preceptores/asistencias
```

## ⚙️ Panel Administración

### Funcionalidades
- ✅ Acceso total al sistema
- ✅ Gestión de usuarios (CRUD)
- ✅ Gestión de cuotas y valores
- ✅ Gestión de comunicados
- ✅ Revisión de pagos
- ✅ Vista jerárquica (nivel > año > división)
- ✅ Reportes y estadísticas
- ✅ Configuración del sistema

### Endpoints API
```
GET /api/v1/admin/usuarios
POST /api/v1/admin/usuarios
PUT /api/v1/admin/usuarios/{id}
DELETE /api/v1/admin/usuarios/{id}
GET /api/v1/admin/cuotas
POST /api/v1/admin/cuotas
GET /api/v1/admin/pagos
GET /api/v1/admin/estadisticas
```

## 💬 Sistema de Mensajería

### Características
- Inbox interno por usuario
- Indicador de mensajes no leídos
- Confirmación de lectura
- Mensajes entre roles autorizados

### Estructura de Mensaje
```javascript
{
  "id": 1,
  "remitente": "Prof. María García",
  "remitente_id": 10,
  "destinatario_id": 5,
  "asunto": "Reunión de padres",
  "mensaje": "Se convoca a reunión...",
  "fecha": "2025-01-28T10:30:00",
  "leido": false,
  "fecha_lectura": null
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptaciones Móviles
- Menú hamburguesa
- Sidebar colapsable
- Cards apiladas verticalmente
- Tablas con scroll horizontal
- Botones de tamaño táctil

## 🔒 Seguridad Frontend

### Mejores Prácticas Implementadas
- ✅ Validación de formularios
- ✅ Sanitización de inputs
- ✅ Tokens JWT en localStorage
- ✅ Validación de roles en cliente
- ✅ Logout seguro (limpieza de datos)
- ✅ Timeouts de sesión
- ✅ HTTPS requerido

### Validaciones
```javascript
// DNI: 7-8 dígitos
validateDNI(dni) {
    return /^\d{7,8}$/.test(dni);
}

// Email
validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## 📊 Ejemplos de Uso

### Cargar Notas de Alumno
```javascript
async function loadNotas() {
    try {
        const notas = await API.get(
            CONFIG.ENDPOINTS.ALUMNOS.NOTAS, 
            true // requiere autenticación
        );
        
        // Procesar y mostrar notas
        renderNotas(notas);
    } catch (error) {
        Utils.showError('Error al cargar notas');
    }
}
```

### Pagar Cuota
```javascript
async function pagarCuota(cuotaId, metodoPago) {
    try {
        Utils.showLoader();
        
        const response = await API.post(
            `${CONFIG.ENDPOINTS.PADRES.CUOTAS}/${cuotaId}/pagar`,
            { metodo_pago: metodoPago },
            true
        );
        
        if (response.payment_url) {
            // Redirigir a Mercado Pago
            window.location.href = response.payment_url;
        }
        
        Utils.showSuccess('Pago procesado correctamente');
    } catch (error) {
        Utils.showError('Error al procesar el pago');
    } finally {
        Utils.hideLoader();
    }
}
```

### Subir Comprobante
```javascript
async function subirComprobante(cuotaId, file) {
    try {
        const response = await API.uploadFile(
            `${CONFIG.ENDPOINTS.PADRES.CUOTAS}/${cuotaId}/comprobante`,
            file,
            true
        );
        
        Utils.showSuccess('Comprobante subido. Será revisado en 24-48hs');
    } catch (error) {
        Utils.showError('Error al subir comprobante');
    }
}
```

## 🚀 Deployment en GitHub Pages

### Pasos para Desplegar

1. **Preparar Repositorio**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/usuario/san-marino-escolar.git
git push -u origin main
```

2. **Configurar GitHub Pages**
- Ir a Settings > Pages
- Source: Deploy from branch
- Branch: main / (root)
- Save

3. **Configurar API URL**
En `js/config.js`, cambiar:
```javascript
API_BASE_URL: 'https://api.institutosanmarino.edu.ar/api/v1'
```

4. **Acceder**
- URL: `https://usuario.github.io/san-marino-escolar/`

### Consideraciones
- ✅ Solo archivos estáticos (HTML, CSS, JS)
- ✅ CORS configurado en la API
- ✅ HTTPS automático
- ❌ No soporta backend (usar API externa)

## 📝 Personalización

### Cambiar Colores
Editar variables en `css/styles.css`:
```css
:root {
    --primary-color: #1a4d7a;
    --secondary-color: #c8102e;
    --accent-color: #f7b32b;
}
```

### Cambiar Logo
Reemplazar archivo en:
- `images/institucional/logo.png`
- `favicon.ico`

### Agregar Niveles
Crear nuevos archivos en `pages/niveles/`

## 🛠️ Mantenimiento

### Actualizar Noticias
Las noticias se cargan desde la API. Para agregar:
```javascript
POST /api/v1/publico/noticias
{
    "titulo": "Nueva noticia",
    "resumen": "Resumen breve",
    "contenido": "Contenido completo",
    "imagen": "url_imagen",
    "fecha": "2025-01-30"
}
```

### Backup
- Código: Git
- Imágenes: Backup manual carpeta `images/`
- Datos: Backup de la base de datos de la API

## 📞 Soporte

Para asistencia técnica:
- **Email**: soporte@institutosanmarino.edu.ar
- **Teléfono**: +54 (266) 4XX-XXXX

## 📄 Licencia

© 2025 Instituto Privado San Marino. Todos los derechos reservados.

---

**Desarrollado con ❤️ para la comunidad educativa del Instituto San Marino**
