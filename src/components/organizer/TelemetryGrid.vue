<template>
  <div class="grid grid-cols-2 lg:grid-cols-1 gap-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center text-center p-6 hover-lift relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <h3 class="text-xs text-zinc-400 font-bold mb-2 uppercase tracking-widest">WBGT Heat Safety</h3>
      <div class="text-4xl font-black tracking-tighter" :class="wbgt > 90 ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'text-zinc-100'">
        {{ wbgt.toFixed(1) }}°<span class="text-2xl text-zinc-500 font-bold">F</span>
      </div>
    </div>
    
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center text-center p-6 hover-lift relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <h3 class="text-xs text-zinc-400 font-bold mb-2 uppercase tracking-widest">Active Incidents</h3>
      <div class="text-4xl font-black tracking-tighter text-zinc-100">{{ activeIncidentCount }}</div>
    </div>
    
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center text-center p-6 hover-lift relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <h3 class="text-xs text-zinc-400 font-bold mb-2 uppercase tracking-widest">Gate Flow Avg</h3>
      <div class="text-4xl font-black tracking-tighter text-zinc-100">{{ avgThroughput.toFixed(0) }}</div>
    </div>
    
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center text-center p-6 hover-lift relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <h3 class="text-xs text-zinc-400 font-bold mb-2 uppercase tracking-widest">Max Transit Delay</h3>
      <div class="text-4xl font-black tracking-tighter" :class="maxDelay > 20 ? 'text-red-500' : maxDelay > 10 ? 'text-amber-500' : 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'">
        {{ maxDelay }}<span class="text-2xl text-zinc-500 font-bold ml-1">m</span>
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
