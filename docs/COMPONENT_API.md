# Component API Documentation

## Overview

This document provides comprehensive API documentation for all major Vue components in OmniPitch 2026. Each component includes prop types, events, slots, and usage examples.

---

## Core Components

### BaseButton

**Location**: `src/components/BaseButton.vue`

**Description**: Primary button component with loading states, disabled states, and variant styles.

**Props**:
```typescript
{
  label?: string;           // Button text
  variant?: 'primary' | 'secondary' | 'danger';  // Visual style
  loading?: boolean;        // Shows spinner, disables interaction
  disabled?: boolean;       // Disables button
  fullWidth?: boolean;      // Expands to container width
}
```

**Defaults**:
```typescript
{
  label: 'Button',
  variant: 'primary',
  loading: false,
  disabled: false,
  fullWidth: false
}
```

**Events**:
- `@click` - Emitted when button is clicked (not emitted when loading/disabled)

**Usage**:
```vue
<BaseButton 
  label="Submit Incident"
  variant="primary"
  :loading="isSubmitting"
  @click="handleSubmit"
/>
```

---

### SlidePanel

**Location**: `src/components/SlidePanel.vue`

**Description**: Animated slide-in panel with backdrop overlay for modals and side panels.

**Props**:
```typescript
{
  isOpen: boolean;          // Controls panel visibility
  title?: string;           // Panel header text
  position?: 'left' | 'right' | 'bottom';  // Slide direction
  closeOnBackdrop?: boolean;  // Close when clicking outside
}
```

**Defaults**:
```typescript
{
  title: '',
  position: 'right',
  closeOnBackdrop: true
}
```

**Events**:
- `@close` - Emitted when panel should close (user clicks close button or backdrop)

**Slots**:
- `default` - Panel content body

**Usage**:
```vue
<SlidePanel 
  :is-open="showPanel"
  title="Incident Details"
  position="right"
  @close="showPanel = false"
>
  <IncidentForm />
</SlidePanel>
```

---

## Fan Dashboard Components

### FanMap

**Location**: `src/components/fan/FanMap.vue`

**Description**: 3D stadium visualization with live crowd density, match simulation, and interactive controls.

**Props**:
```typescript
{
  active?: boolean;  // Whether component is currently visible (controls animation frame loop)
}
```

**Defaults**:
```typescript
{
  active: true
}
```

**Features**:
- Real-time 3D rendering at 60 FPS using Three.js
- 80,000 instanced seat meshes with color-coded crowd density
- Live football match simulation with 22 AI players
- Eco Mode toggle for reduced rendering performance
- Keyboard-accessible with screen-reader hints

**Accessibility**:
- `role="img"` with descriptive `aria-label`
- Screen-reader live region for match status updates
- `aria-describedby` for keyboard controls hint
- Eco Mode toggle with `aria-pressed` state

**Performance**:
- Uses `InstancedMesh` for single-draw-call rendering
- Automatic cleanup on unmount (disposes geometries, materials, textures)
- Low Power Mode reduces animation frame rate

---

### MatchScoreboard

**Location**: `src/components/fan/MatchScoreboard.vue`

**Description**: Live match score display with temperature warning and offline indicator.

**Props**:
```typescript
{
  matchData: {
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    minute: number;
  };
  wbgtTemperature: number;  // Wet Bulb Globe Temperature in Celsius
  isOfflineMode: boolean;   // Whether app is running offline
}
```

**Prop Validation**:
- `wbgtTemperature` must be between -10 and 60°C (runtime warning if invalid)
- `minute` must be between 0 and 120 (runtime warning if invalid)

**Features**:
- Real-time score updates
- Heat hazard warning (WBGT ≥ 32°C)
- Match minute display with live indicator
- Offline mode badge

**Usage**:
```vue
<MatchScoreboard
  :match-data="currentMatch"
  :wbgt-temperature="store.telemetry.wbgtTemperature ?? 29"
  :is-offline-mode="store.isOfflineMode"
/>
```

---

### CrowdDensityPanel

**Location**: `src/components/fan/CrowdDensityPanel.vue`

**Description**: Live crowd density statistics with sparkline visualizations.

**Props**:
```typescript
{
  densityStats: Array<{
    label: 'clear' | 'busy' | 'packed';
    value: number;    // Percentage (0-100)
    color: string;    // Hex color code
  }>;
  clearWavePoints: string;   // SVG polyline points for "clear" sparkline
  busyWavePoints: string;    // SVG polyline points for "busy" sparkline
  packedWavePoints: string;  // SVG polyline points for "packed" sparkline
}
```

**Features**:
- Animated percentage bars
- Historical sparklines (last 20 data points)
- Color-coded by density level
- Internationalized labels

**Usage**:
```vue
<CrowdDensityPanel
  :density-stats="densityStats"
  :clear-wave-points="clearWavePoints"
  :busy-wave-points="busyWavePoints"
  :packed-wave-points="packedWavePoints"
/>
```

---

## Organizer Dashboard Components

### MainLiveChart

**Location**: `src/components/organizer/MainLiveChart.vue`

**Description**: Real-time area chart for telemetry visualization using ApexCharts.

**Props**:
```typescript
{
  title: string;         // Chart title
  subtitle?: string;     // Chart subtitle
  currentValue: number;  // Latest value to append to series
  color?: string;        // Chart line/fill color (hex)
}
```

**Defaults**:
```typescript
{
  subtitle: '',
  color: '#ff6b00'
}
```

**Features**:
- Rolling window of last 20 data points
- Animated area chart with gradient fill
- Auto-scales Y-axis based on data range
- Dark theme optimized

**Usage**:
```vue
<MainLiveChart
  title="Gate Throughput"
  subtitle="Fans per minute"
  :current-value="store.telemetry.gateThroughput"
  color="#10b981"
/>
```

---

### TelemetryDonut

**Location**: `src/components/organizer/TelemetryDonut.vue`

**Description**: Donut chart for proportional data visualization using ApexCharts.

**Props**:
```typescript
{
  title: string;              // Chart title
  series: number[];           // Data values
  labels: string[];           // Category labels
  colors?: string[];          // Slice colors (hex)
  subtitle?: string;          // Chart subtitle
}
```

**Defaults**:
```typescript
{
  colors: ['#10b981', '#fbbf24', '#ef4444'],
  subtitle: ''
}
```

**Prop Validation**:
- Warns if `series` is empty (runtime warning)
- Warns if `series.length !== labels.length` (runtime warning)

**Features**:
- Responsive sizing
- Percentage labels
- Custom color palettes
- Dark theme optimized

**Usage**:
```vue
<TelemetryDonut
  title="Crowd Distribution"
  :series="[40, 35, 25]"
  :labels="['Clear', 'Busy', 'Packed']"
  :colors="['#5eead4', '#fbbf24', '#fb7185']"
/>
```

---

### MetricChart

**Location**: `src/components/organizer/MetricChart.vue`

**Description**: Horizontal bar chart for comparing metrics.

**Props**:
```typescript
{
  title: string;                    // Chart title
  subtitle?: string;                // Chart subtitle
  data: Record<string, number>;     // Label-value pairs
  maxExpected?: number;             // Max value for percentage calculation
  inverseColors?: boolean;          // Reverse color scale (green=low, red=high)
}
```

**Defaults**:
```typescript
{
  subtitle: '',
  inverseColors: false
}
```

**Prop Validation**:
- Warns if `data` is empty (runtime warning)

**Features**:
- Auto-scaling bars (0-100%)
- Color-coded by value (green → amber → red)
- Inverse color option for metrics where low = good
- Hover animations

**Usage**:
```vue
<MetricChart
  title="Gate Load"
  subtitle="Current capacity"
  :data="{ 'North': 85, 'South': 60, 'East': 72, 'West': 45 }"
  :max-expected="100"
/>
```

---

## Store API Reference

### useStadiumStore

**Location**: `src/store/useStadiumStore.ts`

**Description**: Global state management for stadium telemetry and operational data.

**State**:
```typescript
{
  telemetry: StadiumTelemetry;   // Live sensor data
  isOfflineMode: boolean;         // Network connectivity status
  matchFeed: MatchFeedResponse | null;  // Current match data
  lastSync: number;               // Timestamp of last data sync
}
```

**Actions**:
- `updateTelemetry(data: Partial<StadiumTelemetry>)` - Merge new telemetry data
- `setOfflineMode(offline: boolean)` - Toggle offline mode
- `setMatchFeed(feed: MatchFeedResponse)` - Update match data
- `resetStore()` - Reset to initial state

**Usage**:
```typescript
import { useStadiumStore } from '@/store/useStadiumStore';

const store = useStadiumStore();
console.log(store.telemetry.crowdDensity);
store.updateTelemetry({ gateThroughput: 850 });
```

---

### useIncidentStore

**Location**: `src/store/useIncidentStore.ts`

**Description**: Incident management and real-time incident broadcasting.

**State**:
```typescript
{
  incidents: Incident[];          // All logged incidents
  isRealtime: boolean;            // Whether real-time sync is active
  channel: RealtimeChannel | null;  // Supabase broadcast channel
}
```

**Actions**:
- `logIncident(incident: Incident)` - Log new incident and broadcast
- `updateIncident(id: string, updates: Partial<Incident>)` - Update existing incident
- `deleteIncident(id: string)` - Remove incident
- `initRealtime()` - Connect to Supabase real-time channel
- `disconnectRealtime()` - Disconnect from real-time channel

**Usage**:
```typescript
import { useIncidentStore } from '@/store/useIncidentStore';

const incidentStore = useIncidentStore();
await incidentStore.initRealtime();

incidentStore.logIncident({
  id: 'inc_001',
  type: 'MEDICAL',
  severity: 'HIGH',
  location: 'Section 115',
  description: 'Fan injury',
  timestamp: Date.now()
});
```

---

## Composables

### useStadiumScene

**Location**: `src/composables/useStadiumScene.ts`

**Description**: Three.js scene setup and lifecycle management.

**API**:
```typescript
function useStadiumScene(container: Ref<HTMLElement | null>) {
  return {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: OrbitControls;
    animate: () => void;
    dispose: () => void;
  }
}
```

**Features**:
- Automatic canvas setup and resize handling
- OrbitControls with damping and limits
- Ambient + directional lighting
- Complete cleanup on dispose (prevents memory leaks)

---

### useStadiumHeatmap

**Location**: `src/composables/useStadiumHeatmap.ts`

**Description**: 80,000-seat stadium rendering with live crowd density heatmap.

**API**:
```typescript
function useStadiumHeatmap(scene: Scene) {
  return {
    update: (crowdDensity: Record<string, number>) => void;
    dispose: () => void;
  }
}
```

**Features**:
- Single `InstancedMesh` for all 80,000 seats (1 draw call)
- Color interpolation: gray → emerald → amber → red
- Dynamic texture updates based on crowd density
- Automatic geometry/material disposal

---

### useStadiumFootball

**Location**: `src/composables/useStadiumFootball.ts`

**Description**: Live football match simulation with 22 AI players.

**API**:
```typescript
function useStadiumFootball(scene: Scene) {
  return {
    update: (matchData: MatchData) => void;
    dispose: () => void;
  }
}
```

**Features**:
- 22 player meshes with team colors
- Ball physics and passing simulation
- Flocking behavior for player movement
- Score-driven ball repositioning

---

## Service Layer

### Decision Engine

**Location**: `src/services/decisionEngine.ts`

**Description**: Rules-first deterministic decision engine for fan navigation.

**API**:
```typescript
function resolveContext(fanContext: FanContext): DecisionResult | null
```

**Input**:
```typescript
interface FanContext {
  currentZone: string;
  destinationIntent: string;
  accessibilityNeeds: string[];
  minutesToKickoff: number;
  language: 'en' | 'es' | 'fr' | 'de';
}
```

**Output**:
```typescript
interface DecisionResult {
  resolvedFacility: string;
  resolvedRoute: string[];
  crowdLevel: 'low' | 'medium' | 'high' | 'critical';
  isStepFree: boolean;
  urgencyFlag: boolean;
  alternativeFacility?: string;
  accessibilityMode: 'standard' | 'wheelchair' | 'screen_reader' | 'captioned';
}
```

**Features**:
- Zero AI calls - fully deterministic
- Live telemetry integration
- Accessibility-first routing
- Fallback facility recommendations

**Usage**:
```typescript
import { resolveContext } from '@/services/decisionEngine';

const result = resolveContext({
  currentZone: 'North Stand',
  destinationIntent: 'restroom',
  accessibilityNeeds: ['wheelchair'],
  minutesToKickoff: 25,
  language: 'en'
});

// result.resolvedFacility === 'Accessible Restroom - Section A'
// result.isStepFree === true
```

---

### deepseek AI Service

**Location**: `src/services/deepseek.ts`

**Description**: AI-powered chat, vision triage, and sentiment analysis.

**Key Functions**:

#### `askFanCopilot`
```typescript
async function askFanCopilot(
  userMessage: string,
  context: DecisionResult,
  language: string,
  conversationHistory: Array<{role: string, content: string}>
): Promise<string>
```

Answers fan questions using pre-resolved decision context.

#### `analyzeIncidentPhoto`
```typescript
async function analyzeIncidentPhoto(
  base64Image: string,
  location: string
): Promise<{
  type: IncidentType;
  severity: Severity;
  dispatchOrder: string;
}>
```

Analyzes incident photos and generates dispatch instructions.

#### `calculateFanVibe`
```typescript
async function calculateFanVibe(
  gateThroughput: number,
  temperature: number,
  crowdDensity: Record<string, number>
): Promise<{
  score: number;
  summary: string;
}>
```

Generates fan sentiment score from telemetry data.

---

## Testing

### Component Testing

All components have associated test files in `src/**/__tests__/*.spec.ts`.

**Example**:
```typescript
import { mount } from '@vue/test-utils';
import BaseButton from '@/components/BaseButton.vue';

describe('BaseButton', () => {
  it('emits click when not loading', async () => {
    const wrapper = mount(BaseButton, {
      props: { label: 'Test' }
    });
    
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
  
  it('does not emit click when loading', async () => {
    const wrapper = mount(BaseButton, {
      props: { label: 'Test', loading: true }
    });
    
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
```

### Store Testing

All Pinia stores have test coverage:

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useStadiumStore } from '@/store/useStadiumStore';

describe('useStadiumStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  it('updates telemetry', () => {
    const store = useStadiumStore();
    store.updateTelemetry({ gateThroughput: 900 });
    expect(store.telemetry.gateThroughput).toBe(900);
  });
});
```

---

## Accessibility Guidelines

### WCAG 2.1 Level AA Compliance

All components follow accessibility best practices:

1. **Semantic HTML**: Use `<button>` for buttons, `<nav>` for navigation, `<main>` for content
2. **ARIA Labels**: All interactive elements have descriptive `aria-label` or visible text
3. **Keyboard Navigation**: All interactions work via keyboard (Tab, Enter, Space, Escape)
4. **Color Contrast**: Text meets 4.5:1 contrast ratio minimum
5. **Focus Indicators**: Visible focus rings on all interactive elements
6. **Screen Reader Support**: Live regions for dynamic content, descriptive labels
7. **Motion Sensitivity**: Respects `prefers-reduced-motion` media query

### Testing Accessibility

Run automated accessibility tests:
```bash
npm run test:a11y
```

Manual testing checklist:
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify all interactive elements are focusable
- [ ] Check color contrast with browser DevTools
- [ ] Test with browser zoom at 200%

---

## Performance Optimization

### Bundle Size

Monitor bundle size with each build:
```bash
npm run build
```

Target metrics:
- Critical path: <150 KB gzipped
- Total bundle: <700 KB gzipped
- Each route chunk: <200 KB gzipped

### Rendering Performance

Three.js optimization strategies:
- Use `InstancedMesh` for repeated geometry (1 draw call instead of N)
- Dispose geometries, materials, textures on unmount
- Use `shallowRef` for large data structures that don't need deep reactivity
- Lazy-load heavy components (charts, 3D scenes) per route

### Runtime Performance

Profiling:
```typescript
// Add to dev mode
performance.mark('start');
// ... operation
performance.mark('end');
performance.measure('operation', 'start', 'end');
```

Optimization targets:
- Time to Interactive: <3s
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

---

## Contributing

When adding new components:

1. **Add prop validation with `withDefaults`**
   ```typescript
   const props = withDefaults(defineProps<{
     required: string;
     optional?: number;
   }>(), {
     optional: 0
   });
   ```

2. **Add runtime validation for critical props**
   ```typescript
   if (props.value < 0 || props.value > 100) {
     console.warn('[Component] value must be 0-100');
   }
   ```

3. **Document props, events, and slots** in this file

4. **Write unit tests** in `src/**/__tests__/*.spec.ts`

5. **Add accessibility attributes**
   - `aria-label` for icon buttons
   - `role` for non-semantic elements
   - `aria-live` for dynamic regions

6. **Test keyboard navigation** - all interactions must work via keyboard

---

## Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Three.js Documentation](https://threejs.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ApexCharts Documentation](https://apexcharts.com/)
