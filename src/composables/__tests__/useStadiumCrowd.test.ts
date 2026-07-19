import { describe, it, expect, vi } from 'vitest';
import { useStadiumCrowd } from '../useStadiumCrowd';
import * as THREE from 'three';

describe('useStadiumCrowd', () => {
  it('initializes and updates crowd', () => {
    const scene = new THREE.Scene();
    vi.spyOn(scene, 'add');

    const { initCrowd, updateCrowd } = useStadiumCrowd(scene as any, false);
    initCrowd();
    
    expect(scene.add).toHaveBeenCalled();

    // just ensure update doesn't throw
    expect(() => updateCrowd(0.016, 1)).not.toThrow();
  });
});
