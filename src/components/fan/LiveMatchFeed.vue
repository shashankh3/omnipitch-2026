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
      <!-- Match 1: LIVE with Slideshow & Boom Animation -->
      <div class="p-3 border-b border-white/5 bg-white/5 cursor-pointer relative overflow-hidden group">
        <div class="flex justify-between items-center text-[10px] mb-2 relative z-10">
          <div class="flex items-center gap-1.5 text-red-400 font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="tabular-nums">{{ matchMinute }}'</span>
          </div>
          <span class="px-1.5 py-0.5 bg-red-500 text-white rounded text-[9px] uppercase tracking-wider font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">Live</span>
        </div>
        
        <div class="flex justify-between items-center mb-2.5 relative z-10">
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white text-xs block truncate drop-shadow-md">USA</span>
          </div>
          <div class="bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg font-black text-lg flex gap-1.5 tabular-nums text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span :class="{'text-emerald-400 scale-110 transition-transform': currentSlide.isGoal}">2</span>
            <span class="text-white/30">:</span>
            <span>1</span>
          </div>
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/80 text-xs block truncate drop-shadow-md">MEXICO</span>
          </div>
        </div>

        <!-- Slideshow Container -->
        <div class="relative h-32 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10 bg-black">
          <transition name="boom-slide" mode="out-in">
            <div :key="currentSlide.id" class="absolute inset-0 w-full h-full">
              <!-- Image with slow Ken Burns pan -->
              <img 
                :src="currentSlide.image" 
                :alt="currentSlide.text" 
                class="w-full h-full object-cover animate-ken-burns" 
                :class="currentSlide.imageClass"
              />
              <!-- Flash overlay for goals -->
              <div v-if="currentSlide.isGoal" class="absolute inset-0 bg-white opacity-0 animate-goal-flash"></div>
              
              <!-- Gradient & Text -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-3">
                <div v-if="currentSlide.isGoal" class="absolute bottom-10 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-[0_0_8px_rgba(220,38,38,0.8)] -rotate-3 animate-bounce">
                  GOAL!
                </div>
                <p class="text-white text-[11px] font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" v-html="currentSlide.text"></p>
              </div>
            </div>
          </transition>

          <!-- Slideshow Progress Indicators -->
          <div class="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            <div 
              v-for="(_, index) in slides" 
              :key="index"
              class="h-1 rounded-full transition-all duration-300"
              :class="index === slideIndex ? 'w-4 bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'w-1.5 bg-white/30'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Match 2: Finished -->
      <div class="p-3 border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group opacity-70 hover:opacity-100">
        <div class="flex justify-between items-center text-[10px] mb-2">
          <span class="text-white/40 font-bold">Final Whistle</span>
          <span class="px-1.5 py-0.5 bg-white/10 text-white/50 rounded text-[9px] uppercase tracking-wider font-extrabold">FT</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import goalImg from '../../assets/soccer_goal_action.png';
import fansImg from '../../assets/soccer_fans_cheering.png';

const matchMinute = ref(72);
const slideIndex = ref(0);
let minuteInterval: any;
let slideInterval: any;

const slides = [
  {
    id: 1,
    image: goalImg,
    imageClass: 'object-center',
    text: 'Pulisic receives the cross deep in the box...',
    isGoal: false
  },
  {
    id: 2,
    image: goalImg,
    imageClass: 'object-right scale-125 origin-right', // Zoom in on the action
    text: '<span class="text-emerald-400 text-sm">STRIKE!</span> An absolute rocket into the top corner!',
    isGoal: true
  },
  {
    id: 3,
    image: fansImg,
    imageClass: 'object-center',
    text: 'The American fans erupt as USA takes a dramatic 2-1 lead!',
    isGoal: false
  }
];

const currentSlide = computed(() => slides[slideIndex.value]);

onMounted(() => {
  // Cycle slides every 4 seconds
  slideInterval = setInterval(() => {
    slideIndex.value = (slideIndex.value + 1) % slides.length;
  }, 4000);

  // Slowly tick up the match minute
  minuteInterval = setInterval(() => {
    if (matchMinute.value < 90) matchMinute.value++;
  }, 60000);
});

onUnmounted(() => {
  clearInterval(slideInterval);
  clearInterval(minuteInterval);
});
</script>

<style scoped>
/* Slideshow Transitions */
.boom-slide-enter-active {
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.boom-slide-leave-active {
  transition: all 0.4s ease-in;
}
.boom-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9) rotate(5deg);
}
.boom-slide-leave-to {
  opacity: 0;
  transform: translateX(-100%) scale(0.9) rotate(-5deg);
}

/* Flash effect for the goal */
@keyframes goal-flash {
  0% { opacity: 0; transform: scale(1); }
  10% { opacity: 0.8; transform: scale(1.1); box-shadow: inset 0 0 50px rgba(255,255,255,1); }
  100% { opacity: 0; transform: scale(1); }
}
.animate-goal-flash {
  animation: goal-flash 1s ease-out forwards;
}

/* Ken Burns slow pan */
@keyframes ken-burns {
  0% { transform: scale(1.0); }
  100% { transform: scale(1.15); }
}
.animate-ken-burns {
  animation: ken-burns 6s linear forwards;
}
</style>
