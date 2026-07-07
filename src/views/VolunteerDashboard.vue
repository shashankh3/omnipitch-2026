<template>
  <div class="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
    <header class="bg-white border-b border-zinc-200/60 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80 p-4 lg:px-8 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h1 class="text-xl font-extrabold tracking-tight text-zinc-800">Volunteer Operations</h1>
      </div>
      <BaseButton variant="secondary" @click="logout" aria-label="Exit Volunteer Portal" class="!px-4 !py-2 !text-sm">Sign Out</BaseButton>
    </header>

    <main class="flex-1 p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <section class="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <TaskInbox />
        </section>
        
        <section class="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28 self-start">
          <BaseCard class="!p-8 bg-white/70">
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
