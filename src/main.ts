import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import VueApexCharts from 'vue3-apexcharts';
import './assets/main.css';

import { i18n } from './i18n';

const app = createApp(App);

app.use(VueApexCharts);
app.use(createPinia());
app.use(router);
app.use(i18n);

// High Contrast Mode detection based on system preferences, can be overridden by user session
if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
  document.body.classList.add('high-contrast-outdoor');
}

app.mount('#app');
