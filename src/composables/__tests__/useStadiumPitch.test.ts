import { describe, it, expect, vi } from 'vitest';
import { useStadiumPitch } from '../useStadiumPitch';
import * as THREE from 'three';

describe('useStadiumPitch', () => {
  it('adds meshes and lights to the scene', () => {
    const scene = new THREE.Scene();
    vi.spyOn(scene, 'add');

    const { initPitch } = useStadiumPitch(scene);
    initPitch();

    // Verify it added elements (ground, grid, pitch, lines, goals, lights)
    expect(scene.add).toHaveBeenCalled();
    // At least we know it adds the ground, grid, and pitch
    expect((scene.add as any).mock.calls.length).toBeGreaterThan(10);
  });
});
