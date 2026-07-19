import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStadiumHeatmap } from '../useStadiumHeatmap';
import * as THREE from 'three';

describe('useStadiumHeatmap', () => {
  beforeEach(() => {
    // clear mocks if needed
  });

  it('initializes and updates heatmap', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      shadowColor: '',
      shadowBlur: 0,
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: () => ({ width: 0 }),
      arc: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      clearRect: vi.fn(),
      rect: vi.fn(),
      stroke: vi.fn()
    } as any);

    const scene = new THREE.Scene();
    vi.spyOn(scene, 'add');

    const store = {
      telemetry: {
        crowdDensity: { 'North Stand': 50 },
        gateThroughput: { 'GateA': 500 }
      }
    } as any;

    const { initHeatmap, setStandTargetColors } = useStadiumHeatmap(scene, store);
    initHeatmap();
    
    expect(scene.add).toHaveBeenCalled();

    // just ensure update doesn't throw
    expect(() => setStandTargetColors()).not.toThrow();
  });
});
