<template>
    <div ref="overlayRef" class="modal-background">
        <div ref="panelRef" class="modal-structure">
            <div class="modal-head">
                <div class="left-side">
                    <div class="icon">
                        <img v-if="modalModule" :src="modalModuleIcon" alt="" />
                    </div>
                    <span class="title" v-if="modalModule">{{ modalModuleName }}</span>
                </div>
                <button class="close-button" @click="closeModal">
                    <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.CLOSE }}</span>
                </button>
            </div>

            <div class="modal-body">
                <component :is="modalView" v-if="modalView && modalModule"></component>
            </div>

            <div class="modal-footer">
                <button class="button alert fill" @click="closeModal">
                    <span :class="[GGCLASS, 'btn-icon']">{{ GGICONS.CLOSE }}</span>
                    <span class="btn-label">{{ t('common.close') }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';
import { GGCLASS, GGICONS } from '@/constants/ggicons';
import { BaseEntity } from '@/entities/base_entity';
import { ViewTypes } from '@/enums/view_type';
import { GetLanguagedText } from '@/helpers/language_helper';
import Application from '@/models/application';
import { Modal } from '@/models/modal';
import Defaultlookuplistview from '@/views/default_lookup_listview.vue';

// #region PROPERTIES
const overlayRef = ref<HTMLElement | null>(null);
const panelRef   = ref<HTMLElement | null>(null);
const isShowing  = ref(false);
// #endregion

// #region COMPUTED
const modalModule = computed<typeof BaseEntity | null>(() => {
    const modal = Application.modal.value as Modal;
    return modal?.modalView ?? null;
});

const modalModuleIcon = computed(() => modalModule.value?.getModuleIcon());
const modalModuleName = computed(() => modalModule.value?.getModuleName());

const modalView = computed(() => {
    const modal = Application.modal.value as Modal;
    if (!modal || !modal.modalView) return null;

    switch (modal.viewType as ViewTypes) {
        case ViewTypes.LISTVIEW:    return modal.modalView.getModuleListComponent();
        case ViewTypes.DETAILVIEW:  return modal.modalView.getModuleDetailComponent();
        case ViewTypes.DEFAULTVIEW: return modal.modalView.getModuleDefaultComponent();
        case ViewTypes.LOOKUPVIEW:  return Defaultlookuplistview;
        case ViewTypes.CUSTOMVIEW:  return modal.modalView.getModuleCustomComponents()?.get(modal.customViewId!) || null;
        default: return null;
    }
});
// #endregion

// #region METHODS
function t(path: string): string {
    return GetLanguagedText(path);
}

function closeModal(): void {
    Application.ApplicationUIService.closeModal();
}

function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && isShowing.value) {
        Application.ApplicationUIService.closeModal();
    }
}

function showModal(): void {
    const overlay = overlayRef.value;
    const panel   = panelRef.value;
    if (!overlay || !panel) return;

    isShowing.value = true;
    gsap.set(overlay, { display: 'flex', pointerEvents: 'all' });

    gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
    );
    gsap.fromTo(panel,
        { scale: 0.86, opacity: 0, y: -20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );
}

function hideModal(): void {
    const overlay = overlayRef.value;
    const panel   = panelRef.value;
    if (!overlay || !panel) return;

    const tl = gsap.timeline({
        onComplete: () => {
            isShowing.value = false;
            gsap.set(overlay, { display: 'none', pointerEvents: 'none' });
        },
    });
    tl.to(panel,   { scale: 0.9, opacity: 0, y: 10, duration: 0.22, ease: 'power2.in' })
      .to(overlay, { opacity: 0, duration: 0.18, ease: 'power2.in' }, '-=0.1');
}
// #endregion

// #region LIFECYCLE
onMounted(() => {
    gsap.set(overlayRef.value, { display: 'none', opacity: 0, pointerEvents: 'none' });
    window.addEventListener('keydown', handleKeydown);
    Application.eventBus.on('show-modal', showModal);
    Application.eventBus.on('hide-modal', hideModal);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
    Application.eventBus.off('show-modal', showModal);
    Application.eventBus.off('hide-modal', hideModal);
});
// #endregion
</script>

<style scoped>
.modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--overlay-dark);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: var(--z-modal);
    will-change: opacity;
}

.modal-structure {
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-dark);
    max-width: 60vw;
    max-height: calc(60vh + var(--modal-header-footer-height));
    width: 100%;
    height: 100%;
    overflow: hidden;
    will-change: transform, opacity;
}

.modal-head {
    height: var(--modal-header-footer-height);
    padding-block: var(--spacing-xs);
    padding-inline: var(--spacing-lg);
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
}

.modal-head .left-side {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-lg);
}

.modal-body {
    flex-grow: 1;
    max-height: calc(60vh - var(--modal-header-footer-height));
    height: 100%;
    overflow-y: auto;
    padding: var(--spacing-lg);
    margin-inline: var(--spacing-sm);
    box-sizing: border-box;
    background-color: var(--bg-gray);
    border-radius: var(--border-radius);
}

.modal-footer {
    height: var(--modal-header-footer-height);
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding-inline: var(--spacing-lg);
    gap: var(--spacing-md);
}
</style>
