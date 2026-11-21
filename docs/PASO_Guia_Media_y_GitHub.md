# Guía Operativa PASO: Producción de Capturas/Videos, Armado en Google Drive y Subida Limpia a GitHub

Esta guía complementa el documento principal [`PASO_Informe_Caso_Beautiful_Health_Nicho_Salud.md`](PASO_Informe_Caso_Beautiful_Health_Nicho_Salud.md) y te da el paso a paso exacto para:
1. Grabar las capturas y videos cortos de **Beautiful Health** (aprovechando el `DeviceSimulator` integrado).
2. Armar la carpeta compartida de **Google Drive** para que tus compañeros de **PASO** puedan verlo todo de forma simple y visual (sin tener que meterse a un repositorio de código).
3. Dejar listo el proyecto para su **subida limpia y segura a GitHub** con las mismas imágenes y videos en el `README.md`.

---

## 1. Storyboard de Capturas (8 imágenes) y Videos (4 clips cortos)

> **💡 Tip clave:** Levanta el frontend localmente (`cd frontend && npm run dev`) y usá la barra superior del **Simulador de Dispositivos (`DeviceSimulator`)** que ya está integrado en la app. Te permite alternar con un clic entre **Vista Paciente / Vista Profesional**, **iPhone 15 Pro / Android / Escritorio** y disparar **notificaciones push simuladas**.

### A. Capturas de Pantalla (guardar en `docs/media/images/` y subir a Drive)

| Archivo | Ruta / Vista en Beautiful Health | Modo recomendado | Qué debe verse claro |
| :--- | :--- | :--- | :--- |
| `01_login_y_selector_roles.png` | `/login` o `/portal-paciente/login` | Escritorio + marco móvil | Pantalla de acceso limpia y elegante (identidad visual). |
| `02_dashboard_profesional.png` | `/dashboard` | Escritorio (`Desktop`) | Panel de pacientes activos, buscador, estados (`D+4`, `3 / 6`, alerta "Requiere respuesta"). |
| `03_listado_y_alta_pacientes.png` | `/patients` o `/patients/new` | Escritorio (`Desktop`) | Listado / formulario de alta de paciente. |
| `04_historia_clinica_y_tratamientos.png` | `/historia` o `/tratamientos` | Escritorio (`Desktop`) | Evolución clínica, antecedentes y tratamientos. |
| `05_consultas_y_mensajeria.png` | `/consultas` y `/mensajeria` | Escritorio (`Desktop`) | Agenda de sesiones y canal de mensajería clínica. |
| `06_portal_paciente_inicio.png` | `/portal-paciente` (pestaña Inicio) | Móvil (`iPhone 15 Pro Gold`) | Próxima sesión, indicaciones del día y navegación inferior/superior. |
| `07_portal_paciente_documentos_pdf.png` | `/portal-paciente` (pestaña Documentos) | Móvil (`iPhone 15 Pro Gold`) | Lista de estudios/documentos y visor modal abierto. |
| `08_portal_paciente_notas_y_perfil.png` | `/portal-paciente` (pestañas Notas / Perfil) | Móvil (`Pixel Pearl` o `iPhone`) | Seguimiento de cuidados post-consulta y datos del paciente. |

### B. Videos Cortos Demo (20 a 45 seg cada uno — guardar en `docs/media/videos/` y subir a Drive)

| Archivo | Duración ideal | Guion rápido (sin necesidad de voz, o con voz en off corta) |
| :--- | :--- | :--- |
| `01_demo_multidispositivo_y_notificaciones.mp4` | 25–35 seg | Empezar en vista móvil iPhone en `/portal-paciente`, disparar una notificación push del simulador, cambiar a Android y luego a vista Escritorio Profesional. |
| `02_flujo_profesional_dashboard_a_historia.mp4` | 35–45 seg | En `/dashboard`, buscar una paciente, revisar su estado (`D+4` / `Requiere respuesta`), abrir `/historia` y pasar por `/mensajeria`. |
| `03_recorrido_portal_paciente_movil.mp4` | 30–40 seg | En modo iPhone, recorrer las pestañas del Portal del Paciente: Inicio → Documentos (abrir un PDF en modal) → Notas → Perfil. |
| `04_puente_reactivo_profesional_paciente.mp4` | 30–45 seg | Mostrar el contraste directo: cómo ve el caso el profesional desde el consultorio vs. cómo lo recibe y consulta el paciente en su celular. |

---

## 2. Cómo Armar el Google Drive Compartido de PASO

Para que el equipo entre al Drive y entienda todo al instante (sin fricción técnica ni links crudos a GitHub):

```text
📁 PASO — Investigación Nicho Salud/
├── 📄 00_INFORME_PASO_Caso_Beautiful_Health_y_Playbook_Salud (Google Doc)
├── 📁 01_Evidencias_Visuales_Beautiful_Health/
│   ├── 📁 Capturas/ (01_*.png a 08_*.png)
│   └── 📁 Videos_Demo/ (01_*.mp4 a 04_*.mp4)
└── 📁 02_Investigacion_Equipo_PASO/
    ├── 📊 Matriz_Asignacion_SubNichos (Google Sheet)
    └── 📄 Plantilla_Ficha_de_Oportunidad_PASO (Google Doc)
```

### Pasos rápidos para pasar el informe a Google Docs:
1. Subí `docs/PASO_Informe_Caso_Beautiful_Health_Nicho_Salud.md` a Google Drive o copiá su vista previa renderizada y pegala en un Google Doc nuevo (los títulos H1/H2/H3, tablas y viñetas se conservan limpios).
2. Reemplazá cada marcador `[📸 INSERTAR CAPTURA: ...]` insertando la imagen correspondiente desde `01_Evidencias_Visuales_Beautiful_Health/Capturas/`.
3. Reemplazá cada marcador `[🎥 INSERTAR VIDEO: ...]` con un enlace directo (chip inteligente de Google Drive) al video correspondiente en `01_Evidencias_Visuales_Beautiful_Health/Videos_Demo/`.

---

## 3. Preparación y Subida Limpia a GitHub

Actualmente `el directorio del proyecto` **aún no tiene inicializado Git** (`git init`). Antes de hacer el primer commit y subirlo a GitHub, conviene hacer una limpieza rápida para no subir binarios pesados ni documentos privados de presupuestos de clientes.

### Paso 1: Revisar qué NO debería subirse a un repo de GitHub
Detectamos archivos en tu carpeta local que conviene agregar a `.gitignore` antes del primer commit:
* **Binarios y artefactos de compilación/profiling del backend:**
  * `backend/server`
  * `backend/auth.test`
  * `backend/auth.test.exe`
  * `backend/cpu.pprof`
  * `backend/coverage.out`, `backend/coverage.html`, `backend/coverage_full.html`, `backend/handlers.cover.out`
* **Documentos comerciales/presupuestos con nombres de clientes reales** (si el repositorio va a ser público o compartido fuera del proyecto comercial):
  * `Planificación y Presupuesto - App Dra. Natalia Alfonso.*`
  * `Planificacion desarrollo por etapas.*`
  * `Planificacion.pdf`
  * `Propuesta plan de desarrollo App medica.md`
  * `Issues_TRELLO.md`

### Paso 2: Crear la carpeta de media para GitHub
```bash
mkdir -p docs/media/images docs/media/videos
```
> **Nota sobre videos en GitHub:** GitHub permite incrustar archivos `.mp4` (hasta ~10 MB directo en issues/PRs o en el repo) o GIFs cortos. Para videos largos (>10 MB), lo ideal es dejarlos en Google Drive o en un GitHub Release/Asset y enlazar una miniatura en el `README.md`.

### Paso 3: Inicializar Git y hacer la primera subida
Cuando hayas revisado `.gitignore` y creado el repositorio vacío en GitHub:

```bash
git init -b main
git status   # Verificá que no aparezcan .env, binarios ni presupuestos privados
git add .
git commit -m "chore: initial commit de Beautiful Health con documentación PASO"
git remote add origin <URL_DE_TU_REPO_EN_GITHUB>
git push -u origin main
```

### Paso 4: Sección Visual para el `README.md` de GitHub (cuando tengas las fotos/videos)
Cuando copies tus capturas a `docs/media/images/`, podrás agregar una sección **Showcase Visual** al inicio de `README.md` con:
```markdown
## Vista Rápida de la Plataforma

| Panel del Consultorio | Portal del Paciente (Móvil) |
| :---: | :---: |
| ![Dashboard Profesional](docs/media/images/02_dashboard_profesional.png) | ![Portal Paciente](docs/media/images/06_portal_paciente_inicio.png) |
```
