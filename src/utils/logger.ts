/* eslint-disable no-console -- este módulo ES la frontera de logging del framework */

/**
 * Logger nivelado del framework. Respeta `VITE_LOG_LEVEL` (debug|info|warn|error; default info).
 * Es el único punto autorizado para usar `console.*`; el resto del código usa este logger.
 * Punto de extensión: enviar a un servicio externo (Sentry, etc.) desde `error()`.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const initialLevel = (((import.meta.env.VITE_LOG_LEVEL as string) || 'info').toLowerCase()) as LogLevel;

// Mutable so setLogLevel() can override it at runtime (tests, feature flags) without
// requiring a rebuild — VITE_LOG_LEVEL only sets the initial value.
let currentLevel: LogLevel = LEVEL_ORDER[initialLevel] !== undefined ? initialLevel : 'info';

function isEnabled(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel];
}

/**
 * Overrides the active log level at runtime. Intended for tests and feature flags;
 * production code should configure the level via `VITE_LOG_LEVEL` instead.
 */
export function setLogLevel(level: LogLevel): void {
    currentLevel = level;
}

/** Returns the currently active log level. */
export function getLogLevel(): LogLevel {
    return currentLevel;
}

export const logger = {
    debug(...args: unknown[]): void {
        if (isEnabled('debug')) {
            console.debug(...args);
        }
    },
    info(...args: unknown[]): void {
        if (isEnabled('info')) {
            console.info(...args);
        }
    },
    warn(...args: unknown[]): void {
        if (isEnabled('warn')) {
            console.warn(...args);
        }
    },
    error(...args: unknown[]): void {
        if (isEnabled('error')) {
            console.error(...args);
        }
        // Extensión futura: reenviar a servicio de error-tracking aquí.
    },
};
