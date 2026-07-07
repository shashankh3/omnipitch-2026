<template>
  <div class="fan-dashboard flex flex-col h-screen overflow-hidden bg-[#050510] text-white relative">

    <!-- Heat Alert Banner -->
    <div v-if="telemetry.wbgtTemperature > 90" class="absolute top-20 left-1/2 -translate-x-1/2 z-50">
      <div class="bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 text-amber-200 font-semibold px-6 py-2.5 rounded-2xl shadow-[0_4px_24px_rgba(245,158,11,0.2)] flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <span class="text-sm">High Heat: {{ telemetry.wbgtTemperature.toFixed(1) }}°F — Stay hydrated, shaded paths prioritized</span>
      </div>
    </div>

    <!-- Gate Status Panel - Bottom Right (shifted up to clear FAB) -->
    <div class="absolute bottom-28 right-6 z-20 pointer-events-none">
      <div class="bg-[#0a0a1a]/80 backdrop-blur-xl border border-white/8 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-lg">
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
    <header class="absolute top-4 right-4 z-40 flex items-center gap-3">
      <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
        <span class="text-xs text-white/60 font-medium">Systems Online</span>
      </div>
      <button @click="logout" class="bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200">
        Sign Out
      </button>
    </header>

    <!-- OmniPitch Brand Badge - Top Left -->
    <div class="absolute top-4 left-4 z-40 pointer-events-none">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_4px_16px_rgba(251,191,36,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </div>
        <div>
          <h1 class="text-white font-black text-sm tracking-tight leading-none">OmniPitch</h1>
          <p class="text-[9px] text-amber-400/80 font-bold uppercase tracking-[0.25em]">FIFA WC 2026</p>
        </div>
      </div>
    </div>

    <!-- 3D Stadium (Full Bleed) -->
    <main class="flex-1 relative">
      <FanMap />
    </main>

    <!-- Floating Match Feed -->
    <div class="absolute top-16 left-4 z-40 hidden md:block">
      <LiveMatchFeed />
    </div>

    <!-- AI Copilot FAB -->
    <div class="absolute bottom-8 right-8 z-40">
      <button
        class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_24px_rgba(251,191,36,0.35)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.5)] hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-400/30 group"
        @click="isChatOpen = !isChatOpen"
        aria-label="Ask Stadium Copilot"
      >
        <div class="absolute inset-0 rounded-2xl animate-ping opacity-15 bg-amber-300 group-hover:opacity-25"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
    </div>

    <!-- Copilot Slide Panel -->
    <div
      class="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#0a0a1a]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 flex flex-col border-l border-white/5"
      :class="isChatOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <header class="p-6 flex justify-between items-center border-b border-white/5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <h2 class="font-bold text-sm text-white tracking-tight">Stadium Copilot</h2>
            <p class="text-[10px] text-white/30 font-medium">Powered by Gemini AI</p>
          </div>
        </div>
        <button class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all focus:outline-none" @click="isChatOpen = false" aria-label="Close Chat Panel">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </header>
      <div class="flex-1 overflow-hidden p-4">
        <ConciergeChat />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import FanMap from '../components/fan/FanMap.vue';
import ConciergeChat from '../components/fan/ConciergeChat.vue';
import LiveMatchFeed from '../components/fan/LiveMatchFeed.vue';
import { useStadiumStore } from '../store/useStadiumStore';

const router = useRouter();
const store = useStadiumStore();
const isChatOpen = ref(false);

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
  if (tp > 800) return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] animate-pulse';
  if (tp > 500) return 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]';
  return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]';
};

const logout = () => {
  router.push({ name: 'login' });
};
</script>
