<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050510] relative overflow-hidden p-4 transition-colors duration-500">
    
    <!-- Theme Toggle -->
    <div class="absolute top-6 right-6 z-50">
      <ThemeToggle />
    </div>
    
    <!-- Decorative floating elements -->
    <div class="absolute top-10 left-10 w-32 h-32 bg-violet-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
    <div class="absolute top-10 right-10 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-20 w-32 h-32 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000 transition-colors duration-500"></div>

    <BaseCard class="w-full max-w-md !p-8 relative z-10 glass-panel dark:bg-[#0a0a1a]/80 dark:border-white/10 border border-slate-200 shadow-2xl rounded-[2rem] transition-colors duration-500">
      <div class="text-center mb-8 flex flex-col items-center justify-center">
        <OmniLogo subtitle="World Cup Operations Platform" class="!flex-col !gap-4 mb-2 scale-125" />
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
import OmniLogo from '../components/common/OmniLogo.vue';
import ThemeToggle from '../components/common/ThemeToggle.vue';
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
