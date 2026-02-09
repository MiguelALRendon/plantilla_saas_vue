<template>
<div :class="'modal-background ' + (isShowing ? '' : 'closed')">
    <div :class="'modal-structure ' + (isShowing ? '' : 'closed')">
        <div class="modal-head">
            <div class="left-side">
                <div class="icon">
                    <img v-if="modalView && modalModule" :src="modalModule.getModuleIcon()" alt="">
                </div>
                <span class="title" v-if="modalView && modalModule">{{ modalModule.getModuleName() }}</span>
            </div>

            <button class="close-button" @click="closeModal"><span :class="GGCLASS">{{ GGICONS.CLOSE }}</span></button>
        </div>

        <div class="modal-body">
            <component :is="modalView" v-if="modalView && modalModule"></component>
        </div>

        <div class="modal-footer">
            <button class="button info fill">Aceptar</button>
            <button class="button alert fill" @click="closeModal">Cerrar</button>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import ICONS from '@/constants/icons';
import { BaseEntity } from '@/entities/base_entitiy';
import { ViewTypes } from '@/enums/view_type';
import Application from '@/models/application';
import { Modal } from '@/models/modal';
import Defaultlookuplistview from '@/views/default_lookup_listview.vue';
import { Component } from 'vue';

export default {
    name: 'ModalComponent',
    methods: {
        closeModal() {
            Application.ApplicationUIService.closeModal();
        },
        handleKeydown(e: KeyboardEvent) {
            if (e.key === 'Escape' && this.isShowing) {
                Application.ApplicationUIService.closeModal();
            }
        }
    },
    data() {
        return {
            ICONS,
            GGCLASS,
            GGICONS,
            Application,
            modalModule: null as typeof BaseEntity | null,
            isShowing: false,
        }
    },
    computed: {
        modalView() : Component | null {
            const modal = Application.modal.value as Modal;

            if (!modal || !modal.modalView) return null;

            this.modalModule = modal.modalView;

            switch (modal.viewType as ViewTypes) {
                case ViewTypes.LISTVIEW:
                    return modal.modalView.getModuleListComponent();
                case ViewTypes.DETAILVIEW:
                    return modal.modalView.getModuleDetailComponent();
                case ViewTypes.DEFAULTVIEW:
                    return modal.modalView.getModuleDefaultComponent();
                case ViewTypes.LOOKUPVIEW:
                    return Defaultlookuplistview;
                case ViewTypes.CUSTOMVIEW:
                    return modal.modalView.getModuleCustomComponents()?.get(modal.customViewId!) || null;
                default:
                    return null;
            }
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeydown);
        Application.eventBus.on('show-modal', () => {
            this.isShowing = true;
        });
        Application.eventBus.on('hide-modal', () => {
            this.isShowing = false;
        });
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeydown);
        Application.eventBus.off('show-modal');
        Application.eventBus.off('hide-modal');
    },
}
</script>

<style>
.modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--overlay-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 1;
    transition: 0.25s ease;
}
.modal-background.closed {
    opacity: 0;
    pointer-events: none;
}

.modal-structure {
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    max-width: 60vw;
    max-height: calc(60vh + 55px);
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
.modal-structure.closed {
    max-width: 0px;
    max-height: 0px;
}

.modal-head {
    height: 55px;
    padding-block: .25rem;
    padding-inline: 1rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}
.modal-head{box-sizing: border-box;}
.modal-head .left-side {
    width: 100%; 
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
}

.modal-body{
    flex-grow: 1;
    max-height: calc(60vh - 55px);
    height: 100%;
    overflow-y: auto;
    padding: 1rem;
    margin-inline: 0.5rem;
    box-sizing: border-box;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
}

.modal-footer {
    height: 55px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding-inline: 1rem;
    gap: 0.75rem;
}
</style>