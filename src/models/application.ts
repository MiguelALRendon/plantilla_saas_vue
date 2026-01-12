import { Component, ref, Ref } from 'vue';
import type { Module } from './module';
import type { Modal } from './modal';
import { ViewTypes } from '@/enums/view_type';
import { BaseEntity } from '@/entities/base_entitiy';
import { DetailTypes } from '@/enums/detail_type';
import { ViewPropsModel } from './view_props_model';

class ApplicationClass {
    activeView: Ref<Module<any> | null>;
    activeViewComponent: Ref<Component | null>;
    activeViewComponentProps: Ref<ViewPropsModel | null>;
    sidebarToggled: Ref<boolean>;
    isScreenLoading: Ref<boolean>;
    isShowingModal: Ref<boolean>;
    modal: Ref<Modal>;
    private static instance: ApplicationClass | null = null;

    private constructor() {
        this.activeView = ref<Module<any> | null>(null) as Ref<Module<any> | null>;
        this.activeViewComponent = ref<Component | null>(null) as Ref<Component | null>;
        this.sidebarToggled = ref<boolean>(true);
        this.isScreenLoading = ref<boolean>(false);
        this.isShowingModal = ref<boolean>(false);
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null,
            viewType: ViewTypes.LISTVIEW
        }) as Ref<Modal>;
        this.activeViewComponentProps = ref<ViewPropsModel | null>(null) as Ref<ViewPropsModel | null>;
    }

    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }

    changeView(module: Module<any>) {
        this.activeView.value = module;
        this.activeViewComponent.value = module.moduleDefaultType;
        this.activeViewComponentProps.value = null;
    }
    changeViewToDetailView(entity : BaseEntity, detailType : DetailTypes) {
        if (this.activeView.value) {
            this.activeViewComponent.value = this.activeView.value.moduleDetailType;
            this.activeViewComponentProps.value = {
                viewEntity: entity,
                viewType: detailType
            };
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

    showModal(module: Module<any>, viewType: ViewTypes, customViewId?: string) {
        this.modal.value.modalView = module;
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

    openModalOnFunction(module: Module<any>, onCloseFunction: (param : any) => void, viewType: ViewTypes, customViewId?: string) {
        this.modal.value.modalView = module;
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
export default Application;
export { Application };
