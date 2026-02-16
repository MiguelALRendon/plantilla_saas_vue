import { createApp, App as VueApp } from 'vue';
import './css/main.css';
import './css/constants.css';
import './css/form.css';
import App from './App.vue';
import Application from '@/models/application';
import router, { initializeRouterWithApplication } from '@/router';
import { BaseEntity } from '@/entities/base_entity';

// Initialize router with Application
initializeRouterWithApplication();
Application.initializeRouter(router);

const app: VueApp = createApp(App);
app.use(router);
app.mount('#app');

// Set document title from AppConfiguration
document.title = Application.AppConfiguration.value.appName;

// Initial navigation is now handled by the router
if (Application.ModuleList && Application.ModuleList.value && Application.ModuleList.value.length > 0) {
    try {
        // Router will automatically redirect to first module route
        const firstModule: typeof BaseEntity = Application.ModuleList.value[0];
        Application.changeViewToDefaultView(firstModule);
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.log('Failed to set initial module view', e.message);
        } else {
            console.log('Failed to set initial module view', e);
        }
    }
}
