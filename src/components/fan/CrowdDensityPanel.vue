<template>
  <aside class="pointer-events-none absolute bottom-6 left-6 z-30 w-72 transition-all duration-500" aria-label="Crowd density summary">
    <div class="density-panel overflow-hidden rounded-2xl p-4 bg-[#0a0a1a]/95 border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent"></div>

      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-[0.22em] text-white/70">{{ $t('venueAnalytics') }}</p>
          <h2 class="mt-1 text-sm font-bold tracking-wide text-white">{{ $t('crowdDensity') }}</h2>
        </div>

        <div class="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-1">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
          <span class="text-[9px] font-black tracking-wider text-emerald-300">{{ $t('live') }}</span>
        </div>
      </div>

      <div class="mb-4 grid grid-cols-3 gap-2">
        <div
          v-for="stat in densityStats"
          :key="stat.label"
          class="density-stat"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :style="{ backgroundColor: stat.color, boxShadow: `0 0 9px ${stat.color}` }"
          ></span>
          <span class="text-[8px] font-bold uppercase tracking-wide text-white/70">{{ $t(stat.label) }}</span>
          <strong class="text-base font-black tabular-nums text-white">{{ stat.value }}%</strong>
        </div>
      </div>

      <div class="relative">
        <div class="absolute inset-x-0 top-1/2 h-px bg-white/[0.055]"></div>
        <svg
          viewBox="0 0 200 44"
          class="relative h-10 w-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="clearGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#5eead4" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#5eead4" stop-opacity="1" />
            </linearGradient>
            <linearGradient id="busyGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#fbbf24" stop-opacity="1" />
            </linearGradient>
            <linearGradient id="packedGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#fb7185" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#fb7185" stop-opacity="1" />
            </linearGradient>
          </defs>

          <polyline :points="clearWavePoints"  fill="none" stroke="url(#clearGlow)"  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <polyline :points="busyWavePoints"   fill="none" stroke="url(#busyGlow)"   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <polyline :points="packedWavePoints" fill="none" stroke="url(#packedGlow)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>

      <div class="mt-2 flex justify-between border-t border-white/[0.06] pt-2.5">
        <span
          v-for="stat in densityStats"
          :key="`${stat.label}-legend`"
          class="flex items-center gap-1 text-[9px] text-white/70"
        >
          <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: stat.color }"></span>
          {{ $t(stat.label) }}
        </span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  densityStats: Array<{ label: string; value: number; color: string }>;
  clearWavePoints: string;
  busyWavePoints: string;
  packedWavePoints: string;
}>();
</script>

<style scoped>
.density-panel {
  position: relative;
}

.density-stat {
  display: flex;
  min-height: 60px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.22rem;
  border: 1px solid rgba(255, 255, 255, 0.045);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.025);
}
</style>
