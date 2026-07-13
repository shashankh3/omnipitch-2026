<template>
  <div class="fan-dashboard flex flex-col h-screen overflow-hidden bg-[#050510] text-white relative transition-colors duration-500">

    <!-- Heat Alert Banner -->
    <div v-if="telemetry.wbgtTemperature > 32" class="absolute top-20 left-1/2 -translate-x-1/2 z-50">
      <div class="bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 text-amber-200 font-semibold px-6 py-2.5 rounded-2xl shadow-[0_4px_24px_rgba(245,158,11,0.2)] flex items-center gap-3">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <span class="text-sm">High Heat: {{ telemetry.wbgtTemperature.toFixed(1) }}°C — Stay hydrated, shaded paths prioritized</span>
      </div>
    </div>

    <!-- Gate Status Panel - Bottom Right (shifted up to clear FAB) -->
    <div class="absolute bottom-28 right-6 z-20 pointer-events-none">
      <div class="bg-[#0a0a1a]/80 backdrop-blur-xl border border-white/8 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-lg ea-tile">
        <div class="flex justify-between items-center mb-1">
          <span class="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">Gate Throughput</span>
          <span v-if="fastestGate" class="text-[9px] text-emerald-400 font-bold tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            FASTEST: {{ fastestGate }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5" v-for="gate in ['A','B','C']" :key="gate">
            <div class="w-2.5 h-2.5 rounded-full" :class="getGateClass(gate)"></div>
            <span class="text-white/50 text-[10px] font-medium">Gate {{ gate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Bar -->
    <header class="absolute top-6 right-6 z-40 flex items-center gap-4">
      <div class="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-2.5 flex items-center gap-2 ea-tile shadow-lg">
        <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] motion-safe:animate-pulse"></div>
        <span class="text-sm text-white/70 font-bold uppercase tracking-widest">Systems Online</span>
      </div>
      <BaseButton variant="secondary" @click="logout" aria-label="Exit Fan Portal" class="!px-6 !py-2.5 !text-sm !font-bold !tracking-widest uppercase bg-white/5 text-white/70 border-white/20 hover:bg-white/20 hover:text-white transition-all rounded-xl shadow-lg ea-button">
        DISCONNECT
      </BaseButton>
    </header>

    <!-- Massive EA Typography - Top Left -->
    <div class="absolute top-6 left-6 z-40 pointer-events-none drop-shadow-2xl">
      <h1 class="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-1 opacity-90">
        OMNI<span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">PITCH</span> <span class="text-[#ccff00]">26</span>
      </h1>
      <p class="text-[#ccff00] text-xs font-bold uppercase tracking-widest pl-1 opacity-90">Fan Experience</p>
    </div>

    <!-- 3D Stadium (Full Bleed) -->
    <main class="flex-1 relative">
      <FanMap />
    </main>

    <!-- Floating Match Feed -->
    <div class="absolute top-36 left-6 z-40 hidden md:block">
      <LiveMatchFeed />
    </div>

    <!-- AI Copilot FAB & Quiet Zone Button -->
    <div class="absolute bottom-8 right-8 z-40 flex flex-col gap-4">
      <button
        v-if="!isModalOpen"
        class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.5)] outline-none focus:ring-4 focus:ring-indigo-400/30 group ea-button"
        @click="isModalOpen = true"
        aria-label="Find Quiet Zone"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
      </button>
      <button
        class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_24px_rgba(251,191,36,0.35)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.5)] outline-none focus:ring-4 focus:ring-amber-400/30 group ea-button"
        @click="isChatOpen = !isChatOpen"
        aria-label="Ask Stadium Copilot"
      >
        <div class="absolute inset-0 rounded-2xl motion-safe:animate-ping opacity-15 bg-amber-300 group-hover:opacity-25"></div>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
    </div>

    <!-- Quiet Zone Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensory-modal-title"
    >
      <div class="bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          @click="isModalOpen = false"
          class="absolute top-4 right-4 text-white/50 hover:text-white"
          aria-label="Close modal"
        >✕</button>
        <h2 id="sensory-modal-title" class="text-xl font-bold mb-2">Quiet Zone Finder</h2>
        <div v-if="sensoryRoom">
          <p class="text-emerald-400 font-semibold mb-4">{{ sensoryRoom.label[lang as 'en'|'es'|'fr'|'de'] || sensoryRoom.label.en }}</p>
          <div class="mb-4">
            <h3 class="text-xs uppercase text-white/50 mb-1">Features</h3>
            <ul class="flex flex-wrap gap-2">
              <li v-for="f in features" :key="f" class="bg-white/10 px-2 py-1 rounded text-xs font-medium">{{ f }}</li>
            </ul>
          </div>
          <div class="bg-indigo-900/40 border border-indigo-500/30 p-3 rounded-lg text-sm text-indigo-100">
            <strong>Step-Free Route:</strong> {{ stepFreeRoute }}
          </div>
        </div>
        <div v-else class="text-white/50 text-sm">
          No sensory room found in current configuration.
        </div>
      </div>
    </div>

    <!-- Copilot Slide Panel -->
    <div
      class="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#0a0a1a]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 flex flex-col border-l border-white/5"
      :class="isChatOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <header class="p-6 flex justify-between items-center border-b border-white/5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h2 class="font-bold text-sm text-white tracking-tight">Stadium Copilot</h2>
            <p class="text-[10px] text-white/30 font-medium">Powered by Gemini AI</p>
          </div>
        </div>
        <button class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all focus:outline-none" @click="isChatOpen = false" aria-label="Close Chat Panel">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </header>
      <div class="flex-1 overflow-hidden p-4 flex flex-col">
        <ConciergeChat class="flex-1" />

        <!-- Quiet Zone Finder Button -->
        <button
          @click="showSensoryRoom = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl
                 bg-indigo-900/40 border border-indigo-500/40
                 text-indigo-300 hover:bg-indigo-800/50
                 transition-all duration-200 text-sm font-medium
                 w-full justify-center mt-3"
          aria-label="Find nearest quiet zone for sensory sensitivities"
        >
          <span aria-hidden="true">🧘</span>
          <span>Quiet Zone Finder</span>
        </button>
      </div>
    </div>
    <!-- Quiet Zone Modal -->
    <Teleport to="body">
      <div
        v-if="showSensoryRoom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sensory-title"
        class="fixed inset-0 z-50 flex items-center justify-center
               p-4 bg-black/60 backdrop-blur-sm"
        @click.self="showSensoryRoom = false"
      >
        <div
          class="bg-slate-900 border border-indigo-500/40
                 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        >
          <h2
            id="sensory-title"
            class="text-lg font-semibold text-indigo-300 mb-2"
          >
            🧘 {{ nearest?.label?.[currentLanguage] 
                  ?? nearest?.label?.en 
                  ?? 'Quiet Zone' }}
          </h2>

          <p class="text-slate-300 text-sm leading-relaxed mb-4">
            {{ directions }}
          </p>

          <div class="flex flex-wrap gap-2 mb-5">
            <span
              v-for="feature in (nearest?.features ?? [])"
              :key="feature"
              class="px-2 py-1 rounded-full text-xs
                     bg-indigo-900/50 text-indigo-300
                     border border-indigo-700/40"
            >
              {{ feature.replace(/_/g, ' ') }}
            </span>
          </div>

          <button
            @click="showSensoryRoom = false"
            class="w-full py-2 rounded-lg bg-indigo-700
                   hover:bg-indigo-600 text-white text-sm
                   font-medium transition-colors"
            aria-label="Close quiet zone finder"
          >
            Close
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import FanMap from '../components/fan/FanMap.vue';
import ConciergeChat from '../components/fan/ConciergeChat.vue';
import LiveMatchFeed from '../components/fan/LiveMatchFeed.vue';
import BaseButton from '../components/common/BaseButton.vue';
import { useStadiumStore } from '../store/useStadiumStore';
import { useSensoryRoom } from '../composables/useSensoryRoom';
import { useSessionStore } from '../store/useSessionStore';

const router = useRouter();
const store = useStadiumStore();
const isChatOpen = ref(true);

const { isModalOpen, sensoryRoom, stepFreeRoute, features, lang } = useSensoryRoom();
const { sensoryRoom: nearest, stepFreeRoute: directions } = useSensoryRoom();
const session = useSessionStore();
const showSensoryRoom = ref(false);
const currentLanguage = computed(() => session.currentSession?.language ?? 'en');

const telemetry = computed(() => store.telemetry);

const fastestGate = computed(() => {
  const gates = store.telemetry.gateThroughput;
  if (!gates || Object.keys(gates).length === 0) return null;
  // Find the gate with the lowest throughput (fewest people)
  const sorted = Object.entries(gates).sort((a, b) => a[1] - b[1]);
  return sorted[0][0].replace('Gate', 'GATE ');
});

const getGateClass = (gate: string) => {
  const tp = store.telemetry.gateThroughput[`Gate${gate}`] || 0;
  if (tp > 800) return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] motion-safe:animate-pulse';
  if (tp > 500) return 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]';
  return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]';
};

const logout = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
/* Snappy EA Sports style transition */
.ea-tile {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ea-tile:hover {
  transform: scale(1.02) translateY(-2px);
}

.ea-button {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ea-button:hover {
  transform: scale(1.05);
}
.ea-button:active {
  transform: scale(0.95);
}
</style>
