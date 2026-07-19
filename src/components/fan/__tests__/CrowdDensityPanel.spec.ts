import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import CrowdDensityPanel from '../CrowdDensityPanel.vue';

// Mock translation function globally or in config
const globalConfig = {
  mocks: {
    $t: (msg: string) => msg
  }
};

describe('CrowdDensityPanel.vue', () => {
  it('renders stats correctly', () => {
    const wrapper = mount(CrowdDensityPanel, {
      global: globalConfig,
      props: {
        densityStats: [
          { label: 'clear', value: 40, color: '#00ff00' },
          { label: 'busy', value: 35, color: '#ffff00' },
          { label: 'packed', value: 25, color: '#ff0000' }
        ],
        clearWavePoints: '0,20 100,30',
        busyWavePoints: '0,40 100,50',
        packedWavePoints: '0,60 100,70'
      }
    });

    const statElements = wrapper.findAll('.density-stat');
    expect(statElements).toHaveLength(3);
    
    // Check first stat
    expect(statElements[0].text()).toContain('clear');
    expect(statElements[0].text()).toContain('40%');

    // Check SVG polylines
    const polylines = wrapper.findAll('polyline');
    expect(polylines).toHaveLength(3);
    expect(polylines[0].attributes('points')).toBe('0,20 100,30');
    expect(polylines[1].attributes('points')).toBe('0,40 100,50');
    expect(polylines[2].attributes('points')).toBe('0,60 100,70');
  });

  it('renders legend items', () => {
    const wrapper = mount(CrowdDensityPanel, {
      global: globalConfig,
      props: {
        densityStats: [
          { label: 'clear', value: 40, color: '#00ff00' }
        ],
        clearWavePoints: '',
        busyWavePoints: '',
        packedWavePoints: ''
      }
    });

    const legendItems = wrapper.findAll('.mt-2.flex.justify-between.border-t span');
    // First span is the container for the legend item, inside is the color circle
    expect(legendItems.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('clear');
  });
});
