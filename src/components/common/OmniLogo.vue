<template>
  <div class="flex items-center gap-3">
    <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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
