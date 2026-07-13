import { computed } from 'vue';
import { useIncidentStore } from '../store/useIncidentStore';

export function useIncidentSummary() {
  const store = useIncidentStore();
  const openCount = computed(() =>
    store.incidents.filter(i => i.status === 'OPEN').length
  );
  const criticalCount = computed(() =>
    store.incidents.filter(i => i.severity === 'CRITICAL').length
  );
  const byType = computed(() =>
    store.incidents.reduce((acc, inc) => {
      acc[inc.type] = (acc[inc.type] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );
  return { openCount, criticalCount, byType, all: computed(() => store.incidents) };
}
