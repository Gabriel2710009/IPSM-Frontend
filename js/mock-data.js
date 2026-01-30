/**
 * Datos de Ejemplo para Testing
 * Sistema Web Escolar - Instituto San Marino
 */

// USUARIOS DE PRUEBA
const USUARIOS_TEST = {
    alumno: {
        dni: "12345678",
        password: "alumno123",
        nombre: "Juan",
        apellido: "Pérez",
        role: "alumno",
        email: "juan.perez@estudiante.sanmarino.edu.ar",
        nivel: "Secundario",
        anio: 5,
        division: "A",
        legajo: "SEC-2020-001"
    },
    padre: {
        dni: "87654321",
        password: "padre123",
        nombre: "María",
        apellido: "García",
        role: "padre",
        email: "maria.garcia@gmail.com",
        telefono: "+54 266 4123456"
    },
    docente: {
        dni: "11223344",
        password: "docente123",
        nombre: "Carlos",
        apellido: "Rodríguez",
        role: "docente",
        email: "carlos.rodriguez@sanmarino.edu.ar",
        especialidad: "Matemática"
    },
    preceptor: {
        dni: "55667788",
        password: "preceptor123",
        nombre: "Laura",
        apellido: "Martínez",
        role: "preceptor",
        email: "laura.martinez@sanmarino.edu.ar"
    },
    admin: {
        dni: "99887766",
        password: "admin123",
        nombre: "Ana",
        apellido: "Fernández",
        role: "admin",
        email: "ana.fernandez@sanmarino.edu.ar"
    }
};

// NOTAS DE EJEMPLO
const NOTAS_EJEMPLO = [
    {
        id: 1,
        materia: "Matemática",
        trimestre: 1,
        nota: 8,
        fecha: "2025-04-15",
        observaciones: "Muy buen desempeño"
    },
    {
        id: 2,
        materia: "Lengua",
        trimestre: 1,
        nota: 9,
        fecha: "2025-04-20",
        observaciones: "Excelente participación"
    },
    {
        id: 3,
        materia: "Historia",
        trimestre: 1,
        nota: 7,
        fecha: "2025-04-18",
        observaciones: "Debe repasar más"
    },
    {
        id: 4,
        materia: "Biología",
        trimestre: 1,
        nota: 8,
        fecha: "2025-04-22",
        observaciones: "Buen trabajo práctico"
    },
    {
        id: 5,
        materia: "Física",
        trimestre: 1,
        nota: 6,
        fecha: "2025-04-25",
        observaciones: "Debe mejorar en ejercicios"
    },
    {
        id: 6,
        materia: "Matemática",
        trimestre: 2,
        nota: 9,
        fecha: "2025-07-10",
        observaciones: "Excelente evolución"
    },
    {
        id: 7,
        materia: "Lengua",
        trimestre: 2,
        nota: 8,
        fecha: "2025-07-15",
        observaciones: "Mantiene buen nivel"
    }
];

// COMUNICADOS DE EJEMPLO
const COMUNICADOS_EJEMPLO = [
    {
        id: 1,
        titulo: "Inicio del Ciclo Lectivo 2025",
        mensaje: "Les informamos que el ciclo lectivo 2025 dará inicio el día lunes 4 de marzo a las 8:00hs. Se solicita puntualidad.",
        fecha: "2025-02-28",
        adjunto: null
    },
    {
        id: 2,
        titulo: "Reunión de Padres",
        mensaje: "Se convoca a reunión de padres el día viernes 15 de marzo a las 18:00hs en el salón de actos para tratar temas importantes del año lectivo.",
        fecha: "2025-03-01",
        adjunto: null
    },
    {
        id: 3,
        titulo: "Suspensión de Clases",
        mensaje: "Debido a condiciones climáticas adversas, se suspenden las clases del día de mañana. Se informará por este medio sobre la reanudación.",
        fecha: "2025-03-10",
        adjunto: null
    }
];

// MENSAJES DE EJEMPLO
const MENSAJES_EJEMPLO = [
    {
        id: 1,
        remitente: "Prof. Carlos Rodríguez",
        remitente_id: 10,
        destinatario_id: 5,
        asunto: "Tarea de Matemática",
        mensaje: "Recuerda entregar la tarea del capítulo 5 para el próximo viernes.",
        fecha: "2025-01-28T10:30:00",
        leido: false,
        fecha_lectura: null
    },
    {
        id: 2,
        remitente: "Secretaría",
        remitente_id: 1,
        destinatario_id: 5,
        asunto: "Documentación pendiente",
        mensaje: "Se solicita acercar certificado médico a la brevedad.",
        fecha: "2025-01-25T14:00:00",
        leido: true,
        fecha_lectura: "2025-01-26T09:00:00"
    }
];

// CUOTAS DE EJEMPLO
const CUOTAS_EJEMPLO = [
    {
        id: 1,
        hijo_id: 1,
        hijo_nombre: "Juan Pérez",
        mes: "Enero",
        anio: 2025,
        monto: 15000,
        fecha_vencimiento: "2025-01-10",
        pagado: true,
        fecha_pago: "2025-01-08",
        metodo_pago: "Mercado Pago",
        comprobante_url: "https://example.com/comprobante1.pdf"
    },
    {
        id: 2,
        hijo_id: 1,
        hijo_nombre: "Juan Pérez",
        mes: "Febrero",
        anio: 2025,
        monto: 15000,
        fecha_vencimiento: "2025-02-10",
        pagado: true,
        fecha_pago: "2025-02-09",
        metodo_pago: "Transferencia",
        comprobante_url: "https://example.com/comprobante2.pdf"
    },
    {
        id: 3,
        hijo_id: 1,
        hijo_nombre: "Juan Pérez",
        mes: "Marzo",
        anio: 2025,
        monto: 16500,
        fecha_vencimiento: "2025-03-10",
        pagado: false,
        fecha_pago: null,
        metodo_pago: null,
        comprobante_url: null
    },
    {
        id: 4,
        hijo_id: 1,
        hijo_nombre: "Juan Pérez",
        mes: "Abril",
        anio: 2025,
        monto: 16500,
        fecha_vencimiento: "2025-04-10",
        pagado: false,
        fecha_pago: null,
        metodo_pago: null,
        comprobante_url: null
    }
];

// HIJOS DE EJEMPLO (para padres con múltiples hijos)
const HIJOS_EJEMPLO = [
    {
        id: 1,
        nombre: "Juan",
        apellido: "Pérez",
        dni: "12345678",
        nivel: "Secundario",
        anio: 5,
        division: "A",
        promedio: 8.2,
        asistencia: 95,
        cuotas_pendientes: 2
    },
    {
        id: 2,
        nombre: "Sofía",
        apellido: "Pérez",
        dni: "87654322",
        nivel: "Primario",
        anio: 3,
        division: "B",
        promedio: 9.1,
        asistencia: 98,
        cuotas_pendientes: 1
    }
];

// NOTICIAS DE EJEMPLO
const NOTICIAS_EJEMPLO = [
    {
        id: 1,
        titulo: "Inicio del Ciclo Lectivo 2025",
        resumen: "Este lunes 4 de marzo damos inicio al nuevo ciclo lectivo con renovadas energías y proyectos innovadores.",
        contenido: "Con gran alegría damos la bienvenida al ciclo lectivo 2025. Este año trae importantes novedades pedagógicas y tecnológicas que beneficiarán a toda nuestra comunidad educativa.",
        fecha: "2025-02-28",
        imagen: "images/noticias/inicio-ciclo.jpg",
        autor: "Dirección"
    },
    {
        id: 2,
        titulo: "Nuestros alumnos destacados en las Olimpíadas de Matemática",
        resumen: "Felicitamos a nuestros estudiantes por su excelente desempeño en las Olimpíadas Provinciales de Matemática.",
        contenido: "Los alumnos Juan Pérez, María López y Carlos García obtuvieron medallas en las Olimpíadas Provinciales de Matemática, representando dignamente a nuestro instituto.",
        fecha: "2025-02-20",
        imagen: "images/noticias/olimpiadas.jpg",
        autor: "Departamento de Matemática"
    },
    {
        id: 3,
        titulo: "Nueva Sala de Informática",
        resumen: "Inauguramos nuestra nueva sala de informática equipada con tecnología de última generación.",
        contenido: "El instituto invirtió en 30 nuevas computadoras de última generación para mejorar la experiencia de aprendizaje de nuestros estudiantes en el área de tecnología.",
        fecha: "2025-02-15",
        imagen: "images/noticias/sala-informatica.jpg",
        autor: "Dirección"
    }
];

// CURSOS DE EJEMPLO (para docentes)
const CURSOS_EJEMPLO = [
    {
        id: 1,
        nivel: "Secundario",
        anio: 5,
        division: "A",
        turno: "Mañana",
        cantidad_alumnos: 28,
        materias_asignadas: [
            {
                id: 1,
                nombre: "Matemática",
                horas_semanales: 5
            }
        ]
    },
    {
        id: 2,
        nivel: "Secundario",
        anio: 5,
        division: "B",
        turno: "Tarde",
        cantidad_alumnos: 25,
        materias_asignadas: [
            {
                id: 2,
                nombre: "Matemática",
                horas_semanales: 5
            }
        ]
    }
];

// RESPUESTAS DE API MOCK
const API_RESPONSES = {
    // Login exitoso
    login_success: {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OCIsIm5hbWUiOiJKdWFuIFDDqXJleiIsInJvbGUiOiJhbHVtbm8iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        token_type: "bearer",
        user: USUARIOS_TEST.alumno
    },
    
    // Error de login
    login_error: {
        detail: "DNI o contraseña incorrectos"
    },
    
    // Perfil de alumno
    alumno_perfil: USUARIOS_TEST.alumno,
    
    // Notas de alumno
    alumno_notas: NOTAS_EJEMPLO,
    
    // Comunicados
    comunicados: COMUNICADOS_EJEMPLO,
    
    // Mensajes
    mensajes: MENSAJES_EJEMPLO,
    
    // Hijos (para padre)
    padre_hijos: HIJOS_EJEMPLO,
    
    // Cuotas
    padre_cuotas: CUOTAS_EJEMPLO,
    
    // Noticias públicas
    noticias_publicas: NOTICIAS_EJEMPLO,
    
    // Cursos (para docente)
    docente_cursos: CURSOS_EJEMPLO
};

// INSTRUCCIONES DE USO
console.log(`
════════════════════════════════════════════════════
  DATOS DE EJEMPLO - SISTEMA WEB ESCOLAR SAN MARINO
════════════════════════════════════════════════════

USUARIOS DE PRUEBA:
-------------------
Alumno:
  DNI: 12345678
  Password: alumno123

Padre:
  DNI: 87654321
  Password: padre123

Docente:
  DNI: 11223344
  Password: docente123

Preceptor:
  DNI: 55667788
  Password: preceptor123

Admin:
  DNI: 99887766
  Password: admin123

NOTA: Estos datos son solo para testing.
En producción, usar la API real con datos reales.

════════════════════════════════════════════════════
`);

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        USUARIOS_TEST,
        NOTAS_EJEMPLO,
        COMUNICADOS_EJEMPLO,
        MENSAJES_EJEMPLO,
        CUOTAS_EJEMPLO,
        HIJOS_EJEMPLO,
        NOTICIAS_EJEMPLO,
        CURSOS_EJEMPLO,
        API_RESPONSES
    };
}
