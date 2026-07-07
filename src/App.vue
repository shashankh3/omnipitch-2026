<template>
  <!-- Global Error Boundary Fallback UI -->
  <div v-if="hasError" class="h-screen w-full bg-[#050510] flex flex-col items-center justify-center text-center px-4 select-none">
    <div class="mb-6 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <h1 class="text-3xl font-black italic uppercase text-white tracking-tight mb-3">System Fault Detected</h1>
    <p class="text-white/60 max-w-md mb-8">An unexpected core telemetry failure occurred in the OmniPitch ecosystem. Safe mode engaged.</p>
    <button @click="resetError" class="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95">
      Reboot System
    </button>
  </div>

  <!-- Main entry point for the Vue Router -->
  <router-view v-else></router-view>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from 'vue';
import { useStadiumStore } from './store/useStadiumStore';

const hasError = ref(false);

// Global Error Boundary
onErrorCaptured((err, instance, info) => {
  console.error('OmniPitch Global Error Boundary Caught:', err, info);
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
});
</script>

<style>
/* Global styles imported in main.ts */
</style>
