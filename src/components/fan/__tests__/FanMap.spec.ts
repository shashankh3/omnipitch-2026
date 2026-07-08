import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import FanMap from '../FanMap.vue';

// Mock Three.js composables so WebGL doesn't crash jsdom
vi.mock('../../../composables/useStadiumScene', () => ({
  useStadiumScene: () => ({
    initScene: vi.fn(() => ({
      scene: {}, camera: {}, renderer: { render: vi.fn() }, controls: { update: vi.fn() }, prefersReducedMotion: false
    })),
    onWindowResize: vi.fn()
  })
}));

vi.mock('../../../composables/useStadiumPitch', () => ({
  useStadiumPitch: () => ({ initPitch: vi.fn() })
}));

vi.mock('../../../composables/useStadiumHeatmap', () => ({
  useStadiumHeatmap: () => ({
    initHeatmap: vi.fn(),
    setStandTargetColors: vi.fn(),
    updateStandColorsSmooth: vi.fn()
  })
}));

vi.mock('../../../composables/useStadiumCrowd', () => ({
  useStadiumCrowd: () => ({ initCrowd: vi.fn(), updateCrowd: vi.fn() })
}));

vi.mock('../../../composables/useStadiumFootball', () => ({
  useStadiumFootball: () => ({ initFootball: vi.fn(), updateFootball: vi.fn() })
}));

describe('FanMap.vue', () => {
  it('renders the loading state initially and then the HUD', () => {
    setActivePinia(createPinia());
    const wrapper = mount(FanMap);
    
    // Check if the Scoreboard HUD exists
    expect(wrapper.text()).toContain('USA');
    expect(wrapper.text()).toContain('MEX');
    
    // Check if the Heatmap Legend exists
    expect(wrapper.text()).toContain('Crowd Density');
  });
});
