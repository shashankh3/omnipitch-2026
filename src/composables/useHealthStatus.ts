import { computed, onMounted } from 'vue';
import { useSystemStore } from '../store/useSystemStore';

export function useHealthStatus() {
  const systemStore = useSystemStore();
  onMounted(() => {
    systemStore.checkHealth();
  });

  return {
    llmMode: computed(() => systemStore.llmMode),
    isOffline: computed(() => systemStore.isOfflineMode),
    lastCheck: computed(() => systemStore.lastHealthCheck),
    badgeLabel: computed(() =>
      systemStore.llmMode === 'live' ? '🟢 AI Live' : '🟡 AI Offline'
    )
  };
}
