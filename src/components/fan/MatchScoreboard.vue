<template>
  <div class="pointer-events-none absolute left-1/2 top-5 z-30 -translate-x-1/2">
    <div
      class="scoreboard-shell relative flex items-center gap-4 overflow-hidden rounded-2xl px-5 py-3"
      role="status"
      :aria-label="`Live score: ${matchData.home} ${matchData.homeScore}, ${matchData.away} ${matchData.awayScore}, minute ${matchData.minute}`"
    >
      <div class="scoreboard-glow"></div>
      <div class="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent"></div>

      <!-- Home -->
      <div class="relative flex min-w-[82px] items-center justify-end gap-2.5">
        <span class="score-team-name">{{ matchData.home }}</span>
        <span
          class="team-color-mark"
          :style="{ background: matchData.homeColor, boxShadow: `0 0 14px ${matchData.homeColor}` }"
        ></span>
      </div>

      <!-- Score -->
      <div class="relative flex items-center gap-3 rounded-xl border border-white/[0.1] bg-black/25 px-4 py-2">
        <span class="score-number">{{ matchData.homeScore }}</span>
        <span class="score-separator">:</span>
        <span class="score-number">{{ matchData.awayScore }}</span>
      </div>

      <!-- Away -->
      <div class="relative flex min-w-[82px] items-center gap-2.5">
        <span
          class="team-color-mark"
          :style="{ background: matchData.awayColor, boxShadow: `0 0 14px ${matchData.awayColor}` }"
        ></span>
        <span class="score-team-name">{{ matchData.away }}</span>
      </div>

      <div class="relative h-7 w-px bg-white/[0.1]"></div>

      <!-- Clock -->
      <div class="relative flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]"></span>
        </span>
        <span class="font-mono text-xs font-black tracking-wider text-rose-300">
          {{ matchData.minute }}'
        </span>
      </div>

      <div class="relative hidden items-center gap-2 sm:flex">
        <div
          class="weather-chip"
          :class="wbgtTemperature > 32
            ? 'weather-chip-hot'
            : 'weather-chip-normal'"
        >
          <span>{{ wbgtTemperature > 32 ? '🌡' : '☀' }}</span>
          <span>{{ Math.round(wbgtTemperature) }}°C</span>
        </div>

        <div
          class="network-chip"
          :class="isOfflineMode ? 'network-offline' : 'network-online'"
        >
          <span>{{ isOfflineMode ? '◌' : '●' }}</span>
          <span>{{ isOfflineMode ? 'OFFLINE' : 'LIVE' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MatchData {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  homeColor: string;
  awayColor: string;
}

const props = withDefaults(defineProps<{
  matchData: MatchData;
  wbgtTemperature: number;
  isOfflineMode?: boolean;
}>(), {
  isOfflineMode: false
});

// Runtime validation
if (props.wbgtTemperature < -50 || props.wbgtTemperature > 70) {
  console.warn('[MatchScoreboard] Temperature out of expected range:', props.wbgtTemperature);
}
if (props.matchData.minute < 0 || props.matchData.minute > 120) {
  console.warn('[MatchScoreboard] Match minute out of expected range:', props.matchData.minute);
}
</script>

<style scoped>
.scoreboard-shell {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(135deg, rgba(20, 35, 67, 0.96), rgba(4, 9, 24, 0.96));
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.scoreboard-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.1), transparent 43%);
  pointer-events: none;
}

.score-team-name {
  max-width: 62px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.88);
}

.team-color-mark {
  height: 17px;
  width: 5px;
  border-radius: 999px;
}

.score-number {
  font-size: 1.55rem;
  font-weight: 950;
  line-height: 1;
  color: white;
  font-variant-numeric: tabular-nums;
}

.score-separator {
  font-size: 1.35rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.25);
}

.weather-chip,
.network-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 0.5rem;
  padding: 0.35rem 0.48rem;
  font-size: 0.62rem;
  font-weight: 800;
}

.weather-chip-normal {
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(255, 255, 255, 0.055);
  color: rgba(255, 255, 255, 0.72);
}

.weather-chip-hot {
  border: 1px solid rgba(251, 191, 36, 0.24);
  background: rgba(245, 158, 11, 0.12);
  color: #fde68a;
}

.network-online {
  border: 1px solid rgba(52, 211, 153, 0.18);
  background: rgba(16, 185, 129, 0.09);
  color: #86efac;
}

.network-offline {
  border: 1px solid rgba(251, 191, 36, 0.2);
  background: rgba(245, 158, 11, 0.1);
  color: #fde68a;
}

@media (max-width: 640px) {
  .scoreboard-shell {
    gap: 0.65rem;
    padding: 0.65rem 0.8rem;
  }

  .score-team-name {
    max-width: 38px;
    font-size: 0.67rem;
  }

  .score-number {
    font-size: 1.25rem;
  }
}
</style>
