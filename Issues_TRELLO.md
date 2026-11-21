# Backlog de Ingeniería y Plan de Trabajo — App Dra. Natalia Alfonso
> **Ecosistema Digital Interactivo (PWA Multi-dispositivo) para Medicina Estética, Longevidad y Nutrición**  
> **Referencia Técnica & Presupuestaria:** 3 Etapas · 12 Vistas Principales · 265 a 320 hs · Inversión Total: USD 3.000  
> **Formato:** Tarjetas Atómicas e Independientes listas para volcado en Tablero Trello (INVEST).

---

## Resumen Ejecutivo de Tiempos y Presupuesto por Etapa

| Etapa | Enfoque de la Etapa | Vistas y Funcionalidades Principales | Duración Estimada | Esfuerzo de Ingeniería | Inversión |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ETAPA 1 (MVP)** | Base, Agenda, Citas y Micro-Videos | Login, Dashboard Consultorio, Padrón y Alta, Agenda con Video, "Mi Próxima Cita" (Paciente). | 3 a 4 semanas | 110 a 130 hs | USD 1.250 |
| **ETAPA 2** | Seguimiento Continuo y Puente Reactivo | Carga semanal de avance, Gráficos en vivo ("Mi Evolución" y Ficha Médica), Feed de actividad, Suplementación y PDFs. | 3 semanas | 90 a 110 hs | USD 1.000 |
| **ETAPA 3** | Comunicación Privada y Cierre | Chat individual consultorio-paciente, Botonera rápida de 1 clic, Avisos/Notificaciones, QA E2E y Despliegue Producción. | 2 a 3 semanas | 65 a 80 hs | USD 750 |
| **TOTALES** | **Plataforma Completa Multi-dispositivo** | **12 Vistas en Mac, iPad, iPhone y Android** | **8 a 10 semanas** | **265 a 320 hs** | **USD 3.000** |

---

## Convención de Etiquetas para Trello

- `Etapa 1 (MVP)`: Color Rosa
- `Etapa 2 (Seguimiento)`: Color Púrpura / Violeta
- `Etapa 3 (Cierre)`: Color Azul Oscuro
- `Área: Backend`: Color Verde Azulado
- `Área: Frontend`: Color Azul Claro
- `Área: DevOps`: Color Naranja
- `Área: QA / Seguridad`: Color Amarillo
- `Prioridad Alta / Urgente`: Color Rojo
- `Prioridad Media`: Color Amarillo Claro
- `Completado / Entregado`: Color Verde Lima

---

## ETAPA 1: MVP Funcional — Base, Agenda, Citas y Micro-Videos (110 a 130 hs | USD 1.250)

### [ISSUE-01] Configuración de Repositorio, Arquitectura Base Next.js, PWA y Variables de Diseño

- **Area:** **DevOps / Frontend**
- **Prioridad:** Urgente
- **Módulo(s):** `src/app`, `src/styles`, `public`
- **Archivos Afectados:** `package.json`, `next.config.mjs`, `tailwind.config.ts`, `src/styles/globals.css`, `public/manifest.json`, `src/app/layout.tsx`
- **Descripción:** Inicializar el proyecto con Next.js, TypeScript y Tailwind CSS, configurando los Service Workers base y el Web App Manifest para habilitar el comportamiento PWA instalable en iOS/Android y macOS. Establecer en `tailwind.config.ts` y `globals.css` las variables de diseño (paleta cromática y tipografías provistas por Serie Cero Design) y los tres puntos de quiebre responsivos obligatorios: Mobile (`<768px`), Tablet iPad (`768px-1024px`) y Desktop Mac (`>1024px`).
- **Criterios de Aceptación:**
  - El proyecto compila sin errores y cuenta con scripts de formateo y linting estandarizados.
  - El archivo `manifest.json` y la configuración de Service Workers permiten la instalación en pantalla de inicio.
  - Los tres breakpoints responsivos y tokens de diseño están disponibles globalmente en el layout principal.
- **Dependencias:** Ninguna
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Frontend` (Azul Claro), `Área: DevOps` (Naranja), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-02A] Modelado de Base de Datos Relacional (Prisma + PostgreSQL) y Políticas RLS

- **Area:** Backend
- **Prioridad:** Urgente
- **Módulo(s):** `prisma`, `src/lib/db`
- **Archivos Afectados:** `prisma/schema.prisma`, `src/lib/db/prisma.ts`, `prisma/migrations/*`
- **Descripción:** Diseñar el esquema relacional en PostgreSQL (vía Supabase y Prisma ORM) contemplando usuarios con roles (`MEDICA`, `NUTRICION`, `RECEPCION`, `PACIENTE`), fichas clínicas base de pacientes, citas/turnos, catálogo de videos, registros biométricos, suplementación/tratamientos, documentos PDF y mensajes de chat. Implementar políticas de seguridad por fila (Row-Level Security) para garantizar el aislamiento estricto de los expedientes clínicos.
- **Criterios de Aceptación:**
  - Las migraciones de Prisma se ejecutan limpiamente en el entorno de desarrollo y staging sin inconsistencias.
  - Las políticas RLS restringen la lectura y escritura de historias clínicas según el rol y sesión del usuario.
  - Tipos e interfaces de Prisma sincronizados con el código TypeScript.
- **Dependencias:** [ISSUE-01]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-02B] Script de Migración y Normalización del Padrón Histórico (~200 Pacientes)

- **Area:** Backend / Datos
- **Prioridad:** Alta
- **Módulo(s):** `scripts`
- **Archivos Afectados:** `scripts/migrate-patients-csv.ts`, `scripts/templates/pacientes_ejemplo.csv`
- **Descripción:** Desarrollar el script de ingeniería bonificado en la Etapa 1 para importar el padrón histórico (~200 pacientes) desde el archivo CSV/Excel del software administrativo previo. El script normaliza nombres, teléfonos, fechas de nacimiento y valida que no existan DNIs duplicados antes de insertar en la base de datos.
- **Criterios de Aceptación:**
  - Procesa e inserta correctamente los ~200 registros de pacientes en PostgreSQL.
  - Genera un log claro de inconsistencias y omite o alerta ante duplicados de DNI sin interrumpir el proceso.
  - Se puede ejecutar de manera idempotente en staging y producción.
- **Dependencias:** [ISSUE-02A]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-03] Backend de Autenticación Segura y Middleware de Enrutamiento por Rol (Bloque 1 - Parte A)

- **Area:** Backend
- **Prioridad:** Urgente
- **Módulo(s):** `src/app/api/auth`, `src/middleware`, `src/lib/auth`
- **Archivos Afectados:** `src/middleware.ts`, `src/lib/auth/session.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`
- **Descripción:** Implementar la lógica de autenticación con Supabase Auth / JWT que valida credenciales de acceso, identifica el rol asignado (`MEDICA`, `NUTRICION`, `RECEPCION`, `PACIENTE`) y protege las rutas mediante `middleware.ts` para cumplir con el requerimiento RF-01.
- **Criterios de Aceptación:**
  - Un usuario con rol `PACIENTE` solo puede acceder a `/paciente/*` y es bloqueado si intenta ingresar a `/consultorio/*`.
  - Los perfiles profesionales (Natalia, Nutrición y Recepción) acceden al entorno del consultorio según sus permisos.
  - Manejo de sesiones persistentes seguras en dispositivos de confianza (Mac/iPhone de la profesional).
- **Dependencias:** [ISSUE-02A]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-04] UI Pantalla de Bienvenida, Login Diferenciado y Asistente de Instalación PWA (Bloque 1 - Parte B | Bloque: 20 a 25 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(auth)/login`, `src/components/pwa`, `src/components/auth`
- **Archivos Afectados:** `src/app/(auth)/login/page.tsx`, `src/components/auth/LoginForm.tsx`, `src/components/pwa/InstallPromptModal.tsx`
- **Descripción:** Construir la Vista 1 (Login de Paciente y Login del Equipo). Incluye el formulario de acceso con manejo de estados de carga/error y el modal interactivo que detecta si el usuario navega desde Safari (iOS/macOS) o Chrome (Android/Desktop) para asistirlo paso a paso en la instalación del ícono en su pantalla de inicio.
- **Criterios de Aceptación:**
  - Diseño responsivo adaptado a Mobile (`<768px`), iPad (`768-1024px`) y Desktop Mac (`>1024px`).
  - El modal de instalación se muestra adecuadamente cuando la app no está corriendo en modo standalone.
  - Redirección fluida en menos de 1 segundo hacia la pantalla correspondiente tras iniciar sesión.
- **Dependencias:** [ISSUE-01], [ISSUE-03]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-05] API y Consultas en Tiempo Real para el Dashboard del Consultorio (Bloque 2 - Parte A)

- **Area:** Backend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/api/dashboard`, `src/services/dashboard`
- **Archivos Afectados:** `src/app/api/dashboard/summary/route.ts`, `src/services/dashboard/metricsService.ts`, `src/hooks/useRealtimeDashboard.ts`
- **Descripción:** Desarrollar los endpoints y la suscripción en tiempo real (RF-02 y RNF-02) que alimentan el Panel Central del Consultorio: total de pacientes activos, listado de turnos agendados para la fecha actual y filtro de pacientes pendientes de atención en sala.
- **Criterios de Aceptación:**
  - El endpoint devuelve las métricas consolidadas del día en menos de 300ms.
  - El hook `useRealtimeDashboard.ts` escucha cambios en turnos y pacientes, actualizando la vista en Mac, iPad e iPhone en menos de 1 segundo sin recargar la página.
- **Dependencias:** [ISSUE-02A], [ISSUE-03]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-06] UI Panel Central del Consultorio / Dashboard de Resumen Diario (Bloque 2 - Parte B | Bloque: 25 a 30 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(consultorio)/dashboard`, `src/components/dashboard`, `src/components/layout`
- **Archivos Afectados:** `src/app/(consultorio)/dashboard/page.tsx`, `src/components/dashboard/KpiCards.tsx`, `src/components/dashboard/TodayAppointmentsList.tsx`, `src/components/layout/ConsultorioSidebar.tsx`
- **Descripción:** Maquetar y conectar el tablero principal de inicio (Vista Consultorio 2) que ven Natalia, Nutrición y Recepción al abrir la app. Incluye las tarjetas de indicadores (total de pacientes activos, turnos de hoy, pendientes), listado de la jornada y menú de navegación lateral adaptable a escritorio Mac, iPad y vista móvil en iPhone.
- **Criterios de Aceptación:**
  - En Mac (`>1024px`) muestra disposición multicolumna amplia; en iPad (`768-1024px`) adapta la barra lateral; en iPhone (`<768px`) convierte la navegación en menú compacto inferior.
  - Permite conmutar el estado de un turno del día (Pendiente / En atención / Completado) con reflejo instantáneo en todos los dispositivos conectados.
- **Dependencias:** [ISSUE-05]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-07A] API REST y Búsqueda Optimizada de Pacientes (Bloque 3 - Parte A)

- **Area:** Backend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/api/pacientes`, `src/services/pacientes`
- **Archivos Afectados:** `src/app/api/pacientes/route.ts`, `src/app/api/pacientes/[id]/route.ts`, `src/services/pacientes/patientService.ts`
- **Descripción:** Implementar la lógica del servidor y endpoints CRUD para el padrón de pacientes (RF-03). Incluye endpoint de búsqueda optimizada con debounce por DNI, nombre o apellido, paginación eficiente y validación de campos requeridos (nombre, teléfono, fecha de nacimiento, especialidad).
- **Criterios de Aceptación:**
  - La búsqueda por coincidencia parcial de nombre o DNI responde en menos de 150ms.
  - Operaciones de creación y actualización de pacientes validan unicidad de DNI y estructura de teléfono.
- **Dependencias:** [ISSUE-02A], [ISSUE-03]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-07B] UI Padrón General, Buscador Instantáneo y Alta de Pacientes (Bloque 3 - Parte B | Bloque: 25 a 30 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(consultorio)/pacientes`, `src/components/pacientes`
- **Archivos Afectados:** `src/app/(consultorio)/pacientes/page.tsx`, `src/components/pacientes/PatientSearchTable.tsx`, `src/components/pacientes/PatientFormModal.tsx`
- **Descripción:** Desarrollar la Vista Consultorio 3 (Padrón de Pacientes). Construir la tabla interactiva de pacientes con input de búsqueda reactiva (debounce `<250ms`), vista rápida de ficha personal base y formulario modal para dar de alta o editar pacientes asignando su área de atención (cirugía, estética o nutrición).
- **Criterios de Aceptación:**
  - El buscador filtra en vivo a medida que el profesional escribe sin recargar la pantalla.
  - El modal de alta valida en tiempo real y actualiza la lista de pacientes de inmediato al guardar.
  - Interfaz responsiva con scroll horizontal contenido en pantallas iPad y móviles.
- **Dependencias:** [ISSUE-06], [ISSUE-07A]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-08] Almacenamiento Cloudflare R2 / S3 y Catálogo de Micro-Videos de 5 a 15s (Bloque 4 - Parte A)

- **Area:** Backend / DevOps
- **Prioridad:** Alta
- **Módulo(s):** `src/lib/storage`, `src/app/api/videos`
- **Archivos Afectados:** `src/lib/storage/r2Client.ts`, `src/app/api/videos/upload-url/route.ts`, `src/app/api/videos/route.ts`
- **Descripción:** Configurar el bucket de almacenamiento en Cloudflare R2 (o AWS S3) con emisión de URLs prefirmadas (presigned URLs) para subida y lectura. Desarrollar el catálogo de micro-videos donde cada cápsula de 5 a 15 segundos queda catalogada y asociada a un procedimiento del consultorio (RF-04 y RNF-03).
- **Criterios de Aceptación:**
  - Generación de URL prefirmada segura para subida de videos MP4/WebM de hasta 20MB.
  - Catálogo persistido en base de datos con título, duración, URL pública/firmada y tipo de procedimiento.
  - Streaming optimizado de video sin costos elevados de salida (egress fees en R2).
- **Dependencias:** [ISSUE-02A]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Backend` (Verde Azulado), `Área: DevOps` (Naranja), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-09A] Backend de Agenda de Citas y Vinculación Automática de Videos (Bloque 4 - Parte B1)

- **Area:** Backend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/api/turnos`, `src/services/turnos`
- **Archivos Afectados:** `src/app/api/turnos/route.ts`, `src/app/api/turnos/[id]/route.ts`, `src/services/turnos/appointmentService.ts`
- **Descripción:** Crear los endpoints de agenda de turnos para agendar, reprogramar y cancelar citas médicas. Al seleccionar el procedimiento médico al crear el turno, la lógica del servidor vincula de forma automática el micro-video explicativo de 5 a 15s correspondiente del catálogo.
- **Criterios de Aceptación:**
  - Endpoint de creación de turno recibe fecha, hora, profesional, paciente y procedimiento, retornando el video asociado.
  - Manejo de estados del turno (`PENDIENTE`, `EN_CONSULTA`, `COMPLETADO`, `CANCELADO`).
  - Notificación de cambio de estado hacia el canal Realtime del dashboard.
- **Dependencias:** [ISSUE-07A], [ISSUE-08]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-09B] UI Calendario de Citas y Modal de Asignación en Consultorio (Bloque 4 - Parte B2 | Bloque: 20 a 25 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(consultorio)/agenda`, `src/components/agenda`, `src/components/videos`
- **Archivos Afectados:** `src/app/(consultorio)/agenda/page.tsx`, `src/components/agenda/AssignAppointmentModal.tsx`, `src/components/agenda/CalendarView.tsx`, `src/components/videos/VideoLibraryManager.tsx`
- **Descripción:** Desarrollar la Vista Consultorio 4 (Agenda de Citas y Biblioteca de Videos). Construir la vista de calendario con selector de días/horas, modal de asignación con autocompletado de pacientes, selector de tratamiento que previsualiza el video correspondiente y panel para cargar nuevas cápsulas de video por única vez.
- **Criterios de Aceptación:**
  - Vista diaria y semanal fluida en pantallas de Mac, iPad y móvil.
  - Al seleccionar un procedimiento del desplegable, muestra la miniatura del video vinculado de forma automática.
  - La asignación de la cita actualiza la vista del consultorio y queda disponible para el portal de la paciente.
- **Dependencias:** [ISSUE-07B], [ISSUE-09A]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-10] UI Portal de la Paciente: Pantalla "Mi Próxima Cita" y Reproductor Nativo de Video Corto (Bloque 5 | Bloque: 20 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(paciente)/inicio`, `src/components/paciente`, `src/components/layout`
- **Archivos Afectados:** `src/app/(paciente)/inicio/page.tsx`, `src/components/paciente/NextAppointmentCard.tsx`, `src/components/paciente/ShortVideoPlayer.tsx`, `src/components/layout/PacienteBottomNav.tsx`
- **Descripción:** Construir la Vista Móvil 2 (Pantalla principal de la paciente al abrir la app en su teléfono). Muestra con alta legibilidad el día, horario, profesional a cargo (Natalia o Nutrición), procedimiento agendado e indicaciones previas, integrando un reproductor de video nativo (`playsinline`) para ver el video corto de 5 a 15s de Natalia sin salir de la app ni abrir pestañas externas.
- **Criterios de Aceptación:**
  - El video inicia su reproducción en menos de 1.5 segundos en redes móviles 4G/WiFi.
  - Si el consultorio reprograma el turno desde la Mac, la vista de la paciente se actualiza en vivo sin recargar la aplicación.
  - Barra de navegación inferior móvil (Bottom Nav) configurada para la navegación de la paciente.
- **Dependencias:** [ISSUE-04], [ISSUE-09B]
- **Etiquetas:** `Etapa 1 (MVP)` (Rosa), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

## ETAPA 2: Seguimiento Continuo — Puente Reactivo, Gráficos y Suplementación (90 a 110 hs | USD 1.000)

### [ISSUE-11A] Backend del "Puente Reactivo" y API de Biometría (Bloque 1 - Parte A)

- **Area:** Backend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/api/biometricas`, `src/services/biometricas`
- **Archivos Afectados:** `src/app/api/biometricas/route.ts`, `src/services/biometricas/biometricService.ts`
- **Descripción:** Diseñar el servicio y endpoints del "Puente Reactivo" (RF-05) para recibir y validar las cargas semanales de la paciente: peso corporal (kg), saturación de oxígeno en sangre (%), medidas corporales y notas. Aplica validación de rangos biológicos lógicos, fechado automático del servidor y emisión del evento en tiempo real hacia los canales de Supabase/WebSockets del consultorio.
- **Criterios de Aceptación:**
  - Valida que los datos ingresados se encuentren en rangos plausibles (ej. saturación entre 70% y 100%, peso > 0).
  - Al registrar una medición, el evento reactivo se emite al consultorio en menos de 1 segundo.
- **Dependencias:** [ISSUE-10]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-11B] UI Pantalla de la Paciente "Cargar mi Avance" (Bloque 1 - Parte B | Bloque: 20 a 25 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(paciente)/cargar-avance`, `src/components/biometricas`
- **Archivos Afectados:** `src/app/(paciente)/cargar-avance/page.tsx`, `src/components/biometricas/BiometricInputForm.tsx`
- **Descripción:** Desarrollar la Vista Móvil 3 ("Cargar mi Avance"). Formulario móvil ágil y limpio con foco en teclados numéricos directos para que la paciente anote sus controles desde su hogar (peso, saturometría, cintura/cadera) en pocos segundos, con confirmación visual instantánea.
- **Criterios de Aceptación:**
  - Los inputs activan el teclado numérico en teléfonos iOS y Android.
  - Validación visual inmediata antes de enviar y feedback de guardado exitoso.
  - El botón de guardado previene dobles envíos accidentales.
- **Dependencias:** [ISSUE-11A]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-12A] UI Gráficos Interactivos de Evolución Biométrica para Paciente: "Mi Evolución" (Bloque 2 - Parte A | 12 a 15 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(paciente)/mi-evolucion`, `src/components/charts`
- **Archivos Afectados:** `src/app/(paciente)/mi-evolucion/page.tsx`, `src/components/charts/EvolutionLineChart.tsx`
- **Descripción:** Construir la Vista Móvil 4 ("Mi Evolución"). Implementar gráficos de líneas interactivos y motivadores (utilizando Recharts o Chart.js) donde la paciente observa su evolución cronológica de peso y medidas a lo largo de las semanas, con filtros de periodo (último mes, 3 meses, histórico completo).
- **Criterios de Aceptación:**
  - Renderizado táctil con tooltips legibles en pantallas móviles pequeñas.
  - La curva se adapta a cambios de orientación y escala de manera fluida.
- **Dependencias:** [ISSUE-11B]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-12B] UI Ficha Clínica Integral del Consultorio con Curvas Evolutivas en Vivo (Bloque 2 - Parte B | Bloque Total: 25 a 30 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(consultorio)/pacientes/[id]`, `src/components/pacientes`, `src/components/charts`
- **Archivos Afectados:** `src/app/(consultorio)/pacientes/[id]/page.tsx`, `src/components/pacientes/ClinicalRecordView.tsx`, `src/components/charts/DoctorMultiMetricChart.tsx`
- **Descripción:** Construir la Vista Consultorio 5 (Ficha Clínica Integral del Paciente). Permite a la Dra. Natalia y al equipo de Nutrición inspeccionar en pantalla grande de Mac o iPad la curva evolutiva completa de la paciente antes de atenderla en consulta, con comparación simultánea de peso, saturación y fechas de procedimientos.
- **Criterios de Aceptación:**
  - Si la paciente carga un dato desde su celular, la gráfica de la ficha médica se actualiza en vivo sin recargar la página.
  - Permite alternar y superponer métricas clínicas con escalas diferenciadas.
- **Dependencias:** [ISSUE-11A], [ISSUE-12A]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-13] Feed Reactivo y Panel de Avisos de Actividad Reciente en Consultorio (Bloque 3 | Bloque: 15 a 20 hs)

- **Area:** Frontend / Backend
- **Prioridad:** Media
- **Módulo(s):** `src/app/api/actividad-reciente`, `src/components/dashboard`
- **Archivos Afectados:** `src/app/api/actividad-reciente/route.ts`, `src/components/dashboard/RecentActivityFeed.tsx`, `src/app/(consultorio)/dashboard/page.tsx`
- **Descripción:** Implementar la bandeja de novedades dentro del panel principal de Natalia y Nutrición. Lista en orden cronológico a todas las pacientes que actualizaron su peso, saturación o controles en las últimas 24/48 horas o durante la semana, permitiendo abrir su ficha clínica con un solo clic.
- **Criterios de Aceptación:**
  - Cada nuevo registro ingresado por una paciente se posiciona en el tope del feed con distintivo visual de "Nuevo".
  - Al pulsar una notificación del feed, navega directamente a la Ficha Clínica Integral de esa paciente en la sección de su gráfico actualizado.
- **Dependencias:** [ISSUE-11A], [ISSUE-12B]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Backend` (Verde Azulado), `Área: Frontend` (Azul Claro), `Prioridad Media` (Amarillo Claro)

---

### [ISSUE-14A] Backend de Prescripción de Tratamientos, Suplementación y Nutrición (Bloque 4 - Parte A)

- **Area:** Backend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/api/tratamientos`, `src/services/tratamientos`
- **Archivos Afectados:** `src/app/api/tratamientos/route.ts`, `src/app/api/tratamientos/[id]/route.ts`, `src/services/tratamientos/treatmentService.ts`
- **Descripción:** Desarrollar los endpoints de prescripción médica (RF-06). Permite al equipo profesional registrar suplementos, vitaminas, pautas de medicación e instrucciones pre/post-quirúrgicas asociadas a la ficha de la paciente, con dosis, frecuencia, fechas de vigencia y estado (`ACTIVO` o `FINALIZADO`).
- **Criterios de Aceptación:**
  - Operaciones CRUD completas para tratamientos y suplementación.
  - Endpoints con filtros por estado para separar esquemas vigentes de prescripciones históricas.
- **Dependencias:** [ISSUE-07A]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-14B] UI Gestor de Tratamientos en Consultorio y Vista Móvil del Paciente (Bloque 4 - Parte B | Bloque: 15 a 20 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/components/tratamientos`, `src/app/(paciente)/mis-suplementos`
- **Archivos Afectados:** `src/components/tratamientos/TreatmentManager.tsx`, `src/app/(paciente)/mis-suplementos/page.tsx`
- **Descripción:** Maquetar la consola de prescripción dentro de la Ficha Médica del Consultorio y construir la Vista Móvil 5 ("Mis Suplementos e Indicaciones") para la paciente. Natalia y Nutrición prescriben o finalizan tratamientos en un clic, y la paciente consulta sus indicaciones ordenadas con tipografía clara y sin sobrecarga visual.
- **Criterios de Aceptación:**
  - El profesional conmuta el estado de un suplemento de Activo a Finalizado en un solo toque.
  - La paciente accede a sus pautas activas en modo lectura protegida en su teléfono.
- **Dependencias:** [ISSUE-12B], [ISSUE-14A]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-15] Repositorio Seguro de Estudios Médicos y Planes Nutricionales en PDF (Bloque 5 | Bloque: 15 hs)

- **Area:** Backend / Frontend
- **Prioridad:** Media
- **Módulo(s):** `src/app/api/documentos-pdf`, `src/components/documentos`
- **Archivos Afectados:** `src/app/api/documentos-pdf/upload-url/route.ts`, `src/app/api/documentos-pdf/route.ts`, `src/components/documentos/PdfUploader.tsx`, `src/components/documentos/PatientPdfList.tsx`
- **Descripción:** Implementar el módulo de almacenamiento y visualización de archivos PDF (RF-06: análisis clínicos, indicaciones quirúrgicas, consentimientos y planes nutricionales). El consultorio sube archivos hacia Cloudflare R2 / S3 mediante URLs firmadas y la paciente los consulta o descarga directamente desde su celular en la sección de documentos.
- **Criterios de Aceptación:**
  - Subida de archivos PDF validando peso (máx. 15MB) y tipo de archivo seguro.
  - La paciente descarga sus documentos mediante URLs firmadas de vigencia temporal, asegurando la privacidad de su historia clínica.
- **Dependencias:** [ISSUE-08], [ISSUE-14B]
- **Etiquetas:** `Etapa 2 (Seguimiento)` (Púrpura), `Área: Backend` (Verde Azulado), `Área: Frontend` (Azul Claro), `Prioridad Media` (Amarillo Claro)

---

## ETAPA 3: Comunicación Privada — Chat Interno, Botonera y QA Final (65 a 80 hs | USD 750)

### [ISSUE-16] Motor Backend Realtime de Mensajería Confidencial Consultorio-Paciente (Bloque 1 - Parte A)

- **Area:** Backend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/api/mensajeria`, `src/services/chat`, `src/hooks/useRealtimeChat.ts`
- **Archivos Afectados:** `src/app/api/mensajeria/conversaciones/route.ts`, `src/app/api/mensajeria/mensajes/route.ts`, `src/hooks/useRealtimeChat.ts`
- **Descripción:** Desarrollar la arquitectura de base de datos y canales WebSockets / Supabase Realtime para la mensajería privada 1 a 1 entre el consultorio (Natalia o Nutrición) y cada paciente (RF-07 y RNF-02). Contempla persistencia cronológica, marcas de hora, estados de entrega/lectura y opción de borrado lógico.
- **Criterios de Aceptación:**
  - Los mensajes se entregan y renderizan en vivo en menos de 1 segundo en ambos extremos.
  - El historial queda protegido bajo RLS, restringido estrictamente a la paciente y al equipo médico.
- **Dependencias:** [ISSUE-02A], [ISSUE-03]
- **Etiquetas:** `Etapa 3 (Cierre)` (Azul Oscuro), `Área: Backend` (Verde Azulado), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-17] UI Consola de Chat Consultorio y Chat Móvil de Paciente (Bloque 1 - Parte B | Bloque: 30 a 35 hs)

- **Area:** Frontend
- **Prioridad:** Alta
- **Módulo(s):** `src/app/(consultorio)/mensajeria`, `src/app/(paciente)/chat`, `src/components/chat`
- **Archivos Afectados:** `src/app/(consultorio)/mensajeria/page.tsx`, `src/app/(paciente)/chat/page.tsx`, `src/components/chat/ConversationSidebar.tsx`, `src/components/chat/ChatWindow.tsx`
- **Descripción:** Construir la Vista Consultorio 6 (Consola con lista de pacientes, buscador por DNI/nombre y panel de chat activo) y la Vista Móvil 6 (Pantalla de chat directo de la paciente en su celular).
- **Criterios de Aceptación:**
  - En Mac/iPad presenta diseño a dos columnas (lista a la izquierda, conversación a la derecha); en móvil navega de forma limpia entre la lista y la charla activa.
  - Desplazamiento automático al último mensaje recibido y marcas visuales de lectura.
- **Dependencias:** [ISSUE-16]
- **Etiquetas:** `Etapa 3 (Cierre)` (Azul Oscuro), `Área: Frontend` (Azul Claro), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-18] Botonera de Mensajes Rápidos / Plantillas Preconfiguradas de 1 Clic (Bloque 2 | Bloque: 15 a 20 hs)

- **Area:** Frontend / Backend
- **Prioridad:** Media
- **Módulo(s):** `src/app/api/plantillas-chat`, `src/components/chat`
- **Archivos Afectados:** `src/app/api/plantillas-chat/route.ts`, `src/components/chat/QuickTemplatesBar.tsx`, `src/components/chat/TemplateSettingsModal.tsx`
- **Descripción:** Implementar la fila de botones de respuesta rápida situada inmediatamente bajo el input del chat del consultorio (RF-07). Permite disparar o pre-cargar mensajes habituales en un toque (_"Recordatorio: Asistir en ayunas"_, _"Tus estudios ya están disponibles en tu ficha"_, _"Recordá registrar tu peso semanal"_), con panel para crear o editar plantillas.
- **Criterios de Aceptación:**
  - Al pulsar una plantilla se inserta o envía el texto preconfigurado en 1 clic, reduciendo el tipeo repetitivo.
  - Las plantillas se sincronizan entre la Mac, el iPad y el iPhone de la profesional.
- **Dependencias:** [ISSUE-17]
- **Etiquetas:** `Etapa 3 (Cierre)` (Azul Oscuro), `Área: Frontend` (Azul Claro), `Área: Backend` (Verde Azulado), `Prioridad Media` (Amarillo Claro)

---

### [ISSUE-19] Sistema de Avisos de Turnos y Bandeja de Novedades del Consultorio (Bloque 3 - Parte A | 10 a 12 hs)

- **Area:** Backend / Frontend
- **Prioridad:** Media
- **Módulo(s):** `src/app/api/avisos`, `src/components/notificaciones`
- **Archivos Afectados:** `src/app/api/avisos/route.ts`, `src/components/notificaciones/PatientAlertsInbox.tsx`, `src/components/notificaciones/BroadcastNoticeModal.tsx`
- **Descripción:** Implementar el módulo de avisos y notificaciones en el celular de las pacientes: recordatorios de citas programadas, alertas de nuevos estudios subidos y comunicados generales del consultorio.
- **Criterios de Aceptación:**
  - La paciente visualiza una bandeja de notificaciones con insignias de avisos no leídos.
  - El consultorio puede emitir recordatorios individuales o avisos generales desde el panel de control.
- **Dependencias:** [ISSUE-09A], [ISSUE-17]
- **Etiquetas:** `Etapa 3 (Cierre)` (Azul Oscuro), `Área: Backend` (Verde Azulado), `Área: Frontend` (Azul Claro), `Prioridad Media` (Amarillo Claro)

---

### [ISSUE-20A] QA Exhaustivo Multi-dispositivo (Safari/Chrome) y Auditoría de Seguridad RNF-04 (Bloque 3 - Parte B1 | 10 a 12 hs)

- **Area:** QA / Seguridad
- **Prioridad:** Urgente
- **Módulo(s):** `tests/e2e`, `tests/security`
- **Archivos Afectados:** `playwright.config.ts`, `tests/e2e/flujo-completo.spec.ts`
- **Descripción:** Ejecutar el plan integral de pruebas de extremo a extremo (E2E) en las 12 vistas de la plataforma validando compatibilidad visual y operativa en Safari (macOS, iPadOS, iOS) y Chrome (Android, Desktop). Auditar el cumplimiento estricto del requerimiento RNF-04: verificar que ningún paciente pueda acceder por URL o API a datos clínicos o archivos de terceros.
- **Criterios de Aceptación:**
  - 100% de los flujos críticos probados en Mobile (`<768px`), Tablet (`768-1024px`) y Desktop (`>1024px`) sin desbordes de interfaz.
  - Verificación de seguridad clínica: RLS bloquea intentos de acceso cruzado entre expedientes de pacientes.
  - Reproducción de micro-videos fluida (`<1.5s`) sin bloqueos en redes móviles.
- **Dependencias:** [ISSUE-01] al [ISSUE-19]
- **Etiquetas:** `Etapa 3 (Cierre)` (Azul Oscuro), `Área: QA / Seguridad` (Amarillo), `Prioridad Alta / Urgente` (Rojo)

---

### [ISSUE-20B] Despliegue en Producción, Configuración SSL y Estrategia de Backups (Bloque 3 - Parte B2 | Total Bloque: 20 a 25 hs)

- **Area:** DevOps
- **Prioridad:** Urgente
- **Módulo(s):** `infra/production`, `scripts`
- **Archivos Afectados:** `.env.production`, `scripts/backup-database.sh`, `docs/setup/DEPLOYMENT.md`
- **Descripción:** Configurar el entorno de producción definitivo: vinculación de dominio oficial, certificados SSL/TLS, variables de entorno protegidas, verificación final del padrón histórico migrado y configuración de la política de copias de seguridad automáticas diarias de la base de datos PostgreSQL.
- **Criterios de Aceptación:**
  - La plataforma funciona en producción bajo HTTPS con latencias de respuesta inferiores a 1 segundo.
  - Los scripts de backup periódico de PostgreSQL quedan programados y testeados con restauración exitosa.
  - Padrón inicial de ~200 pacientes verificado y listo para el uso operativo diario de la Dra. Natalia Alfonso y su equipo.
- **Dependencias:** [ISSUE-20A]
- **Etiquetas:** `Etapa 3 (Cierre)` (Azul Oscuro), `Área: DevOps` (Naranja), `Prioridad Alta / Urgente` (Rojo), `Completado / Entregado` (Verde Lima)