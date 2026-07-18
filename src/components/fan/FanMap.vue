<template>
  <div class="fan-map relative flex h-full w-full flex-col overflow-hidden bg-[#030712]">

    <!-- Screen-reader match status -->
    <div class="sr-only" aria-live="polite">
      Live Stadium Status: {{ matchData.home }} versus {{ matchData.away }},
      score {{ matchData.homeScore }} to {{ matchData.awayScore }},
      minute {{ matchData.minute }}.
    </div>

    <!-- Scoreboard -->
    <div class="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2">
      <div
        class="scoreboard-shell relative flex items-center gap-4 overflow-hidden rounded-2xl px-5 py-3"
        role="status"
        :aria-label="`Live score: ${matchData.home} ${matchData.homeScore}, ${matchData.away} ${matchData.awayScore}, minute ${matchData.minute}`"
      >
        <div class="scoreboard-glow"></div>
        <div class="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent"></div>

        <!-- Home -->
        <div class="relative flex min-w-[82px] items-center justify-end gap-2.5">
          <span class="score-team-name">{{ matchData.home }}</span>
          <span
            class="team-color-mark"
            :style="{ background: matchData.homeColor, boxShadow: `0 0 14px ${matchData.homeColor}` }"
          ></span>
        </div>

        <!-- Score -->
        <div class="relative flex items-center gap-3 rounded-xl border border-white/[0.1] bg-black/25 px-4 py-2">
          <span class="score-number">{{ matchData.homeScore }}</span>
          <span class="score-separator">:</span>
          <span class="score-number">{{ matchData.awayScore }}</span>
        </div>

        <!-- Away -->
        <div class="relative flex min-w-[82px] items-center gap-2.5">
          <span
            class="team-color-mark"
            :style="{ background: matchData.awayColor, boxShadow: `0 0 14px ${matchData.awayColor}` }"
          ></span>
          <span class="score-team-name">{{ matchData.away }}</span>
        </div>

        <div class="relative h-7 w-px bg-white/[0.1]"></div>

        <!-- Clock -->
        <div class="relative flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]"></span>
          </span>
          <span class="font-mono text-xs font-black tracking-wider text-rose-300">
            {{ matchData.minute }}'
          </span>
        </div>

        <div class="relative hidden items-center gap-2 sm:flex">
          <div
            class="weather-chip"
            :class="(store.telemetry.wbgtTemperature ?? 29) > 32
              ? 'weather-chip-hot'
              : 'weather-chip-normal'"
          >
            <span>{{ (store.telemetry.wbgtTemperature ?? 29) > 32 ? '🌡' : '☀' }}</span>
            <span>{{ Math.round(store.telemetry.wbgtTemperature ?? 29) }}°C</span>
          </div>

          <div
            class="network-chip"
            :class="store.isOfflineMode ? 'network-offline' : 'network-online'"
          >
            <span>{{ store.isOfflineMode ? '◌' : '●' }}</span>
            <span>{{ store.isOfflineMode ? 'OFFLINE' : 'LIVE' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Crowd Density -->
    <aside class="pointer-events-none absolute bottom-6 left-6 z-30 w-72 transition-all duration-500" aria-label="Crowd density summary">
      <div class="density-panel overflow-hidden rounded-2xl p-4 bg-[#0a0a1a]/95 border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent"></div>

        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">Venue Analytics</p>
            <h2 class="mt-1 text-sm font-bold tracking-wide text-white">Crowd Density</h2>
          </div>

          <div class="flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-1">
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
            <span class="text-[9px] font-black tracking-wider text-emerald-300">LIVE</span>
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
            <span class="text-[8px] font-bold uppercase tracking-wide text-white/40">{{ stat.label }}</span>
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
            class="flex items-center gap-1 text-[9px] text-white/35"
          >
            <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: stat.color }"></span>
            {{ stat.label }}
          </span>
        </div>
      </div>
    </aside>

    <!-- Low Power Toggle -->
    <div class="pointer-events-auto absolute bottom-6 right-24 z-40">
      <button 
        @click="isLowPowerMode = !isLowPowerMode"
        class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
        :class="isLowPowerMode ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-[#0a0a1a]/60 text-white/50 hover:bg-[#0a0a1a]/80 hover:text-white/80'"
        type="button"
        :aria-pressed="isLowPowerMode"
        :aria-label="isLowPowerMode ? 'Disable stadium eco mode' : 'Enable stadium eco mode'"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="isLowPowerMode ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse' : 'bg-white/30'"></span>
        Eco Mode
      </button>
    </div>

    <!-- Three.js Canvas -->
    <div
      ref="canvasContainer"
      class="relative min-w-0 flex-1 touch-none overflow-hidden cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Interactive 3D stadium map showing live crowd density, gate load, players, and match ball animation"
    >
      <div class="pointer-events-none absolute inset-0 z-10 stadium-vignette"></div>
      <div class="pointer-events-none absolute inset-0 z-10 stadium-light-sweep"></div>

      <!-- Loader -->
      <Transition name="loader-fade">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-40 flex items-center justify-center bg-[#030712]"
        >
          <div class="loader-card flex flex-col items-center rounded-3xl px-10 py-9">
            <div class="loader-orbit relative mb-6 h-20 w-20">
              <div class="absolute inset-0 rounded-full border border-cyan-300/10"></div>
              <div class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-cyan-400/30"></div>
              <div class="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-indigo-400 border-l-indigo-300/40" style="animation-direction: reverse; animation-duration: 1.4s;"></div>
              <div class="absolute inset-[25px] animate-pulse rounded-full bg-cyan-300 shadow-[0_0_28px_rgba(103,232,249,0.9)]"></div>
            </div>

            <p class="text-sm font-black tracking-wide text-white">Entering OmniPitch Stadium</p>
            <p class="mt-2 text-[9px] font-bold uppercase tracking-[0.28em] text-cyan-200/45">
              Synchronizing live environment
            </p>

            <div class="mt-5 h-1 w-40 overflow-hidden rounded-full bg-white/[0.07]">
              <div class="loader-progress h-full rounded-full"></div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import { useStadiumScene } from '../../composables/useStadiumScene';
import { useStadiumPitch } from '../../composables/useStadiumPitch';
import { useStadiumHeatmap } from '../../composables/useStadiumHeatmap';
import { useStadiumCrowd } from '../../composables/useStadiumCrowd';
import { useStadiumFootball } from '../../composables/useStadiumFootball';
import {
  MATCH_FEED_CACHE_KEY,
  MATCH_FEED_UPDATED_EVENT,
  readCachedMatchFeed,
  type MatchFeedResponse
} from '../../services/matchFeed';

const canvasContainer = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const isLowPowerMode = ref(false);
const store = useStadiumStore();
const props = withDefaults(defineProps<{ active?: boolean }>(), {
  active: true,
});

const densityValues = computed(() => Object.values(store.telemetry.crowdDensity ?? {}));

const clearPercent = computed(() => {
  const values = densityValues.value;
  if (!values.length) return 0;
  return Math.round((values.filter(value => value < 60).length / values.length) * 100);
});

const busyPercent = computed(() => {
  const values = densityValues.value;
  if (!values.length) return 0;
  return Math.round((values.filter(value => value >= 60 && value < 85).length / values.length) * 100);
});

const packedPercent = computed(() => Math.max(0, 100 - clearPercent.value - busyPercent.value));

const densityStats = computed(() => [
  { label: 'Clear',  value: clearPercent.value,  color: '#5eead4' },
  { label: 'Busy',   value: busyPercent.value,   color: '#fbbf24' },
  { label: 'Packed', value: packedPercent.value, color: '#fb7185' },
]);

const densityHistory = shallowRef<number[][]>([]);

watch(
  densityValues,
  (values) => {
    densityHistory.value = [...densityHistory.value.slice(-19), [...values]];
  },
  { immediate: true }
);

function makeWavePoints(threshold: (value: number) => boolean): string {
  const history = densityHistory.value;

  if (history.length < 2) {
    return '0,22 40,19 80,23 120,17 160,21 200,18';
  }

  return history
    .map((tick, index) => {
      const x = (index / (history.length - 1)) * 200;
      const percentage = tick.length
        ? (tick.filter(threshold).length / tick.length) * 100
        : 50;
      const y = 42 - (percentage / 100) * 35;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

const clearWavePoints  = computed(() => makeWavePoints(value => value < 60));
const busyWavePoints   = computed(() => makeWavePoints(value => value >= 60 && value < 85));
const packedWavePoints = computed(() => makeWavePoints(value => value >= 85));

interface ScoreboardMatchData {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  homeColor: string;
  awayColor: string;
}

const DEFAULT_SCOREBOARD_MATCH: ScoreboardMatchData = {
  home: 'USA',
  away: 'MEX',
  homeScore: 2,
  awayScore: 1,
  minute: 72,
  homeColor: '#fb7185',
  awayColor: '#5eead4',
};

const matchData = ref<ScoreboardMatchData>({ ...DEFAULT_SCOREBOARD_MATCH });

const applyMatchFeed = (feed: MatchFeedResponse | null) => {
  if (!feed) return;

  const { liveMatch } = feed;
  matchData.value = {
    home: liveMatch.homeTeam,
    away: liveMatch.awayTeam,
    homeScore: liveMatch.homeScore,
    awayScore: liveMatch.awayScore,
    minute: liveMatch.minute,
    homeColor: liveMatch.primaryColor,
    awayColor: liveMatch.secondaryColor,
  };
};

const loadMatchData = () => {
  applyMatchFeed(readCachedMatchFeed());
};

let animationFrameId: number | undefined;
let initializationFrameId: number | undefined;
let renderFrame: FrameRequestCallback | undefined;
let lastRenderTime = 0;
let elapsedTime = 0;
let crowdAccumulator = 0;
let sceneInitialized = false;
let isDisposed = false;
let disposeScene: (() => void) | undefined;

const { initScene } = useStadiumScene(canvasContainer);
let setStandTargetColors: (() => void) | undefined;
let setCrowdLowPowerMode: ((enabled: boolean) => void) | undefined;

const canAnimate = () => props.active && document.visibilityState !== 'hidden' && !isDisposed;

const stopAnimation = () => {
  if (animationFrameId !== undefined) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = undefined;
  }
};

const startAnimation = () => {
  if (!sceneInitialized || !renderFrame || animationFrameId !== undefined || !canAnimate()) return;
  lastRenderTime = performance.now();
  crowdAccumulator = 0;
  animationFrameId = requestAnimationFrame(renderFrame);
};

const init3D = () => {
  if (sceneInitialized || isDisposed) return;
  const sceneData = initScene();
  if (!sceneData) return;

  const { scene, camera, renderer, controls, prefersReducedMotion, dispose } = sceneData;
  disposeScene = dispose;

  const { initPitch } = useStadiumPitch(scene);
  const {
    initHeatmap,
    setStandTargetColors: updateStandTargets,
    updateStandColorsSmooth,
  } = useStadiumHeatmap(scene, store);
  const crowd = useStadiumCrowd(scene, prefersReducedMotion);
  const { initCrowd, updateCrowd } = crowd;
  const { initFootball, updateFootball } = useStadiumFootball(scene, prefersReducedMotion);

  setStandTargetColors = updateStandTargets;
  setCrowdLowPowerMode = crowd.setLowPowerMode;

  initPitch();
  initHeatmap();
  initCrowd();
  initFootball();
  setCrowdLowPowerMode?.(isLowPowerMode.value);

  sceneInitialized = true;
  renderer.render(scene, camera);
  isLoading.value = false;

  renderFrame = (timestamp) => {
    animationFrameId = undefined;
    if (!canAnimate()) return;
    animationFrameId = requestAnimationFrame(renderFrame!);

    const targetFps = isLowPowerMode.value || prefersReducedMotion ? 30 : 60;
    const frameInterval = 1000 / targetFps;
    const timeSinceLastRender = timestamp - lastRenderTime;
    if (timeSinceLastRender < frameInterval - 0.5) return;

    const frameRemainder = timeSinceLastRender >= frameInterval
      ? timeSinceLastRender % frameInterval
      : 0;
    lastRenderTime = timestamp - frameRemainder;
    const deltaTime = Math.min(timeSinceLastRender / 1000, 0.05);
    elapsedTime += deltaTime;

    controls.update(deltaTime);

    updateStandColorsSmooth(deltaTime);

    const crowdStep = isLowPowerMode.value ? 1 / 15 : 1 / 30;
    crowdAccumulator += deltaTime;
    if (crowdAccumulator >= crowdStep) {
      updateCrowd(Math.min(crowdAccumulator, 0.1), elapsedTime);
      crowdAccumulator %= crowdStep;
    }

    updateFootball(deltaTime, elapsedTime);
    renderer.render(scene, camera);
  };

  startAnimation();
};

watch(
  [
    () => store.telemetry.crowdDensity,
    () => store.telemetry.gateThroughput,
  ],
  () => setStandTargetColors?.(),
  { deep: true, flush: 'post' }
);

watch(isLowPowerMode, (enabled) => {
  setCrowdLowPowerMode?.(enabled);
  lastRenderTime = performance.now();
  crowdAccumulator = 0;
});

watch(() => props.active, (active) => {
  if (active) startAnimation();
  else stopAnimation();
});

const onVisibilityChange = () => {
  if (document.visibilityState === 'hidden') stopAnimation();
  else startAnimation();
};

onMounted(() => {
  loadMatchData();

  // Listen for storage events (from LiveMatchFeed writing cache) instead of polling
  window.addEventListener('storage', onStorageChange);
  window.addEventListener(MATCH_FEED_UPDATED_EVENT, onMatchFeedUpdated);
  document.addEventListener('visibilitychange', onVisibilityChange);
  initializationFrameId = requestAnimationFrame(init3D);
});

const onStorageChange = (e: StorageEvent) => {
  if (e.key === MATCH_FEED_CACHE_KEY) loadMatchData();
};

const onMatchFeedUpdated = (event: Event) => {
  applyMatchFeed((event as CustomEvent<MatchFeedResponse>).detail);
};

onBeforeUnmount(() => {
  isDisposed = true;
  window.removeEventListener('storage', onStorageChange);
  window.removeEventListener(MATCH_FEED_UPDATED_EVENT, onMatchFeedUpdated);
  document.removeEventListener('visibilitychange', onVisibilityChange);

  if (initializationFrameId !== undefined) cancelAnimationFrame(initializationFrameId);
  stopAnimation();
  disposeScene?.();
});
</script>

<style scoped>
.fan-map {
  contain: layout paint style;
  isolation: isolate;
  background:
    radial-gradient(circle at 50% 0%, rgba(30, 64, 175, 0.18), transparent 38%),
    #030712;
}

.scoreboard-shell,
.loader-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(135deg, rgba(20, 35, 67, 0.96), rgba(4, 9, 24, 0.96));
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.scoreboard-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.1), transparent 43%);
  pointer-events: none;
}

.score-team-name {
  max-width: 62px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.88);
}

.team-color-mark {
  height: 17px;
  width: 5px;
  border-radius: 999px;
}

.score-number {
  font-size: 1.55rem;
  font-weight: 950;
  line-height: 1;
  color: white;
  font-variant-numeric: tabular-nums;
}

.score-separator {
  font-size: 1.35rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.25);
}

.weather-chip,
.network-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 0.5rem;
  padding: 0.35rem 0.48rem;
  font-size: 0.62rem;
  font-weight: 800;
}

.weather-chip-normal {
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.055);
  color: rgba(255, 255, 255, 0.72);
}

.weather-chip-hot {
  border: 1px solid rgba(251, 191, 36, 0.24);
  background: rgba(245, 158, 11, 0.12);
  color: #fde68a;
}

.network-online {
  border: 1px solid rgba(52, 211, 153, 0.18);
  background: rgba(16, 185, 129, 0.09);
  color: #86efac;
}

.network-offline {
  border: 1px solid rgba(251, 191, 36, 0.2);
  background: rgba(245, 158, 11, 0.1);
  color: #fde68a;
}

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

.stadium-vignette {
  background:
    radial-gradient(ellipse at center, transparent 38%, rgba(1, 4, 13, 0.45) 73%, rgba(1, 3, 10, 0.88) 100%);
}

.stadium-light-sweep {
  opacity: 0.2;
  will-change: transform;
  background: linear-gradient(
    112deg,
    transparent 36%,
    rgba(125, 211, 252, 0.08) 48%,
    transparent 61%
  );
  animation: light-sweep 10s ease-in-out infinite;
}

.loader-progress {
  width: 45%;
  background: linear-gradient(90deg, #22d3ee, #818cf8, #22d3ee);
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.7);
  animation: loader-progress 1.8s ease-in-out infinite;
}

.loader-fade-leave-active {
  transition: opacity 650ms ease, transform 650ms ease;
}

.loader-fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}

@keyframes light-sweep {
  0%, 100% { transform: translateX(-35%); }
  50% { transform: translateX(35%); }
}

@keyframes loader-progress {
  0%, 100% { width: 25%; transform: translateX(0); }
  50% { width: 75%; transform: translateX(25%); }
}

@media (max-width: 640px) {
  .scoreboard-shell {
    gap: 0.65rem;
    padding: 0.65rem 0.8rem;
  }

  .score-team-name {
    max-width: 38px;
    font-size: 0.67rem;
  }

  .score-number {
    font-size: 1.25rem;
  }
}
</style>
