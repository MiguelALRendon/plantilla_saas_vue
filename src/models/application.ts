import { ref, Ref } from 'vue';
import type { Module } from './module';

class ApplicationClass {
    activeView: Ref<Module | null>;
    sidebarToggled: Ref<boolean>;
    isScreenLoading: Ref<boolean>;
    private static instance: ApplicationClass | null = null;

    private constructor() {
        this.activeView = ref<Module | null>(null);
        this.sidebarToggled = ref<boolean>(true);
        this.isScreenLoading = ref<boolean>(false);
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
}

const Application = ApplicationClass.getInstance();
export default Application;
export { Application };
