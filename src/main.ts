import { createApp, App as VueApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import './css/main.css';
import './css/constants.css';
import './css/form.css';
import './css/table.css';
import App from './App.vue';
import Application from '@/models/application';
import router from '@/router';
import { Home } from '@/entities/home';
import { Capitulo } from './entities/capitulo';
import { Imagen } from './entities/imagen';

// T084: Create and activate Pinia before the Application singleton is instantiated
// so stores are available when ApplicationClass constructor is called.
const pinia = createPinia();
setActivePinia(pinia);

Application.initializeApplication(router);
Application.registerModule(Home);
Application.registerModule(Capitulo);
Application.registerModule(Imagen);

const app: VueApp = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');

/** Set document title from AppConfiguration */
document.title = Application.AppConfiguration.value.appName;
