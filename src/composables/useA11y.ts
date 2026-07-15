import { computed } from 'vue';
import { useSessionStore } from '../store/useSessionStore';

export function useA11y() {
  const session = useSessionStore();
  const profile = computed(() => session.currentSession?.accessibilityProfile);
  const isWheelchair = computed(() => profile.value?.requiresStepFree ?? false);
  const sensoryMode = computed(() => profile.value?.sensoryMode);
  const activeMode = computed(() => {
    if (isWheelchair.value) return 'wheelchair';
    if (sensoryMode.value) return sensoryMode.value;
    return 'standard';
  });
  return { isWheelchair, sensoryMode, activeMode };
}
