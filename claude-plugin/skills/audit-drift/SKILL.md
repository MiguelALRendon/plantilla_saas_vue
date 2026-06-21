---
name: audit-drift
description: Detecta divergencias (drift) entre el código y la documentación generada/de referencia. Úsala para verificar que la doc refleja la realidad del código.
context: fork
agent: Explore
---

# Auditar drift documentación ↔ código

Agente de solo lectura. Compara la realidad del código con la documentación y reporta divergencias de forma concisa.

## Tarea
1. Construye el inventario REAL desde el código:
   - Decoradores exportados en `src/decorations/index.ts`.
   - Entidades en `src/entities/` y cuáles se registran en `src/main.ts` (`Application.registerModule`).
   - Variables de entorno leídas en `src/stores/app_config_store.ts`.
2. Compáralo con `docs/generated/*` (si existe). Lista lo que falta, sobra o no coincide.
3. Revisa `CLAUDE.md` y `.claude/rules/`: señala referencias a archivos, entidades o reglas que ya no existan en el código.
4. El antiguo sistema Spec Kit / Copilot fue eliminado; no hay doc legacy que consultar. Las únicas fuentes válidas son el código y `docs/generated/`.

Devuelve: lista de drift encontrado (archivo + qué difiere) o "sin drift". Sugiere correr `/saas-framework-kit:regen-docs` si el drift está en `docs/generated/`.
