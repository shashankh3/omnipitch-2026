<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight text-white">Urgent Dispatches</h2>
        <p class="text-white/50 text-sm mt-1">Real-time incident stream</p>
      </div>
      <span class="bg-indigo-500/20 text-indigo-400 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-500/30 shadow-sm">
        {{ activeIncidents.length }} Active
      </span>
    </div>
    
    <div v-if="activeIncidents.length === 0" class="flex flex-col items-center justify-center p-16 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl text-white/40">
      <div class="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center mb-4 border border-white/5">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500/50"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <p class="text-lg font-semibold text-white/70">No active incidents</p>
      <p class="text-sm mt-1 text-white/40">The stadium is operating smoothly.</p>
    </div>
    
    <!-- Data Table Header -->
    <div v-if="activeIncidents.length > 0" class="grid grid-cols-12 gap-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest px-4 mb-3">
      <div class="col-span-1">ID</div>
      <div class="col-span-3">Incident Type</div>
      <div class="col-span-3">Location</div>
      <div class="col-span-2">Severity</div>
      <div class="col-span-3 text-right">Action</div>
    </div>
    
    <ul v-if="activeIncidents.length > 0" class="flex flex-col gap-2">
      <li v-for="(incident, index) in activeIncidents" :key="incident.id" class="bg-panel-bg hover:bg-white/[0.02] transition-colors border border-white/5 rounded-xl px-4 py-3 group flex items-center">
        <div class="grid grid-cols-12 gap-4 w-full items-center">
          
          <!-- ID -->
          <div class="col-span-1 text-zinc-500 font-mono text-xs">
            #{{ index + 1 }}
          </div>
          
          <!-- Type -->
          <div class="col-span-3 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div class="font-bold text-white text-sm">{{ incident.type.replace('_', ' ') }}</div>
              <div class="text-xs text-zinc-500 truncate max-w-[150px]">{{ incident.description }}</div>
            </div>
          </div>
          
          <!-- Location -->
          <div class="col-span-3">
            <div class="text-white text-sm font-semibold">{{ incident.location.section }}</div>
            <div class="text-xs text-zinc-500">Gate {{ incident.location.gate }}</div>
          </div>
          
          <!-- Severity (Animated Progress Bar Style) -->
          <div class="col-span-2">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold" :class="getSeverityTextClass(incident.severity)">{{ getSeverityScore(incident.severity) }}</span>
              <span class="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{{ incident.severity }}</span>
            </div>
            <div class="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full rounded-full shadow-[0_0_8px_currentColor]" :class="getSeverityBgClass(incident.severity)" :style="{ width: getSeverityWidth(incident.severity) + '%' }"></div>
            </div>
          </div>
          
          <!-- Action -->
          <div class="col-span-3 flex justify-end gap-2">
            <button 
              type="button"
              v-if="incident.status === 'OPEN'" 
              @click="updateStatus(incident.id, 'IN_PROGRESS')"
              class="px-3 py-1.5 bg-neon-lime/10 hover:bg-neon-lime/20 text-neon-lime text-xs font-bold rounded-lg border border-neon-lime/30 transition-colors"
            >
              Acknowledge
            </button>
            <button 
              type="button"
              v-if="incident.status === 'IN_PROGRESS'" 
              @click="updateStatus(incident.id, 'RESOLVED')"
              class="px-3 py-1.5 bg-neon-orange/10 hover:bg-neon-orange/20 text-neon-orange text-xs font-bold rounded-lg border border-neon-orange/30 transition-colors"
            >
              Resolve
            </button>
          </div>
        </div>

        <!-- AI Checklist Expansion -->
        <div v-if="incident.status === 'IN_PROGRESS' && activeChecklists[incident.id]" class="w-full mt-4 p-4 rounded-xl bg-white/5 border border-white/10 motion-safe:animate-fade-in-up">
          <p class="text-[10px] uppercase font-mono tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            AI Triage Protocol Generated
          </p>
          <ul class="flex flex-col gap-2">
            <li v-for="(step, sIdx) in activeChecklists[incident.id]" :key="sIdx" class="flex items-start gap-2">
              <span class="bg-emerald-500/20 text-emerald-400 text-[10px] w-4 h-4 flex items-center justify-center rounded-full mt-0.5 shrink-0">{{sIdx + 1}}</span>
              <span class="text-sm text-white/80 font-mono">{{ step }}</span>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import { getTaskChecklist } from '../../services/gemini';

const store = useStadiumStore();
const activeChecklists = ref<Record<string, string[]>>({});

const activeIncidents = computed(() => {
  return store.incidents
    .filter(inc => inc.status !== 'RESOLVED')
    .sort((a, b) => {
      const severityScores: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityScores[b.severity] - severityScores[a.severity];
    });
});

const getSeverityScore = (severity: string) => {
  switch(severity) {
    case 'CRITICAL': return '99';
    case 'HIGH': return '85';
    case 'MEDIUM': return '50';
    case 'LOW': return '25';
    default: return '0';
  }
};

const getSeverityWidth = (severity: string) => {
  switch(severity) {
    case 'CRITICAL': return 100;
    case 'HIGH': return 75;
    case 'MEDIUM': return 50;
    case 'LOW': return 25;
    default: return 0;
  }
};

const getSeverityBgClass = (severity: string) => {
  switch(severity) {
    case 'CRITICAL': return 'bg-red-500';
    case 'HIGH': return 'bg-neon-orange';
    case 'MEDIUM': return 'bg-neon-lime';
    case 'LOW': return 'bg-emerald-500';
    default: return 'bg-zinc-500';
  }
};

const getSeverityTextClass = (severity: string) => {
  switch(severity) {
    case 'CRITICAL': return 'text-red-500';
    case 'HIGH': return 'text-neon-orange';
    case 'MEDIUM': return 'text-neon-lime';
    case 'LOW': return 'text-emerald-500';
    default: return 'text-zinc-500';
  }
};

const updateStatus = async (id: string, newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
  const inc = store.incidents.find(i => i.id === id);
  if (inc) {
    store.updateIncidentStatus(id, newStatus);
    
    // Generate AI Checklist if transitioning to IN_PROGRESS
    if (newStatus === 'IN_PROGRESS' && !activeChecklists.value[id]) {
      activeChecklists.value[id] = ["Generating AI triage protocol..."];
      try {
        const checklist = await getTaskChecklist(`${inc.type}: ${inc.description}`);
        activeChecklists.value[id] = checklist;
      } catch (e) {
        activeChecklists.value[id] = ["Proceed with standard operating protocol."];
      }
    }
  }
};
</script>
