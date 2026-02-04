<template>
<div :class="['confirmation-dialog-container', { closed: !isShowing }]">
  <div class="confirmation-dialog-card">
    <div class="confirmation-dialog-header">
      <h2>{{ dialogInfo.title }}</h2>
    </div>
    <div class="confirmation-dialog-body">
      <div class="confirmation-dialog-center">
        <span :class="[GGCLASS,
          {txtinfo: dialogInfo.type === confMenuType.INFO},
          {txtsuccess: dialogInfo.type === confMenuType.SUCCESS},
          {txtwarning: dialogInfo.type === confMenuType.WARNING},
          {txterror: dialogInfo.type === confMenuType.ERROR}
        ]" class="dialog-icon">{{ 
          dialogInfo.type === confMenuType.INFO ? GGICONS.INFO :
          dialogInfo.type === confMenuType.SUCCESS ? GGICONS.CHECK :
          dialogInfo.type === confMenuType.WARNING ? GGICONS.WARNING :
          dialogInfo.type === confMenuType.ERROR ? GGICONS.CLOSE : ''
          }}</span>
        <p :class="[
          {txtinfo: dialogInfo.type === confMenuType.INFO},
          {txtsuccess: dialogInfo.type === confMenuType.SUCCESS},
          {txtwarning: dialogInfo.type === confMenuType.WARNING},
          {txterror: dialogInfo.type === confMenuType.ERROR}
        ]">{{ dialogInfo.message }}</p>
      </div>
    </div>
    <div class="confirmation-dialog-footer">
      <button v-if="dialogInfo.confirmationAction" class="button info fill" @click="Application.acceptConfigurationMenu()">
        <span :class="GGCLASS">{{ GGICONS.CHECK }}</span>
        {{ dialogInfo.acceptButtonText || 'Aceptar' }}
      </button>
      <button class="button alert fill" @click="Application.closeConfirmationMenu()">
        <span :class="GGCLASS">{{ GGICONS.CLOSE }}</span>
        {{ dialogInfo.cancelButtonText || 'Cancelar' }}
      </button>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { GGICONS, GGCLASS } from '@/constants/ggicons';
import { confMenuType } from '@/enums/conf_menu_type';
import Application from '@/models/application';

export default {
  name: 'ConfirmationDialogComponent',
  computed: {
    dialogInfo() {
      return Application.confirmationMenu.value;
    },
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
  z-index: 800;
  background-color: var(--overlay-dark);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
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
  border-radius: 1rem;
  box-shadow: var(--shadow-dark);
  overflow: hidden;
  transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.confirmation-dialog-container.closed .confirmation-dialog-card {
  max-width: 0px;
  max-height: 0px;
}

.confirmation-dialog-header {
  padding-bottom: .5rem;
  padding-top: 1rem;
  text-align: center;
  flex-shrink: 0;
}

.confirmation-dialog-body {
  padding: .5rem;
  flex: 1;
  overflow-y: auto;
}
.confirmation-dialog-center {
  text-align: center;
  background-color: var(--bg-gray);
  padding: 1rem;
  border-radius: 1rem;
}

.confirmation-dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  padding-top: 0.5rem;
  padding-inline: 1rem;
  flex-shrink: 0;
}

.dialog-icon {
  font-size: 3rem;
}

.txtinfo, .txtinfo span {
  color: var(--blue-1) !important;
}
.txtsuccess, .txtsuccess span {
  color: var(--green-main);
}
.txtwarning, .txtwarning span {
  color: var(--warning);
}
.txterror, .txterror span {
  color: var(--error);
}
</style>