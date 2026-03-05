import { createApp, App as VueApp } from 'vue';
import './css/main.css';
import './css/constants.css';
import './css/form.css';
import './css/table.css';
import App from './App.vue';
import Application from '@/models/application';
import router from '@/router';
import { Product } from '@/entities/product';
import { Customer } from '@/entities/customer';

Application.initializeApplication(router);
Application.registerModule(Product);
Application.registerModule(Customer);

const app: VueApp = createApp(App);
app.use(router);
app.mount('#app');

/** Set document title from AppConfiguration */
document.title = Application.AppConfiguration.value.appName;
