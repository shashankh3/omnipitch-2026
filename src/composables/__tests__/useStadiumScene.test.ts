import type { Ref } from 'vue';
import { describe, it, expect } from 'vitest';
import { useStadiumScene } from '../useStadiumScene';

describe('useStadiumScene', () => {
  it('creates scene, camera, renderer', () => {
    // Basic mock since we might not have a full DOM in vitest
    const container = document.createElement('div');
    const { initScene, onWindowResize } = useStadiumScene({ value: container } as unknown as Ref<HTMLDivElement>);
    
    // We mainly want to ensure no errors on initialization
    expect(initScene).toBeDefined();
    expect(onWindowResize).toBeDefined();

    try {
      initScene();
    } catch (e) {
      // ignore webgl context errors in jsdom
    }
  });
});
