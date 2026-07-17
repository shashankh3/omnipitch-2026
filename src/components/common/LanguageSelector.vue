<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-24 px-3 py-2 text-sm font-bold tracking-wider text-white uppercase transition-all duration-300 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-[#ccff00]/50 hover:shadow-[0_0_15px_rgba(204,255,0,0.15)] focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 ea-button group"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      aria-label="Select Language"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="isOpen ? 'bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.8)]' : 'bg-white/40'"></span>
        <span class="group-hover:text-[#ccff00] transition-colors">{{ currentLangLabel }}</span>
      </div>
      <svg
        class="w-4 h-4 transition-transform duration-300"
        :class="{ 'rotate-180 text-[#ccff00]': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 w-32 mt-2 origin-top-right bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
        role="listbox"
        tabindex="-1"
      >
        <div class="py-1">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="selectLanguage(lang.code)"
            class="flex items-center w-full px-4 py-2.5 text-sm font-bold tracking-widest text-left text-white/70 uppercase transition-colors hover:bg-white/10 hover:text-white"
            :class="{ 'bg-white/5 text-[#ccff00] border-l-2 border-[#ccff00]': currentLang === lang.code }"
            role="option"
            :aria-selected="currentLang === lang.code"
          >
            {{ lang.code }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStadiumStore } from '../../store/useStadiumStore';
import { useI18n } from 'vue-i18n';

const store = useStadiumStore();
const { locale } = useI18n();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' }
];

const currentLang = computed(() => {
  return store.currentSession?.language || 'en';
});

const currentLangLabel = computed(() => {
  const lang = languages.find(l => l.code === currentLang.value);
  return lang ? lang.label : 'EN';
});

const selectLanguage = (code: string) => {
  store.setLanguage(code as 'en' | 'es' | 'fr' | 'de');
  locale.value = code;
  isOpen.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.ea-button {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ea-button:hover {
  transform: scale(1.05);
}
.ea-button:active {
  transform: scale(0.95);
}
</style>
