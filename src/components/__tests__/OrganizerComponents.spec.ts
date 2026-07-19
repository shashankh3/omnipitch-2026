import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import MainLiveChart from '../organizer/MainLiveChart.vue';
import MetricChart from '../organizer/MetricChart.vue';
import OperationsDashboard from '../organizer/OperationsDashboard.vue';
import TelemetryDonut from '../organizer/TelemetryDonut.vue';

// Mock chart.js to prevent canvas errors during test
vi.mock('chart.js', () => ({
  Chart: class {
    constructor() {}
    destroy() {}
    update() {}
  },
  registerables: []
}));

vi.mock('vue-chartjs', () => ({
  Line: { render: () => {} },
  Doughnut: { render: () => {} }
}));

vi.mock('vue3-apexcharts', () => ({
  default: { render: () => {} }
}));

// ResizeObserver mock
vi.stubGlobal('ResizeObserver', class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
});

describe('Organizer Components', () => {
  it('mounts MainLiveChart', () => {
    const wrapper = mount(MainLiveChart, {
      props: { title: 'Test', currentValue: 10 },
      global: {
        plugins: [createPinia()],
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('mounts MetricChart', () => {
    const wrapper = mount(MetricChart, {
      props: { title: 'Test Metric', type: 'line', data: [] as any, labels: [] },
      global: {
        plugins: [createPinia()],
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('mounts OperationsDashboard', () => {
    const wrapper = mount(OperationsDashboard, {
      global: {
        plugins: [createPinia()],
        stubs: {
          MetricChart: true,
          MainLiveChart: true,
          TelemetryDonut: true
        }
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('mounts TelemetryDonut', () => {
    const wrapper = mount(TelemetryDonut, {
      props: { title: 'Test', centerLabel: 'Test', data: {} },
      global: {
        plugins: [createPinia()],
      }
    });
    expect(wrapper.exists()).toBe(true);
  });
});
