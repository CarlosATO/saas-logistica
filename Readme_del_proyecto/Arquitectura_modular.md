# 03 - Estrategia Modular y Repositorios

**Estado:** Definido
**Estrategia:** Polyrepo (Múltiples repositorios) con Base de Datos Monolítica Compartida.

## 1. Estructura de Repositorios

### A. Repositorio Core: "Portal Unificado"
* **Nombre sugerido:** `saas-portal-core`
* **Función:** * Autenticación (Login / Registro / Recuperar pass).
    * Onboarding (Crear nueva Empresa).
    * Gestión de Usuarios (Invitar empleados a la empresa).
    * Menú Principal (Launcher): Muestra los iconos de los módulos disponibles.
* **Hosting:** `app.midominio.com`

### B. Repositorios de Módulos (Apps Verticales)
* **Ejemplo 1:** `saas-rrhh`
    * **Tablas:** Prefijo `RRHH_` (ej. `RRHH_empleados`, `RRHH_vacaciones`).
    * **Hosting:** `rrhh.midominio.com` (o ruta gestionada).
* **Ejemplo 2:** `saas-logistica`
    * **Tablas:** Prefijo `LOGIS_` (ej. `LOGIS_flota`, `LOGIS_rutas`).
    * **Hosting:** `logistica.midominio.com`.

## 2. Flujo de Datos y Conexión

1. **La Base de Datos (Supabase):** Es ÚNICA para todos.
    * Todos los repositorios se conectan a la MISMA URL y API KEY de Supabase.
2. **Sesión Compartida:**
    * Al loguearse en el Portal, Supabase guarda la sesión (Token) en el navegador (LocalStorage/Cookies).
    * Como todos los módulos usan el mismo proyecto de Supabase, pueden leer ese token y saber "Quién es el usuario" y "A qué empresa pertenece".

## 3. Nomenclatura de Tablas (Convención)
Para evitar el caos en la base de datos compartida:
* Tablas Core: `organizations`, `profiles`.
* Tablas RRHH: `RRHH_nombre_tabla`.
* Tablas Logística: `LOGIS_nombre_tabla`.