import * as THREE from 'three';
import { randomFloat } from '../utils/mathUtils';

export function useStadiumFootball(scene: THREE.Scene, prefersReducedMotion: boolean) {
  const PLAYERS_PER_TEAM = 11;
  let redTeamMesh: THREE.InstancedMesh;
  let blueTeamMesh: THREE.InstancedMesh;
  let ballMesh: THREE.Mesh;
  const ballTrailPoints: THREE.Vector3[] = [];
  let ballTrail: THREE.Line;
  const dummy = new THREE.Object3D();

  interface Player {
    x: number; z: number;
    vx: number; vz: number;
    homeX: number; homeZ: number;
    speed: number;
    role: 'chase' | 'support';
    bobPhase: number;
  }
  const redTeamData: Player[] = [];
  const blueTeamData: Player[] = [];

  interface Ball {
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    spin: number;
  }
  const ballData: Ball = { x: 0, y: 0.5, z: 0, vx: 3, vy: 0, vz: 2, spin: 0 };

  const GRAVITY = -22;
  const RESTITUTION = 0.55;
  const BALL_RADIUS = 0.5;

  const easeOutQuad = (t: number) => t * (2 - t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const initFootball = () => {
    const playerGeo = new THREE.CapsuleGeometry(0.4, 1.4, 4, 8);

    redTeamMesh = new THREE.InstancedMesh(playerGeo, new THREE.MeshStandardMaterial({
      color: 0xff6b6b, emissive: 0xef4444, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.4
    }), PLAYERS_PER_TEAM);
    redTeamMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(redTeamMesh);

    blueTeamMesh = new THREE.InstancedMesh(playerGeo, new THREE.MeshStandardMaterial({
      color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.4
    }), PLAYERS_PER_TEAM);
    blueTeamMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(blueTeamMesh);

    const formationOffsets = [
      { x: -20, z: 0 },
      { x: -12, z: -20 }, { x: -12, z: -7 }, { x: -12, z: 7 }, { x: -12, z: 20 },
      { x: 0, z: -20 }, { x: 0, z: -7 }, { x: 0, z: 7 }, { x: 0, z: 20 },
      { x: 15, z: -10 }, { x: 15, z: 10 }
    ];

    for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
      const off = formationOffsets[i];
      redTeamData.push({ x: off.x - 10, z: off.z, vx: 0, vz: 0, homeX: off.x - 10, homeZ: off.z, speed: 6 + randomFloat() * 2, role: 'support', bobPhase: randomFloat() * Math.PI * 2 });
      blueTeamData.push({ x: -off.x + 10, z: -off.z, vx: 0, vz: 0, homeX: -off.x + 10, homeZ: -off.z, speed: 6 + randomFloat() * 2, role: 'support', bobPhase: randomFloat() * Math.PI * 2 });
    }

    // Ball
    ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(BALL_RADIUS, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfacc15, emissiveIntensity: 0.4, roughness: 0.2 })
    );
    ballMesh.castShadow = true;
    scene.add(ballMesh);

    // Ball trail
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(20 * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    ballTrail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.35 }));
    scene.add(ballTrail);
  };

  const updateBall = (dt: number) => {
    if (prefersReducedMotion) return;

    ballData.vy += GRAVITY * dt;
    ballData.x += ballData.vx * dt;
    ballData.y += ballData.vy * dt;
    ballData.z += ballData.vz * dt;

    if (ballData.y <= BALL_RADIUS) {
      ballData.y = BALL_RADIUS;
      ballData.vy = Math.abs(ballData.vy) * RESTITUTION;
      if (ballData.vy < 0.5) ballData.vy = 0;
      ballData.vx *= 0.97;
      ballData.vz *= 0.97;
    }

    if (ballData.x > 51 || ballData.x < -51) { ballData.vx *= -0.8; ballData.x = clamp(ballData.x, -51, 51); }
    if (ballData.z > 33 || ballData.z < -33) { ballData.vz *= -0.8; ballData.z = clamp(ballData.z, -33, 33); }

    ballMesh.position.set(ballData.x, ballData.y, ballData.z);
    ballMesh.rotation.x += ballData.vz * dt * 0.5;
    ballMesh.rotation.z -= ballData.vx * dt * 0.5;

    ballTrailPoints.push(new THREE.Vector3(ballData.x, ballData.y, ballData.z));
    if (ballTrailPoints.length > 20) ballTrailPoints.shift();
    const posAttr = ballTrail.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < ballTrailPoints.length; i++) {
      posAttr.setXYZ(i, ballTrailPoints[i].x, ballTrailPoints[i].y, ballTrailPoints[i].z);
    }
    ballTrail.geometry.setDrawRange(0, ballTrailPoints.length);
    posAttr.needsUpdate = true;
  };

  const updateTeam = (mesh: THREE.InstancedMesh, teamData: Player[], time: number, dt: number) => {
    if (prefersReducedMotion) return;

    let closest1 = -1, minDist1 = Infinity;
    let closest2 = -1, minDist2 = Infinity;
    for (let i = 0; i < teamData.length; i++) {
      const dx = ballData.x - teamData[i].x;
      const dz = ballData.z - teamData[i].z;
      const distSq = dx * dx + dz * dz;
      if (distSq < minDist1) {
        minDist2 = minDist1; closest2 = closest1;
        minDist1 = distSq; closest1 = i;
      } else if (distSq < minDist2) {
        minDist2 = distSq; closest2 = i;
      }
    }
    const chasers = new Set([closest1, closest2]);

    for (let i = 0; i < teamData.length; i++) {
      const p = teamData[i];
      let targetX: number, targetZ: number;

      if (chasers.has(i)) {
        targetX = ballData.x;
        targetZ = ballData.z;
      } else {
        targetX = p.homeX + (ballData.x) * 0.15;
        targetZ = p.homeZ + (ballData.z - p.homeZ) * 0.1;
      }

      const dx = targetX - p.x;
      const dz = targetZ - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.1) {
        const accel = easeOutQuad(clamp(dist / 10, 0, 1)) * p.speed;
        p.vx = lerp(p.vx, (dx / dist) * accel, 0.08);
        p.vz = lerp(p.vz, (dz / dist) * accel, 0.08);
      } else {
        p.vx *= 0.8;
        p.vz *= 0.8;
      }

      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.x = clamp(p.x, -50, 50);
      p.z = clamp(p.z, -32, 32);

      if (chasers.has(i)) {
        const dx = ballData.x - p.x;
        const dz = ballData.z - p.z;
        const ballDistSq = dx * dx + dz * dz;
        if (ballDistSq < 1.8 * 1.8 && ballData.y < 1.5) {
          const kdx = ballData.x - p.x;
          const kdz = ballData.z - p.z;
          const kd = Math.sqrt(kdx * kdx + kdz * kdz) || 1;
          const power = 8 + randomFloat() * 6;
          ballData.vx = (kdx / kd) * power;
          ballData.vz = (kdz / kd) * power;
          ballData.vy = 3 + randomFloat() * 4;
        }
      }

      const speed = Math.sqrt(p.vx * p.vx + p.vz * p.vz);
      const runBob = Math.abs(Math.sin(time * 10 + p.bobPhase)) * 0.25 * clamp(speed / 4, 0, 1);
      dummy.position.set(p.x, 1.5 + runBob, p.z);
      if (speed > 0.1) dummy.lookAt(p.x + p.vx, 1.5, p.z + p.vz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  const updateFootball = (dt: number, time: number) => {
    if (!ballMesh || !redTeamMesh || !blueTeamMesh || !ballTrail) return;

    updateBall(dt);
    updateTeam(redTeamMesh, redTeamData, time, dt);
    updateTeam(blueTeamMesh, blueTeamData, time, dt);
  };

  return { initFootball, updateFootball };
}
