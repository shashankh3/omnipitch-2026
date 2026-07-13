import { computed } from 'vue';
import { useSystemStore } from '../store/useSystemStore';
import { useSessionStore } from '../store/useSessionStore';
import type { AlertAudience } from '../services/proactiveAlerts';

export function useProactiveAlerts() {
  const systemStore = useSystemStore();
  const sessionStore = useSessionStore();

  const role = computed(
    () => sessionStore.currentSession?.role ?? 'FAN'
  );

  // Map role to audience filter
  const audienceMap: Record<string, AlertAudience[]> = {
    FAN: ['FAN', 'ALL'],
    VOLUNTEER: ['VOLUNTEER', 'ALL'],
    ORGANIZER: ['ORGANIZER', 'ALL']
  };

  const visibleAlerts = computed(() =>
    systemStore.proactiveAlerts.filter(
      (a) =>
        !a.dismissed &&
        audienceMap[role.value]?.includes(a.audience)
    )
  );

  const criticalCount = computed(
    () => visibleAlerts.value.filter(a => a.severity === 'CRITICAL').length
  );

  function dismiss(id: string) {
    systemStore.dismissAlert(id);
  }

  return { visibleAlerts, criticalCount, dismiss };
}
