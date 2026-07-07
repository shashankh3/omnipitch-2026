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
    primary: 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 border border-transparent',
    secondary: 'bg-white/80 hover:bg-white text-zinc-800 border border-zinc-200/50 shadow-sm backdrop-blur-sm',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 shadow-sm',
    warning: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 shadow-sm',
    success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 shadow-sm'
  };
});
</script>
