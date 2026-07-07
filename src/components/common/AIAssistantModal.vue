<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close" @keydown.esc="close">
      <div 
        class="modal-content" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        ref="modalRef"
        tabindex="-1"
      >
        <header class="modal-header">
          <h2 id="modal-title" class="text-xl">{{ title }}</h2>
          <button class="close-btn" @click="close" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  title: string;
}>();

const emit = defineEmits(['close']);
const modalRef = ref<HTMLElement | null>(null);

const close = () => {
  emit('close');
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isOpen || !modalRef.value) return;
  
  if (e.key === 'Tab') {
    const focusableElements = modalRef.value.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-text-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-xl {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-main);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  background-color: rgba(0,0,0,0.05);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
