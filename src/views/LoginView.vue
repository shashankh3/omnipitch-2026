<template>
  <div class="h-screen w-full bg-[#030308] overflow-hidden relative flex items-center select-none">
    
    <!-- Dynamic EA-Style Background -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <!-- Deep space base with subtle grid -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGgyMHYyMEgyMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-30"></div>
      
      <!-- Massive sweeping color gradients (Stadium Floodlight effect) -->
      <div class="absolute top-[-20%] left-[-10%] w-[70%] h-[140%] bg-gradient-to-br from-indigo-600/20 to-transparent rounded-full mix-blend-screen filter blur-[120px] animate-sweep-slow"></div>
      <div class="absolute bottom-[-30%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-tl from-[#ccff00]/10 to-transparent rounded-full mix-blend-screen filter blur-[100px] animate-sweep-fast" style="animation-direction: reverse;"></div>
      
      <!-- Abstract diagonal slash typical of sports games -->
      <div class="absolute inset-0 opacity-20 transform -skew-x-12 translate-x-1/4 scale-150 border-l border-white/5 pointer-events-none"></div>
      <div class="absolute inset-0 opacity-10 transform -skew-x-12 -translate-x-1/4 scale-150 border-r border-white/5 pointer-events-none"></div>
    </div>

    <!-- Main Content Container -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      
      <!-- Left Side: Massive Typography -->
      <div class="lg:col-span-7 flex flex-col justify-center animate-fade-in-left">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-[#ccff00] to-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.3)]">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#050510" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <span class="text-white/50 uppercase tracking-[0.3em] font-bold text-sm">FIFA World Cup</span>
        </div>
        
        <h1 class="text-6xl md:text-8xl lg:text-[140px] font-black italic text-white uppercase tracking-tighter leading-[0.85] mb-2 drop-shadow-2xl mix-blend-plus-lighter">
          OMNI<br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">PITCH</span> 
          <span class="text-[#ccff00] block text-5xl md:text-7xl lg:text-[100px] mt-2">26</span>
        </h1>
        
        <p class="text-white/40 text-lg md:text-xl font-medium tracking-wide mt-6 border-l-4 border-[#ccff00] pl-4 max-w-md">
          Global Stadium Operations & Immersive Fan Telemetry Engine
        </p>
      </div>

      <!-- Right Side: Modular Tile Grid -->
      <div class="lg:col-span-5 grid grid-cols-2 gap-4 animate-fade-in-up">
        
        <!-- Hero Tile: Fan Experience -->
        <button 
          @click="handleLogin('fan')" 
          class="col-span-2 group relative h-64 rounded-2xl overflow-hidden glass-panel border border-white/10 text-left transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(204,255,0,0.15)] hover:border-[#ccff00]/50 outline-none focus:ring-4 focus:ring-[#ccff00]/30 ea-tile"
          aria-label="Enter Fan Experience Portal"
        >
          <!-- Dynamic hover background -->
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-[#ccff00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen"></div>
          
          <!-- Abstract mesh graphic -->
          <div class="absolute right-0 bottom-0 w-64 h-64 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHBhdGggZD0iTTAgMGg4MHY4MEgwem00MCA0MGg0MHY0MEg0MHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] transform rotate-12 translate-x-10 translate-y-10 group-hover:rotate-6 transition-transform duration-700 ease-out"></div>
          
          <div class="absolute inset-0 p-8 flex flex-col justify-end">
            <h2 class="text-4xl font-black italic uppercase text-white tracking-tight mb-2 group-hover:text-[#ccff00] transition-colors duration-300 transform group-hover:translate-x-2">Fan<br/>Experience</h2>
            <p class="text-white/60 text-sm font-medium tracking-wide transform group-hover:translate-x-2 transition-transform duration-300 delay-75">Enter the immersive 3D stadium</p>
          </div>
          
          <!-- Glowing arrow indicator -->
          <div class="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#ccff00] group-hover:bg-[#ccff00]/10 transition-all duration-300">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white group-hover:text-[#ccff00] transform -rotate-45 group-hover:rotate-0 transition-transform duration-300"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
        </button>

        <!-- Volunteer Tile -->
        <button 
          @click="handleLogin('volunteer')" 
          class="col-span-1 group relative h-48 rounded-2xl overflow-hidden glass-panel border border-white/10 text-left transition-all duration-500 hover:scale-[1.05] hover:-translate-y-1 hover:shadow-2xl hover:border-white/40 outline-none focus:ring-4 focus:ring-white/20 ea-tile"
          aria-label="Enter Volunteer Portal"
        >
          <div class="absolute inset-0 p-6 flex flex-col justify-between">
            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h3 class="text-xl font-bold italic uppercase text-white tracking-tight mb-1 group-hover:translate-x-1 transition-transform duration-300">Volunteer</h3>
              <p class="text-white/40 text-xs font-medium uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300 delay-75">Ground Crew</p>
            </div>
          </div>
        </button>

        <!-- Organizer Tile -->
        <button 
          @click="handleLogin('organizer')" 
          class="col-span-1 group relative h-48 rounded-2xl overflow-hidden glass-panel border border-white/10 text-left transition-all duration-500 hover:scale-[1.05] hover:-translate-y-1 hover:shadow-2xl hover:border-white/40 outline-none focus:ring-4 focus:ring-white/20 ea-tile"
          aria-label="Enter Organizer Command Center"
        >
          <div class="absolute inset-0 p-6 flex flex-col justify-between">
            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </div>
            <div>
              <h3 class="text-xl font-bold italic uppercase text-white tracking-tight mb-1 group-hover:translate-x-1 transition-transform duration-300">Organizer</h3>
              <p class="text-white/40 text-xs font-medium uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-300 delay-75">Cmd Center</p>
            </div>
          </div>
        </button>

      </div>
    </div>
    
    <!-- Footer / Branding watermark -->
    <div class="absolute bottom-6 left-12 z-10 pointer-events-none opacity-20">
      <p class="font-mono text-[10px] uppercase tracking-[0.4em] text-white">v.2.0.4.52 // Zero Trust Secured</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStadiumStore } from '../store/useStadiumStore';
import type { UserSession } from '../types';

const router = useRouter();
const store = useStadiumStore();

const handleLogin = (role: 'fan' | 'volunteer' | 'organizer') => {
  const sessionData: UserSession = {
    id: `usr_${Math.floor(Math.random() * 10000)}`,
    email: `test_${role}@worldcup2026.org`,
    role: role.toUpperCase() as 'FAN' | 'VOLUNTEER' | 'ORGANIZER',
    language: 'en',
    accessibilityProfile: { requiresStepFree: false, highContrastMode: false }
  };
  
  store.currentSession = sessionData;
  router.push({ name: `${role}-dashboard` });
};
</script>

<style scoped>
/* Core Glass Panel Base */
.glass-panel {
  background: rgba(22, 22, 24, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Snappy EA Sports style transition */
.ea-tile {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Background Sweep Animations */
@keyframes sweep {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(5deg) scale(1.1) translate(2%, 2%); }
  100% { transform: rotate(0deg) scale(1); }
}
.animate-sweep-slow {
  animation: sweep 20s ease-in-out infinite;
}
.animate-sweep-fast {
  animation: sweep 12s ease-in-out infinite;
}

/* Entrance Animations */
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-fade-in-left {
  animation: fadeInLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  opacity: 0; /* Ensures it stays hidden until animation starts */
}
</style>
