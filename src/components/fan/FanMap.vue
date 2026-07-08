<template>
  <div class="h-full w-full bg-[#050510] overflow-hidden relative flex flex-col">

    <!-- Accessibility Screen Reader Data -->
    <div class="sr-only" aria-live="polite">
      Live Stadium Status: {{ matchData.home }} vs {{ matchData.away }}, Score {{ matchData.homeScore }} to {{ matchData.awayScore }}, Minute {{ matchData.minute }}. 
    </div>

    <!-- Scoreboard HUD - Top Center -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div class="bg-[#0a0a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-3 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div class="flex items-center gap-3">
          <div class="w-6 h-4 rounded-sm shadow-sm" :style="{ backgroundColor: matchData.homeColor }"></div>
          <span class="text-white font-black text-sm tracking-wide">{{ matchData.home }}</span>
        </div>
        <div class="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">
          <span class="text-white font-black text-2xl tabular-nums">{{ matchData.homeScore }}</span>
          <span class="text-white/30 font-light text-xl">:</span>
          <span class="text-white font-black text-2xl tabular-nums">{{ matchData.awayScore }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-white font-black text-sm tracking-wide">{{ matchData.away }}</span>
          <div class="w-6 h-4 rounded-sm shadow-sm" :style="{ backgroundColor: matchData.awayColor }"></div>
        </div>
        <div class="ml-2 flex items-center gap-1.5 border-l border-white/10 pl-4">
          <span class="relative flex h-2 w-2">
            <span class="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span class="text-red-400 font-mono text-xs font-bold tracking-wider">{{ matchData.minute }}'</span>
        </div>
      </div>
    </div>

    <!-- Heatmap Legend - Bottom Left -->
    <div class="absolute bottom-6 left-6 z-20 pointer-events-none">
      <div class="bg-[#0a0a1a]/80 backdrop-blur-xl border border-white/8 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-lg">
        <span class="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">Crowd Density</span>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]"></div>
            <span class="text-white/50 text-[10px] font-medium">Clear</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]"></div>
            <span class="text-white/50 text-[10px] font-medium">Busy</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] motion-safe:animate-pulse"></div>
            <span class="text-white/50 text-[10px] font-medium">Packed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3D Canvas Container -->
    <div ref="canvasContainer" class="flex-1 relative cursor-grab active:cursor-grabbing touch-none">
      <!-- Cinematic vignette -->
      <div class="absolute inset-0 pointer-events-none z-10"
        style="background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%);"></div>

      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-20 bg-[#050510]">
        <div class="flex flex-col items-center gap-5">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 rounded-full border-2 border-white/5"></div>
            <div class="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent motion-safe:animate-spin"></div>
            <div class="absolute inset-2 rounded-full border-2 border-t-transparent border-r-transparent border-b-cyan-400 border-l-transparent motion-safe:animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-white/80 font-semibold text-sm tracking-wide">OmniPitch Stadium</span>
            <span class="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em] motion-safe:animate-pulse">Loading 3D Environment</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { useStadiumStore } from '../../store/useStadiumStore';

// Composables
import { useStadiumScene } from '../../composables/useStadiumScene';
import { useStadiumPitch } from '../../composables/useStadiumPitch';
import { useStadiumHeatmap } from '../../composables/useStadiumHeatmap';
import { useStadiumCrowd } from '../../composables/useStadiumCrowd';
import { useStadiumFootball } from '../../composables/useStadiumFootball';

const canvasContainer = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const store = useStadiumStore();

const matchData = ref({
  home: 'USA',
  away: 'MEX',
  homeScore: 2,
  awayScore: 1,
  minute: 72,
  homeColor: '#ef4444',
  awayColor: '#10b981'
});

const loadMatchData = () => {
  const cached = localStorage.getItem('omnipitch_match_feed_v2');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.data && parsed.data.liveMatch) {
        const lm = parsed.data.liveMatch;
        matchData.value = {
          home: lm.homeTeam || 'USA',
          away: lm.awayTeam || 'MEX',
          homeScore: lm.homeScore || 0,
          awayScore: lm.awayScore || 0,
          minute: lm.minute || 0,
          homeColor: lm.primaryColor || '#ef4444',
          awayColor: lm.secondaryColor || '#10b981'
        };
      }
    } catch(e) {}
  }
};

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

  initPitch();
  initHeatmap();
  initCrowd();
  initFootball();

  isLoading.value = false;
  clock.start();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.getElapsedTime();

    controls.update();
    
    if (!prefersReducedMotion) {
      updateStandColorsSmooth(dt);
    }
    
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
  // cleanup renderer is handled partly in unmount of canvasContainer, but typically we could clear it here
});
</script>
