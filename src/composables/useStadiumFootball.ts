import * as THREE from 'three';
import { randomFloat } from '../utils/mathUtils';

export function useStadiumFootball(scene: THREE.Scene, prefersReducedMotion: boolean) {
  const PLAYERS_PER_TEAM = 11;
  let redTeamMesh: THREE.InstancedMesh;
  let blueTeamMesh: THREE.InstancedMesh;
  let ballMesh: THREE.Mesh;
  let ballTrail: THREE.Line;
  const BALL_TRAIL_LENGTH = 20;
  const ballTrailPositions = new Float32Array(BALL_TRAIL_LENGTH * 3);
  let ballTrailPointCount = 0;
  const dummy = new THREE.Object3D();

  type TeamColor = 'red' | 'blue';

  interface Player {
    id: number;
    team: TeamColor;
    x: number; z: number;
    vx: number; vz: number;
    heading: number;
    lean: number;
    homeX: number; homeZ: number;
    speed: number;
    state: 'chase' | 'return' | 'dribble' | 'support';
    bobPhase: number;
    cooldown: number;
  }
  
  const allPlayers: Player[] = [];
  const redTeamData: Player[] = [];
  const blueTeamData: Player[] = [];

  interface Ball {
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    spin: number;
    owner: Player | null;
  }
  const ballData: Ball = { x: 0, y: 0.5, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, owner: null };

  const GRAVITY = -22;
  const RESTITUTION = 0.55;
  const BALL_RADIUS = 0.5;

  const PITCH_WIDTH = 100; // -50 to 50
  const PITCH_HEIGHT = 64; // -32 to 32

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

    // 4-4-2 Formation offsets
    const formationOffsets = [
      { x: -40, z: 0 }, // Goalkeeper
      { x: -30, z: -15 }, { x: -30, z: -5 }, { x: -30, z: 5 }, { x: -30, z: 15 }, // Defense
      { x: -15, z: -20 }, { x: -15, z: -7 }, { x: -15, z: 7 }, { x: -15, z: 20 }, // Midfield
      { x: -2, z: -8 }, { x: -2, z: 8 } // Forwards
    ];

    let idCounter = 0;

    for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
      const off = formationOffsets[i];
      const redP: Player = { id: idCounter++, team: 'red', x: off.x, z: off.z, vx: 0, vz: 0, heading: 0, lean: 0, homeX: off.x, homeZ: off.z, speed: 7 + randomFloat() * 1.5, state: 'support', bobPhase: randomFloat() * Math.PI * 2, cooldown: 0 };
      const blueP: Player = { id: idCounter++, team: 'blue', x: -off.x, z: -off.z, vx: 0, vz: 0, heading: Math.PI, lean: 0, homeX: -off.x, homeZ: -off.z, speed: 7 + randomFloat() * 1.5, state: 'support', bobPhase: randomFloat() * Math.PI * 2, cooldown: 0 };
      
      redTeamData.push(redP);
      blueTeamData.push(blueP);
      allPlayers.push(redP, blueP);

      updatePlayerMesh(redTeamMesh, i, redP, 0);
      updatePlayerMesh(blueTeamMesh, i, blueP, 0);
    }

    // Ball
    ballMesh = new THREE.Mesh(
      new THREE.SphereGeometry(BALL_RADIUS, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfacc15, emissiveIntensity: 0.4, roughness: 0.2 })
    );
    ballMesh.castShadow = true;
    ballMesh.position.set(ballData.x, ballData.y, ballData.z);
    scene.add(ballMesh);

    // Ball trail
    const trailGeo = new THREE.BufferGeometry();
    const trailAttribute = new THREE.BufferAttribute(ballTrailPositions, 3);
    trailAttribute.setUsage(THREE.DynamicDrawUsage);
    trailGeo.setAttribute('position', trailAttribute);
    trailGeo.setDrawRange(0, 0);
    ballTrail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.35 }));
    ballTrail.frustumCulled = false;
    scene.add(ballTrail);
  };

  const updatePlayerMesh = (mesh: THREE.InstancedMesh, index: number, p: Player, time: number) => {
    const speed = Math.sqrt(p.vx * p.vx + p.vz * p.vz);
    const speedNorm = clamp(speed / p.speed, 0, 1);

    const bobSin = Math.sin(time * 15 + p.bobPhase);
    const runBob = Math.abs(bobSin) * 0.3 * speedNorm;
    
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(p.x, 1.5 + runBob, p.z);
    
    // Rotate to heading
    dummy.rotation.y = -p.heading + Math.PI / 2; // Offset for 3D orientation

    // Forward lean based on acceleration
    const forwardLean = speedNorm * 0.4;
    dummy.rotateX(forwardLean);
    
    // Sideways lean (centripetal tilt during turns)
    dummy.rotateZ(p.lean * 0.6);

    // Run wobble
    const runWobble = Math.cos(time * 7.5 + p.bobPhase) * 0.1 * speedNorm;
    dummy.rotateY(runWobble);

    // Squash & stretch on impact
    const stretch = 1 + (Math.abs(bobSin) - 0.5) * 0.25 * speedNorm;
    const squash = 1 / Math.sqrt(stretch);
    dummy.scale.set(squash, stretch, squash);

    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  };

  const wrapAngle = (a: number) => {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  };

  const updatePlayers = (dt: number, time: number) => {
    if (prefersReducedMotion) return;

    // Determine possession and nearest players
    let nearestRed: Player | null = null;
    let nearestBlue: Player | null = null;
    let minRedDist = Infinity;
    let minBlueDist = Infinity;

    for (const p of redTeamData) {
      const dist = Math.hypot(ballData.x - p.x, ballData.z - p.z);
      if (dist < minRedDist) { minRedDist = dist; nearestRed = p; }
    }
    for (const p of blueTeamData) {
      const dist = Math.hypot(ballData.x - p.x, ballData.z - p.z);
      if (dist < minBlueDist) { minBlueDist = dist; nearestBlue = p; }
    }

    // Possession logic
    if (ballData.y < 2.0) { // Ball is low enough to control
      if (minRedDist < 1.5 && minRedDist <= minBlueDist && (!ballData.owner || ballData.owner.team === 'red')) {
        ballData.owner = nearestRed;
      } else if (minBlueDist < 1.5 && minBlueDist < minRedDist && (!ballData.owner || ballData.owner.team === 'blue')) {
        ballData.owner = nearestBlue;
      }
    }

    const possessingTeam = ballData.owner ? ballData.owner.team : null;

    for (let i = 0; i < allPlayers.length; i++) {
      const p = allPlayers[i];
      if (p.cooldown > 0) p.cooldown -= dt;

      let targetX = p.homeX;
      let targetZ = p.homeZ;
      let isChaser = false;

      if (p === ballData.owner) {
        // Dribbling
        const attackDir = p.team === 'red' ? 1 : -1;
        targetX = p.x + attackDir * 10; // Run towards goal
        targetZ = clamp(p.z + (ballData.z - p.z) * 0.5, -20, 20); // Centralize slightly
        
        // Pass or shoot logic
        if (p.cooldown <= 0) {
          const distToGoal = Math.abs((p.team === 'red' ? 50 : -50) - p.x);
          if (distToGoal < 20) {
            // Shoot
            const shootY = 2 + randomFloat() * 4;
            const shootV = 18 + randomFloat() * 6;
            ballData.vx = attackDir * shootV;
            ballData.vy = shootY;
            ballData.vz = (randomFloat() - 0.5) * 8;
            ballData.owner = null;
            p.cooldown = 1.0;
          } else if (Math.random() < 0.02) {
            // Pass
            const teammates = p.team === 'red' ? redTeamData : blueTeamData;
            const forwardTeammates = teammates.filter(t => t !== p && (p.team === 'red' ? t.x > p.x : t.x < p.x));
            if (forwardTeammates.length > 0) {
              const target = forwardTeammates[Math.floor(Math.random() * forwardTeammates.length)];
              const dx = target.x - p.x;
              const dz = target.z - p.z;
              const dist = Math.hypot(dx, dz);
              ballData.vx = (dx / dist) * 15;
              ballData.vz = (dz / dist) * 15;
              ballData.vy = 2;
              ballData.owner = null;
              p.cooldown = 1.0;
            }
          }
        }
      } else {
        // Not possessing
        if ((p.team === 'red' && p === nearestRed) || (p.team === 'blue' && p === nearestBlue)) {
          isChaser = true;
          // Predict ball position slightly
          targetX = ballData.x + ballData.vx * 0.2;
          targetZ = ballData.z + ballData.vz * 0.2;
        } else {
          // Tactical formation push/pull
          const pushFactor = possessingTeam === p.team ? 15 : (possessingTeam ? -10 : 0);
          const attackDir = p.team === 'red' ? 1 : -1;
          targetX = p.homeX + attackDir * pushFactor + (ballData.x * 0.1);
          targetZ = p.homeZ + (ballData.z * 0.15);
        }
      }

      // Steering Kinematics
      let dx = targetX - p.x;
      let dz = targetZ - p.z;
      
      // Separation (Boids avoidance)
      let sepX = 0, sepZ = 0;
      for (const other of allPlayers) {
        if (other !== p) {
          const odx = p.x - other.x;
          const odz = p.z - other.z;
          const odistSq = odx * odx + odz * odz;
          if (odistSq < 4.0 && odistSq > 0.01) {
            const odist = Math.sqrt(odistSq);
            sepX += (odx / odist) * (2.0 - odist);
            sepZ += (odz / odist) * (2.0 - odist);
          }
        }
      }
      
      // Apply separation strongly if we aren't the chaser
      if (!isChaser && p !== ballData.owner) {
        dx += sepX * 5;
        dz += sepZ * 5;
      }

      const currentSpeed = Math.hypot(p.vx, p.vz);
      
      if (Math.hypot(dx, dz) > 0.5) {
        const desiredHeading = Math.atan2(dz, dx);
        let angleDiff = wrapAngle(desiredHeading - p.heading);
        
        // Turn rate limits
        const maxTurn = 5.0 * dt; // rad per sec
        const turnStep = clamp(angleDiff, -maxTurn, maxTurn);
        p.heading = wrapAngle(p.heading + turnStep);

        // Lean into turns
        const targetLean = (turnStep / maxTurn) * (currentSpeed / p.speed);
        p.lean = lerp(p.lean, targetLean, 10 * dt);

        // Accelerate
        const accel = p.speed * 2.0; 
        p.vx += Math.cos(p.heading) * accel * dt;
        p.vz += Math.sin(p.heading) * accel * dt;
        
        // Cap speed
        const newSpeed = Math.hypot(p.vx, p.vz);
        if (newSpeed > p.speed) {
          p.vx = (p.vx / newSpeed) * p.speed;
          p.vz = (p.vz / newSpeed) * p.speed;
        }
      } else {
        // Decelerate
        p.vx *= Math.exp(-8 * dt);
        p.vz *= Math.exp(-8 * dt);
        p.lean = lerp(p.lean, 0, 10 * dt);
      }

      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.x = clamp(p.x, -PITCH_WIDTH/2, PITCH_WIDTH/2);
      p.z = clamp(p.z, -PITCH_HEIGHT/2, PITCH_HEIGHT/2);
    }

    for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
      updatePlayerMesh(redTeamMesh, i, redTeamData[i], time);
      updatePlayerMesh(blueTeamMesh, i, blueTeamData[i], time);
    }
    redTeamMesh.instanceMatrix.needsUpdate = true;
    blueTeamMesh.instanceMatrix.needsUpdate = true;
  };

  const updateBall = (dt: number) => {
    if (prefersReducedMotion) return;

    if (ballData.owner) {
      // Dribbling: tether ball to owner's feet
      const owner = ballData.owner;
      const ownerSpeed = Math.hypot(owner.vx, owner.vz);
      
      // Place ball slightly ahead of player
      const aheadDist = 0.8 + ownerSpeed * 0.1;
      const targetBx = owner.x + Math.cos(owner.heading) * aheadDist;
      const targetBz = owner.z + Math.sin(owner.heading) * aheadDist;

      ballData.x = lerp(ballData.x, targetBx, 15 * dt);
      ballData.z = lerp(ballData.z, targetBz, 15 * dt);
      ballData.y = BALL_RADIUS;
      
      ballData.vx = owner.vx;
      ballData.vz = owner.vz;
      ballData.vy = 0;
      
      // Random loss of possession
      if (Math.random() < 0.005) ballData.owner = null;
    } else {
      // Free physics
      ballData.vy += GRAVITY * dt;
      ballData.x += ballData.vx * dt;
      ballData.y += ballData.vy * dt;
      ballData.z += ballData.vz * dt;

      if (ballData.y <= BALL_RADIUS) {
        ballData.y = BALL_RADIUS;
        ballData.vy = Math.abs(ballData.vy) * RESTITUTION;
        if (ballData.vy < 0.5) ballData.vy = 0;
        const ballDamp = Math.exp(-1.8 * dt);
        ballData.vx *= ballDamp;
        ballData.vz *= ballDamp;
      }

      // Bounds bouncing
      if (ballData.x > 51 || ballData.x < -51) { ballData.vx *= -0.7; ballData.x = clamp(ballData.x, -51, 51); }
      if (ballData.z > 33 || ballData.z < -33) { ballData.vz *= -0.7; ballData.z = clamp(ballData.z, -33, 33); }
    }

    ballMesh.position.set(ballData.x, ballData.y, ballData.z);
    
    // Spin based on velocity
    const rollSpeed = Math.hypot(ballData.vx, ballData.vz) / BALL_RADIUS;
    if (rollSpeed > 0.1) {
      const rollAxis = new THREE.Vector3(-ballData.vz, 0, ballData.vx).normalize();
      ballMesh.rotateOnWorldAxis(rollAxis, rollSpeed * dt);
    }

    if (ballTrailPointCount < BALL_TRAIL_LENGTH) {
      ballTrailPointCount++;
    } else {
      ballTrailPositions.copyWithin(0, 3);
    }

    const trailOffset = (ballTrailPointCount - 1) * 3;
    ballTrailPositions[trailOffset] = ballData.x;
    ballTrailPositions[trailOffset + 1] = ballData.y;
    ballTrailPositions[trailOffset + 2] = ballData.z;

    const posAttr = ballTrail.geometry.getAttribute('position') as THREE.BufferAttribute;
    ballTrail.geometry.setDrawRange(0, ballTrailPointCount);
    posAttr.needsUpdate = true;
  };

  const updateFootball = (dt: number, time: number) => {
    if (!ballMesh || !redTeamMesh || !blueTeamMesh || !ballTrail) return;

    updatePlayers(dt, time);
    updateBall(dt);
  };

  return { initFootball, updateFootball };
}
