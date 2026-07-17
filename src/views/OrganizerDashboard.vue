<template>
  <div class="min-h-screen flex flex-col bg-[#030308] text-white font-sans transition-colors duration-500 relative overflow-hidden">
    
    <!-- Offline Banner -->
    <div v-if="isOffline" class="absolute top-0 left-0 right-0 z-[100] bg-rose-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 flex justify-center shadow-lg animate-pulse">
      [WARNING: Network Degraded. Engaging Local Deterministic Engine]
    </div>

    <!-- Health Status Strip -->
    <div
      class="flex items-center gap-4 px-4 py-2 text-xs
             border-b border-slate-800/60
             bg-slate-950/80 backdrop-blur-sm relative z-50"
      :class="{'mt-6': isOffline}"
      role="status"
      aria-live="polite"
      aria-label="System health status"
    >
      <span
        :class="isOffline
          ? 'text-amber-400'
          : 'text-emerald-400'"
        class="font-medium"
      >
        {{ badgeLabel }}
      </span>

      <span class="text-slate-600">|</span>

      <span class="text-slate-500">
        {{ $t('lastChecked') }}: {{ lastCheckTime }}
      </span>

      <span class="text-slate-600">|</span>

      <span
        :class="isOffline
          ? 'text-amber-500'
          : 'text-emerald-500'"
        class="text-xs"
      >
        {{ isOffline ? '🔴 ' + $t('supabaseOffline') : '🟢 ' + $t('supabaseConnected') }}
      </span>
    </div>

    <!-- Dynamic EA-Style Background -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-30"></div>
      <div class="absolute top-[-20%] left-[-10%] w-[70%] h-[140%] bg-gradient-to-br from-indigo-600/10 to-transparent rounded-full mix-blend-screen filter blur-[120px] motion-safe:animate-sweep-slow"></div>
      <div class="absolute bottom-[-30%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-tl from-[#ccff00]/5 to-transparent rounded-full mix-blend-screen filter blur-[100px] motion-safe:animate-sweep-fast" style="animation-direction: reverse;"></div>
      <div class="absolute inset-0 opacity-10 transform -skew-x-12 translate-x-1/4 scale-150 border-l border-white/5"></div>
      <div class="absolute inset-0 opacity-5 transform -skew-x-12 -translate-x-1/4 scale-150 border-r border-white/5"></div>
    </div>

    <!-- Massive EA Typography Header -->
    <header class="relative z-30 pt-12 pb-6 px-6 lg:px-12 flex justify-between items-end transition-colors duration-500 border-b border-white/10 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div class="flex flex-col motion-safe:animate-fade-in-left">
        <h1 class="text-4xl md:text-5xl lg:text-7xl font-black italic text-white uppercase tracking-tighter leading-none mb-1 drop-shadow-lg">
          OMNI<span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">PITCH</span> <span class="text-[#ccff00]">26</span>
        </h1>
        <p class="text-[#ccff00] text-sm md:text-base font-bold uppercase tracking-widest pl-1">{{ $t('cmdCenter') }}</p>
      </div>
      
      <div class="flex flex-col items-end gap-3 motion-safe:animate-fade-in-right mb-2">
        <div class="flex items-center gap-4">
          <div class="flex flex-col gap-1 items-end text-xs font-medium mr-4">
            <div v-if="health.status === 'unknown'" class="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gray-500/20 text-gray-400 border border-gray-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              {{ $t('systemStatusUnknown') }}
            </div>
            <template v-else>
              <div class="flex items-center gap-1.5 px-2 py-0.5 rounded border" :class="health.llm === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'">
                <span class="w-1.5 h-1.5 rounded-full" :class="health.llm === 'live' ? 'bg-emerald-400' : 'bg-red-400'"></span>
                {{ health.llm === 'live' ? $t('aiLive') : $t('aiOffline') }}
              </div>
              <div class="flex items-center gap-1.5 px-2 py-0.5 rounded border" :class="health.supabase === 'configured' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'">
                <span class="w-1.5 h-1.5 rounded-full" :class="health.supabase === 'configured' ? 'bg-emerald-400' : 'bg-red-400'"></span>
                {{ health.supabase === 'configured' ? $t('supabaseConnected') : $t('supabaseOffline') }}
              </div>
            </template>
          </div>
          <BaseButton variant="secondary" @click="logout" aria-label="Exit Organizer Portal" class="!px-6 !py-2.5 !text-sm !font-bold !tracking-widest uppercase bg-white/5 text-white/70 border-white/20 hover:bg-white/20 hover:text-white transition-all rounded-xl ea-button">{{ $t('disconnect') }}</BaseButton>
        </div>
        <LanguageSelector />
      </div>
    </header>

    <main class="flex-1 p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full relative z-10 motion-safe:animate-fade-in-up pb-10">
      <OperationsDashboard />
      
      <!-- Hardware Badge -->
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] text-white/30 tracking-widest uppercase z-50 whitespace-nowrap pointer-events-none pb-2 text-center w-full">
        Data Source: OmniPitch Software Simulation Node (Hardware-Agnostic)
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import OperationsDashboard from '../components/organizer/OperationsDashboard.vue';
import BaseButton from '../components/common/BaseButton.vue';
import LanguageSelector from '../components/common/LanguageSelector.vue';
import { useHealthStatus } from '../composables/useHealthStatus';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t: $t } = useI18n();

const { badgeLabel, isOffline, lastCheck } = useHealthStatus();
const lastCheckTime = computed(() => {
  if (!lastCheck.value) return 'checking...';
  return new Date(lastCheck.value).toLocaleTimeString();
});

const health = ref({ status: 'unknown', llm: 'offline', supabase: 'missing', gemini: 'missing' });
let healthInterval: number;

const fetchHealth = async () => {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      health.value = await res.json();
    } else {
      health.value.status = 'unknown';
    }
  } catch {
    health.value.status = 'unknown';
  }
};

onMounted(() => {
  fetchHealth();
  healthInterval = window.setInterval(fetchHealth, 30000);
});

onUnmounted(() => {
  if (healthInterval) clearInterval(healthInterval);
});

const logout = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
/* Snappy EA Sports style transition */
.ea-button {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ea-button:active {
  transform: scale(0.95);
}

/* Background Sweep Animations */
@keyframes sweep {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(5deg) scale(1.1) translate(2%, 2%); }
  100% { transform: rotate(0deg) scale(1); }
}
.motion-safe:animate-sweep-slow { animation: sweep 20s ease-in-out infinite; }
.motion-safe:animate-sweep-fast { animation: sweep 12s ease-in-out infinite; }

/* Entrance Animations */
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
.motion-safe:animate-fade-in-left { animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
.motion-safe:animate-fade-in-right { animation: fadeInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.motion-safe:animate-fade-in-up {
  animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  opacity: 0;
}
</style>
