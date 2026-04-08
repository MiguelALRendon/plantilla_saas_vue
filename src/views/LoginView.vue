<template>
    <div class="login-wrapper">

        <!-- ── Panel izquierdo: imagen/marca ─────────────────────── -->
        <div class="login-left">
            <img :src="appLogo" class="login-logo" alt="logo" />
            <h1 class="login-app-name">{{ appName }}</h1>
        </div>

        <!-- ── Panel derecho: formulario con color plano ─────────── -->
        <div class="login-right">

            <!-- Botón dark/light mode — usa el sistema real de temas -->
            <button class="login-theme-toggle" type="button" @click="toggleDarkMode" :title="isDark ? 'Modo claro' : 'Modo oscuro'">
                <span :class="GGCLASS">{{ isDark ? GGICONS.LIGHT_MODE : GGICONS.DARK_MODE }}</span>
            </button>

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

                    <button type="submit" class="login-submit" :disabled="isLoading">
                        {{ isLoading ? t('common.loading') : t('common.auth.login') }}
                    </button>
                </form>
            </div>
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
    background-color: var(--login-panel-bg, var(--btn-primary));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: var(--padding-large);
}

/* ── Botón de tema ────────────────────────────────────────────────────── */
.login-theme-toggle {
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

.login-theme-toggle:hover {
    background-color: rgba(255, 255, 255, 0.35);
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
    .login-wrapper { flex-direction: column; }
    .login-left { flex: none; min-height: 30vh; }
    .login-logo { width: 72px; height: 72px; }
    .login-right { flex: 1; min-height: 70vh; }
}
</style>
