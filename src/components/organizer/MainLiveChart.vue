<template>
  <div class="bg-[var(--color-panel-bg)] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col h-full">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="font-black italic text-white text-2xl tracking-tighter uppercase">{{ title }}</h3>
        <p class="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{{ subtitle || 'Live Telemetry Analysis' }}</p>
      </div>
      <div class="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold text-[#ccff00]">
        <div class="w-2 h-2 rounded-full bg-[#ccff00] motion-safe:animate-pulse"></div>
        LIVE SYNC
      </div>
    </div>
    
    <div class="flex-1 w-full min-h-[300px] relative">
      <apexchart 
        v-if="isMounted"
        type="area" 
        height="100%" 
        width="100%"
        :options="chartOptions" 
        :series="series"
      ></apexchart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import apexchart from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { randomFloat } from '../../utils/mathUtils';

const props = defineProps<{
  title: string;
  subtitle?: string;
  currentValue: number;
  color?: string;
}>();

const isMounted = ref(false);
const maxDataPoints = 20;

const series = ref([{
  name: 'Telemetry',
  data: [] as {x: number, y: number}[]
}]);

const themeColor = props.color || '#ff6b00';

const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'area',
    animations: {
      enabled: true,
      dynamicAnimation: { speed: 1000 }
    },
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    foreColor: '#52525b'
  },
  colors: [themeColor],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.0,
      stops: [0, 100]
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    type: 'datetime',
    range: maxDataPoints * 1000,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { show: false },
    tooltip: { enabled: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#52525b', fontWeight: 600 },
      formatter: (val: number) => val.toFixed(0)
    }
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.05)',
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } }
  },
  theme: { mode: 'dark' },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val: number) => val.toFixed(0) }
  }
});

onMounted(() => {
  isMounted.value = true;
  
  // Seed initial data by walking backward from the current logical value
  const initialData = [];
  let simulatedVal = props.currentValue || 1000;
  for (let i = 0; i < maxDataPoints; i++) {
    initialData.unshift({
      x: new Date().getTime() - (i * 3000), // Match the 3-second simulation tick
      y: simulatedVal
    });
    // Reverse logic of the simulation to trace a realistic past
    simulatedVal = Math.max(0, simulatedVal - Math.floor((randomFloat() - 0.4) * 150));
  }
  series.value = [{ name: 'Telemetry', data: initialData }];
  
  // Watch for exact updates from the Pinia store telemetry engine
  watch(() => props.currentValue, (newVal) => {
    const newData = [...series.value[0].data];
    newData.push({
      x: new Date().getTime(),
      y: newVal
    });
    if (newData.length > maxDataPoints) newData.shift();
    
    series.value = [{ ...series.value[0], data: newData }];
  });
});
</script>
