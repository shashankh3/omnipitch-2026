import { describe, it, expect } from 'vitest';
import { supabase, isSupabaseConfigured } from '../supabase';

describe('supabase', () => {
  it('exports configuration status', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('provides offline stub when unconfigured', async () => {
    if (!isSupabaseConfigured) {
      const channel = supabase.channel('test');
      expect(channel).toBeDefined();
      
      const onRes = channel.on('broadcast', { event: 'test' }, () => {});
      expect(onRes).toBeDefined();
      
      const subRes = channel.subscribe();
      expect(subRes).toBeDefined();

      const sendRes = await channel.send({ type: 'broadcast', event: 'test', payload: {} });
      expect(sendRes).toBe('ok');

      const unsubRes = await channel.unsubscribe();
      expect(unsubRes).toBe('ok');
    }
  });
});
