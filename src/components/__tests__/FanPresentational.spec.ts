import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import SlidePanel from '../common/SlidePanel.vue';
import BaseButton from '../common/BaseButton.vue';
import CrowdDensityPanel from '../fan/CrowdDensityPanel.vue';
import MatchScoreboard from '../fan/MatchScoreboard.vue';

const t = { mocks: { $t: (key: string) => key } };

describe('SlidePanel', () => {
  const baseProps = { isOpen: false, panelTitle: 'Concierge' };

  it('renders the FAB only when showFab is true and emits open on click', async () => {
    const wrapper = mount(SlidePanel, { props: { ...baseProps, showFab: true, fabLabel: 'Open chat' } });
    const fab = wrapper.find('button[aria-label="Open chat"]');
    expect(fab.exists()).toBe(true);
    await fab.trigger('click');
    expect(wrapper.emitted('open')).toHaveLength(1);

    // showFab defaults to true, so need to explicitly pass false
    const noFab = mount(SlidePanel, { props: { ...baseProps, showFab: false } });
    expect(noFab.find('button[aria-label="Open panel"]').exists()).toBe(false);
  });

  it('falls back to default FAB aria-label when fabLabel is not provided', () => {
    const wrapper = mount(SlidePanel, { props: { ...baseProps, showFab: true } });
    expect(wrapper.find('button[aria-label="Open panel"]').exists()).toBe(true);
  });

  it('shows backdrop when open and emits close on backdrop click', async () => {
    const wrapper = mount(SlidePanel, { props: { ...baseProps, isOpen: true } });
    const backdrop = wrapper.find('[aria-hidden="true"]');
    expect(backdrop.exists()).toBe(true);
    await backdrop.trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('hides backdrop and translates panel off-screen when closed', () => {
    const wrapper = mount(SlidePanel, { props: baseProps });
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(false);
    expect(wrapper.find('[role="dialog"]').classes()).toContain('translate-x-full');
  });

  it('renders title and optional subtitle', () => {
    const withSub = mount(SlidePanel, {
      props: { ...baseProps, isOpen: true, panelSubtitle: 'AI Assistant' }
    });
    expect(withSub.find('h2').text()).toBe('Concierge');
    expect(withSub.text()).toContain('AI Assistant');

    const withoutSub = mount(SlidePanel, { props: { ...baseProps, isOpen: true } });
    expect(withoutSub.find('p').exists()).toBe(false);
  });

  it('emits close from the header close button and escape key', async () => {
    const wrapper = mount(SlidePanel, {
      props: { ...baseProps, isOpen: true, closeLabel: 'Dismiss' }
    });
    await wrapper.find('button[aria-label="Dismiss"]').trigger('click');
    await wrapper.find('[role="dialog"]').trigger('keydown.escape');
    expect(wrapper.emitted('close')).toHaveLength(2);
  });

  it('locks body scroll while open and restores it on close', async () => {
    const wrapper = mount(SlidePanel, { props: baseProps });
    await wrapper.setProps({ isOpen: true });
    expect(document.body.style.overflow).toBe('hidden');
    await wrapper.setProps({ isOpen: false });
    expect(document.body.style.overflow).toBe('');
  });
});

describe('BaseButton', () => {
  it('emits click and applies each variant class set', async () => {
    const variants = ['primary', 'secondary', 'danger', 'warning', 'success'] as const;
    for (const variant of variants) {
      const wrapper = mount(BaseButton, { props: { variant } });
      expect(wrapper.attributes('class')).toBeTruthy();
      await wrapper.trigger('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
    }
  });

  it('applies w-full when block and forwards aria-label and type', () => {
    const wrapper = mount(BaseButton, {
      props: { block: true, ariaLabel: 'Submit form', type: 'submit' }
    });
    expect(wrapper.classes()).toContain('w-full');
    expect(wrapper.attributes('aria-label')).toBe('Submit form');
    expect(wrapper.attributes('type')).toBe('submit');
  });
});

describe('CrowdDensityPanel', () => {
  const props = {
    densityStats: [
      { label: 'clear', value: 55, color: '#5eead4' },
      { label: 'busy', value: 30, color: '#fbbf24' },
      { label: 'packed', value: 15, color: '#fb7185' }
    ],
    clearWavePoints: '0,10 100,20 200,10',
    busyWavePoints: '0,20 100,30 200,20',
    packedWavePoints: '0,30 100,40 200,30'
  };

  it('renders a stat cell and legend entry per density level', () => {
    const wrapper = mount(CrowdDensityPanel, { props, global: t });
    expect(wrapper.findAll('.density-stat')).toHaveLength(3);
    expect(wrapper.text()).toContain('55%');
    expect(wrapper.text()).toContain('30%');
    expect(wrapper.text()).toContain('15%');
  });

  it('binds wave point strings to the three polylines', () => {
    const wrapper = mount(CrowdDensityPanel, { props, global: t });
    const polylines = wrapper.findAll('polyline');
    expect(polylines).toHaveLength(3);
    expect(polylines[0].attributes('points')).toBe(props.clearWavePoints);
    expect(polylines[1].attributes('points')).toBe(props.busyWavePoints);
    expect(polylines[2].attributes('points')).toBe(props.packedWavePoints);
  });
});

describe('MatchScoreboard', () => {
  const matchData = {
    home: 'CAN',
    away: 'MEX',
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    homeColor: '#ff0000',
    awayColor: '#00ff00'
  };

  it('renders teams, score, minute and an accessible live-score label', () => {
    const wrapper = mount(MatchScoreboard, {
      props: { matchData, wbgtTemperature: 24, isOfflineMode: false }
    });
    expect(wrapper.text()).toContain('CAN');
    expect(wrapper.text()).toContain('MEX');
    expect(wrapper.text()).toContain("67'");
    expect(wrapper.find('[role="status"]').attributes('aria-label'))
      .toBe('Live score: CAN 2, MEX 1, minute 67');
  });

  it('shows normal weather chip and LIVE network state under mild conditions', () => {
    const wrapper = mount(MatchScoreboard, {
      props: { matchData, wbgtTemperature: 24.4, isOfflineMode: false }
    });
    expect(wrapper.find('.weather-chip-normal').exists()).toBe(true);
    expect(wrapper.text()).toContain('24°C');
    expect(wrapper.find('.network-online').exists()).toBe(true);
    expect(wrapper.text()).toContain('LIVE');
  });

  it('shows hot weather chip and OFFLINE state when WBGT > 32 and offline', () => {
    const wrapper = mount(MatchScoreboard, {
      props: { matchData, wbgtTemperature: 33.7, isOfflineMode: true }
    });
    expect(wrapper.find('.weather-chip-hot').exists()).toBe(true);
    expect(wrapper.text()).toContain('34°C');
    expect(wrapper.find('.network-offline').exists()).toBe(true);
    expect(wrapper.text()).toContain('OFFLINE');
  });
});
