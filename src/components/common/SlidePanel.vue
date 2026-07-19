<template>
  <div>
    <!-- FAB to open side panel (Only shown if showFab is true) -->
    <button
      v-if="showFab"
      @click="$emit('open')"
      class="fixed bottom-[5.5rem] right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.6)] transition-transform duration-300 hover:scale-110 active:scale-95"
      :aria-label="fabLabel || 'Open panel'"
      :title="fabLabel"
    >
      <slot name="fab-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </slot>
    </button>

    <!-- Side Panel Overlay Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
      aria-hidden="true"
    ></div>

    <!-- Side Panel -->
    <div
      class="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#0a0a1a]/98 shadow-[0_0_60px_rgba(0,0,0,0.8)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100] flex flex-col border-l border-white/5"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
      @keydown.escape="$emit('close')"
      role="dialog"
      aria-modal="true"
      :aria-label="panelTitle"
    >
      <header class="px-5 py-4 flex justify-between items-center border-b border-white/5 flex-shrink-0">
        <div class="flex items-center gap-3">
          <slot name="header-icon"></slot>
          <div>
            <h2 class="text-sm font-bold tracking-wide text-white">{{ panelTitle }}</h2>
            <p v-if="panelSubtitle" class="text-[10px] text-cyan-200/50 uppercase tracking-wider font-bold">{{ panelSubtitle }}</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 -mr-2 text-white/40 hover:text-white transition-colors"
          :aria-label="closeLabel || 'Close'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="flex-1 overflow-hidden p-4 flex flex-col min-h-0">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  panelTitle: string;
  panelSubtitle?: string;
  showFab?: boolean;
  fabLabel?: string;
  closeLabel?: string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'open'): void;
}>();

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);
</script>
