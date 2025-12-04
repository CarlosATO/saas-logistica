# 11 - Single Sign-On (SSO) y Seguridad Modular

**Objetivo:** Centralizar el acceso en el Portal y proteger los módulos externos.

## Flujo de Autenticación
1. **Portal (Emisor):** El usuario se loguea aquí.
2. **Navegación:** Al hacer clic en un módulo (RRHH), el Portal redirige añadiendo tokens al fragmento de URL:
   `http://localhost:5174/#access_token=XYZ&refresh_token=ABC`
3. **Módulo RRHH (Receptor):**
   * Al cargar, intercepta el hash de la URL.
   * Ejecuta `supabase.auth.setSession(token)`.
   * Si tiene éxito, limpia la URL y muestra el contenido.
   * Si falla o no hay tokens, redirige forzosamente a `http://localhost:5173`.

## Almacenamiento de Archivos
Los archivos se organizan estrictamente por `organization_id` dentro del Bucket `rrhh-files` para evitar mezclas de datos entre inquilinos.