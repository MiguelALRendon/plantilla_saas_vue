#!/usr/bin/env node
/**
 * Regenera docs/generated/* DESDE el código fuente. El código es la fuente de la verdad.
 * Introspección por regex (no requiere compilar). Ejecuta: node scripts/regen-docs.mjs
 * Invocable también vía la skill /saas-framework-kit:regen-docs.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');
const outDir = join(root, 'docs', 'generated');
mkdirSync(outDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const header = (title) =>
    `<!-- GENERADO por scripts/regen-docs.mjs - NO editar a mano. Regenera con /saas-framework-kit:regen-docs -->\n\n# ${title}\n\n_Generado: ${today}_\n`;

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

/** Decoradores exportados en src/decorations/index.ts (omite *_KEY y exports type-only). */
function decorators() {
    const idx = read(join(srcDir, 'decorations', 'index.ts'));
    const names = new Set();
    const re = /export\s+(type\s+)?\{([^}]*)\}\s+from/g;
    let m;
    while ((m = re.exec(idx)) !== null) {
        if (m[1]) continue; // export type { ... } → no es decorador
        for (const raw of m[2].split(',')) {
            const n = raw.trim();
            if (!n || n.endsWith('_KEY')) continue;
            if (/^[A-Z][A-Za-z0-9]*$/.test(n)) names.add(n);
        }
    }
    const list = [...names].sort();
    let md = header('Decoradores disponibles');
    md += `\nTotal: ${list.length}. Fuente: \`src/decorations/index.ts\`.\n\n`;
    for (const n of list) md += `- \`@${n}\`\n`;
    return md;
}

/** Entidades en src/entities/ (excepto base_entity) + si están registradas en main.ts. */
function entities() {
    const dir = join(srcDir, 'entities');
    const files = existsSync(dir)
        ? readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'base_entity.ts')
        : [];
    const main = read(join(srcDir, 'main.ts'));
    let md = header('Entidades');
    md += `\nFuente: \`src/entities/\` + registro en \`src/main.ts\`. Total: ${files.length}.\n\n`;
    md += `| Archivo | Clase | @Module name | Registrada en main.ts |\n|---|---|---|---|\n`;
    for (const f of files.sort()) {
        const c = read(join(dir, f));
        const cls = (c.match(/export\s+class\s+(\w+)\s+extends\s+BaseEntity/) || [])[1] || '-';
        const name = (c.match(/@Module\(\{[^}]*name:\s*['"]([^'"]+)['"]/) || [])[1] || '-';
        const registered =
            cls !== '—' && new RegExp(`registerModule\\(\\s*${cls}\\s*\\)`).test(main) ? 'sí' : 'no';
        md += `| \`${f}\` | \`${cls}\` | \`${name}\` | ${registered} |\n`;
    }
    return md;
}

/** Variables de entorno leídas en src/stores/app_config_store.ts. */
function envVars() {
    const c = read(join(srcDir, 'stores', 'app_config_store.ts'));
    const re = /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g;
    const set = new Set();
    let m;
    while ((m = re.exec(c)) !== null) set.add(m[1]);
    const list = [...set].sort();
    let md = header('Variables de entorno');
    md += `\nFuente: \`src/stores/app_config_store.ts\`. Total: ${list.length}.\n\n`;
    for (const v of list) md += `- \`${v}\`\n`;
    return md;
}

writeFileSync(join(outDir, 'decorators.md'), decorators());
writeFileSync(join(outDir, 'entities.md'), entities());
writeFileSync(join(outDir, 'env-vars.md'), envVars());
console.log('Regenerado docs/generated/: decorators.md, entities.md, env-vars.md');
