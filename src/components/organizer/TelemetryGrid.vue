<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- WBGT Heat Safety -->
    <div class="bg-panel-bg border border-white/5 rounded-2xl flex flex-col p-5 hover-lift relative overflow-hidden group" :role="wbgt > 32 ? 'alert' : undefined">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-1.5 h-4 rounded-full" :class="wbgt > 32 ? 'bg-neon-orange' : 'bg-neon-lime'"></div>
        <h3 class="text-xs text-zinc-400 font-medium tracking-wide">WBGT Safety</h3>
      </div>
      <div class="text-3xl font-bold tracking-tighter" :class="wbgt > 32 ? 'text-neon-orange' : 'text-white'">
        {{ wbgt.toFixed(1) }}<span class="text-lg text-zinc-600 font-normal ml-1">°C</span>
      </div>
    </div>
    
    <!-- Active Incidents -->
    <div class="bg-panel-bg border border-white/5 rounded-2xl flex flex-col p-5 hover-lift relative overflow-hidden group">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-1.5 h-4 rounded-full bg-red-500"></div>
        <h3 class="text-xs text-zinc-400 font-medium tracking-wide">Active Incidents</h3>
      </div>
      <div class="text-3xl font-bold tracking-tighter text-white">{{ activeIncidentCount }}</div>
    </div>
    
    <!-- Gate Flow Avg -->
    <div class="bg-panel-bg border border-white/5 rounded-2xl flex flex-col p-5 hover-lift relative overflow-hidden group">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-1.5 h-4 rounded-full bg-[#6366f1]"></div>
        <h3 class="text-xs text-zinc-400 font-medium tracking-wide">Gate Flow Avg</h3>
      </div>
      <div class="text-3xl font-bold tracking-tighter text-white">{{ avgThroughput.toFixed(0) }} <span class="text-lg text-zinc-600 font-normal ml-1">/ min</span></div>
    </div>
    
    <!-- Max Transit Delay -->
    <div class="bg-panel-bg border border-white/5 rounded-2xl flex flex-col p-5 hover-lift relative overflow-hidden group">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-1.5 h-4 rounded-full" :class="maxDelay > 20 ? 'bg-red-500' : maxDelay > 10 ? 'bg-neon-orange' : 'bg-neon-lime'"></div>
        <h3 class="text-xs text-zinc-400 font-medium tracking-wide">Max Transit Delay</h3>
      </div>
      <div class="text-3xl font-bold tracking-tighter" :class="maxDelay > 20 ? 'text-red-500' : maxDelay > 10 ? 'text-neon-orange' : 'text-neon-lime'">
        {{ maxDelay }}<span class="text-lg text-zinc-600 font-normal ml-1">m</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';

const store = useStadiumStore();

const wbgt = computed(() => store.telemetry.wbgtTemperature);

const activeIncidentCount = computed(() => {
  return store.incidents.filter(i => i.status !== 'RESOLVED').length;
});

const avgThroughput = computed(() => {
  const gates = Object.values(store.telemetry.gateThroughput);
  const total = gates.reduce((sum, val) => sum + val, 0);
  return gates.length ? total / gates.length : 0;
});

const maxDelay = computed(() => {
  const delays = Object.values(store.telemetry.transitDelays);
  return delays.length ? Math.max(...delays) : 0;
});
</script>
