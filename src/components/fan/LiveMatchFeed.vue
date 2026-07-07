<template>
  <div class="bg-[#0a0a1a]/90 backdrop-blur-2xl border border-white/8 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col pointer-events-auto w-72 transition-all duration-300">
    <div class="px-4 py-3 flex justify-between items-center border-b border-white/5">
      <div class="flex items-center gap-2">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <h3 class="font-bold text-xs text-white tracking-wide">Live Matches</h3>
      </div>
      <span class="text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase">MD 12</span>
    </div>

    <div class="flex-1 overflow-y-auto max-h-[55vh] custom-scrollbar">
      <!-- Match 1 -->
      <div class="p-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group">
        <div class="flex justify-between items-center text-[10px] mb-2">
          <div class="flex items-center gap-1.5 text-red-400 font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>72'</span>
          </div>
          <span class="px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded text-[9px] uppercase tracking-wider font-extrabold border border-red-500/20">Live</span>
        </div>
        <div class="flex justify-between items-center mb-2.5">
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white text-xs block truncate">USA</span>
          </div>
          <div class="bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-black text-base flex gap-1.5 tabular-nums text-white">
            <span>2</span><span class="text-white/20">:</span><span>1</span>
          </div>
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white text-xs block truncate">MEXICO</span>
          </div>
        </div>
        <div class="relative h-24 rounded-lg overflow-hidden group-hover:shadow-md transition-shadow">
          <img src="../../assets/soccer_goal_action.png" alt="USA scores a dramatic goal" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2">
            <p class="text-white text-[10px] font-semibold leading-tight drop-shadow-md">Pulisic scores a stunning header to take the lead!</p>
          </div>
        </div>
      </div>

      <!-- Match 2 -->
      <div class="p-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group">
        <div class="flex justify-between items-center text-[10px] mb-2">
          <span class="text-white/30 font-bold">Final Whistle</span>
          <span class="px-1.5 py-0.5 bg-white/5 text-white/30 rounded text-[9px] uppercase tracking-wider font-extrabold border border-white/10">FT</span>
        </div>
        <div class="flex justify-between items-center mb-2.5">
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/70 text-[10px] block truncate">ARGENTINA</span>
          </div>
          <div class="bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-black text-base flex gap-1.5 tabular-nums text-white/60">
            <span>3</span><span class="text-white/15">:</span><span>0</span>
          </div>
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/70 text-xs block truncate">CANADA</span>
          </div>
        </div>
        <div class="relative h-24 rounded-lg overflow-hidden group-hover:shadow-md transition-shadow">
          <img src="../../assets/soccer_fans_cheering.png" alt="Fans cheering wildly" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2">
            <p class="text-white/80 text-[10px] font-semibold leading-tight drop-shadow-md">Argentina fans erupt as Messi seals the victory.</p>
          </div>
        </div>
      </div>

      <!-- Upcoming Match -->
      <div class="p-3 hover:bg-white/3 transition-colors cursor-pointer">
        <div class="flex justify-between items-center text-[10px] mb-2">
          <span class="text-white/30 font-bold">19:00 Local</span>
          <span class="px-1.5 py-0.5 bg-amber-500/10 text-amber-400/80 rounded text-[9px] uppercase tracking-wider font-extrabold border border-amber-500/15">Soon</span>
        </div>
        <div class="flex justify-between items-center">
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/50 text-xs block truncate">BRAZIL</span>
          </div>
          <div class="bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-black text-sm flex gap-1.5 text-white/30">
            <span>vs</span>
          </div>
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/50 text-xs block truncate">GERMANY</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Static match feed for Fan Dashboard engagement
</script>
