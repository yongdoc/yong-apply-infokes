import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { authStore } from './stores/auth-store'

authStore.loadFromStorage()

createApp(App).use(router).mount('#app')
