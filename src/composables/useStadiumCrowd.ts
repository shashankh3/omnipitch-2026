import * as THREE from 'three';
import { randomFloat } from '../utils/mathUtils';

export function useStadiumCrowd(scene: THREE.Scene, prefersReducedMotion: boolean) {
  let crowdInstancedMesh: THREE.InstancedMesh;
  const CROWD_SIZE = 1500;
  let activeCrowdSize = CROWD_SIZE;
  const dummy = new THREE.Object3D();

  interface CrowdAgent {
    x: number; z: number;
    vx: number; vz: number;
    anchorX: number; anchorZ: number;
    wanderAngle: number;
    bobPhase: number;
    bobSpeed: number;
    targetStand: string;
  }
  const crowdData: CrowdAgent[] = [];
  const CELL_SIZE = 4;
  const GRID_OFFSET = 64;
  const GRID_STRIDE = 128;
  const crowdGrid = new Map<number, number[]>();
  const activeCells: number[] = [];

  const cellKey = (x: number, z: number) =>
    (Math.floor(x / CELL_SIZE) + GRID_OFFSET) * GRID_STRIDE
    + Math.floor(z / CELL_SIZE) + GRID_OFFSET;

  const cellKeyFromCoordinates = (x: number, z: number) =>
    (x + GRID_OFFSET) * GRID_STRIDE + z + GRID_OFFSET;

  const rebuildCrowdGrid = () => {
    for (let i = 0; i < activeCells.length; i++) {
      crowdGrid.get(activeCells[i])!.length = 0;
    }
    activeCells.length = 0;
    for (let i = 0; i < activeCrowdSize; i++) {
      const key = cellKey(crowdData[i].x, crowdData[i].z);
      let bucket = crowdGrid.get(key);
      if (!bucket) {
        bucket = [];
        crowdGrid.set(key, bucket);
      }
      if (bucket.length === 0) activeCells.push(key);
      bucket.push(i);
    }
  };

  const standBounds: Record<string, { xMin: number; xMax: number; zMin: number; zMax: number }> = {
    'North Stand': { xMin: -57, xMax: 57, zMin: -88, zMax: -48 },
    'South Stand': { xMin: -57, xMax: 57, zMin: 48, zMax: 88 },
    'East Stand': { xMin: 65, xMax: 105, zMin: -40, zMax: 40 },
    'West Stand': { xMin: -105, xMax: -65, zMin: -40, zMax: 40 }
  };

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const initCrowd = () => {
    const avatarGeo = new THREE.CapsuleGeometry(0.35, 1.1, 4, 8);
    const avatarMat = new THREE.MeshStandardMaterial({
      color: 0xe0e0ff,
      emissive: 0x6366f1,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.5
    });
    crowdInstancedMesh = new THREE.InstancedMesh(avatarGeo, avatarMat, CROWD_SIZE);
    crowdInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    crowdInstancedMesh.castShadow = false;
    crowdInstancedMesh.receiveShadow = false;
    scene.add(crowdInstancedMesh);

    const standNames = ['North Stand', 'South Stand', 'East Stand', 'West Stand'];
    for (let i = 0; i < CROWD_SIZE; i++) {
      const targetStand = standNames[Math.floor(randomFloat() * standNames.length)];
      let cx = 0, cz = 0;

      if (targetStand === 'North Stand') { cx = (randomFloat() - 0.5) * 115; cz = -68 + (randomFloat() * 20 - 10); }
      if (targetStand === 'South Stand') { cx = (randomFloat() - 0.5) * 115; cz = 68 + (randomFloat() * 20 - 10); }
      if (targetStand === 'East Stand') { cz = (randomFloat() - 0.5) * 80; cx = 85 + (randomFloat() * 20 - 10); }
      if (targetStand === 'West Stand') { cz = (randomFloat() - 0.5) * 80; cx = -85 + (randomFloat() * 20 - 10); }

      crowdData.push({
        x: cx, z: cz, vx: 0, vz: 0,
        anchorX: cx, anchorZ: cz,
        wanderAngle: randomFloat() * Math.PI * 2,
        bobPhase: randomFloat() * Math.PI * 2,
        bobSpeed: 2 + randomFloat() * 2,
        targetStand
      });
      dummy.position.set(cx, 1.2, cz);
      dummy.updateMatrix();
      crowdInstancedMesh.setMatrixAt(i, dummy.matrix);
    }
    crowdInstancedMesh.instanceMatrix.needsUpdate = true;
    crowdInstancedMesh.computeBoundingSphere();
  };

  const setLowPowerMode = (enabled: boolean) => {
    activeCrowdSize = enabled ? Math.ceil(CROWD_SIZE * 0.6) : CROWD_SIZE;
    if (crowdInstancedMesh) crowdInstancedMesh.count = activeCrowdSize;
  };

  const updateCrowd = (dt: number, time: number) => {
    if (prefersReducedMotion) return; // Skip intensive updates

    rebuildCrowdGrid();
    const SEPARATION_RADIUS = 1.6;
    const SEPARATION_FORCE = 3.5;
    const ANCHOR_FORCE = 0.8;
    const WANDER_FORCE = 1.2;
    const MAX_SPEED = 1.2;

    for (let i = 0; i < activeCrowdSize; i++) {
      const a = crowdData[i];
      let fx = 0, fz = 0;

      const cellX = Math.floor(a.x / CELL_SIZE);
      const cellZ = Math.floor(a.z / CELL_SIZE);
      for (let gridX = cellX - 1; gridX <= cellX + 1; gridX++) {
        for (let gridZ = cellZ - 1; gridZ <= cellZ + 1; gridZ++) {
          const bucket = crowdGrid.get(cellKeyFromCoordinates(gridX, gridZ));
          if (!bucket) continue;

          for (let bucketIndex = 0; bucketIndex < bucket.length; bucketIndex++) {
            const neighborIndex = bucket[bucketIndex];
            if (neighborIndex === i) continue;
            const neighbor = crowdData[neighborIndex];
            const dx = a.x - neighbor.x;
            const dz = a.z - neighbor.z;
            const distSq = dx * dx + dz * dz;
            if (distSq < SEPARATION_RADIUS * SEPARATION_RADIUS && distSq > 0.0001) {
              const inverseDistanceSquared = 1 / distSq;
              fx += dx * SEPARATION_FORCE * inverseDistanceSquared;
              fz += dz * SEPARATION_FORCE * inverseDistanceSquared;
            }
          }
        }
      }

      fx += (a.anchorX - a.x) * ANCHOR_FORCE * 0.05;
      fz += (a.anchorZ - a.z) * ANCHOR_FORCE * 0.05;

      a.wanderAngle += (randomFloat() - 0.5) * 1.5 * dt;
      fx += Math.cos(a.wanderAngle) * WANDER_FORCE * 0.3;
      fz += Math.sin(a.wanderAngle) * WANDER_FORCE * 0.3;

      const DAMPING_FACTOR = Math.exp(-6 * dt);
      a.vx = (a.vx + fx * dt) * DAMPING_FACTOR;
      a.vz = (a.vz + fz * dt) * DAMPING_FACTOR;

      const speed = Math.sqrt(a.vx * a.vx + a.vz * a.vz);
      if (speed > MAX_SPEED) {
        a.vx = (a.vx / speed) * MAX_SPEED;
        a.vz = (a.vz / speed) * MAX_SPEED;
      }

      a.x += a.vx * dt;
      a.z += a.vz * dt;

      const bounds = standBounds[a.targetStand];
      a.x = clamp(a.x, bounds.xMin, bounds.xMax);
      a.z = clamp(a.z, bounds.zMin, bounds.zMax);

      const bob = Math.sin(time * a.bobSpeed + a.bobPhase) * 0.08;
      dummy.position.set(a.x, 1.2 + bob, a.z);
      const facingAngle = Math.atan2(a.vz, a.vx);
      if (speed > 0.05) dummy.rotation.y = -facingAngle;
      dummy.updateMatrix();
      crowdInstancedMesh.setMatrixAt(i, dummy.matrix);
    }
    crowdInstancedMesh.instanceMatrix.needsUpdate = true;
  };

  return { initCrowd, updateCrowd, setLowPowerMode };
}
