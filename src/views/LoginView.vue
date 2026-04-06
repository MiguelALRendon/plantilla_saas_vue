<template>
    <div class="login-wrapper" @click="closePicker">

        <!-- ── Panel izquierdo: imagen/marca ─────────────────────── -->
        <div class="login-left">
            <img :src="appLogo" class="login-logo" alt="logo" />
            <h1 class="login-app-name">{{ appName }}</h1>
        </div>

        <!-- ── Panel derecho: formulario con color plano ─────────── -->
        <div class="login-right" :style="panelStyle" @click.stop>

            <!-- Botón para cambiar el tema de color -->
            <button class="login-theme-trigger" type="button" @click.stop="togglePicker" title="Cambiar tema">
                <span class="material-symbols-outlined">palette</span>
            </button>

            <!-- Paleta de colores del sistema -->
            <div class="theme-picker" v-if="showPicker" @click.stop>
                <span class="theme-picker-label">Tema de color</span>
                <div class="theme-swatches">
                    <button
                        v-for="theme in THEMES"
                        :key="theme.var"
                        type="button"
                        class="theme-swatch"
                        :style="{ backgroundColor: theme.preview }"
                        :class="{ active: selectedTheme === theme.var }"
                        :title="theme.label"
                        @click="selectTheme(theme.var)"
                    />
                </div>
            </div>

            <!-- Formulario -->
            <div class="login-form-wrapper">
                <h2 class="login-title">{{ t('common.auth.login') }}</h2>

                <form @submit.prevent="handleLogin" class="login-form" novalidate>
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

                    <button
                        type="submit"
                        class="login-submit"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? t('common.loading') : t('common.auth.login') }}
                    </button>
                </form>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { User } from '@/entities/user';
import Application from '@/models/application';
import { GetLanguagedText } from '@/helpers/language_helper';
import TextInputComponent from '@/components/Form/TextInputComponent.vue';
import PasswordInputComponent from '@/components/Form/PasswordInputComponent.vue';

// #region CONSTANTS — Cada entrada apunta a una constante de sistema definida en constants.css
const THEME_STORAGE_KEY = 'login_theme';

const THEMES = [
    { var: '--btn-primary',   preview: '#2563eb', label: 'Primario'  },
    { var: '--btn-secondary', preview: '#8b5fc7', label: 'Morado'    },
    { var: '--btn-success',   preview: '#52b5bc', label: 'Verde'     },
    { var: '--btn-accent',    preview: '#c74d8a', label: 'Rosa'      },
    { var: '--btn-warning',   preview: '#f5a623', label: 'Naranja'   },
    { var: '--accent-red',    preview: '#db3955', label: 'Rojo'      },
    { var: '--green-deep',    preview: '#3f8f7d', label: 'Bosque'    },
    { var: '--purple-1',      preview: '#8660b3', label: 'Lavanda'   },
    { var: '--gray-medium',   preview: '#4a5568', label: 'Gris'      },
] as const;
// #endregion

// #region PROPERTIES
const userClass = User;
const loginEntity = ref(new User());
const isLoading  = ref(false);
const showPicker = ref(false);

const appLogo = Application.AppConfiguration.value.squared_app_logo_image;
const appName = Application.AppConfiguration.value.appName;

const selectedTheme = ref<string>(
    localStorage.getItem(THEME_STORAGE_KEY) ?? '--btn-primary'
);

/**
 * Inyecta --login-panel-bg apuntando a la constante seleccionada del sistema.
 * El formulario y el botón consumen esta variable localmente, sin contaminar :root.
 */
const panelStyle = computed(() => ({
    '--login-panel-bg': `var(${selectedTheme.value})`,
}));
// #endregion

// #region METHODS
function t(key: string): string {
    return GetLanguagedText(key);
}

function selectTheme(varName: string): void {
    selectedTheme.value = varName;
    localStorage.setItem(THEME_STORAGE_KEY, varName);
    showPicker.value = false;
}

function togglePicker(): void {
    showPicker.value = !showPicker.value;
}

function closePicker(): void {
    showPicker.value = false;
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

// #region LIFECYCLE
onMounted(() => document.addEventListener('click', closePicker));
onUnmounted(() => document.removeEventListener('click', closePicker));
// #endregion
</script>

<style scoped>
/* ── Contenedor raíz ──────────────────────────────────────────────────── */
.login-wrapper {
    display: flex;
    min-height: 100vh;
    overflow: hidden;
}

/* ── Panel izquierdo: imagen/marca ───────────────────────────────────── */
.login-left {
    flex: 1;
    background: var(--grad-pink-purple);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--margin-large);
    padding: var(--padding-large);
}

.login-logo {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(var(--shadow-dark));
}

.login-app-name {
    color: var(--white);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-bold);
    text-align: center;
}

/* ── Panel derecho: color plano ─────────────────────────────────────── */
.login-right {
    flex: 1;
    /* El color apunta a --login-panel-bg, que a su vez apunta a la constante
       seleccionada (p. ej. var(--btn-primary)). Inyectado reactivamente vía :style */
    background-color: var(--login-panel-bg, var(--btn-primary));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: var(--padding-large);
}

/* ── Botón de tema ────────────────────────────────────────────────────── */
.login-theme-trigger {
    position: absolute;
    top: var(--margin-medium);
    right: var(--margin-medium);
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--border-radius-circle);
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: background-color var(--transition-fast) var(--timing-ease);
}

.login-theme-trigger:hover {
    background-color: rgba(255, 255, 255, 0.35);
}

/* ── Paleta de colores ────────────────────────────────────────────────── */
.theme-picker {
    position: absolute;
    top: 3.75rem;
    right: var(--margin-medium);
    background-color: var(--white);
    border-radius: var(--border-radius);
    padding: var(--padding-small);
    box-shadow: var(--shadow-dark);
    z-index: var(--z-dropdown);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    min-width: 140px;
}

.theme-picker-label {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--gray-medium);
    padding-inline: var(--spacing-xs);
}

.theme-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
}

.theme-swatch {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: var(--border-radius-circle);
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform var(--transition-fast) var(--timing-ease);
}

.theme-swatch:hover {
    transform: scale(1.15);
}

.theme-swatch.active {
    border-color: var(--gray-medium);
    transform: scale(1.1);
}

/* ── Formulario ──────────────────────────────────────────────────────── */
.login-form-wrapper {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: var(--margin-medium);
}

.login-title {
    color: var(--white);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: var(--margin-small);
}

/* ── Botón de submit ─────────────────────────────────────────────────── */
/* Fondo: var(--white) — Texto: var(--login-panel-bg) que apunta a la constante activa.
   La relación color-texto ↔ fondo-panel garantiza contraste automático. */
.login-submit {
    width: 100%;
    height: var(--button-height);
    margin-top: var(--margin-medium);
    background-color: var(--white);
    color: var(--login-panel-bg, var(--btn-primary));
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

/* ── Responsive: móvil apila los paneles ──────────────────────────────── */
@media (max-width: 768px) {
    .login-wrapper {
        flex-direction: column;
    }

    .login-left {
        flex: none;
        min-height: 30vh;
        padding: var(--padding-large);
    }

    .login-logo {
        width: 72px;
        height: 72px;
    }

    .login-right {
        flex: 1;
        min-height: 70vh;
    }
}
</style>
