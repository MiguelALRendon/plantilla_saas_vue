import { createApp, App as VueApp } from 'vue';
import './css/main.css';
import './css/constants.css';
import './css/form.css';
import App from './App.vue';
import Application from '@/models/application';
import router from '@/router';

Application.initializeRouter(router);

const app: VueApp = createApp(App);
app.use(router);
app.mount('#app');

// Set document title from AppConfiguration
document.title = Application.AppConfiguration.value.appName;
