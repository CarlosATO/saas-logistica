# 02 - Modelo de Datos Inicial (Schema)

**Estado:** Diseño Aprobado
**Objetivo:** Definir las tablas base para la autenticación y la multitenencia.

## Diagrama de Relación
`auth.users` (Supabase) -> `public.profiles` -> `public.organizations`

## Definición de Tablas (SQL)

### 1. Tabla: organizations
Representa a la empresa o inquilino (Tenant).

```sql
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Aquí podríamos agregar 'plan_tier', 'logo_url', etc.
  slug text unique -- Para URLs amigables (ej. [app.saas.com/mi-empresa](https://app.saas.com/mi-empresa))
);