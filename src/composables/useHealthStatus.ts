import { computed, onMounted, onUnmounted } from 'vue';
import { useSystemStore } from '../store/useSystemStore';

export function useHealthStatus() {
  const systemStore = useSystemStore();
  let intervalId: ReturnType<typeof setInterval>;

  onMounted(() => {
    systemStore.checkHealth();
    intervalId = setInterval(() => systemStore.checkHealth(), 30_000);
  });
  
  onUnmounted(() => {
    clearInterval(intervalId);
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
