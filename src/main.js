import { createApp } from 'vue'
import './css/main.css'
import App from './App.vue'
import Application from '@/models/application'
import { MODULES } from '@/constants/modules'

// Initialize singleton and set default active view
Application.changeView(MODULES[0]);

createApp(App).mount('#app')
