<template>
<div :class="'modal-background ' + (Application.isShowingModal ? '' : 'closed')">
    <div :class="'modal-structure ' + (Application.isShowingModal ? '' : 'closed')">
        <div class="modal-head">
            <div class="left-side">
                <div class="icon">
                    <img :src="modalView.icon" alt="" v-if="modalView">
                </div>
                <span class="title" v-if="modalView">{{ modalView.nombre }}</span>
            </div>

            <button class="close-button" @click="closeModal"><span :class="GGCLASS">{{ GGICONS.CLOSE }}</span></button>
        </div>

        <div class="modal-body">
            <component :is="modalView.type" v-if="modalView"></component>
        </div>

        <div class="modal-footer">
            <button class="button info fill">Aceptar</button>
            <button class="button primary fill" @click="closeModal">Cerrar</button>
        </div>
    </div>
</div>
</template>

<script>
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import ICONS from '@/constants/icons';
import Application from '@/models/application';

export default {
    name: 'ModalComponent',
    methods: {
        closeModal() {
            Application.closeModal();
        },
        handleKeydown(e) {
            if (e.key === 'Escape' && Application.isShowingModal) {
                Application.closeModal();
            }
        }
    },
    data() {
        return {
            ICONS,
            GGCLASS,
            GGICONS,
            Application,
        }
    },
    computed: {
        modalView() {
            return Application.modal.value.modalView;
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeydown);
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeydown);
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
    background-color: rgba(0, 0, 0, 0.5);
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
    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
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
    background-color: #f5f5f5;
    border-radius: 1rem;
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