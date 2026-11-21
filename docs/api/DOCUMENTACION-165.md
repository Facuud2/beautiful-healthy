# Documentación del Sistema de Autenticación: Correcciones y Mejoras

## 1. Resumen ejecutivo
El objetivo de esta intervención fue solucionar una serie de problemas críticos en el flujo de autenticación que impedían el correcto funcionamiento del login y la persistencia de la sesión mediante cookies. Adicionalmente, se implementó una funcionalidad de cierre de sesión (
logout
) segura y se corrigieron errores de configuración y estructura en el frontend.

### 1.1. Mitigación de Riesgos de Seguridad
El sistema ahora utiliza cookies HttpOnly para almacenar el token JWT, una práctica de seguridad recomendada que mitiga el riesgo de ataques XSS (Cross-Site Scripting).

## 2. Corrección del Flujo de Autenticación (Login)
El problema inicial era que el navegador no almacenaba la cookie de sesión después de un login exitoso. El diagnóstico reveló dos errores clave en el backend.

### 2.1. Configuración de Cookies en el Backend  *(backend/internal/handlers/auth.go)*
Se realizaron dos ajustes fundamentales en el manejador de login:

#### 2.1.1. Ajuste del atributo SameSite:
> Problema: La cookie se configuraba con SameSite: http.SameSiteNoneMode. Por especificación de los navegadores modernos, una cookie con SameSite=None debe tener también el atributo Secure=true, lo que exige una conexión HTTPS. Como el entorno de desarrollo local se ejecuta sobre HTTP, el navegador rechazaba la cookie.

Solución: Se cambió el atributo a SameSite: http.SameSiteLaxMode. Este valor es el más adecuado y seguro para un entorno de desarrollo donde el frontend y el backend, aunque en puertos distintos, corren en el mismo dominio (localhost).

Orden de Operaciones:
Problema: La función http.SetCookie se llamaba después de c.JSON(...). Esto es incorrecto, ya que c.JSON finaliza la escritura de la respuesta y envía las cabeceras HTTP, impidiendo que se añadan nuevas cabeceras como Set-Cookie.

Solución: Se reordenó el código para que http.SetCookie se ejecute antes de c.JSON, asegurando que la cabecera de la cookie se incluya correctamente en la respuesta.

### 2.2. Lógica del Middleware de Autenticación *(backend/internal/middleware/jwt_auth.go)*
Problema: El middleware tenía una lógica defectuosa para leer el token. No manejaba correctamente el caso en que la cookie no existiera y debía recurrir al header Authorization.

Solución: Se refactorizó el middleware para seguir un orden lógico claro:

1. Intentar obtener el token desde la cookie `jwt_token`.
2. Si no se encuentra en la cookie, buscarlo en el header Authorization (formato `Bearer <token>`).
3. Si no se encuentra en ninguna de las dos fuentes, denegar el acceso. Esto proporciona un sistema robusto que funciona tanto para sesiones web basadas en cookies como para clientes de API que envían el token en el header.

## 3. Implementación del Cierre de Sesión (Logout)
Se implementó un flujo de logout completo que invalida la sesión tanto en el servidor como en el cliente.

### 3.1. Endpoint de Logout en el Backend *(main.go y auth.go)*
Se creó un nuevo manejador `Logout` en `auth.go` cuya única responsabilidad es invalidar la cookie de sesión. Lo hace enviando al navegador una cookie con el mismo nombre (`jwt_token`) pero con un `MaxAge` de -1. Este valor negativo instruye al navegador para que elimine la cookie de forma inmediata.

Se registró una nueva ruta POST `/api/auth/logout` en `main.go` para exponer esta funcionalidad.

### 3.2. Lógica de Logout en el Frontend *(frontend/src/auth/AuthContext.tsx)*
La función `logout` en el `AuthContext` se convirtió en `async`.

Ahora, antes de limpiar el estado local, realiza una llamada POST al endpoint `/api/auth/logout`. Esto asegura que la cookie HttpOnly sea eliminada por el backend primero.

Posteriormente, se limpia el estado del usuario en React y se elimina la información del `localStorage` para completar el cierre de sesión en el lado del cliente.

## 4. Refactorización y Correcciones en el Frontend
Durante el proceso, se identificaron y solucionaron varios problemas en el frontend.

### 4.1. Solución al Error `useNavigate` *(frontend/src/App.tsx)*
Problema: La aplicación lanzaba el error `useNavigate()` may be used only in the context of a `<Router>` component.

Causa: El `AuthProvider`, que internamente usa el hook `useNavigate`, estaba siendo renderizado fuera del contexto del `BrowserRouter`.

Solución: Se reestructuró el componente `App.tsx` para que `<BrowserRouter>` envuelva a `<AuthProvider>`, garantizando que todos los componentes hijos tengan acceso al contexto de enrutamiento.

### 4.2. Unificación de Endpoints y Configuración del Proxy *(frontend/vite.config.ts y frontend/src/api/axiosConfig.ts)*
Problema: Las llamadas a la API se estaban realizando con rutas relativas (`/login`) y absolutas (`http://localhost:6060/...`), lo que puede generar inconsistencias.

Solución:

1. Se configuró el proxy en `frontend/vite.config.ts` para redirigir todas las peticiones que comiencen con `/api` al servidor backend en `http://localhost:6060`.
2. Se estandarizó la configuración de axios en `frontend/src/api/axiosConfig.ts`, estableciendo `/api` como baseURL.

Importante: Finalmente, se optó por usar las URL completas en las llamadas de `AuthContext.tsx` (`http://localhost:6060/api/auth/login`). Aunque el proxy está configurado, este enfoque explícito elimina cualquier ambigüedad sobre a qué endpoint se está llamando.

### 4.3. Migración a TypeScript *(frontend/src/api/axiosConfig.ts)*
Problema: Se detectó un error de linting porque se estaba importando un archivo `.js` en un archivo `.tsx` sin una declaración de tipos.

Solución: Se migró `axiosConfig.js` a `axiosConfig.ts`, añadiendo los tipos de Axios correspondientes. Esto no solo solucionó el error, sino que también mejoró la robustez y la mantenibilidad del código al aprovechar el sistema de tipos de TypeScript.