<template>
  <div class="flex flex-col h-full bg-zinc-900/80 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative glass-panel-dark">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
      <div class="flex items-center gap-3">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div>
          <h3 class="text-white font-bold tracking-tight">AI Command Console</h3>
          <p class="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">OmniPitch Intelligence Core</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-emerald-400 font-mono tracking-widest uppercase">Online</span>
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        </span>
      </div>
    </div>

    <!-- Feed -->
    <div class="flex-1 p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar bg-gradient-to-b from-transparent to-zinc-950/50">
      
      <!-- Initial System Alert -->
      <div class="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
        <p class="text-amber-500 text-[10px] uppercase font-mono tracking-widest mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          Proactive Alert
        </p>
        <p class="text-zinc-200 text-sm font-mono leading-relaxed">
          Gate C capacity threshold reached (890 fans/min). Recommend pushing automated app notifications to route incoming traffic toward Gate B.
        </p>
      </div>
      
      <!-- AI Responses -->
      <div v-for="(rec, idx) in recommendations" :key="idx" class="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
        <p class="text-indigo-400 text-[10px] uppercase font-mono tracking-widest mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/></svg>
          AI Response
        </p>
        <p class="text-zinc-200 text-sm font-mono leading-relaxed">{{ rec }}</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
         <svg class="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">Computing tactical vectors...</p>
      </div>
    </div>

    <!-- Input -->
    <form @submit.prevent="askAI" class="p-4 bg-zinc-950 border-t border-zinc-800">
      <div class="relative group">
        <label for="console-input" class="sr-only">Command Console Query</label>
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span class="text-zinc-500 font-mono text-sm">>_</span>
        </div>
        <input 
          id="console-input"
          v-model="query" 
          type="text" 
          placeholder="Enter operational query..."
          class="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3.5 pl-10 pr-12 text-zinc-100 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-zinc-600 shadow-inner"
          :disabled="isLoading"
        />
        <button 
          type="submit" 
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-indigo-600 text-zinc-400 hover:text-white p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400"
          :disabled="!query.trim() || isLoading"
          aria-label="Submit Console Command"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import { getOrganizerRecommendation, translateAnnouncement, getSentimentAnalysis } from '../../services/gemini';

const store = useStadiumStore();
const query = ref('');
const isLoading = ref(false);
const recommendations = ref<string[]>([]);

const askAI = async () => {
  if (!query.value.trim() || isLoading.value) return;
  
  const userQuery = query.value;
  query.value = '';
  isLoading.value = true;
  
  try {
    if (userQuery.startsWith('/broadcast ')) {
      const textToTranslate = userQuery.replace('/broadcast ', '').trim();
      const translation = await translateAnnouncement(textToTranslate);
      recommendations.value.unshift(`[BROADCAST INITIATED]\nOriginal: ${textToTranslate}\n\nTranslations:\n${translation}`);
    } else if (userQuery.startsWith('/sentiment')) {
      const sentiment = await getSentimentAnalysis(store.telemetry);
      recommendations.value.unshift(`[SENTIMENT ANALYSIS]\n${sentiment}`);
    } else {
      const result = await getOrganizerRecommendation(userQuery, store.telemetry);
      recommendations.value.unshift(result);
    }
  } catch (error) {
    recommendations.value.unshift("System timeout.");
  } finally {
    isLoading.value = false;
  }
};
</script>
