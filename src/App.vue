<template>
  <a href="#main-content" class="sr-only focus:not-sr-only fixed top-4 left-4 z-50 px-4 py-2 bg-white text-black rounded font-bold shadow-lg">Skip to main content</a>
  <!-- System Alerts (Hidden on Login Page) -->
  <div
    v-if="route.name !== 'login'"
    class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
    role="region"
    aria-label="System alerts"
    aria-live="polite"
  >
    <div
      v-for="alert in visibleAlerts"
      :key="alert.id"
      :class="[
        'rounded-lg p-3 text-sm flex items-start gap-2 shadow-lg',
        'backdrop-blur-md border',
        alert.severity === 'CRITICAL' ? 'bg-purple-900/90 border-purple-500 text-white' :
        alert.severity === 'HIGH'     ? 'bg-red-900/90 border-red-500 text-white' :
        alert.severity === 'MEDIUM'   ? 'bg-amber-900/90 border-amber-500 text-white' :
                                        'bg-slate-800/90 border-slate-600 text-slate-200'
      ]"
    >
      <span class="flex-1">
        {{ alert.message[currentLanguage] || alert.message.en }}
      </span>
      <button
        type="button"
        @click="dismiss(alert.id)"
        class="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        :aria-label="`Dismiss alert: ${alert.message.en}`"
      >✕</button>
    </div>
  </div>

  <div v-if="hasError" class="h-screen w-full bg-[#050510] flex flex-col items-center justify-center text-center px-4 select-none">
    <div class="mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <h1 class="text-3xl font-black italic uppercase text-white tracking-tight mb-3">System Fault Detected</h1>
    <p class="text-white/60 max-w-md mb-8">An unexpected core telemetry failure occurred in the OmniPitch ecosystem. Safe mode engaged.</p>
    <button type="button" @click="resetError" class="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95">
      Reboot System
    </button>
  </div>

  <!-- Main entry point for the Vue Router -->
  <main id="main-content" v-else class="h-full w-full">
    <router-view></router-view>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onErrorCaptured, onMounted, watch } from 'vue';
import { logger } from './services/logger';
import { useStadiumStore } from './store/useStadiumStore';
import { useProactiveAlerts } from './composables/useProactiveAlerts';
import { useSessionStore } from './store/useSessionStore';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { visibleAlerts, dismiss } = useProactiveAlerts();
const session = useSessionStore();
const { locale } = useI18n();

const currentLanguage = computed(
  () => (session.currentSession?.language as 'en' | 'es' | 'fr' | 'de') ?? 'en'
);

watch(currentLanguage, (newLang) => {
  locale.value = newLang;
  document.documentElement.lang = newLang;
}, { immediate: true });

const hasError = ref(false);

onErrorCaptured((err) => {
  logger.error('OmniPitch Global Error Boundary Caught:', err ? 1 : 0);
  hasError.value = true;
  return false; // Prevent error from propagating further
});

const resetError = () => {
  hasError.value = false;
  window.location.reload();
};

onMounted(() => {
  const store = useStadiumStore();
  store.startTelemetrySimulation();
  store.initRealtime();
});
</script>

<style>
/* Global styles imported in main.ts */
</style>
