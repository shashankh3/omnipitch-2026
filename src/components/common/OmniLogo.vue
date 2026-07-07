<template>
  <div class="flex items-center gap-3">
    <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_4px_16px_rgba(251,191,36,0.3)]">
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
    </div>
    <div class="flex flex-col">
      <h1 class="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">OmniPitch <span class="text-indigo-600 dark:text-indigo-400">2026</span></h1>
      <span v-if="subtitle" class="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest mt-1">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  subtitle?: string
}>()
</script>
