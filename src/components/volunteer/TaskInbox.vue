<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight text-zinc-900">Urgent Dispatches</h2>
        <p class="text-zinc-500 text-sm mt-1">Real-time incident stream</p>
      </div>
      <span class="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-100 shadow-sm">
        {{ activeIncidents.length }} Active
      </span>
    </div>
    
    <div v-if="activeIncidents.length === 0" class="flex flex-col items-center justify-center p-16 bg-white/50 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400">
      <div class="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <p class="text-lg font-semibold text-zinc-600">No active incidents</p>
      <p class="text-sm mt-1">The stadium is operating smoothly.</p>
    </div>
    
    <ul v-else class="flex flex-col gap-5">
      <li v-for="incident in activeIncidents" :key="incident.id">
        <BaseCard class="bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group">
          <!-- Subtle severity indicator bar -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="getSeverityBarClass(incident.severity)"></div>
          
          <div class="pl-2">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-bold text-lg text-zinc-800 tracking-tight">{{ incident.type.replace('_', ' ') }}</h3>
              <span 
                class="px-3 py-1 rounded-full text-xs font-bold tracking-wide border"
                :class="getSeverityClasses(incident.severity)"
              >
                {{ incident.severity }}
              </span>
            </div>
            
            <div class="flex items-center text-sm mb-4 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100 text-zinc-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-zinc-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="font-medium text-zinc-800 mr-1">Location:</span> {{ incident.location.section }} (Gate {{ incident.location.gate }})
            </div>
            
            <p class="text-zinc-600 mb-6 text-sm leading-relaxed">{{ incident.description }}</p>
            
            <div class="flex flex-wrap gap-3 mt-auto">
              <BaseButton 
                v-if="incident.status === 'OPEN'" 
                variant="primary" 
                class="flex-1"
                @click="updateStatus(incident.id, 'IN_PROGRESS')"
                aria-label="Acknowledge Incident"
              >
                Acknowledge
              </BaseButton>
              <BaseButton 
                v-if="incident.status === 'IN_PROGRESS'" 
                variant="success" 
                class="flex-1"
                @click="updateStatus(incident.id, 'RESOLVED')"
                aria-label="Resolve Incident"
              >
                Mark Resolved
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import BaseCard from '../common/BaseCard.vue';
import BaseButton from '../common/BaseButton.vue';

const store = useStadiumStore();

const activeIncidents = computed(() => {
  return store.incidents
    .filter(inc => inc.status !== 'RESOLVED')
    .sort((a, b) => {
      const severityScores: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return severityScores[b.severity] - severityScores[a.severity];
    });
});

const getSeverityClasses = (severity: string) => {
  switch(severity) {
    case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
    case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'LOW': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
};

const getSeverityBarClass = (severity: string) => {
  switch(severity) {
    case 'CRITICAL': return 'bg-red-500';
    case 'HIGH': return 'bg-orange-500';
    case 'MEDIUM': return 'bg-amber-400';
    case 'LOW': return 'bg-emerald-500';
    default: return 'bg-zinc-300';
  }
}

const updateStatus = (id: string, newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
  const inc = store.incidents.find(i => i.id === id);
  if (inc) {
    inc.status = newStatus;
  }
};
</script>
