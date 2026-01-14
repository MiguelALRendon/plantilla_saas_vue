import { Component, ref, Ref } from 'vue';
import type { Modal } from './modal';
import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entitiy';
import { Products } from '@/entities/products';

class ApplicationClass {
    ModuleList: Ref<(typeof BaseEntity)[]>;
    activeViewEntity: Ref<typeof BaseEntity | null>;
    activeViewComponent: Ref<Component | null>;
    activeViewComponentProps: Ref<BaseEntity | null>;
    sidebarToggled: Ref<boolean>;
    isScreenLoading: Ref<boolean>;
    isShowingModal: Ref<boolean>;
    modal: Ref<Modal>;
    private static instance: ApplicationClass | null = null;

    private constructor() {
        this.ModuleList = ref<(typeof BaseEntity)[]>([]) as Ref<(typeof BaseEntity)[]>;
        this.activeViewEntity = ref<typeof BaseEntity | null>(null) as Ref<typeof BaseEntity | null>;
        this.activeViewComponent = ref<Component | null>(null) as Ref<Component | null>;
        this.sidebarToggled = ref<boolean>(true);
        this.isScreenLoading = ref<boolean>(false);
        this.isShowingModal = ref<boolean>(false);
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null,
            viewType: ViewTypes.LISTVIEW
        }) as Ref<Modal>;
        this.activeViewComponentProps = ref<BaseEntity | null>(null) as Ref<BaseEntity | null>;
    }

    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }

    changeView(entity: typeof BaseEntity) {
        this.activeViewEntity.value = entity;
        this.activeViewComponent.value = entity.getModuleDefaultComponent();
    }

    changeViewToDetailView(entity: BaseEntity) {
        if (this.activeViewEntity.value) {
            this.activeViewComponentProps.value = entity;
            this.activeViewComponent.value = this.activeViewEntity.value.getModuleDetailComponent();
        }
    }

    toggleSidebar() {
        this.sidebarToggled.value = !this.sidebarToggled.value;
    }

    setSidebar(state: boolean) {
        this.sidebarToggled.value = state;
    }

    showLoadingScreen() {
        this.isScreenLoading.value = true;
    }

    hideLoadingScreen() {
        this.isScreenLoading.value = false;
    }

    showModal(entity: typeof BaseEntity, viewType: ViewTypes, customViewId?: string) {
        this.modal.value.modalView = entity;
        this.modal.value.modalOnCloseFunction = null;
        this.modal.value.viewType = viewType;
        this.modal.value.customViewId = customViewId;
        this.isShowingModal.value = true;
    }

    closeModal() {
        this.isShowingModal.value = false;
        setTimeout(() => {
            this.modal.value.modalView = null;
        }, 150);
    }

    openModalOnFunction(entity: typeof BaseEntity, onCloseFunction: (param : any) => void, viewType: ViewTypes, customViewId?: string) {
        this.modal.value.modalView = entity;
        this.modal.value.modalOnCloseFunction = onCloseFunction;
        this.modal.value.viewType = viewType;
        this.modal.value.customViewId = customViewId;
        this.isShowingModal.value = true;
    }

    closeModalOnFunction(param : any) {
        if (this.modal.value.modalOnCloseFunction) {
            this.modal.value.modalOnCloseFunction(param);
        }
        this.isShowingModal.value = false;
        setTimeout(() => {
            this.modal.value.modalView = null;
            this.modal.value.modalOnCloseFunction = null;
        }, 150);
    }
}

const Application = ApplicationClass.getInstance();

Application.ModuleList.value.push(Products);
export default Application;
export { Application };
