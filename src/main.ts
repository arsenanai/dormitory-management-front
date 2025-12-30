import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import "./index.css";
import VueKonva from "vue-konva";
import { useAuthStore } from "@/stores/auth";
import { useAccessibility } from "@/composables/useAccessibility";

// Load saved locale from localStorage
const savedLocale = localStorage.getItem("locale");
if (savedLocale && ["en", "ru", "kk"].includes(savedLocale)) {
  (i18n.global.locale as any).value = savedLocale;
}

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(VueKonva);

// Ensure authStore is initialized before mounting the app
const authStore = useAuthStore();
const { loadSettings: loadAccessibilitySettings } = useAccessibility();

// Load accessibility settings
// try {
//   loadAccessibilitySettings();
// } catch (error) {
//   console.error('Failed to load accessibility settings:', error);
// }

authStore
  .initializeAuth()
  .then(() => {
    app.mount("#app");
  })
  .catch((error) => {
    // If auth initialization fails, still mount the app
    console.error("Auth initialization failed:", error);
    app.mount("#app");
  });
