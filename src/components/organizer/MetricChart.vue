<template>
  <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
    <div class="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
    <div class="mb-5">
      <h3 class="font-extrabold text-lg text-white tracking-tight">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">{{ subtitle }}</p>
    </div>
    
    <div class="flex flex-col gap-4">
      <div 
        v-for="(value, label) in data" 
        :key="label" 
        class="flex items-center gap-4 group/row relative"
      >
        <div class="w-24 text-sm font-semibold truncate text-zinc-400 group-hover/row:text-zinc-200 transition-colors" :title="String(label)">{{ label }}</div>
        <div class="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
          <div 
            class="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]" 
            :style="{ width: getPercentage(value) + '%' }"
            :class="getBarColorClass(value)"
          ></div>
        </div>
        <div class="w-12 text-right font-black text-sm text-zinc-300 group-hover/row:text-white transition-colors">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  subtitle?: string;
  data: Record<string, number>;
  maxExpected?: number;
  inverseColors?: boolean;
}>();

const maxVal = computed(() => {
  if (props.maxExpected) return props.maxExpected;
  const values = Object.values(props.data);
  return values.length ? Math.max(...values, 1) : 100;
});

const getPercentage = (val: number) => {
  return Math.min(100, (val / maxVal.value) * 100);
};

const getBarColorClass = (val: number) => {
  const perc = getPercentage(val);
  if (props.inverseColors) {
    if (perc > 75) return 'bg-red-500 text-red-500';
    if (perc > 50) return 'bg-amber-500 text-amber-500';
    return 'bg-emerald-500 text-emerald-500';
  } else {
    if (perc < 25) return 'bg-red-500 text-red-500';
    if (perc < 50) return 'bg-amber-500 text-amber-500';
    return 'bg-indigo-500 text-indigo-500';
  }
};
</script>
