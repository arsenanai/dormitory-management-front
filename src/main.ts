

console.log('E2E DEBUG: main.ts loaded');
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import './index.css';
import VueKonva from 'vue-konva';
import { useAuthStore } from '@/stores/auth';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(VueKonva);

// Ensure authStore is initialized before mounting the app
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#app');