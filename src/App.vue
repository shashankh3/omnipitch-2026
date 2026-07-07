<template>
  <!-- Main entry point for the Vue Router -->
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useStadiumStore } from './store/useStadiumStore';

onMounted(() => {
  const store = useStadiumStore();
  store.startTelemetrySimulation();
  
  if (store.globalTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>

<style>
/* Global styles imported in main.ts */
</style>
