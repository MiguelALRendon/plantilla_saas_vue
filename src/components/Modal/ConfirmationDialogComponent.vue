<template>
    <div :class="['confirmation-dialog-container', { closed: !isShowing }]">
        <div class="confirmation-dialog-card">
            <div class="confirmation-dialog-header">
                <h2>{{ dialogInfo.title }}</h2>
            </div>
            <div class="confirmation-dialog-body">
                <div class="confirmation-dialog-center">
                    <span
                        :class="[
                            GGCLASS,
                            { txtinfo: dialogInfo.type === confMenuType.INFO },
                            { txtsuccess: dialogInfo.type === confMenuType.SUCCESS },
                            { txtwarning: dialogInfo.type === confMenuType.WARNING },
                            { txterror: dialogInfo.type === confMenuType.ERROR }
                        ]"
                        class="dialog-icon"
                        >{{ dialogIcon }}</span
                    >
                    <p
                        :class="[
                            { txtinfo: dialogInfo.type === confMenuType.INFO },
                            { txtsuccess: dialogInfo.type === confMenuType.SUCCESS },
                            { txtwarning: dialogInfo.type === confMenuType.WARNING },
                            { txterror: dialogInfo.type === confMenuType.ERROR }
                        ]"
                    >
                        {{ dialogInfo.message }}
                    </p>
                </div>
            </div>
            <div class="confirmation-dialog-footer">
                <button
                    v-if="dialogInfo.confirmationAction"
                    class="button info fill"
                    @click="Application.ApplicationUIService.acceptConfigurationMenu()"
                >
                    <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
                    {{ dialogInfo.acceptButtonText || 'Aceptar' }}
                </button>
                <button class="button alert fill" @click="Application.ApplicationUIService.closeConfirmationMenu()">
                    <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
                    {{ dialogInfo.cancelButtonText || 'Cancelar' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { ConfMenuType as confMenuType } from '@/enums/conf_menu_type';
import Application from '@/models/application';

export default {
    name: 'ConfirmationDialogComponent',
    computed: {
        dialogInfo() {
            return Application.confirmationMenu.value;
        },
        dialogIcon(): string {
            switch (this.dialogInfo.type) {
                case confMenuType.INFO:
                    return GGICONS.INFO;
                case confMenuType.SUCCESS:
                    return GGICONS.CHECK;
                case confMenuType.WARNING:
                    return GGICONS.WARNING;
                case confMenuType.ERROR:
                    return GGICONS.CLOSE;
                default:
                    return '';
            }
        }
    },
    data() {
        return {
            Application,
            GGCLASS,
            GGICONS,
            confMenuType,
            isShowing: false
        };
    },
    mounted() {
        Application.eventBus.on('show-confirmation', () => {
            this.isShowing = true;
        });
        Application.eventBus.on('hide-confirmation', () => {
            this.isShowing = false;
        });
    },
    beforeUnmount() {
        Application.eventBus.off('show-confirmation');
        Application.eventBus.off('hide-confirmation');
    }
};
</script>

<style scoped>
.confirmation-dialog-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-toast);
    background-color: var(--overlay-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity var(--transition-normal) var(--timing-ease);
}

.confirmation-dialog-container.closed {
    opacity: 0;
    pointer-events: none;
}

.confirmation-dialog-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    max-height: 300px;
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    overflow: hidden;
    transition: var(--transition-normal) var(--timing-bounce);
}

.confirmation-dialog-container.closed .confirmation-dialog-card {
    transform: var(--transform-scale-min);
}

.confirmation-dialog-header {
    padding-bottom: var(--spacing-sm);
    padding-top: var(--spacing-lg);
    text-align: center;
    flex-shrink: 0;
}

.confirmation-dialog-body {
    padding: var(--spacing-sm);
    flex: 1;
    overflow-y: auto;
}
.confirmation-dialog-center {
    text-align: center;
    background-color: var(--bg-gray);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
}

.confirmation-dialog-footer {
    display: flex;
    flex-direction: row;
    justify-content: end;
    align-items: center;
    gap: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
    padding-top: var(--spacing-sm);
    padding-inline: var(--spacing-lg);
    flex-shrink: 0;
}

.dialog-icon {
    font-size: 3rem;
}

.txtinfo,
.txtinfo span {
    color: var(--blue-1);
}
.txtsuccess,
.txtsuccess span {
    color: var(--green-main);
}
.txtwarning,
.txtwarning span {
    color: var(--warning);
}
.txterror,
.txterror span {
    color: var(--accent-red);
}
</style>
