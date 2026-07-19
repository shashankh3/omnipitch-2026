import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import TaskInbox from '../TaskInbox.vue';
import { useStadiumStore } from '../../../store/useStadiumStore';
import * as geminiService from '../../../services/gemini';

vi.mock('../../../services/gemini', () => ({
  getTaskChecklist: vi.fn()
}));

describe('TaskInbox.vue', () => {
  it('renders empty state when no active incidents', () => {
    setActivePinia(createPinia());
    const store = useStadiumStore();
    store.incidents = [];
    
    const wrapper = mount(TaskInbox);
    expect(wrapper.text()).toContain('No active incidents');
  });

  it('renders incidents and sorts by severity', () => {
    setActivePinia(createPinia());
    const store = useStadiumStore();
    store.incidents = [
      { id: '1', type: 'MEDICAL', severity: 'LOW', status: 'OPEN', location: { section: 'A', gate: '1', coordinates: [0, 0] }, description: 'Minor scrape', reportedBy: 'System', timestamp: '' },
      { id: '2', type: 'CROWD_BOTTLENECK', severity: 'CRITICAL', status: 'OPEN', location: { section: 'B', gate: '2', coordinates: [0, 0] }, description: 'Fight', reportedBy: 'System', timestamp: '' },
      { id: '3', type: 'FACILITY_DAMAGE', severity: 'HIGH', status: 'OPEN', location: { section: 'C', gate: '3', coordinates: [0, 0] }, description: 'Spill', reportedBy: 'System', timestamp: '' },
      { id: '4', type: 'WEATHER_HAZARD', severity: 'MEDIUM', status: 'OPEN', location: { section: 'D', gate: '4', coordinates: [0, 0] }, description: 'Dense', reportedBy: 'System', timestamp: '' },
      { id: '5', type: 'MEDICAL', severity: 'LOW', status: 'OPEN', location: { section: 'E', gate: '5', coordinates: [0, 0] }, description: 'What', reportedBy: 'System', timestamp: '' }
    ];

    const wrapper = mount(TaskInbox);
    const incidentItems = wrapper.findAll('li');
    expect(incidentItems.length).toBe(5);
    
    // First should be CRITICAL
    expect(incidentItems[0].text()).toContain('CROWD BOTTLENECK');
  });

  it('handles acknowledge and fetches checklist successfully', async () => {
    setActivePinia(createPinia());
    const store = useStadiumStore();
    store.incidents = [
      { id: '1', type: 'MEDICAL', severity: 'HIGH', status: 'OPEN', location: { section: 'A', gate: '1', coordinates: [0, 0] }, description: 'Help', reportedBy: 'System', timestamp: '' }
    ];

    const mockChecklist = vi.mocked(geminiService.getTaskChecklist);
    mockChecklist.mockResolvedValueOnce(['Step 1', 'Step 2']);

    const wrapper = mount(TaskInbox);
    await wrapper.find('button').trigger('click'); // Acknowledge button
    
    expect(store.incidents[0].status).toBe('IN_PROGRESS');
    
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toContain('Step 1');
    expect(wrapper.text()).toContain('Step 2');
  });

  it('handles acknowledge and catches API error', async () => {
    setActivePinia(createPinia());
    const store = useStadiumStore();
    store.incidents = [
      { id: '1', type: 'MEDICAL', severity: 'HIGH', status: 'OPEN', location: { section: 'A', gate: '1', coordinates: [0, 0] }, description: 'Help', reportedBy: 'System', timestamp: '' }
    ];

    const mockChecklist = vi.mocked(geminiService.getTaskChecklist);
    mockChecklist.mockRejectedValueOnce(new Error('API failed'));

    const wrapper = mount(TaskInbox);
    await wrapper.find('button').trigger('click'); // Acknowledge button
    
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    expect(wrapper.text()).toContain('Proceed with standard operating protocol.');
  });

  it('handles resolve', async () => {
    setActivePinia(createPinia());
    const store = useStadiumStore();
    store.incidents = [
      { id: '1', type: 'MEDICAL', severity: 'HIGH', status: 'IN_PROGRESS', location: { section: 'A', gate: '1', coordinates: [0, 0] }, description: 'Help', reportedBy: 'System', timestamp: '' }
    ];

    const wrapper = mount(TaskInbox);
    await wrapper.find('button').trigger('click'); // Resolve button
    
    expect(store.incidents[0].status).toBe('RESOLVED');
  });
});
