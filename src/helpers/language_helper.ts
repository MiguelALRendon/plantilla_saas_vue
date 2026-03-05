/**
 * Language helper — single-argument i18n lookup for framework and entity display texts.
 * §8E — T229 (restructured: category-based JSON, single dot-path argument)
 *
 * STRUCTURE:
 *   src/languages/
 *     custom.json          ← reserved root file  (access via 'custom.*')
 *     common.json          ← category file
 *     errors.json          ← category file
 *     validation.json      ← category file
 *     navigation.json      ← category file
 *
 * CATALOG FORMAT (per key):
 *   "key_name": { "en": "...", "es": "...", "jp": "..." }
 *
 * USAGE:
 *   GetLanguagedText('errors.connection_error')    → resolved string for active language
 *   GetLanguagedText('custom.products.name')       → nested path inside custom.json (reserved)
 *   GetLanguagedText('common.save')                → "Save" / "Guardar" / "保存"
 *
 * RULES:
 *   - First segment = category (file name), e.g. 'errors', 'common'
 *   - 'custom' is the ONLY reserved word — always maps to custom.json at root
 *   - Remaining segments form the dot-notation key path inside the file
 *   - Falls back to 'MissingNO' when path cannot be resolved
 */

import { Language } from '@/enums/language';
import Application from '@/models/application';

// ── Category catalog imports ─────────────────────────────────────────────────
import commonCatalog from '@/languages/common.json';
import errorsCatalog from '@/languages/errors.json';
import validationCatalog from '@/languages/validation.json';
import navigationCatalog from '@/languages/navigation.json';
// 'custom' is reserved — loaded separately
import customCatalog from '@/languages/custom.json';

// ── Types ────────────────────────────────────────────────────────────────────

type LangCode = 'en' | 'es' | 'jp';
type TranslationLeaf = { en: string; es: string; jp: string };
type Catalog = Record<string, unknown>;
type BuiltinCategory = 'common' | 'errors' | 'validation' | 'navigation';

// ── Language code resolver ───────────────────────────────────────────────────

const LANG_CODE_MAP: Record<Language, LangCode> = {
    [Language.EN]: 'en',
    [Language.ES]: 'es',
    [Language.JP]: 'jp',
};

function activeLangCode(): LangCode {
    return LANG_CODE_MAP[Application.AppConfiguration.value.selectedLanguage] ?? 'en';
}

// ── Catalog registry ─────────────────────────────────────────────────────────

const CATEGORY_CATALOGS: Record<BuiltinCategory, Catalog> = {
    common:     commonCatalog     as Catalog,
    errors:     errorsCatalog     as Catalog,
    validation: validationCatalog as Catalog,
    navigation: navigationCatalog as Catalog,
};

// ── Public helper ────────────────────────────────────────────────────────────

/**
 * Returns the localised text for the given dot-notation path.
 *
 * Format: `'<category>.<key>'` or `'<category>.<nested>.<key>'`
 *
 * `custom` is the ONLY reserved word — maps to `custom.json` at the languages root
 * regardless of nesting depth. Any other first segment maps to `<segment>.json`.
 *
 * @param path  Dot-notation path: category + key, e.g. `'errors.connection_error'`
 * @returns     Localised string, or `'MissingNO'` when path cannot be resolved.
 *
 * @example
 * GetLanguagedText('errors.connection_error')   // → "Connection error..."
 * GetLanguagedText('custom.products.name')      // → "Name" / "Nombre" / "名前"
 * GetLanguagedText('common.save')               // → "Save" / "Guardar" / "保存"
 */
export function GetLanguagedText(path: string): string {
    const dotIndex = path.indexOf('.');
    if (dotIndex === -1) {
        return 'MissingNO';
    }

    const category = path.slice(0, dotIndex);
    const keyPath  = path.slice(dotIndex + 1); // remainder after the first dot

    // Resolve the catalog
    let catalog: Catalog;
    if (category === 'custom') {
        // Reserved word — always points to custom.json at root
        catalog = customCatalog as Catalog;
    } else {
        const found = CATEGORY_CATALOGS[category as BuiltinCategory];
        if (!found) {
            return 'MissingNO';
        }
        catalog = found;
    }

    // Navigate dot-notation key path inside the catalog
    const parts = keyPath.split('.');
    let node: unknown = catalog;
    for (const part of parts) {
        node = (node as Record<string, unknown>)?.[part];
        if (node === undefined || node === null) {
            return 'MissingNO';
        }
    }

    // Leaf must be a TranslationLeaf: { en, es, jp }
    if (typeof node !== 'object') {
        return typeof node === 'string' ? node : 'MissingNO';
    }

    const leaf = node as Partial<TranslationLeaf>;
    const langCode = activeLangCode();
    const text = leaf[langCode];

    return typeof text === 'string' ? text : 'MissingNO';
}

