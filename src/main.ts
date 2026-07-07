import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// High Contrast Mode detection based on system preferences, can be overridden by user session
if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
  document.body.classList.add('high-contrast-outdoor');
}

app.mount('#app');
