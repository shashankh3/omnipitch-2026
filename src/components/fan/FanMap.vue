<template>
  <div class="h-full w-full bg-[#050510] overflow-hidden relative flex flex-col">

    <!-- Accessibility Screen Reader -->
    <div class="sr-only" aria-live="polite">
      Live Stadium Status: {{ matchData.home }} vs {{ matchData.away }},
      Score {{ matchData.homeScore }} to {{ matchData.awayScore }},
      Minute {{ matchData.minute }}.
    </div>

    <!-- ── Scoreboard HUD ──────────────────────────────── -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div class="bg-[#080818]/90 backdrop-blur-2xl border border-white/8 rounded-2xl px-6 py-2.5 flex items-center gap-5 shadow-[0_8px_40px_rgba(0,0,0,0.7)] relative overflow-hidden">
        <!-- Subtle top accent -->
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>

        <!-- Home team -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-5 rounded flex-shrink-0 shadow-sm ring-1 ring-white/10" :style="{ backgroundColor: matchData.homeColor }"></div>
          <span class="text-white font-black text-sm tracking-wide truncate">{{ matchData.home }}</span>
        </div>

        <!-- Score -->
        <div class="flex items-center gap-1.5 bg-white/5 px-4 py-1.5 rounded-xl border border-white/8 flex-shrink-0">
          <span class="text-white font-black text-2xl tabular-nums leading-none">{{ matchData.homeScore }}</span>
          <span class="text-white/20 font-light text-xl leading-none mx-0.5">:</span>
          <span class="text-white font-black text-2xl tabular-nums leading-none">{{ matchData.awayScore }}</span>
        </div>

        <!-- Away team -->
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="text-white font-black text-sm tracking-wide truncate">{{ matchData.away }}</span>
          <span class="text-xl flex-shrink-0" role="img" aria-label="Away team flag">🇲🇽</span>
        </div>

        <!-- Divider -->
        <div class="w-px h-8 bg-white/8 flex-shrink-0"></div>

        <!-- Match clock -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span class="text-red-400 font-mono text-xs font-bold tracking-wider">{{ matchData.minute }}'</span>
        </div>

        <!-- Weather badge -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <div
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold"
            :class="(store.telemetry.wbgtTemperature ?? 29) > 32
              ? 'bg-amber-500/15 border-amber-500/25 text-amber-300'
              : 'bg-white/5 border-white/8 text-white/70'"
          >
            <span aria-hidden="true">{{ (store.telemetry.wbgtTemperature ?? 29) > 32 ? '🌡️' : '☀️' }}</span>
            <span>{{ Math.round(store.telemetry.wbgtTemperature ?? 29) }}°C</span>
          </div>

          <!-- Connectivity -->
          <div
            class="flex items-center gap-1 px-2 py-1 rounded-lg border text-xs"
            :class="store.isOfflineMode
              ? 'bg-amber-500/15 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'"
          >
            <span aria-hidden="true">{{ store.isOfflineMode ? '📡' : '📶' }}</span>
            <span class="font-semibold text-[10px] tracking-wide">{{ store.isOfflineMode ? 'OFFLINE' : 'LIVE' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Crowd Density Card ─────────────────────────── -->
    <div class="absolute bottom-6 left-6 z-20 pointer-events-none w-64 flex-shrink-0">
      <div class="bg-[#0a0a1a]/85 backdrop-blur-2xl border border-white/8 rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Crowd Density</span>
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[10px] text-emerald-400 font-bold">LIVE</span>
          </span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div
            v-for="stat in densityStats"
            :key="stat.label"
            class="flex flex-col items-center gap-1 p-1.5 rounded-lg"
            :style="{ backgroundColor: stat.bg }"
          >
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: stat.color }"></span>
            <span class="text-[9px] text-slate-400 uppercase font-bold tracking-wide">{{ stat.label }}</span>
            <span class="text-base font-black text-white leading-none">{{ stat.value }}%</span>
          </div>
        </div>

        <!-- Sparkline -->
        <svg viewBox="0 0 200 40" class="w-full h-8" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparkClear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#34d399" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polyline :points="clearWavePoints"  fill="none" stroke="#34d399" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
          <polyline :points="busyWavePoints"   fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
          <polyline :points="packedWavePoints" fill="none" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
        </svg>

        <!-- Legend row -->
        <div class="flex justify-between mt-2">
          <span v-for="s in densityStats" :key="s.label" class="flex items-center gap-1 text-[9px] text-slate-500">
            <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: s.color }"></span>
            {{ s.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── 3D Canvas ───────────────────────────────────── -->
    <div
      ref="canvasContainer"
      class="flex-1 min-w-0 overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
    >
      <!-- Cinematic vignette -->
      <div
        class="absolute inset-0 pointer-events-none z-10"
        style="background: radial-gradient(ellipse at center, transparent 45%, rgba(5,5,16,0.75) 100%);"
      ></div>

      <!-- Loading Screen -->
      <Transition name="loader-fade">
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center z-20 bg-[#050510]"
        >
          <div class="flex flex-col items-center gap-6">
            <!-- Spinner rings -->
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 rounded-full border-2 border-white/5"></div>
              <div class="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div class="absolute inset-2 rounded-full border-2 border-t-transparent border-r-transparent border-b-cyan-400 border-l-transparent animate-spin" style="animation-direction:reverse;animation-duration:1.5s;"></div>
              <div class="absolute inset-[14px] rounded-full border border-white/10 animate-ping" style="animation-duration:2s;"></div>
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <span class="text-white/80 font-bold text-sm tracking-wide">OmniPitch Stadium</span>
              <span class="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Initializing 3D Environment…</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { useStadiumStore } from '../../store/useStadiumStore';
import { useStadiumScene } from '../../composables/useStadiumScene';
import { useStadiumPitch } from '../../composables/useStadiumPitch';
import { useStadiumHeatmap } from '../../composables/useStadiumHeatmap';
import { useStadiumCrowd } from '../../composables/useStadiumCrowd';
import { useStadiumFootball } from '../../composables/useStadiumFootball';

const canvasContainer = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const store = useStadiumStore();

// ── Crowd density ──────────────────────────────────────
const densityValues = computed(() => Object.values(store.telemetry.crowdDensity ?? {}));

const clearPercent = computed(() => {
  const v = densityValues.value; if (!v.length) return 0;
  return Math.round((v.filter(x => x < 60).length / v.length) * 100);
});
const busyPercent = computed(() => {
  const v = densityValues.value; if (!v.length) return 0;
  return Math.round((v.filter(x => x >= 60 && x < 85).length / v.length) * 100);
});
const packedPercent = computed(() =>
  Math.max(0, 100 - clearPercent.value - busyPercent.value)
);

const densityStats = computed(() => [
  { label: 'Clear',  value: clearPercent.value,  color: '#34d399', bg: 'rgba(52,211,153,0.06)'  },
  { label: 'Busy',   value: busyPercent.value,   color: '#fbbf24', bg: 'rgba(251,191,36,0.06)'  },
  { label: 'Packed', value: packedPercent.value, color: '#f87171', bg: 'rgba(248,113,113,0.06)' },
]);

const densityHistory = ref<number[][]>([]);
watch(densityValues, (vals) => {
  densityHistory.value.push([...vals]);
  if (densityHistory.value.length > 20) densityHistory.value.shift();
});

function makeWavePoints(threshold: (v: number) => boolean): string {
  const history = densityHistory.value;
  if (history.length < 2) return '0,20 200,20';
  return history.map((tick, i) => {
    const x = (i / (history.length - 1)) * 200;
    const pct = tick.length ? (tick.filter(threshold).length / tick.length) * 100 : 50;
    const y = 40 - (pct / 100) * 35;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

const clearWavePoints  = computed(() => makeWavePoints(v => v < 60));
const busyWavePoints   = computed(() => makeWavePoints(v => v >= 60 && v < 85));
const packedWavePoints = computed(() => makeWavePoints(v => v >= 85));

// ── Match data ─────────────────────────────────────────
const matchData = ref({
  home: 'USA', away: 'MEX',
  homeScore: 2, awayScore: 1,
  minute: 72,
  homeColor: '#ef4444', awayColor: '#10b981',
});

const loadMatchData = () => {
  const cached = localStorage.getItem('omnipitch_match_feed_v2');
  if (!cached) return;
  try {
    const parsed = JSON.parse(cached);
    const lm = parsed?.data?.liveMatch;
    if (lm) matchData.value = {
      home: lm.homeTeam || 'USA', away: lm.awayTeam || 'MEX',
      homeScore: lm.homeScore || 0, awayScore: lm.awayScore || 0,
      minute: lm.minute || 0,
      homeColor: lm.primaryColor || '#ef4444', awayColor: lm.secondaryColor || '#10b981',
    };
  } catch { /* ignore */ }
};

// ── Three.js setup ─────────────────────────────────────
let syncInterval: ReturnType<typeof setInterval> | undefined;
let animationFrameId: number;
const clock = new THREE.Clock();
const { initScene, onWindowResize } = useStadiumScene(canvasContainer);
let setStandTargetColors: () => void;

const init3D = () => {
  const sceneData = initScene();
  if (!sceneData) return;
  const { scene, camera, renderer, controls, prefersReducedMotion } = sceneData;

  const { initPitch } = useStadiumPitch(scene);
  const { initHeatmap, setStandTargetColors: sstc, updateStandColorsSmooth } = useStadiumHeatmap(scene, store);
  const { initCrowd, updateCrowd } = useStadiumCrowd(scene, prefersReducedMotion);
  const { initFootball, updateFootball } = useStadiumFootball(scene, prefersReducedMotion);

  setStandTargetColors = sstc;
  initPitch(); initHeatmap(); initCrowd(); initFootball();
  isLoading.value = false;
  clock.start();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const dt   = Math.min(clock.getDelta(), 0.05);
    const time = clock.getElapsedTime();
    controls.update();
    if (!prefersReducedMotion) updateStandColorsSmooth(dt);
    updateCrowd(dt, time);
    updateFootball(dt, time);
    renderer.render(scene, camera);
  };
  animate();
};

watch(() => store.telemetry.crowdDensity, () => {
  if (setStandTargetColors) setStandTargetColors();
}, { deep: true });

onMounted(() => {
  loadMatchData();
  syncInterval = setInterval(loadMatchData, 5000);
  setTimeout(init3D, 100);
  window.addEventListener('resize', onWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  clearInterval(syncInterval);
  cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
/* Loading screen fade-out */
.loader-fade-leave-active { transition: opacity 0.6s ease, transform 0.6s ease; }
.loader-fade-leave-to     { opacity: 0; transform: scale(1.03); }
</style>
