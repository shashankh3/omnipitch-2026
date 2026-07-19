<template>
  <div class="flex flex-col gap-4 h-full">
    
    <!-- Top Row: Telemetry KPI Cards -->
    <section class="w-full">
      <TelemetryGrid />
    </section>
    
    <!-- Middle Row: Main Chart & Side Charts -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
      
      <!-- Main Large Area Chart (simulating Portfolio/Market chart) -->
      <div class="lg:col-span-2 glass-panel rounded-[2rem] p-6 border border-white/5 shadow-2xl transition-all duration-400 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(204,255,0,0.1)] hover:border-[#ccff00]/20 ea-tile">
        <MainLiveChart 
          title="Global Stadium Throughput" 
          subtitle="Live Fans / Min Across All Gates"
          :currentValue="totalThroughput" 
          color="#ccff00"
        />
      </div>
      
      <!-- Right Side Donut Chart -->
      <div class="lg:col-span-1 glass-panel rounded-[2rem] p-6 border border-white/5 shadow-2xl transition-all duration-400 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(255,107,0,0.15)] hover:border-[#ff6b00]/30 ea-tile flex items-center justify-center">
        <div class="w-full">
          <TelemetryDonut 
            title="Incident Distribution"
            subtitle="Active Events by Severity"
            :data="incidentDistribution"
            centerLabel="Active Incidents"
          />
        </div>
      </div>
    </section>
    
    <!-- Bottom Row: Incident Table & AI Console -->
    <section class="h-[400px] w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
      <div class="glass-panel rounded-[2rem] p-6 border border-white/5 shadow-2xl transition-all duration-400 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ea-tile">
        <IncidentTable />
      </div>
      <div class="glass-panel rounded-[2rem] p-6 border border-white/5 shadow-2xl transition-all duration-400 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ea-tile">
        <AiCommandConsole />
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import TelemetryGrid from './TelemetryGrid.vue';
import MainLiveChart from './MainLiveChart.vue';
import TelemetryDonut from './TelemetryDonut.vue';
import AiCommandConsole from './AiCommandConsole.vue';
import IncidentTable from './IncidentTable.vue';

const store = useStadiumStore();

const totalThroughput = computed(() => {
  return Object.values(store.telemetry.gateThroughput).reduce((sum, val) => sum + val, 0);
});

const incidentDistribution = computed(() => {
  const dist: Record<string, number> = { 'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0 };
  store.incidents.forEach(inc => {
    if (inc.status !== 'RESOLVED' && dist[inc.severity] !== undefined) {
      dist[inc.severity]++;
    }
  });
  // Filter out zeros for cleaner donut
  const filtered: Record<string, number> = {};
  for (const [k, v] of Object.entries(dist)) {
    if (v > 0) filtered[k] = v;
  }
  // Fallback if empty
  if (Object.keys(filtered).length === 0) return { 'None': 1 };
  return filtered;
});
</script>

<style scoped>
.glass-panel {
  background: rgba(10, 10, 26, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.ea-tile {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
