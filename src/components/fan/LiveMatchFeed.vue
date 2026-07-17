<template>
  <div :style="{'--theme-primary': feedData.liveMatch.primaryColor || '#ccff00', '--theme-secondary': feedData.liveMatch.secondaryColor || '#10b981'}" class="bg-[#0a0a1a]/90 backdrop-blur-2xl border border-white/8 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col pointer-events-auto w-72 ea-tile min-h-0 relative group">
    <!-- EA Sports Scanner Line -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-2xl">
      <div class="w-[200%] h-1 bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent opacity-0 group-hover:opacity-40 motion-safe:animate-scan-line"></div>
    </div>
    <div class="px-4 py-3 flex justify-between items-center border-b border-white/5 relative">
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#ccff00]/10 to-transparent translate-x-[-100%] motion-safe:animate-shimmer" v-if="isLoading"></div>
      <div class="flex items-center gap-2 relative z-10">
        <span class="flex h-2 w-2 relative">
          <span class="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="isLoading ? 'bg-amber-400' : 'bg-red-400'"></span>
          <span class="relative inline-flex rounded-full h-2 w-2" :class="isLoading ? 'bg-amber-500' : 'bg-red-500'"></span>
        </span>
        <h3 class="font-bold text-xs text-white tracking-wide">Live Matches</h3>
      </div>
      <div class="flex items-center gap-2 relative z-10">
        <button @click="forceRefresh" class="text-[9px] text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors uppercase tracking-wider flex items-center gap-1 font-bold">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.13-5.88L21 8"/></svg>
          Refresh
        </button>
        <span class="text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase">MD 12</span>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-70">
      <div class="w-8 h-8 rounded-full border-2 border-white/10 border-t-[var(--theme-primary)] motion-safe:animate-spin mb-3 shadow-[0_0_15px_var(--theme-primary)]"></div>
      <p class="text-xs font-bold uppercase tracking-widest text-white/50">Gemini AI Generating<br/>Match Feed...</p>
    </div>



    <div v-else class="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-2">
      <!-- Match 1: LIVE with Slideshow & Boom Animation -->
      <div class="p-3 border-b border-white/5 bg-white/5 cursor-pointer relative overflow-hidden group">
        <div class="flex justify-between items-center text-[10px] mb-2 relative z-10">
          <div class="flex items-center gap-1.5 text-red-400 font-bold">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="text-white/30 font-bold flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-red-500 motion-safe:animate-pulse"></div> {{ matchMinute }}'</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="!dataLoaded" class="text-[9px] text-slate-400 italic">Demo match</span>
            <span class="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] uppercase tracking-wider font-extrabold border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]">Live</span>
          </div>
        </div>
        
        <div class="flex justify-between items-center mb-2.5 relative z-10">
          <div class="text-center w-[35%] flex flex-col items-center gap-1">
            <div class="w-8 h-1 rounded-full opacity-70" :style="{ backgroundColor: 'var(--theme-primary)' }"></div>
            <span class="font-extrabold text-white text-xs block truncate drop-shadow-md" :style="{ color: 'var(--theme-primary)' }">{{ feedData.liveMatch.homeTeam }}</span>
          </div>
          <div class="bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg font-black text-lg flex gap-1.5 tabular-nums text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <span :class="{'scale-125 transition-transform': currentSlide?.isGoal}" :style="{ color: currentSlide?.isGoal ? 'var(--theme-primary)' : 'white' }">{{ feedData.liveMatch.homeScore }}</span>
            <span class="text-white/30">:</span>
            <span :class="{'scale-125 transition-transform': currentSlide?.isGoal}" :style="{ color: currentSlide?.isGoal ? 'var(--theme-secondary)' : 'white' }">{{ feedData.liveMatch.awayScore }}</span>
          </div>
          <div class="text-center w-[35%] flex flex-col items-center gap-1">
            <div class="w-8 h-1 rounded-full opacity-70" :style="{ backgroundColor: 'var(--theme-secondary)' }"></div>
            <span class="font-extrabold text-white/80 text-xs block truncate drop-shadow-md" :style="{ color: 'var(--theme-secondary)' }">{{ feedData.liveMatch.awayTeam }}</span>
          </div>
        </div>

        <!-- Slideshow Container -->
        <div class="relative h-32 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white/10 bg-black">
          <transition name="boom-slide" mode="out-in">
            <div v-if="currentSlide" :key="currentSlide.id" class="absolute inset-0 w-full h-full">
              <!-- Image with slow Ken Burns pan -->
              <img 
                :src="currentSlide.image" 
                alt="Match Action" 
                class="w-full h-full object-cover motion-safe:animate-ken-burns" 
                :class="currentSlide.imageClass"
              />
              <!-- Flash overlay for goals -->
              <div v-if="currentSlide.isGoal" class="absolute inset-0 bg-white opacity-0 motion-safe:animate-goal-flash"></div>
              
              <!-- Gradient & Text -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-3">
                <div v-if="currentSlide.isGoal" class="absolute bottom-10 left-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-[0_0_8px_rgba(220,38,38,0.8)] -rotate-3 motion-safe:animate-bounce">
                  GOAL!
                </div>
                <p class="text-white text-[11px] font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" v-html="DOMPurify.sanitize(currentSlide.text)"></p>
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
            <span class="font-extrabold text-white/70 text-[10px] block truncate uppercase">{{ feedData.completedMatch.homeTeam }}</span>
          </div>
          <div class="bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-black text-base flex gap-1.5 tabular-nums text-white/60">
            <span>{{ feedData.completedMatch.homeScore }}</span><span class="text-white/15">:</span><span>{{ feedData.completedMatch.awayScore }}</span>
          </div>
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/70 text-xs block truncate uppercase">{{ feedData.completedMatch.awayTeam }}</span>
          </div>
        </div>
      </div>

      <!-- Upcoming Match -->
      <div class="p-3 hover:bg-white/3 transition-colors cursor-pointer">
        <div class="flex justify-between items-center text-[10px] mb-2">
          <span class="text-white/30 font-bold">{{ feedData.upcomingMatch.time }}</span>
          <span class="px-1.5 py-0.5 bg-amber-500/10 text-amber-400/80 rounded text-[9px] uppercase tracking-wider font-extrabold border border-amber-500/15">Soon</span>
        </div>
        <div class="flex justify-between items-center">
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/50 text-xs block truncate uppercase">{{ feedData.upcomingMatch.homeTeam }}</span>
          </div>
          <div class="bg-white/5 border border-white/10 px-3 py-1 rounded-lg font-black text-sm flex gap-1.5 text-white/30">
            <span>vs</span>
          </div>
          <div class="text-center w-[35%]">
            <span class="font-extrabold text-white/50 text-xs block truncate uppercase">{{ feedData.upcomingMatch.awayTeam }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { logger } from '../../services/logger';
import DOMPurify from 'dompurify';
import goalImg from '../../assets/soccer_goal_action.webp';
import fansImg from '../../assets/soccer_fans_cheering.webp';
import { getSimulatedMatchFeed } from '../../services/gemini';


interface Slide {
  id: number;
  text: string;
  isGoal: boolean;
  image: string;
  imageClass: string;
}

const isLoading = ref(false);
const dataLoaded = ref(false);
const matchMinute = ref(90);
const slideIndex = ref(0);
const slides = ref<Slide[]>([]);

const feedData = ref({
  liveMatch: { homeTeam: 'Argentina', awayTeam: 'Egypt', homeScore: 3, awayScore: 2, minute: 90, primaryColor: '#43a1d5', secondaryColor: '#c09300', slides: [{ id: 1, text: 'Incredible atmosphere in the stadium!', isGoal: false, image: fansImg, imageClass: 'object-center' }] },
  completedMatch: { homeTeam: 'Brazil', awayTeam: 'France', homeScore: 1, awayScore: 1 },
  upcomingMatch: { homeTeam: 'Spain', awayTeam: 'Germany', time: '18:00' }
});

let minuteInterval: ReturnType<typeof setInterval> | undefined;
let slideInterval: ReturnType<typeof setInterval> | undefined;

const currentSlide = computed(() => slides.value[slideIndex.value]);

const forceRefresh = () => {
  localStorage.removeItem('omnipitch_match_feed_v2');
  isLoading.value = true;
  fetchFeed(true);
};

const fetchFeed = async (forceRefetch = false) => {
  try {
    let data;
    // Cache valid for 10 minutes (600000ms) to aggressively protect 20 RPD quota
    const cached = localStorage.getItem('omnipitch_match_feed_v2');
    if (cached && !forceRefetch) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 600000) {
        data = parsed.data;
      }
    }
    
    if (!data) {
      if (!forceRefetch) return;
      
      data = await getSimulatedMatchFeed();
      localStorage.setItem('omnipitch_match_feed_v2', JSON.stringify({ timestamp: Date.now(), data }));
    }

    feedData.value = data;
    dataLoaded.value = true;
    matchMinute.value = data.liveMatch.minute;
    slides.value = data.liveMatch.slides.map((s: { id: number; text: string; isGoal: boolean }, idx: number) => ({
      ...s,
      image: idx % 2 === 0 ? goalImg : fansImg,
      imageClass: idx % 2 === 0 ? 'object-[center_30%]' : 'object-center'
    }));
  } catch (error) {
    logger.error('Failed to fetch match feed', 2);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchFeed();

  // Cycle slides every 4 seconds
  slideInterval = setInterval(() => {
    if (slides.value.length > 0) {
      slideIndex.value = (slideIndex.value + 1) % slides.value.length;
    }
  }, 4000);

  // Slowly tick up the match minute
  minuteInterval = setInterval(() => {
    if (matchMinute.value < 90 && !isLoading.value) matchMinute.value++;
  }, 60000);
});

onUnmounted(() => {
  clearInterval(slideInterval);
  clearInterval(minuteInterval);
});
</script>

<style scoped>
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.motion-safe:animate-shimmer {
  animation: shimmer 1.5s infinite;
}
/* Snappy EA Sports style transition */
.ea-tile {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ea-tile:hover {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 20px var(--theme-primary, rgba(204,255,0,0.2));
  border-color: var(--theme-primary, rgba(255, 255, 255, 0.2));
}

@keyframes scan-line {
  0% { transform: translateY(-10px) translateX(-50%); }
  50% { transform: translateY(350px) translateX(0%); }
  100% { transform: translateY(-10px) translateX(-50%); }
}
.motion-safe:animate-scan-line {
  animation: scan-line 4s linear infinite;
}

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
.motion-safe:animate-goal-flash {
  animation: goal-flash 1s ease-out forwards;
}

/* Ken Burns slow pan */
@keyframes ken-burns {
  0% { transform: scale(1.0); }
  100% { transform: scale(1.15); }
}
.motion-safe:animate-ken-burns {
  animation: ken-burns 6s linear forwards;
}
</style>
