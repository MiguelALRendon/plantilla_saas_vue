import { createApp } from 'vue'
import './css/main.css'
import './css/constants.css'
import './css/form.css'
import App from './App.vue'
import Application from '@/models/application'

const app = createApp(App)
app.mount('#app')

// Set document title from AppConfiguration
document.title = Application.AppConfiguration.value.appName

if (Application.ModuleList && Application.ModuleList.value && Application.ModuleList.value.length > 0) {
	try {
		Application.changeView(Application.ModuleList.value[0])
	} catch (e) {
		console.log('Failed to set initial module view', e)
	}
}