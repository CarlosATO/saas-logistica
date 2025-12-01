# 04 - Setup del Portal Unificado

**Fecha:** 01 Diciembre 2025
**Proyecto:** saas-portal
**Tecnología:** React + Vite

## Dependencias Clave Instaladas
* `react`: Librería de UI.
* `react-router-dom`: Gestión de rutas (Navegación SPA).
* `@supabase/supabase-js`: Cliente oficial para conectar con Backend.

## Configuración de Entorno
El proyecto requiere un archivo `.env.local` en la raíz con:
* `VITE_SUPABASE_URL`: Endpoint del proyecto Supabase.
* `VITE_SUPABASE_ANON_KEY`: Llave pública para operaciones desde el cliente.

## Estructura de Directorios (src)
* `/auth`: Manejo de autenticación.
* `/components`: Componentes UI reutilizables.
* `/pages`: Vistas principales.
* `/services`: Lógica de conexión a datos.
* `/context`: Estado global (User Session).

## Comandos
* `npm run dev`: Levantar servidor de desarrollo.
* `npm run build`: Compilar para producción.