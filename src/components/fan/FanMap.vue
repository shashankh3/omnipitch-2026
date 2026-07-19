<template>
  <div class="fan-map relative flex h-full w-full flex-col overflow-hidden bg-[#030712]">

    <!-- Screen-reader match status -->
    <div class="sr-only" aria-live="polite">
      {{ $t('srLiveMatchStatus', { home: matchData.home, away: matchData.away, homeScore: matchData.homeScore, awayScore: matchData.awayScore, minute: matchData.minute }) }}
    </div>

    <!-- Scoreboard -->
    <MatchScoreboard
      :match-data="matchData"
      :wbgt-temperature="store.telemetry.wbgtTemperature ?? WBGT_HEAT_DEFAULT_C"
      :is-offline-mode="store.isOfflineMode"
    />

    <!-- Crowd Density -->
    <CrowdDensityPanel
      :density-stats="densityStats"
      :clear-wave-points="clearWavePoints"
      :busy-wave-points="busyWavePoints"
      :packed-wave-points="packedWavePoints"
    />

    <!-- Low Power Toggle -->
    <div class="pointer-events-auto absolute bottom-6 right-24 z-40">
      <button
        @click="isLowPowerMode = !isLowPowerMode"
        class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-[#030712]"
        :class="isLowPowerMode ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-white/10 bg-[#0a0a1a]/60 text-white/70 hover:bg-[#0a0a1a]/80 hover:text-white/80'"
        type="button"
        :aria-pressed="isLowPowerMode"
        :aria-label="isLowPowerMode ? $t('disableEcoMode') : $t('enableEcoMode')"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="isLowPowerMode ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse' : 'bg-white/30'"></span>
        {{ $t('ecoMode') }}
      </button>
    </div>

    <!-- Keyboard navigation hint for screen readers -->
    <div id="canvas-controls-hint" class="sr-only">
      This is a mouse-controlled 3D view. Drag to rotate the camera. A screen-reader accessible data table is available via the accessibility toggle above the map.
    </div>

    <!-- Three.js Canvas -->
    <div
      ref="canvasContainer"
      class="relative min-w-0 flex-1 touch-none overflow-hidden cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Interactive 3D stadium map showing live crowd density, gate load, players, and match ball animation"
      aria-describedby="canvas-controls-hint"
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

            <p class="text-sm font-black tracking-wide text-white">{{ $t('enteringStadium') }}</p>
            <p class="mt-2 text-[9px] font-bold uppercase tracking-[0.28em] text-cyan-200/90">
              {{ $t('syncingEnvironment') }}
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
import { WBGT_HEAT_DEFAULT_C } from '../../constants';
import MatchScoreboard from './MatchScoreboard.vue';
import CrowdDensityPanel from './CrowdDensityPanel.vue';

const canvasContainer = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const isLowPowerMode = ref(false);
const store = useStadiumStore();
const props = withDefaults(defineProps<{ active?: boolean }>(), {
  active: true,
});

const densityValues = computed(() => Object.values(store.telemetry.crowdDensity ?? {}) as number[]);

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
  { label: 'clear',  value: clearPercent.value,  color: '#5eead4' },
  { label: 'busy',   value: busyPercent.value,   color: '#fbbf24' },
  { label: 'packed', value: packedPercent.value, color: '#fb7185' },
]);

const densityHistory = shallowRef<number[][]>([]);

watch(
  densityValues,
  (values) => {
    densityHistory.value = [...densityHistory.value.slice(-19), [...values]];
  },
  { immediate: true }
);

/**
 * Generates an SVG polyline string representing the history of a crowd density threshold over time.
 * The Y-axis represents the percentage of values matching the threshold, mapped inversely to fit 
 * an SVG height of 42 (0% -> 42, 100% -> 7). The X-axis scales the history points across a width of 200.
 * 
 * @param threshold - A predicate function that tests whether a density value meets the criteria
 * @returns A space-separated string of x,y coordinates to draw the SVG polyline
 */
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

    updateFootball(deltaTime);
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
  { flush: 'post' }
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

.loader-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(135deg, rgba(20, 35, 67, 0.96), rgba(4, 9, 24, 0.96));
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
</style>
