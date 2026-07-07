<template>
  <div class="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-[#050510] dark:text-white font-sans transition-colors duration-500">
    <header class="bg-white/80 dark:bg-[#0a0a1a]/80 border-b border-zinc-200/60 dark:border-white/5 sticky top-0 z-30 shadow-sm backdrop-blur-md p-4 lg:px-8 flex justify-between items-center transition-colors duration-500">
      <OmniLogo subtitle="Volunteer Ops" />
      <div class="flex items-center gap-4">
        <ThemeToggle />
        <BaseButton variant="secondary" @click="logout" aria-label="Exit Volunteer Portal" class="!px-4 !py-2 !text-sm dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white transition-all">Sign Out</BaseButton>
      </div>
    </header>

    <main class="flex-1 p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <section class="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <TaskInbox />
        </section>
        
        <section class="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 self-start">
          <BaseCard class="!p-8 bg-white/70 dark:bg-[#0a0a1a]/90 dark:border-white/10 transition-colors duration-500">
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
import OmniLogo from '../components/common/OmniLogo.vue';
import ThemeToggle from '../components/common/ThemeToggle.vue';

const router = useRouter();

const logout = () => {
  router.push({ name: 'login' });
};
</script>
