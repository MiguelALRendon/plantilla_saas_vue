import { ref, Ref } from 'vue';
import type { Module } from './module';
import type { Modal } from './modal';

class ApplicationClass {
    activeView: Ref<Module | null>;
    sidebarToggled: Ref<boolean>;
    isScreenLoading: Ref<boolean>;
    isShowingModal: Ref<boolean>;
    modal: Ref<Modal>;
    private static instance: ApplicationClass | null = null;

    private constructor() {
        this.activeView = ref<Module | null>(null);
        this.sidebarToggled = ref<boolean>(true);
        this.isScreenLoading = ref<boolean>(false);
        this.isShowingModal = ref<boolean>(false);
        this.modal = ref<Modal>({
            modalView: null,
            modalOnCloseFunction: null
        });
    }

    static getInstance() {
        if (!this.instance) this.instance = new ApplicationClass();
        return this.instance;
    }

    changeView(module: Module) {
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

    showModal(module: Module) {
        this.modal.value.modalView = module;
        this.modal.value.modalOnCloseFunction = null;
        this.isShowingModal.value = true;
    }

    closeModal() {
        this.isShowingModal.value = false;
        setTimeout(() => {
            this.modal.value.modalView = null;
        }, 150);
    }

    openModalOnFunction(module: Module, onCloseFunction: () => void) {
        this.modal.value.modalView = module;
        this.modal.value.modalOnCloseFunction = onCloseFunction;
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
        }, 1000);
    }
}

const Application = ApplicationClass.getInstance();
export default Application;
export { Application };
