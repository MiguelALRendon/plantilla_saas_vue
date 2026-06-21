---
name: regen-docs
description: Regenera la documentación de referencia (decoradores, entidades, variables de entorno) DESDE el código fuente hacia docs/generated/. Úsala tras añadir entidades/decoradores/env vars o para corregir drift de documentación.
allowed-tools: Bash(node scripts/regen-docs.mjs)
---

# Regenerar documentación desde el código

El código es la fuente de la verdad. Este flujo regenera `docs/generated/` introspeccionando el repo (no edites esos archivos a mano).

## Acción
1. Ejecuta el generador con Bash:
   `node scripts/regen-docs.mjs`
2. Resume qué cambió en `docs/generated/` (`decorators.md`, `entities.md`, `env-vars.md`).
3. Si el diff revela que `CLAUDE.md` o `.claude/rules/` mencionan algo que ya no existe, propón corregirlo.

Los archivos en `docs/generated/` llevan una cabecera "GENERADO — no editar a mano".
