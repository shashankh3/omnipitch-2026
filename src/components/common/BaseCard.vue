<template>
  <div class="glass-panel rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-shadow duration-300" :class="{ 'p-0': noPadding, 'p-6': !noPadding }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  noPadding?: boolean;
}>();
</script>
