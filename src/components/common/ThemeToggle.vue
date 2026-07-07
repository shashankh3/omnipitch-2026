<template>
  <button 
    @click="store.toggleTheme()" 
    class="relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-100 hover:bg-zinc-200 text-amber-500 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-indigo-400 overflow-hidden shadow-inner"
    aria-label="Toggle Dark Mode"
  >
    <!-- Sun icon -->
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      class="absolute transition-all duration-500 transform"
      :class="store.globalTheme === 'dark' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100 rotate-90'"
    >
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    
    <!-- Moon icon -->
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      class="absolute transition-all duration-500 transform"
      :class="store.globalTheme === 'dark' ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-10 opacity-0 -rotate-90'"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useStadiumStore } from '../../store/useStadiumStore';
const store = useStadiumStore();
</script>
