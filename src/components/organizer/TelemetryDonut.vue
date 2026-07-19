<template>
  <div class="w-full h-full flex flex-col">
    <div class="w-full flex justify-between items-start z-10 mb-2">
      <div>
        <h3 class="font-black italic text-white text-xl tracking-tighter uppercase flex items-center gap-2">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-[0_0_8px_rgba(255,107,0,0.8)]"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 ml-6">{{ subtitle }}</p>
      </div>
    </div>
    
    <div class="w-full flex-1 flex items-center justify-center relative min-h-[250px]">
      <apexchart 
        v-if="isMounted"
        type="donut" 
        width="100%"
        :options="chartOptions" 
        :series="series"
      ></apexchart>
      
      <!-- Custom Center Label to match screenshot -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
        <div class="text-3xl font-black text-white tracking-tighter">{{ totalValue }}</div>
        <div class="text-[10px] uppercase tracking-widest text-zinc-500 mt-1 font-semibold">{{ centerLabel }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import apexchart from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';

const props = withDefaults(defineProps<{
  title: string;
  subtitle?: string;
  data: Record<string, number>;
  centerLabel: string;
}>(), {
  subtitle: ''
});

// Runtime validation
if (Object.keys(props.data).length === 0) {
  console.warn('[TelemetryDonut] Empty data provided, chart will not render properly');
}

const isMounted = ref(false);

const series = computed(() => Object.values(props.data));
const labels = computed(() => Object.keys(props.data));
const totalValue = computed(() => series.value.reduce((a, b) => a + b, 0));

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    background: 'transparent',
    animations: { enabled: true, dynamicAnimation: { speed: 400 } }
  },
  labels: labels.value,
  colors: ['#ccff00', '#ff6b00', '#6366f1', '#ec4899', '#14b8a6'],
  stroke: { show: false, width: 0 },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '85%',
        labels: { show: false }
      }
    }
  },
  legend: { show: false },
  theme: { mode: 'dark' },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val: number) => String(val) }
  }
}));

onMounted(() => {
  isMounted.value = true;
});
</script>
