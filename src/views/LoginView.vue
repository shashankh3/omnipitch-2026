<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-mesh relative overflow-hidden p-4">
    
    <!-- Decorative floating elements -->
    <div class="absolute top-10 left-10 w-32 h-32 bg-violet-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
    <div class="absolute top-10 right-10 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

    <BaseCard class="w-full max-w-md !p-8 relative z-10 glass-panel border border-white/40 shadow-2xl rounded-[2rem]">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h1 class="text-3xl font-extrabold text-zinc-900 tracking-tight">OmniPitch <span class="text-indigo-600">2026</span></h1>
        <p class="text-zinc-500 mt-2 text-sm font-medium">World Cup Operations Platform</p>
      </div>

      <div class="flex flex-col gap-4">
        <BaseButton @click="handleLogin('fan')" variant="primary" block aria-label="Enter Fan Experience Portal">
          Enter Fan Experience
        </BaseButton>
        
        <BaseButton @click="handleLogin('volunteer')" variant="secondary" block aria-label="Enter Volunteer Portal">
          Volunteer Portal
        </BaseButton>

        <BaseButton @click="handleLogin('organizer')" variant="secondary" block aria-label="Enter Organizer Command Center">
          Organizer Command Center
        </BaseButton>
      </div>
      
      <div class="mt-8 pt-6 border-t border-zinc-200/50 text-center">
        <p class="text-xs text-zinc-400">Secured via zero-trust architecture</p>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStadiumStore } from '../store/useStadiumStore';
import BaseCard from '../components/common/BaseCard.vue';
import BaseButton from '../components/common/BaseButton.vue';
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
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>
