<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
    
    <!-- Left Column: Telemetry KPI Cards -->
    <section class="flex flex-col gap-6 lg:col-span-1">
      <TelemetryGrid />
    </section>
    
    <!-- Center Column: Metric progress bar breakdowns -->
    <section class="flex flex-col gap-6 lg:col-span-1">
      <MetricChart 
        title="Gate Throughput"
        subtitle="Live fans per minute"
        :data="telemetry.gateThroughput"
        :maxExpected="1000"
      />
      
      <MetricChart 
        title="Transit Delays"
        subtitle="Network delay in minutes"
        :data="telemetry.transitDelays"
        :inverseColors="true"
        :maxExpected="30"
      />
      
      <MetricChart 
        title="Concession Inventory"
        subtitle="Current stock levels (%)"
        :data="telemetry.concessionInventory"
        :maxExpected="100"
      />
    </section>
    
    <!-- Right Column: AI Command Console -->
    <section class="flex flex-col h-[600px] lg:h-[calc(100vh-140px)] lg:col-span-1">
      <AiCommandConsole />
    </section>
    
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import TelemetryGrid from './TelemetryGrid.vue';
import MetricChart from './MetricChart.vue';
import AiCommandConsole from './AiCommandConsole.vue';

const store = useStadiumStore();
const telemetry = computed(() => store.telemetry);
</script>
