<template>
    <div class="login-wrapper">

        <!-- ── Fondo: aurora líquida ambiental (SVG/SMIL, sin JS) ──── -->
        <svg class="login-blobs" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
                <filter id="login-blob-blur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="22" />
                </filter>
            </defs>
            <path
                class="login-blob login-blob-a"
                filter="url(#login-blob-blur)"
                d="M110,40 C150,30 180,60 178,100 C176,140 144,168 106,162 C68,156 46,124 56,90 C62,68 80,48 110,40 Z"
            >
                <animate
                    attributeName="d"
                    dur="11s"
                    repeatCount="indefinite"
                    values="M110,40 C150,30 180,60 178,100 C176,140 144,168 106,162 C68,156 46,124 56,90 C62,68 80,48 110,40 Z;
                            M118,48 C156,42 182,76 174,112 C166,148 130,166 98,154 C66,142 50,108 64,76 C74,54 92,52 118,48 Z;
                            M110,40 C150,30 180,60 178,100 C176,140 144,168 106,162 C68,156 46,124 56,90 C62,68 80,48 110,40 Z"
                />
            </path>
            <path
                class="login-blob login-blob-b"
                filter="url(#login-blob-blur)"
                d="M300,230 C340,222 368,254 364,294 C360,334 326,360 290,352 C254,344 234,310 246,276 C254,252 272,236 300,230 Z"
            >
                <animate
                    attributeName="d"
                    dur="15s"
                    repeatCount="indefinite"
                    values="M300,230 C340,222 368,254 364,294 C360,334 326,360 290,352 C254,344 234,310 246,276 C254,252 272,236 300,230 Z;
                            M308,238 C344,234 366,270 354,304 C342,338 304,358 274,342 C244,326 238,290 256,262 C266,248 284,240 308,238 Z;
                            M300,230 C340,222 368,254 364,294 C360,334 326,360 290,352 C254,344 234,310 246,276 C254,252 272,236 300,230 Z"
                />
            </path>
            <path
                class="login-blob login-blob-c"
                filter="url(#login-blob-blur)"
                d="M210,260 C250,255 278,285 270,320 C262,355 226,375 192,365 C158,355 142,322 156,292 C166,270 186,264 210,260 Z"
            >
                <animate
                    attributeName="d"
                    dur="18s"
                    repeatCount="indefinite"
                    values="M210,260 C250,255 278,285 270,320 C262,355 226,375 192,365 C158,355 142,322 156,292 C166,270 186,264 210,260 Z;
                            M200,268 C238,260 268,292 258,326 C248,360 210,376 180,362 C150,348 140,312 156,284 C166,266 180,272 200,268 Z;
                            M210,260 C250,255 278,285 270,320 C262,355 226,375 192,365 C158,355 142,322 156,292 C166,270 186,264 210,260 Z"
                />
            </path>
        </svg>

        <!-- Botón dark/light mode — usa el sistema real de temas -->
        <button v-spark class="login-theme-toggle" type="button" @click="toggleDarkMode" :title="isDark ? 'Modo claro' : 'Modo oscuro'">
            <span :class="GGCLASS">{{ isDark ? GGICONS.LIGHT_MODE : GGICONS.DARK_MODE }}</span>
        </button>

        <!-- ── Tarjeta centrada: marca + formulario ────────────────── -->
        <div class="login-card">
            <img :src="appLogo" class="login-logo" alt="logo" />
            <h1 class="login-app-name">{{ appName }}</h1>
            <h2 class="login-title">{{ t('common.auth.login') }}</h2>

            <form @submit.prevent="handleLogin" class="login-form" data-testid="login-form" novalidate>
                <TextInputComponent
                    :entity-class="userClass"
                    :entity="loginEntity"
                    property-key="usuario"
                    :model-value="loginEntity.usuario"
                    @update:model-value="loginEntity.usuario = $event"
                />

                <PasswordInputComponent
                    :entity-class="userClass"
                    :entity="loginEntity"
                    property-key="contraseña"
                    :model-value="loginEntity.contraseña"
                    @update:model-value="loginEntity.contraseña = $event"
                />

                <button v-liquid type="submit" class="login-submit" data-testid="login-submit" :disabled="isLoading">
                    {{ isLoading ? t('common.loading') : t('common.auth.login') }}
                </button>
            </form>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { User } from '@/entities/user';
import Application from '@/models/application';
import { GetLanguagedText } from '@/helpers/language_helper';
import GGICONS, { GGCLASS } from '@/constants/ggicons';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';
import PasswordInputComponent from '@/components/Form/PasswordInputComponent.vue';

// #region PROPERTIES
const userClass = User;
const loginEntity = ref(new User({}));
const isLoading = ref(false);

const appLogo = Application.AppConfiguration.value.squared_app_logo_image;
const appName = Application.AppConfiguration.value.appName;

const isDark = computed(() => Application.AppConfiguration.value.isDarkMode);
// #endregion

// #region METHODS
function t(key: string): string {
    return GetLanguagedText(key);
}

function toggleDarkMode(): void {
    Application.applyConfigurationSnapshot({
        ...Application.AppConfiguration.value,
        isDarkMode: !Application.AppConfiguration.value.isDarkMode,
    });
}

async function handleLogin(): Promise<void> {
    isLoading.value = true;
    try {
        await loginEntity.value.save();
    } catch {
        // El error lo gestiona BaseEntity.onSavingError + el interceptor de Application
    } finally {
        isLoading.value = false;
    }
}
// #endregion
</script>

<style scoped>
/* ── Contenedor raíz: lienzo "deep aurora" a pantalla completa ─────────── */
.login-wrapper {
    position: relative;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
    background: var(--grad-login-bg);
    padding: var(--padding-large);
}

/* Aurora líquida ambiental — pure SVG/SMIL, no JS: tres blobs que derivan
   lentamente detrás de la tarjeta para que el fondo se sienta vivo. */
.login-blobs {
    position: absolute;
    inset: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
}
.login-blob {
    mix-blend-mode: screen;
}
.login-blob-a {
    fill: var(--login-aurora-violet);
    opacity: 0.45;
}
.login-blob-b {
    fill: var(--login-aurora-teal);
    opacity: 0.35;
}
.login-blob-c {
    fill: var(--login-aurora-magenta);
    opacity: 0.3;
}

@media (prefers-reduced-motion: reduce) {
    .login-blobs {
        display: none;
    }
}

/* ── Botón de tema ────────────────────────────────────────────────────── */
.login-theme-toggle {
    position: absolute;
    top: var(--margin-medium);
    right: var(--margin-medium);
    z-index: 1;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--border-radius-circle);
    background-color: rgba(231, 233, 255, 0.1);
    color: var(--login-aurora-teal);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: background-color var(--transition-fast) var(--timing-ease);
}

.login-theme-toggle:hover {
    background-color: rgba(231, 233, 255, 0.18);
}

/* ── Tarjeta central: cristal esmerilado sobre la aurora ───────────────── */
.login-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--margin-small);
    padding: var(--padding-large) var(--margin-large) var(--margin-large);
    background-color: var(--login-card-bg);
    border: var(--border-width-thin) solid var(--login-card-border);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-login-card);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
}

.login-logo {
    width: 76px;
    height: 76px;
    object-fit: contain;
    filter: drop-shadow(var(--shadow-dark));
}

.login-app-name {
    color: var(--login-text-bright);
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-bold);
    text-align: center;
}

.login-title {
    color: var(--login-text-muted);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--margin-small);
    text-align: center;
}

/* ── Formulario ──────────────────────────────────────────────────────── */
.login-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--margin-small);
}

/* ── Botón de submit ─────────────────────────────────────────────────── */
.login-submit {
    width: 100%;
    height: var(--button-height);
    margin-top: var(--margin-medium);
    background: var(--grad-login-submit);
    background-color: var(--login-aurora-violet);
    color: var(--login-text-bright);
    border: none;
    border-radius: var(--border-radius);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    font-family: var(--font-family-base);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity var(--transition-fast) var(--timing-ease);
}

.login-submit:hover {
    opacity: var(--opacity-hover);
}

.login-submit:disabled {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
}

/* ── Responsive: tarjeta a ancho completo en móvil ─────────────────────── */
@media (max-width: 768px) {
    .login-card {
        max-width: 100%;
    }
}
</style>
