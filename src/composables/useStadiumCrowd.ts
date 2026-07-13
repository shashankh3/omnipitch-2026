import * as THREE from 'three';
import { randomFloat } from '../utils/mathUtils';

export function useStadiumCrowd(scene: THREE.Scene, prefersReducedMotion: boolean) {
  let crowdInstancedMesh: THREE.InstancedMesh;
  const CROWD_SIZE = 1500;
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
  const crowdGrid = new Map<string, number[]>();

  const cellKey = (x: number, z: number) => `${Math.floor(x / CELL_SIZE)}_${Math.floor(z / CELL_SIZE)}`;

  const rebuildCrowdGrid = () => {
    crowdGrid.clear();
    for (let i = 0; i < CROWD_SIZE; i++) {
      const key = cellKey(crowdData[i].x, crowdData[i].z);
      if (!crowdGrid.has(key)) crowdGrid.set(key, []);
      crowdGrid.get(key)!.push(i);
    }
  };

  const getNeighbors = (i: number): number[] => {
    const a = crowdData[i];
    const cx = Math.floor(a.x / CELL_SIZE);
    const cz = Math.floor(a.z / CELL_SIZE);
    const result: number[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const key = `${cx + dx}_${cz + dz}`;
        const bucket = crowdGrid.get(key);
        if (bucket) result.push(...bucket);
      }
    }
    return result;
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
  };

  const updateCrowd = (dt: number, time: number) => {
    if (prefersReducedMotion) return; // Skip intensive updates

    rebuildCrowdGrid();
    const SEPARATION_RADIUS = 1.6;
    const SEPARATION_FORCE = 3.5;
    const ANCHOR_FORCE = 0.8;
    const WANDER_FORCE = 1.2;
    const MAX_SPEED = 1.2;
    const DAMPING = 0.9;

    for (let i = 0; i < CROWD_SIZE; i++) {
      const a = crowdData[i];
      let fx = 0, fz = 0;

      const neighbors = getNeighbors(i);
      for (const j of neighbors) {
        if (j === i) continue;
        const b = crowdData[j];
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < SEPARATION_RADIUS * SEPARATION_RADIUS && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          fx += (dx / dist) * SEPARATION_FORCE / dist;
          fz += (dz / dist) * SEPARATION_FORCE / dist;
        }
      }

      fx += (a.anchorX - a.x) * ANCHOR_FORCE * 0.05;
      fz += (a.anchorZ - a.z) * ANCHOR_FORCE * 0.05;

      a.wanderAngle += (randomFloat() - 0.5) * 1.5 * dt;
      fx += Math.cos(a.wanderAngle) * WANDER_FORCE * 0.3;
      fz += Math.sin(a.wanderAngle) * WANDER_FORCE * 0.3;

      a.vx = (a.vx + fx * dt) * DAMPING;
      a.vz = (a.vz + fz * dt) * DAMPING;

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

  return { initCrowd, updateCrowd };
}
