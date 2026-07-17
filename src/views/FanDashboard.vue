<template>
  <div class="fan-dashboard flex flex-col h-screen overflow-hidden bg-[#050510] text-white relative transition-colors duration-500">

    <!-- Offline Banner -->
    <div v-if="store.isOfflineMode" class="absolute top-0 left-0 right-0 z-[100] bg-rose-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 flex justify-center shadow-lg animate-pulse">
      [WARNING: Network Degraded. Engaging Local Deterministic Engine]
    </div>

    <!-- Heat Alert Banner -->
    <div v-if="telemetry.wbgtTemperature > 32" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div class="bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 text-amber-200 font-semibold px-6 py-2.5 rounded-2xl shadow-[0_4px_24px_rgba(245,158,11,0.2)] flex items-center gap-3">
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <span class="text-sm">{{ $t('highHeat') }}: {{ telemetry.wbgtTemperature.toFixed(1) }}°C — {{ $t('stayHydrated') }}</span>
      </div>
    </div>

    <!-- Gate Status Panel - Bottom Right (shifted left to clear FAB) -->
    <div class="absolute bottom-6 right-24 z-20 pointer-events-none w-[280px]">
      <div class="bg-[#0a0a1a]/80 backdrop-blur-xl border border-white/8 rounded-xl px-4 py-3 flex flex-col shadow-lg gate-throughput-panel pointer-events-auto w-full">
        <!-- Header with toggle -->
        <div class="flex items-start justify-between mb-3 gap-2">
          <div class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
              {{ $t('gateThroughput') }}
            </span>
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[9px] text-emerald-400 font-bold">{{ $t('live') }}</span>
            </span>
          </div>
          <div class="flex rounded-lg overflow-hidden border border-slate-700 text-[9px] flex-shrink-0 mt-0.5">
            <button
              @click="throughputView = 'fastest'"
              :class="throughputView === 'fastest' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-500'"
              class="px-2 py-1 transition-colors uppercase"
            >
              {{ $t('fastest') }}
            </button>
            <button
              @click="throughputView = 'lowest'"
              :class="throughputView === 'lowest' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-500'"
              class="px-2 py-1 transition-colors uppercase"
            >
              {{ $t('lowest') }}
            </button>
          </div>
        </div>

        <!-- All 4 gates -->
        <div class="flex flex-col gap-2">
          <div v-for="gate in sortedGates" :key="gate.name" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: gate.color }"></span>
              <span class="text-xs text-slate-300">{{ gate.name }}</span>
            </div>
            <span
              class="text-xs font-bold tabular-nums"
              :class="gate.throughput >= 1000 ? 'text-emerald-400' : gate.throughput >= 700 ? 'text-amber-400' : 'text-red-400'"
            >
              {{ gate.throughput.toLocaleString() }} {{ $t('perMin') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Bar -->
    <header class="absolute top-6 right-6 z-40 flex flex-col items-end gap-3" :class="{'mt-4': store.isOfflineMode}">
      <div class="flex items-center gap-4">
        <button 
          @click="isScreenReaderMode = !isScreenReaderMode"
          class="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2 hover:bg-white/20 transition-all text-white/70 hover:text-white ea-button shadow-lg"
          aria-label="Toggle Screen Reader Mode"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/></svg>
          <span class="text-xs font-bold uppercase tracking-widest hidden sm:inline">a11y Mode</span>
        </button>
        <div class="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-2.5 flex items-center gap-2 ea-tile shadow-lg">
          <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] motion-safe:animate-pulse"></div>
          <span class="text-sm text-white/70 font-bold uppercase tracking-widest">{{ $t('systemsOnline') }}</span>
        </div>
        <BaseButton variant="secondary" @click="logout" aria-label="Exit Fan Portal" class="!px-6 !py-2.5 !text-sm !font-bold !tracking-widest uppercase bg-white/5 text-white/70 border-white/20 hover:bg-white/20 hover:text-white transition-all rounded-xl shadow-lg ea-button">
          {{ $t('disconnect') }}
        </BaseButton>
      </div>
      <LanguageSelector />
    </header>

    <!-- Massive EA Typography - Top Left -->
    <div class="absolute top-6 left-6 z-40 pointer-events-none drop-shadow-2xl" :class="{'mt-4': store.isOfflineMode}">
      <h1 class="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-1 opacity-90">
        OMNI<span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">PITCH</span> <span class="text-[#ccff00]">26</span>
      </h1>
      <p class="text-[#ccff00] text-xs font-bold uppercase tracking-widest pl-1 opacity-90">{{ $t('fanExperience') }}</p>
    </div>

    <!-- 3D Stadium (Full Bleed) -->
    <main class="flex-1 relative">
      <FanMap :aria-hidden="isScreenReaderMode" :class="{ 'opacity-0 pointer-events-none': isScreenReaderMode }" class="transition-opacity duration-300" />
      
      <!-- Screen Reader Data Grid (a11y) -->
      <div v-if="isScreenReaderMode" class="absolute inset-0 z-50 bg-[#050510] overflow-auto p-6 md:p-12 mt-20 md:mt-24 pointer-events-auto">
        <h2 class="text-2xl font-bold text-white mb-6">Stadium Data (Screen Reader View)</h2>
        
        <h3 class="text-xl text-emerald-400 mb-4 mt-8">Gate Throughput</h3>
        <table class="w-full text-left text-white border border-white/20">
          <thead>
            <tr class="bg-white/10 border-b border-white/20">
              <th class="p-3">Gate</th>
              <th class="p-3">Flow Rate (Per Min)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gate in allGates" :key="gate.name" class="border-b border-white/10">
              <td class="p-3">{{ gate.name }}</td>
              <td class="p-3">{{ gate.throughput }}</td>
            </tr>
          </tbody>
        </table>
        
        <h3 class="text-xl text-amber-400 mb-4 mt-8">Crowd Density</h3>
        <table class="w-full text-left text-white border border-white/20 mb-12">
          <thead>
            <tr class="bg-white/10 border-b border-white/20">
              <th class="p-3">Zone / Section</th>
              <th class="p-3">Capacity %</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(val, zone) in telemetry.crowdDensity" :key="zone" class="border-b border-white/10">
              <td class="p-3">{{ zone }}</td>
              <td class="p-3">{{ val }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Hardware Badge -->
    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-white/30 tracking-widest uppercase z-50 whitespace-nowrap pointer-events-none">
      Data Source: OmniPitch Software Simulation Node (Hardware-Agnostic)
    </div>

    <!-- Floating Match Feed -->
    <div class="absolute top-32 left-6 bottom-[280px] z-40 hidden md:flex flex-col w-72 flex-shrink-0 transition-all duration-500">
      <LiveMatchFeed class="h-full" />
    </div>

    <!-- AI Copilot FAB & Quiet Zone Button -->
    <div class="absolute bottom-4 right-4 z-40 flex flex-col gap-4">
      <button
        v-if="!isModalOpen"
        class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.5)] outline-none focus:ring-4 focus:ring-indigo-400/30 group ea-button"
        @click="isModalOpen = true"
        :aria-label="$t('findQuietZone')"
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
        <h2 id="sensory-modal-title" class="text-xl font-bold mb-2">{{ $t('quietZoneFinder') }}</h2>
        <div v-if="sensoryRoom">
          <p class="text-emerald-400 font-semibold mb-4">{{ sensoryRoom.label[lang as 'en'|'es'|'fr'|'de'] || sensoryRoom.label.en }}</p>
          <div class="mb-4">
            <h3 class="text-xs uppercase text-white/50 mb-1">{{ $t('features') }}</h3>
            <ul class="flex flex-wrap gap-2">
              <li v-for="f in features" :key="f" class="bg-white/10 px-2 py-1 rounded text-xs font-medium">{{ f }}</li>
            </ul>
          </div>
          <div class="bg-indigo-900/40 border border-indigo-500/30 p-3 rounded-lg text-sm text-indigo-100">
            <strong>{{ $t('stepFreeRoute') }}:</strong> {{ stepFreeRoute }}
          </div>
        </div>
        <div v-else class="text-white/50 text-sm">
          {{ $t('noSensoryRoom') }}
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
            <h2 class="font-bold text-sm text-white tracking-tight">{{ $t('concierge') }}</h2>
            <p class="text-[10px] text-white/30 font-medium">{{ $t('poweredByGemini') }}</p>
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
          @click="isModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl
                 bg-indigo-900/40 border border-indigo-500/40
                 text-indigo-300 hover:bg-indigo-800/50
                 transition-all duration-200 text-sm font-medium
                 w-full justify-center mt-3"
          aria-label="Find nearest quiet zone for sensory sensitivities"
        >
          <span aria-hidden="true">🧘</span>
          <span>{{ $t('quietZoneFinder') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import FanMap from '../components/fan/FanMap.vue';
import ConciergeChat from '../components/fan/ConciergeChat.vue';
import LiveMatchFeed from '../components/fan/LiveMatchFeed.vue';
import BaseButton from '../components/common/BaseButton.vue';
import LanguageSelector from '../components/common/LanguageSelector.vue';
import { useStadiumStore } from '../store/useStadiumStore';
import { useSensoryRoom } from '../composables/useSensoryRoom';

const router = useRouter();
const store = useStadiumStore();
const { t: $t } = useI18n();
const isChatOpen = ref(true);
const isScreenReaderMode = ref(false);

const { isModalOpen, sensoryRoom, stepFreeRoute, features, lang } = useSensoryRoom();

const telemetry = computed(() => store.telemetry);

const throughputView = ref<'fastest' | 'lowest'>('fastest');

const gateColors: Record<string, string> = {
  GateA: '#34d399',
  GateB: '#34d399',
  GateC: '#60a5fa',
  GateD: '#f87171'
};

const allGates = computed(() => {
  const throughput = store.telemetry.gateThroughput ?? {};
  return Object.entries(throughput).map(([key, val]) => ({
    name: key.replace('Gate', 'Gate '),
    throughput: val,
    color: gateColors[key] ?? '#94a3b8'
  }));
});

const sortedGates = computed(() => {
  const gates = [...allGates.value];
  return throughputView.value === 'fastest'
    ? gates.sort((a, b) => b.throughput - a.throughput)
    : gates.sort((a, b) => a.throughput - b.throughput);
});

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
