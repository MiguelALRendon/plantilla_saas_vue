import { createApp, App as VueApp } from 'vue'
import './css/main.css'
import './css/constants.css'
import './css/form.css'
import App from './App.vue'
import Application from '@/models/application'
import router, { initializeRouterWithApplication } from '@/router'
import { BaseEntity } from '@/entities/base_entity'

// Inicializar el router con Application
initializeRouterWithApplication()
Application.initializeRouter(router)

const app: VueApp = createApp(App)
app.use(router)
app.mount('#app')

// Set document title from AppConfiguration
document.title = Application.AppConfiguration.value.appName

// La navegación inicial ahora la maneja el router
if (Application.ModuleList && Application.ModuleList.value && Application.ModuleList.value.length > 0) {
    try {
        // El router redirigirá automáticamente a la ruta del primer módulo
        const firstModule: typeof BaseEntity = Application.ModuleList.value[0]
        Application.changeViewToDefaultView(firstModule)
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.log('Failed to set initial module view', e.message)
        } else {
            console.log('Failed to set initial module view', e)
        }
    }
}
