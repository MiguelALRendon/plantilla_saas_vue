# saas-framework-kit (plugin de Claude Code)

Motor de agente y gobernanza para el framework SaaS Vue dirigido por metadatos. Empaqueta:

- **Skills** (`skills/`): `new-entity`, `new-decorator`, `new-input`, `regen-docs`, `audit-drift`, `e2e`.
- **Subagentes** (`agents/`): `browser-tester` (Playwright MCP), `architecture-reviewer`, `change-verifier`.
- **Hooks** (`hooks/hooks.json`): bloquean violaciones de arquitectura (PreToolUse) y corren type-check tras editar (PostToolUse). Scripts en PowerShell (`hooks/*.ps1`).
- **LSP** (`.lsp.json`): code intelligence de TypeScript (requiere `typescript-language-server` instalado).

> Principio: **el código es la fuente de la verdad**. Las skills leen patrones reales del repo; los docs de referencia se generan desde el código (`/saas-framework-kit:regen-docs`).

## Uso en desarrollo (sin instalar)
```sh
claude --plugin-dir ./claude-plugin
```
Recarga tras editar el plugin: `/reload-plugins`.

## Instalación vía marketplace local
Hay un marketplace local en `.claude-plugin/marketplace.json` (raíz del repo):
```text
/plugin marketplace add ./
/plugin install saas-framework-kit@saas-vue-local
```

## Comprobar
- `/help` lista las skills bajo el namespace `saas-framework-kit:`.
- `/agents` muestra los subagentes.
- Las skills NO son componentes de plugin: `CLAUDE.md` y `.claude/rules/` viven a nivel proyecto (en el repo) y viajan con el clon de la plantilla.

## Notas
- Scripts de hook en **PowerShell** (entorno Windows).
- LSP de Vue (`.vue`) es opcional; este plugin solo configura TS. Para `.vue` instala el plugin LSP de Vue/Volar oficial si lo necesitas.
