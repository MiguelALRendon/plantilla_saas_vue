import { logger } from '@/utils/logger';
import type { AppConfiguration } from './app_configuration';

const CURRENT_USER_KEY = 'current_user';
const CSRF_TOKEN_KEY = 'csrf_token';

/**
 * Encapsula la sesión de usuario respaldada por `sessionStorage` (datos de usuario,
 * tokens JWT, CSRF) y la validez/expiración del token. Extraído de ApplicationClass
 * para concentrar la lógica de sesión/seguridad en un solo lugar (SRP).
 *
 * Recibe un accesor de configuración para leer las claves de token sin depender del
 * singleton Application (evita imports circulares).
 */
export class SessionService {
    constructor(private readonly getConfig: () => AppConfiguration) {}

    /** Persiste datos de usuario y tokens tras un login exitoso. */
    saveUserData(
        userData: Record<string, unknown>,
        accessToken: string,
        refreshToken: string,
        csrfToken: string = ''
    ): void {
        const { authTokenKey, authRefreshTokenKey } = this.getConfig();
        try {
            sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
            sessionStorage.setItem(authTokenKey, accessToken);
            sessionStorage.setItem(authRefreshTokenKey, refreshToken);
            if (csrfToken) {
                sessionStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
            }
        } catch (error) {
            logger.error('[SessionService] Failed to save user data to SessionStorage.', error);
        }
    }

    /** Recupera y parsea el usuario actual, o null si no hay/ es inválido. */
    getCurrentUser(): Record<string, unknown> | null {
        try {
            const raw = sessionStorage.getItem(CURRENT_USER_KEY);
            if (!raw) {
                return null;
            }
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return null;
        }
    }

    /** Limpia toda la sesión (usuario + tokens + CSRF). */
    clear(): void {
        const { authTokenKey, authRefreshTokenKey } = this.getConfig();
        sessionStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.removeItem(authTokenKey);
        sessionStorage.removeItem(authRefreshTokenKey);
        sessionStorage.removeItem(CSRF_TOKEN_KEY);
    }

    /** Token de acceso actual (o null). */
    getToken(): string | null {
        return sessionStorage.getItem(this.getConfig().authTokenKey);
    }

    /** True si hay un usuario en sesión (sin validar expiración). */
    hasSession(): boolean {
        return sessionStorage.getItem(CURRENT_USER_KEY) !== null;
    }

    /** Decodifica el JWT y determina si su claim `exp` ya venció. Fail-closed: un token malformado se trata como expirado. */
    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) {
            return true;
        }
        try {
            const payloadSegment = token.split('.')[1];
            if (!payloadSegment) {
                logger.warn('[SessionService] JWT sin payload — tratando como expirado.');
                return true;
            }
            const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(normalized)) as { exp?: number };
            if (typeof payload.exp !== 'number') {
                // Token sin claim exp: no podemos verificar expiración, asumimos inválido.
                logger.warn('[SessionService] JWT sin claim exp — tratando como expirado.');
                return true;
            }
            return Date.now() >= payload.exp * 1000;
        } catch (error) {
            logger.warn('[SessionService] JWT parse fallido — tratando como expirado.', error);
            return true;
        }
    }

    /** True si hay sesión y el token no ha expirado; limpia una sesión expirada como efecto. */
    hasValidSession(): boolean {
        if (!this.hasSession()) {
            return false;
        }
        if (this.isTokenExpired()) {
            this.clear();
            return false;
        }
        return true;
    }
}
