import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

import { i18n } from './i18n';
import { useStadiumStore } from './store/useStadiumStore';
import { useSystemStore } from './store/useSystemStore';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

// High Contrast Mode detection based on system preferences, can be overridden by user session
if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
  document.body.classList.add('high-contrast-outdoor');
}

const store = useStadiumStore();

// Mount immediately so the user doesn't see a blank screen
app.mount('#app');

// Run health checks asynchronously
async function initHealthChecks() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  let isOffline = false;

  if (!supabaseUrl) {
    isOffline = true;
  } else {
    try {
      // Try to ping supabase health (or just the base URL)
      await fetch(`${supabaseUrl}/auth/v1/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    } catch {
      isOffline = true;
    }
  }

  store.setOfflineMode(isOffline);

  const systemStore = useSystemStore();
  systemStore.checkHealth();
  setInterval(() => systemStore.checkHealth(), 30_000);
}

initHealthChecks();
