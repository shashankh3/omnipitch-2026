import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TelemetryGrid from '../TelemetryGrid.vue';
import { useStadiumStore } from '../../../store/useStadiumStore';

describe('TelemetryGrid.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders role="alert" when WBGT is > 32', async () => {
    const store = useStadiumStore();
    store.telemetry.wbgtTemperature = 33;

    const wrapper = mount(TelemetryGrid);
    await wrapper.vm.$nextTick();

    const heatDiv = wrapper.findAll('div.bg-panel-bg').find(w => w.text().includes('WBGT Safety'));
    expect(heatDiv?.attributes('role')).toBe('alert');
  });

  it('does not render role="alert" when WBGT is <= 32', async () => {
    const store = useStadiumStore();
    store.telemetry.wbgtTemperature = 30;

    const wrapper = mount(TelemetryGrid);
    await wrapper.vm.$nextTick();

    const heatDiv = wrapper.findAll('div.bg-panel-bg').find(w => w.text().includes('WBGT Safety'));
    expect(heatDiv?.attributes('role')).toBeUndefined();
  });
});
