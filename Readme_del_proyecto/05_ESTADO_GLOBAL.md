# 05 - Gestión del Estado de Autenticación

**Objetivo:** Mantener la sesión del usuario viva en toda la aplicación.
**Herramienta:** React Context API + Supabase Auth Listener.

## ¿Cómo funciona?
1. Creamos un `AuthContext` que envuelve a toda la aplicación.
2. Al cargar la app, el Context pregunta a Supabase: "¿Hay sesión activa?".
3. Si la hay, guarda el objeto `user` y `session` en memoria.
4. Escucha cambios (Login, Logout) en tiempo real con `onAuthStateChange`.

## Beneficio
Cualquier componente (Dashboard, Navbar, Perfil) puede acceder a los datos del usuario simplemente usando `useAuth()`.