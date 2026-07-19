<template>
  <div class="flex flex-col h-full bg-zinc-900/80 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative glass-panel-dark">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
      <div class="flex items-center gap-3">
        <h3 class="text-white font-bold tracking-tight">Incident Log</h3>
        <p class="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Real-time Stream</p>
      </div>
      <span class="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
        {{ store.incidents.length }} Total
      </span>
    </div>

    <!-- Data Table Header -->
    <div class="grid grid-cols-12 gap-4 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-6 py-3 border-b border-zinc-800 bg-zinc-950/80">
      <div class="col-span-2">ID</div>
      <div class="col-span-3">Type</div>
      <div class="col-span-3">Location</div>
      <div class="col-span-2">Severity</div>
      <div class="col-span-2 text-right">Status</div>
    </div>

    <!-- Virtual List -->
    <div v-bind="containerProps" class="flex-1 overflow-y-auto custom-scrollbar p-2">
      <div v-bind="wrapperProps">
        <div 
          v-for="{ data } in list" 
          :key="data.id"
          class="h-[60px] flex items-center px-4 hover:bg-white/[0.02] transition-colors border-b border-zinc-800/50 group"
        >
          <div class="grid grid-cols-12 gap-4 w-full items-center">
            <div class="col-span-2 text-zinc-500 font-mono text-[10px] truncate" :title="data.id">{{ data.id.substring(0, 13) }}...</div>
            <div class="col-span-3 font-bold text-white text-xs truncate">{{ data.type.replace('_', ' ') }}</div>
            <div class="col-span-3">
              <div class="text-zinc-200 text-xs font-semibold truncate">{{ data.location.section }}</div>
              <div class="text-[10px] text-zinc-500">Gate {{ data.location.gate }}</div>
            </div>
            <div class="col-span-2">
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded" :class="getSeverityClass(data.severity)">
                {{ data.severity }}
              </span>
            </div>
            <div class="col-span-2 text-right text-[10px] font-mono text-zinc-400">{{ data.status }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import { useVirtualList } from '@vueuse/core';

const store = useStadiumStore();

const sortedIncidents = computed(() => {
  return [...store.incidents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
});

const { list, containerProps, wrapperProps } = useVirtualList(
  sortedIncidents,
  {
    itemHeight: 60,
  }
);

const getSeverityClass = (severity: string) => {
  switch(severity) {
    case 'CRITICAL': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'HIGH': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    case 'MEDIUM': return 'bg-lime-500/20 text-lime-400 border border-lime-500/30';
    case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    default: return 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30';
  }
};
</script>
