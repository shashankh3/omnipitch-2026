<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#050510] dark:text-zinc-50 font-sans transition-colors duration-500">
    <header class="bg-white/80 dark:bg-[#0a0a1a]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 sticky top-0 z-30 p-4 lg:px-8 flex justify-between items-center transition-colors duration-500">
      <OmniLogo subtitle="Command Center" />
      <div class="flex items-center gap-4">
        <ThemeToggle />
        <BaseButton variant="secondary" @click="logout" aria-label="Exit Organizer Portal" class="!px-4 !py-2 !text-sm dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white transition-all">Sign Out</BaseButton>
      </div>
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
import OmniLogo from '../components/common/OmniLogo.vue';
import ThemeToggle from '../components/common/ThemeToggle.vue';

const router = useRouter();

const logout = () => {
  router.push({ name: 'login' });
};
</script>
