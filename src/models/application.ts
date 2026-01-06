import { ref, Ref } from 'vue';
import type { Module } from './module';
import type { Modal } from './modal';
import { ViewType } from '@/enums/view_type';

class ApplicationClass {
    activeView: Ref<Module<any> | null>;
    sidebarToggled: Ref<boolean>;
    isScreenLoading: Ref<boolean>;
    isShowingModal: Ref<boolean>;
    modal: Ref<Modal>;
    private static instance: ApplicationClass | null = null;

    private constructor() {
        this.activeView = ref<Module<any> | null>(null) as Ref<Module<any> | null>;
        this.sidebarToggled = ref<boolean>(true);
        this.isScreenLoading = ref<boolean>(false);
        this.isShowingModal = ref<boolean>(false);
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null,
            viewType: ViewType.LISTVIEW
        }) as Ref<Modal>;
    }

    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }

    changeView(module: Module<any>) {
        this.activeView.value = module;
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

    showModal(module: Module<any>, viewType: ViewType, customViewId?: string) {
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

    openModalOnFunction(module: Module<any>, onCloseFunction: () => void, viewType: ViewType, customViewId?: string) {
        this.modal.value.modalView = module;
        this.modal.value.modalOnCloseFunction = onCloseFunction;
        this.modal.value.viewType = viewType;
        this.modal.value.customViewId = customViewId;
        this.isShowingModal.value = true;
    }

    closeModalOnFunction() {
        if (this.modal.value.modalOnCloseFunction) {
            this.modal.value.modalOnCloseFunction();
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
