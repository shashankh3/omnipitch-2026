import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LiveMatchFeed from '../LiveMatchFeed.vue'

// Mock the Gemini service
vi.mock('../../../services/gemini', () => ({
  getSimulatedMatchFeed: vi.fn().mockResolvedValue({
    liveMatch: { 
      homeTeam: 'USA', 
      awayTeam: 'MEX', 
      homeScore: 2, 
      awayScore: 1, 
      minute: 75, 
      primaryColor: '#ff0000', 
      secondaryColor: '#00ff00', 
      slides: [] 
    },
    completedMatch: { homeTeam: 'ENG', awayTeam: 'FRA', homeScore: 1, awayScore: 0 },
    upcomingMatch: { homeTeam: 'GER', awayTeam: 'ESP', time: '20:00' }
  })
}))

describe('LiveMatchFeed', () => {
  it('renders loading state initially', () => {
    const wrapper = mount(LiveMatchFeed)
    expect(wrapper.text()).toContain('Gemini AI Generating')
  })

  it('renders match data after loading', async () => {
    const wrapper = mount(LiveMatchFeed)
    // Wait for the async fetch to resolve
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('USA')
    expect(wrapper.text()).toContain('MEX')
    expect(wrapper.text()).toContain('ENG')
    expect(wrapper.text()).toContain('FRA')
    expect(wrapper.text()).toContain('GER')
    expect(wrapper.text()).toContain('ESP')
  })
})
