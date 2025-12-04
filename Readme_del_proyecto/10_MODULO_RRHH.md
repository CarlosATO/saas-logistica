# Módulo: Recursos Humanos (RRHH)

**Puerto Local:** 5174
**Tabla Principal:** `rrhh_employees`

## Propósito
Gestionar el ciclo de vida de los empleados (Alta, Baja, Modificación).

## Conexión
Comparte la misma instancia de Supabase que el Portal.
Usa las mismas políticas RLS: El aislamiento se garantiza mediante `organization_id`.