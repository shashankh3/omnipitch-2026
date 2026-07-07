<template>
  <button 
    class="inline-flex items-center justify-center px-6 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none" 
    :class="[variantClasses[variant], { 'w-full': block }]"
    @click="$emit('click')"
    :aria-label="ariaLabel"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  block?: boolean;
  ariaLabel?: string;
}>(), {
  variant: 'primary',
  block: false
});

defineEmits(['click']);

const variantClasses = computed(() => {
  return {
    primary: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.3)] border border-amber-300/20',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-sm backdrop-blur-sm',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 shadow-sm',
    warning: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 shadow-sm',
    success: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 shadow-sm'
  };
});
</script>
