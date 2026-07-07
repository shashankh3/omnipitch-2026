<template>
  <div class="min-h-screen flex flex-col bg-[#030308] text-white font-sans transition-colors duration-500 relative overflow-hidden">
    
    <!-- Dynamic EA-Style Background (Shared with Login) -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none fixed">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-30"></div>
      <div class="absolute top-[-20%] left-[-10%] w-[70%] h-[140%] bg-gradient-to-br from-indigo-600/10 to-transparent rounded-full mix-blend-screen filter blur-[120px] animate-sweep-slow"></div>
      <div class="absolute bottom-[-30%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-tl from-[#ccff00]/5 to-transparent rounded-full mix-blend-screen filter blur-[100px] animate-sweep-fast" style="animation-direction: reverse;"></div>
      <div class="absolute inset-0 opacity-10 transform -skew-x-12 translate-x-1/4 scale-150 border-l border-white/5"></div>
      <div class="absolute inset-0 opacity-5 transform -skew-x-12 -translate-x-1/4 scale-150 border-r border-white/5"></div>
    </div>

    <!-- Massive EA Typography Header -->
    <header class="relative z-30 pt-12 pb-6 px-6 lg:px-12 flex justify-between items-end transition-colors duration-500 border-b border-white/10 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div class="flex flex-col animate-fade-in-left">
        <h1 class="text-4xl md:text-5xl lg:text-7xl font-black italic text-white uppercase tracking-tighter leading-none mb-1 drop-shadow-lg">
          OMNI<span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">PITCH</span> <span class="text-[#ccff00]">26</span>
        </h1>
        <p class="text-[#ccff00] text-sm md:text-base font-bold uppercase tracking-widest pl-1">Volunteer Operations</p>
      </div>
      
      <div class="flex items-center gap-4 animate-fade-in-right mb-2">
        <BaseButton variant="secondary" @click="logout" aria-label="Exit Volunteer Portal" class="!px-6 !py-2.5 !text-sm !font-bold !tracking-widest uppercase bg-white/5 text-white/70 border-white/20 hover:bg-white/20 hover:text-white transition-all rounded-xl ea-button">DISCONNECT</BaseButton>
      </div>
    </header>

    <main class="flex-1 p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full relative z-10 animate-fade-in-up">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <section class="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <TaskInbox />
        </section>
        
        <section class="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-10 self-start">
          <BaseCard class="!p-8 transition-colors duration-500 hover:shadow-[0_20px_60px_rgba(204,255,0,0.1)] hover:border-[#ccff00]/30 ea-tile bg-[#0a0a1a]/90 backdrop-blur-xl">
            <IncidentLogger />
          </BaseCard>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import TaskInbox from '../components/volunteer/TaskInbox.vue';
import IncidentLogger from '../components/volunteer/IncidentLogger.vue';
import BaseButton from '../components/common/BaseButton.vue';
import BaseCard from '../components/common/BaseCard.vue';

const router = useRouter();

const logout = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
/* Snappy EA Sports style transition */
.ea-tile {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
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
.animate-sweep-slow { animation: sweep 20s ease-in-out infinite; }
.animate-sweep-fast { animation: sweep 12s ease-in-out infinite; }

/* Entrance Animations */
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-in-left { animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-in-right { animation: fadeInRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  opacity: 0;
}
</style>
