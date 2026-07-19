<template>
  <div class="fan-dashboard flex flex-col h-screen overflow-hidden bg-[#050510] text-white relative transition-colors duration-500">

    <!-- Offline Banner -->
    <div v-if="store.isOfflineMode" class="absolute top-0 left-0 right-0 z-[100] bg-rose-700 text-white text-xs font-bold uppercase tracking-widest py-1.5 flex justify-center shadow-lg animate-pulse">
      {{ $t('networkDegraded') }}
    </div>

    <!-- Heat Alert (just below banners, centred horizontally, doesn't clash with anything) -->
    <Transition name="slide-down">
      <div
        v-if="telemetry.wbgtTemperature > 32 && !isScreenReaderMode"
        class="absolute top-[96px] left-1/2 -translate-x-1/2 z-[90] pointer-events-none"
        :class="store.isOfflineMode ? 'top-[128px]' : 'top-[96px]'"
      >
        <div class="bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 text-amber-200 font-semibold px-6 py-2.5 rounded-2xl shadow-[0_4px_24px_rgba(245,158,11,0.2)] flex items-center gap-3 whitespace-nowrap">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <span class="text-sm">{{ $t('highHeat') }}: {{ telemetry.wbgtTemperature.toFixed(1) }}°C — {{ $t('stayHydrated') }}</span>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- TOP-LEFT: Brand mark                                           -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div
      class="absolute left-6 z-40 pointer-events-none drop-shadow-2xl transition-all duration-300"
      :class="store.isOfflineMode ? 'top-10' : 'top-6'"
    >
      <h1 class="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-0.5 opacity-90">
        OMNI<span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">PITCH</span>
        <span class="text-[#ccff00]"> 26</span>
      </h1>
      <p class="text-[#ccff00] text-[10px] font-bold uppercase tracking-widest pl-0.5 opacity-90">{{ $t('fanExperience') }}</p>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- TOP-RIGHT: Controls row (a11y + status + disconnect + language) -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <header
      class="absolute right-6 z-40 flex flex-col items-end gap-2 transition-all duration-300"
      :class="store.isOfflineMode ? 'top-10' : 'top-6'"
    >
      <!-- Row 1: interactive controls -->
      <div class="flex items-center gap-2">
        <!-- A11y Mode toggle -->
        <button
          type="button"
          @click="isScreenReaderMode = !isScreenReaderMode"
          class="h-9 bg-[#0a0a1a]/90 border border-white/20 rounded-xl px-3 flex items-center gap-2 hover:bg-white/20 transition-all text-white/70 hover:text-white ea-button shadow-md"
          :class="isScreenReaderMode ? 'border-[#ccff00]/50 bg-[#ccff00]/10 text-[#ccff00]' : ''"
          aria-label="Toggle Screen Reader Mode"
          :aria-pressed="isScreenReaderMode"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/></svg>
          <span class="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">A11Y</span>
        </button>

        <!-- Systems online badge -->
        <div class="h-9 bg-[#0a0a1a]/90 border border-white/20 rounded-xl px-3 flex items-center gap-2 shadow-md">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] motion-safe:animate-pulse"></div>
          <span class="text-[10px] text-white/60 font-bold uppercase tracking-widest hidden sm:inline">{{ $t('systemsOnline') }}</span>
        </div>

        <!-- Disconnect -->
        <button
          type="button"
          @click="logout"
          aria-label="Exit Fan Portal"
          class="h-9 bg-white/5 hover:bg-white/15 border border-white/20 hover:border-white/40 text-white/60 hover:text-white rounded-xl px-3 text-[10px] font-bold uppercase tracking-widest transition-all ea-button shadow-md"
        >
          {{ $t('disconnect') }}
        </button>
      </div>

      <!-- Row 2: Language selector (indented right-align) -->
      <LanguageSelector />
    </header>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- MAIN: 3-D stadium canvas fills remaining space                  -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <main class="flex-1 relative">
      <FanMap
        :active="!isScreenReaderMode"
        :aria-hidden="isScreenReaderMode"
        :class="{ 'opacity-0 pointer-events-none': isScreenReaderMode }"
        class="transition-opacity duration-300"
      />

      <!-- Screen Reader Data Grid (a11y) -->
      <div
        v-if="isScreenReaderMode"
        class="absolute inset-0 z-50 bg-[#050510] overflow-auto p-6 md:p-12 pt-28 pointer-events-auto"
      >
        <h2 class="text-2xl font-bold text-white mb-6">{{ $t('screenReaderView') }}</h2>

        <h3 class="text-xl text-emerald-400 mb-4 mt-8">{{ $t('srGateThroughput') }}</h3>
        <table class="w-full text-left text-white border border-white/20">
          <thead>
            <tr class="bg-white/10 border-b border-white/20">
              <th class="p-3">{{ $t('srGate') }}</th>
              <th class="p-3">{{ $t('srFlowRate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gate in allGates" :key="gate.name" class="border-b border-white/10">
              <td class="p-3">{{ gate.name }}</td>
              <td class="p-3">{{ gate.throughput }}</td>
            </tr>
          </tbody>
        </table>

        <h3 class="text-xl text-amber-400 mb-4 mt-8">{{ $t('srCrowdDensity') }}</h3>
        <table class="w-full text-left text-white border border-white/20 mb-12">
          <thead>
            <tr class="bg-white/10 border-b border-white/20">
              <th class="p-3">{{ $t('srZoneSection') }}</th>
              <th class="p-3">{{ $t('srCapacity') }}</th>
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

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- LEFT COLUMN: Live Match Feed                                   -->
    <!--   • starts below the brand mark, ends above gate-throughput   -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="absolute left-6 top-[100px] bottom-[260px] z-30 hidden md:flex flex-col w-72 flex-shrink-0">
      <LiveMatchFeed class="h-full" />
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- BOTTOM-RIGHT AREA: Gate Throughput panel                       -->
    <!--   • sits ABOVE the FABs, aligned with the right edge          -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="absolute bottom-[64px] right-24 z-30 w-[270px]">
      <div class="bg-[#0a0a1a]/95 border border-white/10 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-3">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-0.5">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
              {{ $t('gateThroughput') }}
            </span>
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[9px] text-emerald-400 font-bold">{{ $t('live') }}</span>
            </span>
          </div>
          <!-- Toggle pill -->
          <div class="flex rounded-lg overflow-hidden border border-slate-700/80 text-[9px] bg-[#0a0a1a]">
            <button
              type="button"
              @click="throughputView = 'fastest'"
              :class="throughputView === 'fastest' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-400'"
              class="px-2.5 py-1 transition-colors uppercase tracking-widest font-bold"
            >
              {{ $t('fastest') }}
            </button>
            <button
              type="button"
              @click="throughputView = 'lowest'"
              :class="throughputView === 'lowest' ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-400'"
              class="px-2.5 py-1 transition-colors uppercase tracking-widest font-bold"
            >
              {{ $t('lowest') }}
            </button>
          </div>
        </div>

        <!-- Gate rows -->
        <div class="flex flex-col gap-2">
          <div v-for="gate in sortedGates" :key="gate.name" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: gate.color }"></span>
              <span class="text-xs text-slate-300">{{ gate.name }}</span>
            </div>
            <span
              class="text-xs font-bold tabular-nums"
              :class="gate.throughput >= GATE_THROUGHPUT_EXCELLENT ? 'text-emerald-400' : gate.throughput >= GATE_THROUGHPUT_GOOD ? 'text-amber-400' : 'text-red-400'"
            >
              {{ gate.throughput.toLocaleString() }} {{ $t('perMin') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- BOTTOM-RIGHT CORNER: FAB column (quiet zone)                  -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="absolute bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      <!-- Quiet Zone FAB -->
      <button
        type="button"
        v-if="!isModalOpen"
        class="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.5)] outline-none focus:ring-4 focus:ring-indigo-400/30 ea-button transition-all"
        @click="isModalOpen = true"
        :aria-label="$t('findQuietZone')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- BOTTOM CENTER: Hardware watermark                              -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-white/20 tracking-widest uppercase z-20 whitespace-nowrap pointer-events-none select-none" aria-hidden="true">
      Data Source: OmniPitch Software Simulation Node (Hardware-Agnostic)
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- MODAL: Quiet Zone Finder                                       -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sensory-modal-title"
        @keydown.escape="isModalOpen = false"
        @click.self="isModalOpen = false"
      >
        <div ref="quietZoneModalRef" class="bg-[#0d0d20] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative" tabindex="-1">
          <button
            type="button"
            @click="isModalOpen = false"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close modal"
          >✕</button>
          <h2 id="sensory-modal-title" class="text-xl font-bold mb-4 pr-8">{{ $t('quietZoneFinder') }}</h2>
          <div v-if="sensoryRoom">
            <p class="text-emerald-400 font-semibold mb-4">{{ sensoryRoom.label[lang as 'en'|'es'|'fr'|'de'] || sensoryRoom.label.en }}</p>
            <div class="mb-4">
              <h3 class="text-xs uppercase text-white/40 mb-2 tracking-widest">{{ $t('features') }}</h3>
              <ul class="flex flex-wrap gap-2">
                <li v-for="f in features" :key="f" class="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-medium">{{ f }}</li>
              </ul>
            </div>
            <div class="bg-indigo-900/40 border border-indigo-500/30 p-3 rounded-xl text-sm text-indigo-100">
              <strong>{{ $t('stepFreeRoute') }}:</strong> {{ stepFreeRoute }}
            </div>
          </div>
          <div v-else class="text-white/70 text-sm">{{ $t('noSensoryRoom') }}</div>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- SIDE PANEL: Copilot chat                                       -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <SlidePanel
      :is-open="isChatOpen"
      :show-fab="!isChatOpen"
      :panel-title="$t('concierge')"
      :panel-subtitle="$t('poweredByDeepseek')"
      :fab-label="'Ask Stadium Copilot'"
      @open="isChatOpen = true"
      @close="isChatOpen = false"
    >
      <template #fab-icon>
        <div class="absolute inset-0 rounded-2xl motion-safe:animate-ping opacity-15 bg-amber-300"></div>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </template>

      <template #header-icon>
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
      </template>

      <ConciergeChat class="flex-1 min-h-0" />

      <!-- Quiet Zone shortcut -->
      <button
        type="button"
        @click="isModalOpen = true"
        class="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-800/50 transition-all duration-200 text-sm font-medium w-full justify-center mt-3"
        aria-label="Find nearest quiet zone for sensory sensitivities"
      >
        <span aria-hidden="true">🧘</span>
        <span>{{ $t('quietZoneFinder') }}</span>
      </button>
    </SlidePanel>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { GATE_THROUGHPUT_EXCELLENT, GATE_THROUGHPUT_GOOD } from '../constants';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import FanMap from '../components/fan/FanMap.vue';
import ConciergeChat from '../components/fan/ConciergeChat.vue';
import LiveMatchFeed from '../components/fan/LiveMatchFeed.vue';
import LanguageSelector from '../components/common/LanguageSelector.vue';
import SlidePanel from '../components/common/SlidePanel.vue';
import { useStadiumStore } from '../store/useStadiumStore';
import { useSensoryRoom } from '../composables/useSensoryRoom';

const router = useRouter();
const store = useStadiumStore();
const { t: $t } = useI18n();
const isChatOpen = ref(false);
const isScreenReaderMode = ref(false);
const quietZoneModalRef = ref<HTMLElement | null>(null);

const { isModalOpen, sensoryRoom, stepFreeRoute, features, lang } = useSensoryRoom();

// Focus management for modals
watch(isModalOpen, async (open) => {
  if (open) {
    await nextTick();
    quietZoneModalRef.value?.focus();
  }
});

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
  transform: scale(1.06);
}
.ea-button:active {
  transform: scale(0.94);
}

/* Heat alert entrance */
.slide-down-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-down-leave-active { transition: all 0.25s ease-in; }
.slide-down-enter-from  { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.slide-down-leave-to    { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* Modal fade */
.modal-fade-enter-active { transition: all 0.3s ease; }
.modal-fade-leave-active { transition: all 0.2s ease; }
.modal-fade-enter-from  { opacity: 0; }
.modal-fade-leave-to    { opacity: 0; }
.modal-fade-enter-active > div,
.modal-fade-enter-from   > div { transform: scale(0.96); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
</style>
