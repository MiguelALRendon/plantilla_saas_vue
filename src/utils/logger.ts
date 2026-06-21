/* eslint-disable no-console -- este módulo ES la frontera de logging del framework */

/**
 * Logger nivelado del framework. Respeta `VITE_LOG_LEVEL` (debug|info|warn|error; default info).
 * Es el único punto autorizado para usar `console.*`; el resto del código usa este logger.
 * Punto de extensión: enviar a un servicio externo (Sentry, etc.) desde `error()`.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const configuredLevel = (((import.meta.env.VITE_LOG_LEVEL as string) || 'info').toLowerCase()) as LogLevel;
const threshold = LEVEL_ORDER[configuredLevel] ?? LEVEL_ORDER.info;

function isEnabled(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= threshold;
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
