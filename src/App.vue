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
});
</script>

<style>
/* Global styles imported in main.ts */
</style>
