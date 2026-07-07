<template>
  <div class="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 font-sans dark-theme">
    <header class="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30 p-4 lg:px-8 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-50 flex items-center justify-center font-bold shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        </div>
        <h1 class="text-xl font-extrabold tracking-tight text-white">Organizer Command Center</h1>
      </div>
      <BaseButton variant="secondary" @click="logout" aria-label="Exit Organizer Portal" class="!bg-zinc-900 !text-white !border-zinc-800 hover:!bg-zinc-800 !px-4 !py-2 !text-sm">Sign Out</BaseButton>
    </header>

    <main class="flex-1 p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto w-full">
      <OperationsDashboard />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import OperationsDashboard from '../components/organizer/OperationsDashboard.vue';
import BaseButton from '../components/common/BaseButton.vue';

const router = useRouter();

const logout = () => {
  router.push({ name: 'login' });
};
</script>
