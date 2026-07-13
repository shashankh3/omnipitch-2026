import { computed } from 'vue';
import { useSessionStore } from '../store/useSessionStore';

export function useA11y() {
  const session = useSessionStore();
  const profile = computed(() => session.currentSession?.accessibilityProfile);
  const isWheelchair = computed(() => profile.value?.requiresStepFree ?? false);
  const isHighContrast = computed(() => profile.value?.highContrastMode ?? false);
  const activeMode = computed(() => {
    if (isWheelchair.value) return 'wheelchair';
    if (isHighContrast.value) return 'screen_reader';
    return 'standard';
  });
  return { isWheelchair, isHighContrast, activeMode };
}
