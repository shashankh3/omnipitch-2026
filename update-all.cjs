const fs = require('fs');

// 1. useTelemetryStore.ts
let tStore = fs.readFileSync('src/store/useTelemetryStore.ts', 'utf8');
tStore = tStore.replace(/}, 10_000\);/, "}, TELEMETRY_INTERVAL_MS);");
tStore = tStore.replace(/import \{ MOCK_TELEMETRY \} from '\.\.\/data\/mockTelemetry';/, "import { MOCK_TELEMETRY } from '../data/mockTelemetry';\nimport { TELEMETRY_INTERVAL_MS } from '../constants';");
fs.writeFileSync('src/store/useTelemetryStore.ts', tStore);

// 2. proactiveAlerts.ts
let pa = fs.readFileSync('src/services/proactiveAlerts.ts', 'utf8');
pa = pa.replace(/import \{ logger \} from '\.\/logger';/, "import { logger } from './logger';\nimport { CROWD_DENSITY_CRITICAL, GATE_THROUGHPUT_EXCELLENT, CROWD_DENSITY_HIGH } from '../constants';");
pa = pa.replace(/\(t\.crowdDensity\['East Stand'\] \?\? 0\) >= 90/, "(t.crowdDensity['East Stand'] ?? 0) >= CROWD_DENSITY_CRITICAL");
pa = pa.replace(/\(t\.gateThroughput\['GateC'\] \?\? 0\) >= 1000/, "(t.gateThroughput['GateC'] ?? 0) >= GATE_THROUGHPUT_EXCELLENT");
pa = pa.replace(/\(t\.crowdDensity\['North Stand'\] \?\? 0\) >= 80/, "(t.crowdDensity['North Stand'] ?? 0) >= CROWD_DENSITY_HIGH");
fs.writeFileSync('src/services/proactiveAlerts.ts', pa);

// 3. FanDashboard.vue
let fd = fs.readFileSync('src/views/FanDashboard.vue', 'utf8');
fd = fd.replace(/gate\.throughput >= 1000/g, "gate.throughput >= GATE_THROUGHPUT_EXCELLENT");
fd = fd.replace(/gate\.throughput >= 700/g, "gate.throughput >= GATE_THROUGHPUT_GOOD");
fd = fd.replace(/import \{ computed, ref, onMounted \} from 'vue';/, "import { computed, ref, onMounted } from 'vue';\nimport { GATE_THROUGHPUT_EXCELLENT, GATE_THROUGHPUT_GOOD } from '../constants';");
fs.writeFileSync('src/views/FanDashboard.vue', fd);

// 4. ConciergeChat.vue
let cc = fs.readFileSync('src/components/fan/ConciergeChat.vue', 'utf8');
cc = cc.replace(/import \{ useHealthStatus \} from '\.\.\/\.\.\/composables\/useHealthStatus';/, "import { useHealthStatus } from '../../composables/useHealthStatus';\nimport { AI_CHAT_HISTORY_MAX } from '../../constants';");
const pushLogic = `messages.value.push({ role: 'ai', text: response });
    if (messages.value.length > AI_CHAT_HISTORY_MAX) {
      messages.value = [messages.value[0], ...messages.value.slice(-(AI_CHAT_HISTORY_MAX - 1))];
    }`;
cc = cc.replace(/messages\.value\.push\(\{ role: 'ai', text: response \}\);/, pushLogic);

const pushUserLogic = `messages.value.push({ role: 'user', text: userText });
  if (messages.value.length > AI_CHAT_HISTORY_MAX) {
    messages.value = [messages.value[0], ...messages.value.slice(-(AI_CHAT_HISTORY_MAX - 1))];
  }`;
cc = cc.replace(/messages\.value\.push\(\{ role: 'user', text: userText \}\);/, pushUserLogic);
fs.writeFileSync('src/components/fan/ConciergeChat.vue', cc);

// 5. telemetrySimulator.ts
let ts = fs.readFileSync('src/services/telemetrySimulator.ts', 'utf8');
ts = ts.replace(/import \{ MOCK_TELEMETRY \} from '\.\/dataLoader';/, "import { MOCK_TELEMETRY } from './dataLoader';\nimport { CROWD_DENSITY_MODERATE, CROWD_DENSITY_HIGH, CROWD_DENSITY_CRITICAL } from '../constants';");
ts = ts.replace(/if \(density < 40\) return 'low';\n  if \(density < 70\) return 'medium';\n  if \(density < 90\) return 'high';/, `if (density < CROWD_DENSITY_MODERATE) return 'low';
  if (density < CROWD_DENSITY_HIGH) return 'medium';
  if (density < CROWD_DENSITY_CRITICAL) return 'high';`);
fs.writeFileSync('src/services/telemetrySimulator.ts', ts);
