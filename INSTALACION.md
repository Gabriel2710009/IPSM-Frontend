# Guía de Instalación - Sistema Web Escolar San Marino

## 📋 Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet
- API FastAPI funcionando en servidor

## 🔧 Configuración Inicial

### 1. Configurar URL de la API

Editar el archivo `js/config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'https://tu-api.dominio.com/api/v1',
    // ... resto de configuración
};
```

### 2. Agregar Imágenes Institucionales

Colocar las siguientes imágenes en sus carpetas correspondientes:

```
images/institucional/
├── logo.png (200x50px recomendado)
├── frente-colegio.jpg
└── hero-bg.jpg

images/noticias/
├── default.jpg
├── inicio-ciclo.jpg
├── olimpiadas.jpg
└── sala-informatica.jpg

images/cursos/
├── nivel-inicial.jpg
├── nivel-primario.jpg
└── nivel-secundario.jpg
```

### 3. Crear Favicon

Generar archivo `favicon.ico` y colocarlo en la raíz del proyecto.

## 🚀 Deployment

### Opción 1: GitHub Pages (Recomendado)

```bash
# Inicializar repositorio
git init
git add .
git commit -m "Sistema Web Escolar - Primera versión"

# Crear repositorio en GitHub
# Luego ejecutar:
git remote add origin https://github.com/tu-usuario/san-marino-escolar.git
git push -u origin main
```

En GitHub:
1. Ir a Settings → Pages
2. Source: Deploy from branch
3. Branch: main
4. Folder: / (root)
5. Save

Tu sitio estará disponible en:
`https://tu-usuario.github.io/san-marino-escolar/`

### Opción 2: Servidor Web Propio

Subir todos los archivos al servidor web mediante FTP/SFTP.

Estructura en servidor:
```
public_html/
├── index.html
├── css/
├── js/
├── images/
└── pages/
```

## ⚙️ Configuración de API (FastAPI)

### CORS Configuration

En tu API FastAPI, agregar:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-usuario.github.io",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Endpoints Requeridos

La API debe implementar los siguientes endpoints:

**Autenticación**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/verify`

**Alumnos**
- `GET /api/v1/alumnos/perfil`
- `GET /api/v1/alumnos/notas`
- `GET /api/v1/alumnos/comunicados`
- `GET /api/v1/alumnos/mensajes`

**Padres**
- `GET /api/v1/padres/perfil`
- `GET /api/v1/padres/hijos`
- `GET /api/v1/padres/cuotas`
- `POST /api/v1/padres/cuotas/{id}/pagar`
- `POST /api/v1/padres/cuotas/{id}/comprobante`
- `GET /api/v1/padres/libreta/{hijo_id}/{trimestre}`

**Docentes**
- `GET /api/v1/docentes/perfil`
- `GET /api/v1/docentes/cursos`
- `POST /api/v1/docentes/notas`

**Preceptores**
- `GET /api/v1/preceptores/perfil`
- `GET /api/v1/preceptores/cursos`

**Admin**
- `GET /api/v1/admin/usuarios`
- `POST /api/v1/admin/usuarios`
- `PUT /api/v1/admin/usuarios/{id}`

**Público**
- `GET /api/v1/publico/noticias`
- `GET /api/v1/publico/cursos`
- `POST /api/v1/publico/contacto`

## 👥 Usuarios de Prueba

Para testing, crear los siguientes usuarios en la base de datos:

```sql
-- Alumno
INSERT INTO usuarios (dni, password, nombre, apellido, role, email)
VALUES ('12345678', 'hashed_password', 'Juan', 'Pérez', 'alumno', 'juan@test.com');

-- Padre
INSERT INTO usuarios (dni, password, nombre, apellido, role, email)
VALUES ('87654321', 'hashed_password', 'María', 'García', 'padre', 'maria@test.com');

-- Docente
INSERT INTO usuarios (dni, password, nombre, apellido, role, email)
VALUES ('11223344', 'hashed_password', 'Carlos', 'Rodríguez', 'docente', 'carlos@test.com');

-- Admin
INSERT INTO usuarios (dni, password, nombre, apellido, role, email)
VALUES ('99887766', 'hashed_password', 'Ana', 'Martínez', 'admin', 'ana@test.com');
```

## 🧪 Testing

### Probar Login

1. Abrir `pages/auth/login.html`
2. Ingresar DNI: `12345678`
3. Ingresar contraseña de prueba
4. Verificar redirección al dashboard correspondiente

### Probar Funcionalidades

- **Alumno**: Verificar visualización de notas
- **Padre**: Verificar gestión de cuotas
- **Docente**: Verificar carga de notas
- **Admin**: Verificar gestión de usuarios

## 🔐 Seguridad

### Configuración HTTPS

Para producción, asegurar que:
- ✅ El sitio usa HTTPS
- ✅ La API usa HTTPS
- ✅ Tokens JWT tienen expiración
- ✅ CORS está configurado correctamente

### Headers de Seguridad

En el servidor, configurar:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

## 📊 Monitoreo

### Logs

Revisar regularmente:
- Console del navegador (F12)
- Logs del servidor API
- Errores de autenticación

### Métricas

Monitorear:
- Tiempo de respuesta de API
- Errores de login
- Uso por rol

## 🆘 Troubleshooting

### Problema: No se puede hacer login

**Solución:**
1. Verificar que la API esté corriendo
2. Revisar URL en `js/config.js`
3. Verificar CORS en la API
4. Revisar console del navegador

### Problema: Imágenes no se cargan

**Solución:**
1. Verificar rutas de imágenes
2. Verificar permisos de archivos
3. Agregar imágenes faltantes

### Problema: Dashboard no carga datos

**Solución:**
1. Verificar que el token sea válido
2. Revisar endpoints de API
3. Verificar rol del usuario

## 📞 Soporte

Para asistencia técnica:
- Email: soporte@institutosanmarino.edu.ar
- Teléfono: +54 (266) 4XX-XXXX

## 📚 Recursos Adicionales

- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [GitHub Pages](https://pages.github.com/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

¡Sistema listo para usar! 🎉
