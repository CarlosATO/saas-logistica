# 01 - Arquitectura General del Proyecto SaaS

**Fecha:** 01 Diciembre 2025
**Estado:** En definición
**Stack:** React + Supabase + Railway

## 1. Visión General
El objetivo es crear una plataforma SaaS Multi-inquilino (Multitenant) que permita a diferentes empresas registrarse y gestionar sus propios recursos de forma aislada y segura.

## 2. Componentes Tecnológicos

### A. Frontend (El Cliente)
* **Tecnología:** React (posiblemente usando Vite para el build).
* **Responsabilidad:** Interfaz de usuario, gestión de estado local, routing.
* **Comunicación:** Habla directamente con Supabase mediante `supabase-js`.

### B. Backend as a Service (El Motor)
* **Tecnología:** Supabase.
* **Base de Datos:** PostgreSQL.
* **Autenticación:** Supabase Auth (Email/Password + Social Login si se requiere).
* **Seguridad de Datos:** RLS (Row Level Security). Es CRÍTICO implementar políticas que filtren por `tenant_id`.

### C. Infraestructura (El Alojamiento)
* **Tecnología:** Railway.
* **Función:** Alojar y servir los archivos estáticos del Frontend y gestionar el despliegue continuo (CI/CD) desde GitHub.

## 3. Estrategia de Multitenencia (Tenancy)
Usaremos un enfoque de **Aislamiento Lógico** (Logical Isolation).
* Todos los clientes comparten la misma base de datos.
* Cada tabla sensible tendrá una columna `tenant_id` (o `organization_id`).
* Supabase RLS forzará que `SELECT * FROM facturas` solo devuelva las facturas donde `organization_id` coincida con la organización del usuario logueado.

## 4. Requisitos Previos para el Desarrollo
1.  Cuenta en GitHub (para el código).
2.  Cuenta en Supabase (para la BD).
3.  Cuenta en Railway (para el deploy).
4.  Node.js instalado en local.