import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import MatchScoreboard from '../MatchScoreboard.vue';

describe('MatchScoreboard.vue', () => {
  const defaultProps = {
    matchData: {
      home: 'USA',
      away: 'MEX',
      homeScore: 2,
      awayScore: 1,
      minute: 75,
      homeColor: '#ff0000',
      awayColor: '#00ff00'
    },
    wbgtTemperature: 28,
    isOfflineMode: false
  };

  it('renders scores and team names', () => {
    const wrapper = mount(MatchScoreboard, {
      props: defaultProps
    });

    expect(wrapper.text()).toContain('USA');
    expect(wrapper.text()).toContain('MEX');
    expect(wrapper.text()).toContain('2');
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain("75'");
  });

  it('renders normal weather chip when temp <= 32', () => {
    const wrapper = mount(MatchScoreboard, {
      props: {
        ...defaultProps,
        wbgtTemperature: 28
      }
    });

    const weatherChip = wrapper.find('.weather-chip');
    expect(weatherChip.classes()).toContain('weather-chip-normal');
    expect(weatherChip.text()).toContain('28°C');
  });

  it('renders hot weather chip when temp > 32', () => {
    const wrapper = mount(MatchScoreboard, {
      props: {
        ...defaultProps,
        wbgtTemperature: 35
      }
    });

    const weatherChip = wrapper.find('.weather-chip');
    expect(weatherChip.classes()).toContain('weather-chip-hot');
    expect(weatherChip.text()).toContain('35°C');
  });

  it('renders online network chip when isOfflineMode is false', () => {
    const wrapper = mount(MatchScoreboard, {
      props: {
        ...defaultProps,
        isOfflineMode: false
      }
    });

    const networkChip = wrapper.find('.network-chip');
    expect(networkChip.classes()).toContain('network-online');
    expect(networkChip.text()).toContain('LIVE');
  });

  it('renders offline network chip when isOfflineMode is true', () => {
    const wrapper = mount(MatchScoreboard, {
      props: {
        ...defaultProps,
        isOfflineMode: true
      }
    });

    const networkChip = wrapper.find('.network-chip');
    expect(networkChip.classes()).toContain('network-offline');
    expect(networkChip.text()).toContain('OFFLINE');
  });
});
