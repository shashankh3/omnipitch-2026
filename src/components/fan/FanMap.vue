<template>
  <div class="h-full w-full bg-[#050510] overflow-hidden relative flex flex-col">

    <!-- Scoreboard HUD - Top Center -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div class="bg-[#0a0a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-3 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div class="flex items-center gap-3">
          <div class="w-6 h-4 rounded-sm bg-gradient-to-b from-red-500 to-red-700 shadow-sm"></div>
          <span class="text-white font-black text-sm tracking-wide">USA</span>
        </div>
        <div class="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">
          <span class="text-white font-black text-2xl tabular-nums">2</span>
          <span class="text-white/30 font-light text-xl">:</span>
          <span class="text-white font-black text-2xl tabular-nums">1</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-white font-black text-sm tracking-wide">MEX</span>
          <div class="w-6 h-4 rounded-sm bg-gradient-to-b from-emerald-600 to-emerald-800 shadow-sm"></div>
        </div>
        <div class="ml-2 flex items-center gap-1.5 border-l border-white/10 pl-4">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span class="text-red-400 font-mono text-xs font-bold tracking-wider">72'</span>
        </div>
      </div>
    </div>

    <!-- Heatmap Legend - Bottom Left -->
    <div class="absolute bottom-6 left-6 z-20 pointer-events-none">
      <div class="bg-[#0a0a1a]/80 backdrop-blur-xl border border-white/8 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-lg">
        <span class="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">Crowd Density</span>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]"></div>
            <span class="text-white/50 text-[10px] font-medium">Clear</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]"></div>
            <span class="text-white/50 text-[10px] font-medium">Busy</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] animate-pulse"></div>
            <span class="text-white/50 text-[10px] font-medium">Packed</span>
          </div>
        </div>
      </div>
    </div>



    <!-- 3D Canvas Container -->
    <div ref="canvasContainer" class="flex-1 relative cursor-grab active:cursor-grabbing touch-none">
      <!-- Cinematic vignette -->
      <div class="absolute inset-0 pointer-events-none z-10"
        style="background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%);"></div>

      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-20 bg-[#050510]">
        <div class="flex flex-col items-center gap-5">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 rounded-full border-2 border-white/5"></div>
            <div class="absolute inset-0 rounded-full border-2 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div class="absolute inset-2 rounded-full border-2 border-t-transparent border-r-transparent border-b-cyan-400 border-l-transparent animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="text-white/80 font-semibold text-sm tracking-wide">OmniPitch Stadium</span>
            <span class="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading 3D Environment</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useStadiumStore } from '../../store/useStadiumStore';

const canvasContainer = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const store = useStadiumStore();

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let animationFrameId: number;
const clock = new THREE.Clock();

// Gate status helper for template
const getGateClass = (gate: string) => {
  const tp = store.telemetry.gateThroughput[`Gate${gate}`] || 0;
  if (tp > 800) return 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)] animate-pulse';
  if (tp > 500) return 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]';
  return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]';
};

// ---------- Easing helpers ----------
const easeOutQuad = (t: number) => t * (2 - t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// ---------- Heatmap ----------
const standMaterials: Record<string, THREE.MeshStandardMaterial> = {};
const standColorState: Record<string, { current: THREE.Color; target: THREE.Color; currentEmissive: number; targetEmissive: number }> = {};
const stands: Record<string, THREE.Mesh> = {};

const gateMaterials: Record<string, THREE.MeshStandardMaterial> = {};
const gateColorState: Record<string, { current: THREE.Color; target: THREE.Color; currentEmissive: number; targetEmissive: number }> = {};
const gates: Record<string, THREE.Mesh> = {};
const gateHUDMaterials: Record<string, THREE.MeshBasicMaterial> = {};

const createGateHUDTexture = (gateId: string, throughput: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  // Holographic glass background
  ctx.fillStyle = 'rgba(5, 5, 20, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate wait time
  let waitMins = Math.max(1, Math.floor((throughput / 1000) * 45)); 
  if (throughput === 0) waitMins = 0;
  
  let statusColor = '#34d399'; // Emerald
  let statusText = 'FAST';
  if (waitMins > 25) { statusColor = '#ef4444'; statusText = 'HEAVY'; }
  else if (waitMins > 10) { statusColor = '#fbbf24'; statusText = 'BUSY'; }
  
  // Top border accent
  ctx.fillStyle = statusColor;
  ctx.fillRect(0, 0, canvas.width, 4);
  
  // Gate ID
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText(`GATE ${gateId.replace('Gate', '')}`, 30, 60);
  
  // Wait Time Large
  ctx.fillStyle = statusColor;
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${waitMins}m`, canvas.width - 30, 65);
  
  // Subtitles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(statusText, 30, 95);
  
  ctx.textAlign = 'right';
  ctx.fillText('EST. WAIT', canvas.width - 30, 95);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
};

const standHUDMaterials: Record<string, THREE.MeshBasicMaterial> = {};

const createStandHUDTexture = (name: string, density: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Holographic glass background
  ctx.fillStyle = 'rgba(5, 5, 20, 0.4)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Top/Bottom accent borders
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, canvas.width, 2);
  ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(name.toUpperCase(), 40, 80);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`LIVE CAPACITY: ${density}%`, 40, 120);

  // GitHub style contribution heatmap boxes
  const boxSize = 14;
  const gap = 4;
  const cols = 52;
  const rows = 5;
  const startX = 40;
  const startY = 145;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // Simulate historical heatmap data fading into the current exact density
      const timeFactor = c / cols; 
      let val = (density / 100) * timeFactor * (0.5 + Math.random() * 0.5);
      if (c >= cols - 2) val = density / 100;
      
      val = Math.max(0, Math.min(1, val));
      
      if (val < 0.2) ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // empty
      else if (val < 0.5) ctx.fillStyle = '#fbbf24'; // amber
      else if (val < 0.8) ctx.fillStyle = '#f97316'; // orange
      else ctx.fillStyle = '#ef4444'; // red
      
      // Slight rounding on boxes
      ctx.beginPath();
      ctx.roundRect(startX + c * (boxSize + gap), startY + r * (boxSize + gap), boxSize, boxSize, 2);
      ctx.fill();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
};

// ---------- Crowd ----------
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

// ---------- Football ----------
const PLAYERS_PER_TEAM = 11;
let redTeamMesh: THREE.InstancedMesh;
let blueTeamMesh: THREE.InstancedMesh;
let ballMesh: THREE.Mesh;
let ballTrailPoints: THREE.Vector3[] = [];
let ballTrail: THREE.Line;

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

// Heatmap palette
const colors = {
  clear: new THREE.Color(0x34d399),
  moderate: new THREE.Color(0xfbbf24),
  packed: new THREE.Color(0xef4444)
};

const getHeatmapColor = (density: number): THREE.Color => {
  if (density > 80) return colors.packed;
  if (density > 50) return colors.moderate;
  return colors.clear;
};

const setStandTargetColors = () => {
  const densities = store.telemetry.crowdDensity;
  Object.keys(standMaterials).forEach(section => {
    const density = densities[section] || 0;
    const targetColor = getHeatmapColor(density);
    const state = standColorState[section];
    state.target.copy(targetColor);
    state.targetEmissive = density > 80 ? 0.5 : 0.15;
    
    // Update Holographic HUDs
    if (standHUDMaterials[section]) {
      const oldMap = standHUDMaterials[section].map;
      standHUDMaterials[section].map = createStandHUDTexture(section, density);
      standHUDMaterials[section].needsUpdate = true;
      if (oldMap) oldMap.dispose();
    }
  });

  const gatesThroughput = store.telemetry.gateThroughput;
  Object.keys(gateMaterials).forEach(gateId => {
    const tp = gatesThroughput[gateId] || 0;
    const normalizedDensity = (tp / 1000) * 100;
    const targetColor = getHeatmapColor(normalizedDensity);
    const state = gateColorState[gateId];
    state.target.copy(targetColor);
    state.targetEmissive = normalizedDensity > 60 ? 0.8 : 0.4;

    // Update Gate HUDs
    if (gateHUDMaterials[gateId]) {
      const oldMap = gateHUDMaterials[gateId].map;
      gateHUDMaterials[gateId].map = createGateHUDTexture(gateId, tp);
      gateHUDMaterials[gateId].needsUpdate = true;
      if (oldMap) oldMap.dispose();
    }
  });
};

const updateStandColorsSmooth = (dt: number) => {
  const speed = 1.5;
  Object.keys(standMaterials).forEach(section => {
    const mat = standMaterials[section];
    const state = standColorState[section];
    const t = clamp(dt * speed, 0, 1);
    state.current.lerp(state.target, t);
    state.currentEmissive = lerp(state.currentEmissive, state.targetEmissive, t);
    mat.color.copy(state.current);
    mat.emissive.copy(state.current).multiplyScalar(state.currentEmissive);
  });

  Object.keys(gateMaterials).forEach(gateId => {
    const mat = gateMaterials[gateId];
    const state = gateColorState[gateId];
    const t = clamp(dt * speed, 0, 1);
    state.current.lerp(state.target, t);
    state.currentEmissive = lerp(state.currentEmissive, state.targetEmissive, t);
    mat.color.copy(state.current);
    mat.emissive.copy(state.current).multiplyScalar(state.currentEmissive);
  });
};

// ========== LINE DRAWING HELPERS ==========
const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });

const drawLine = (points: THREE.Vector3[]) => {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geo, lineMat);
  line.position.y = 0.62;
  scene.add(line);
};

const drawArc = (cx: number, cz: number, r: number, startAngle: number, endAngle: number, segments = 32) => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / segments);
    pts.push(new THREE.Vector3(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r));
  }
  drawLine(pts);
};

const drawRect = (x1: number, z1: number, x2: number, z2: number) => {
  drawLine([
    new THREE.Vector3(x1, 0, z1),
    new THREE.Vector3(x2, 0, z1),
    new THREE.Vector3(x2, 0, z2),
    new THREE.Vector3(x1, 0, z2),
    new THREE.Vector3(x1, 0, z1),
  ]);
};

const init3D = () => {
  if (!canvasContainer.value) return;

  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);
  scene.fog = new THREE.FogExp2(0x050510, 0.0018);

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1200);
  camera.position.set(-80, 120, 180);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  canvasContainer.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 30;
  controls.maxDistance = 500;
  controls.target.set(0, 0, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  // ========== LIGHTING ==========
  // Warm ambient base
  scene.add(new THREE.AmbientLight(0xfff5e6, 0.15));

  // Hemisphere sky/ground tint
  scene.add(new THREE.HemisphereLight(0x1a1a3e, 0x0a0a0a, 0.3));

  // Key sunlight (warm)
  const sunLight = new THREE.DirectionalLight(0xffeedd, 1.0);
  sunLight.position.set(80, 250, 80);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.left = -150;
  sunLight.shadow.camera.right = 150;
  sunLight.shadow.camera.top = 150;
  sunLight.shadow.camera.bottom = -150;
  sunLight.shadow.bias = -0.0001;
  scene.add(sunLight);

  // ========== GROUND ==========
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.95, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Subtle grid
  const grid = new THREE.GridHelper(800, 200, 0x151530, 0x0d0d20);
  grid.position.y = 0.05;
  scene.add(grid);

  // ========== PITCH ==========
  const pitchW = 105, pitchH = 68;
  const pitch = new THREE.Mesh(
    new THREE.PlaneGeometry(pitchW, pitchH),
    new THREE.MeshStandardMaterial({ color: 0x1a6b3c, roughness: 0.85 })
  );
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.y = 0.5;
  pitch.receiveShadow = true;
  scene.add(pitch);

  // Grass stripes
  const stripeCount = 10;
  for (let i = 0; i < stripeCount; i++) {
    if (i % 2 === 0) continue;
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(pitchW / stripeCount, pitchH),
      new THREE.MeshStandardMaterial({ color: 0x1f7a45, roughness: 0.9, transparent: true, opacity: 0.4 })
    );
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(-pitchW / 2 + (i + 0.5) * (pitchW / stripeCount), 0.55, 0);
    scene.add(stripe);
  }

  // ========== FULL FIFA PITCH MARKINGS ==========
  const hw = pitchW / 2, hh = pitchH / 2;

  // Outer boundary
  drawRect(-hw, -hh, hw, hh);

  // Half line
  drawLine([new THREE.Vector3(0, 0, -hh), new THREE.Vector3(0, 0, hh)]);

  // Center circle
  drawArc(0, 0, 9.15, 0, Math.PI * 2, 48);

  // Center spot
  const centerSpot = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
  centerSpot.rotation.x = -Math.PI / 2;
  centerSpot.position.y = 0.62;
  scene.add(centerSpot);

  // Penalty areas (16.5m from goal line, 40.3m wide)
  drawRect(-hw, -20.16, -hw + 16.5, 20.16);
  drawRect(hw - 16.5, -20.16, hw, 20.16);

  // Goal areas (5.5m from goal line, 18.3m wide)
  drawRect(-hw, -9.15, -hw + 5.5, 9.15);
  drawRect(hw - 5.5, -9.15, hw, 9.15);

  // Penalty spots
  const penSpot1 = centerSpot.clone();
  penSpot1.position.set(-hw + 11, 0.62, 0);
  scene.add(penSpot1);
  const penSpot2 = centerSpot.clone();
  penSpot2.position.set(hw - 11, 0.62, 0);
  scene.add(penSpot2);

  // Penalty arcs (outside penalty area)
  drawArc(-hw + 11, 0, 9.15, -0.93, 0.93, 24);
  drawArc(hw - 11, 0, 9.15, Math.PI - 0.93, Math.PI + 0.93, 24);

  // Corner arcs
  drawArc(-hw, -hh, 1, 0, Math.PI / 2, 8);
  drawArc(hw, -hh, 1, Math.PI / 2, Math.PI, 8);
  drawArc(hw, hh, 1, Math.PI, 3 * Math.PI / 2, 8);
  drawArc(-hw, hh, 1, 3 * Math.PI / 2, 2 * Math.PI, 8);

  // ========== GOAL POSTS ==========
  const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.15, metalness: 0.8, roughness: 0.2 });
  const postRadius = 0.12;
  const goalWidth = 7.32;
  const goalHeight = 2.44;
  const goalDepth = 2;

  const createGoal = (xPos: number) => {
    // Left post
    const lp = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 8), goalMat);
    lp.position.set(xPos, goalHeight / 2 + 0.5, -goalWidth / 2);
    scene.add(lp);
    // Right post
    const rp = lp.clone();
    rp.position.set(xPos, goalHeight / 2 + 0.5, goalWidth / 2);
    scene.add(rp);
    // Crossbar
    const cb = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 8), goalMat);
    cb.rotation.x = Math.PI / 2;
    cb.position.set(xPos, goalHeight + 0.5, 0);
    scene.add(cb);
    // Net (translucent plane)
    const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide, wireframe: true });
    // Back net
    const backNet = new THREE.Mesh(new THREE.PlaneGeometry(goalWidth, goalHeight, 8, 4), netMat);
    const sign = xPos > 0 ? 1 : -1;
    backNet.position.set(xPos + sign * goalDepth, goalHeight / 2 + 0.5, 0);
    scene.add(backNet);
  };
  createGoal(-hw);
  createGoal(hw);

  // ========== FLOODLIGHT TOWERS ==========
  const createFloodlight = (x: number, z: number) => {
    // Pole
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.4, metalness: 0.8 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 55, 8), poleMat);
    pole.position.set(x, 27.5, z);
    pole.castShadow = true;
    scene.add(pole);

    // Light array (box on top)
    const lightHead = new THREE.Mesh(
      new THREE.BoxGeometry(6, 2, 4),
      new THREE.MeshStandardMaterial({ color: 0x333344, emissive: 0xffeedd, emissiveIntensity: 0.4, roughness: 0.1 })
    );
    lightHead.position.set(x, 56, z);
    scene.add(lightHead);

    // Actual light cone
    const floodSpot = new THREE.SpotLight(0xfff8e7, 2.5, 300, Math.PI / 4, 0.6, 1.5);
    floodSpot.position.set(x, 56, z);
    floodSpot.target.position.set(0, 0, 0);
    scene.add(floodSpot);
    scene.add(floodSpot.target);
  };

  createFloodlight(-75, -55);
  createFloodlight(75, -55);
  createFloodlight(-75, 55);
  createFloodlight(75, 55);

  // ========== STANDS ==========
  const CHAIRS_PER_STAND = 300;
  const chairGeo = new THREE.BoxGeometry(0.7, 0.6, 0.7);

  const createStand = (name: string, width: number, depth: number, x: number, z: number, rotY: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, 22);
    shape.lineTo(width * 0.95, 24);
    shape.lineTo(0, 6);
    shape.lineTo(0, 0);

    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.4, bevelThickness: 0.3 });
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    geo.translate(-(bb.max.x - bb.min.x) / 2, 0, -(bb.max.z - bb.min.z) / 2);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.35,
      metalness: 0.65,
      transparent: true,
      opacity: 0.95
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    standMaterials[name] = mat;
    standColorState[name] = {
      current: colors.clear.clone(),
      target: colors.clear.clone(),
      currentEmissive: 0.15,
      targetEmissive: 0.15
    };
    stands[name] = mesh;

    // Chairs share stand material for heatmap inheritance
    const standChairMesh = new THREE.InstancedMesh(chairGeo, mat, CHAIRS_PER_STAND);
    scene.add(standChairMesh);

    let chairCounter = 0;
    for (let r = 1; r < 15; r++) {
      for (let c = 0; c < 20; c++) {
        const localX = (r / 15) * width - (width / 2);
        const localY = (r / 15) * 22 + 0.5;
        const localZ = (c / 20) * depth - (depth / 2);

        dummy.position.set(localX, localY, localZ);
        dummy.rotation.set(0, 0, 0);

        const transformMatrix = new THREE.Matrix4().makeRotationY(rotY);
        transformMatrix.setPosition(x, 0, z);
        dummy.applyMatrix4(transformMatrix);

        dummy.updateMatrix();
        standChairMesh.setMatrixAt(chairCounter++, dummy.matrix);
      }
    }
    standChairMesh.instanceMatrix.needsUpdate = true;

    // Roof canopy (thin curved overhang for FIFA-grade look)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(width * 0.6, 22);
    roofShape.lineTo(width, 24);
    roofShape.lineTo(width, 24.8);
    roofShape.lineTo(width * 0.3, 22.8);
    roofShape.lineTo(width * 0.6, 22);

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: depth * 0.95, bevelEnabled: false });
    roofGeo.computeBoundingBox();
    const rbb = roofGeo.boundingBox!;
    roofGeo.translate(-(rbb.max.x - rbb.min.x) / 2, 0, -(rbb.max.z - rbb.min.z) / 2);

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.1,
      metalness: 0.95,
      transparent: true,
      opacity: 0.7
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(x, 0, z);
    roof.rotation.y = rotY;
    scene.add(roof);

    // Holographic Jumbotron / GitHub Heatmap HUD
    const hudMat = new THREE.MeshBasicMaterial({
      map: createStandHUDTexture(name, store.telemetry.crowdDensity[name] || 0),
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    // Aspect ratio of canvas is 1024/256 = 4:1. Size: 48x12
    const hudGeo = new THREE.PlaneGeometry(48, 12);
    const hudMesh = new THREE.Mesh(hudGeo, hudMat);
    // Position it hovering above the back of the roof
    // Local +X is the back of the stand. The stand extends from X=0 to X=width (roughly width/2 from center).
    hudMesh.position.set(width * 0.45, 32, 0);
    // Face the pitch (-X direction locally)
    hudMesh.rotation.y = -Math.PI / 2;
    mesh.add(hudMesh); // Add to stand mesh so it inherits the stand's world rotation and position
    
    standHUDMaterials[name] = hudMat;
  };

  createStand('North Stand', 42, 115, 0, -68, -Math.PI / 2);
  createStand('South Stand', 42, 115, 0, 68, Math.PI / 2);
  createStand('East Stand', 42, 80, 85, 0, 0);
  createStand('West Stand', 42, 80, -85, 0, Math.PI);

  // ========== GATE SYSTEMS ==========
  const createGate = (id: string, x: number, z: number, rotY: number) => {
    const archGeo = new THREE.TorusGeometry(7, 0.6, 12, 40, Math.PI);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.05, metalness: 0.95 });
    const arch = new THREE.Mesh(archGeo, gateMat);
    arch.position.set(x, 0, z);
    arch.rotation.y = rotY;
    scene.add(arch);

    // Left post
    const postGeo = new THREE.CylinderGeometry(0.5, 0.5, 7, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.9, roughness: 0.2 });
    const lp = new THREE.Mesh(postGeo, postMat);
    lp.position.set(x + Math.cos(rotY) * 7, 3.5, z + Math.sin(rotY) * 7);
    scene.add(lp);
    const rp = lp.clone();
    rp.position.set(x - Math.cos(rotY) * 7, 3.5, z - Math.sin(rotY) * 7);
    scene.add(rp);

    // Label panel behind gate
    const labelMat = new THREE.MeshBasicMaterial({ 
      map: createGateHUDTexture(id, store.telemetry.gateThroughput[id] || 0),
      transparent: true, 
      opacity: 0.9, 
      side: THREE.DoubleSide 
    });
    // Aspect ratio 512/128 = 4:1
    const labelGeo = new THREE.PlaneGeometry(12, 3);
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(x, 10, z);
    
    // Make the label always face the center of the stadium
    label.lookAt(0, 10, 0);
    scene.add(label);

    gateMaterials[id] = gateMat;
    gateHUDMaterials[id] = labelMat;
    gateColorState[id] = {
      current: colors.clear.clone(),
      target: colors.clear.clone(),
      currentEmissive: 0.3,
      targetEmissive: 0.3
    };
    gates[id] = arch;
  };

  createGate('GateA', -60, -65, -Math.PI / 4);
  createGate('GateB', -60, 65, Math.PI / 4);
  createGate('GateC', 75, 0, Math.PI / 2);

  setStandTargetColors();

  // ========== CROWD ==========
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
    const targetStand = standNames[Math.floor(Math.random() * standNames.length)];
    let cx = 0, cz = 0;

    if (targetStand === 'North Stand') { cx = (Math.random() - 0.5) * 115; cz = -68 + (Math.random() * 20 - 10); }
    if (targetStand === 'South Stand') { cx = (Math.random() - 0.5) * 115; cz = 68 + (Math.random() * 20 - 10); }
    if (targetStand === 'East Stand') { cz = (Math.random() - 0.5) * 80; cx = 85 + (Math.random() * 20 - 10); }
    if (targetStand === 'West Stand') { cz = (Math.random() - 0.5) * 80; cx = -85 + (Math.random() * 20 - 10); }

    crowdData.push({
      x: cx, z: cz, vx: 0, vz: 0,
      anchorX: cx, anchorZ: cz,
      wanderAngle: Math.random() * Math.PI * 2,
      bobPhase: Math.random() * Math.PI * 2,
      bobSpeed: 2 + Math.random() * 2,
      targetStand
    });
    dummy.position.set(cx, 1.2, cz);
    dummy.updateMatrix();
    crowdInstancedMesh.setMatrixAt(i, dummy.matrix);
  }
  crowdInstancedMesh.instanceMatrix.needsUpdate = true;

  // ========== FOOTBALL MATCH ==========
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
    redTeamData.push({ x: off.x - 10, z: off.z, vx: 0, vz: 0, homeX: off.x - 10, homeZ: off.z, speed: 6 + Math.random() * 2, role: 'support', bobPhase: Math.random() * Math.PI * 2 });
    blueTeamData.push({ x: -off.x + 10, z: -off.z, vx: 0, vz: 0, homeX: -off.x + 10, homeZ: -off.z, speed: 6 + Math.random() * 2, role: 'support', bobPhase: Math.random() * Math.PI * 2 });
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

  window.addEventListener('resize', onWindowResize);
  isLoading.value = false;
  clock.start();
  animate();
};

const onWindowResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return;
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// ---------- Spatial hash ----------
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

const updateCrowd = (dt: number, time: number) => {
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

    a.wanderAngle += (Math.random() - 0.5) * 1.5 * dt;
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

const updateBall = (dt: number) => {
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

const updateTeam = (mesh: THREE.InstancedMesh, teamData: Player[], opponentData: Player[], time: number, dt: number) => {
  const distances = teamData.map((p, idx) => ({
    idx,
    dist: Math.hypot(ballData.x - p.x, ballData.z - p.z)
  })).sort((a, b) => a.dist - b.dist);
  const chasers = new Set(distances.slice(0, 2).map(d => d.idx));

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
    const dist = Math.hypot(dx, dz);

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
      const ballDist = Math.hypot(ballData.x - p.x, ballData.z - p.z);
      if (ballDist < 1.8 && ballData.y < 1.5) {
        const kdx = ballData.x - p.x;
        const kdz = ballData.z - p.z;
        const kd = Math.hypot(kdx, kdz) || 1;
        const power = 8 + Math.random() * 6;
        ballData.vx = (kdx / kd) * power;
        ballData.vz = (kdz / kd) * power;
        ballData.vy = 3 + Math.random() * 4;
      }
    }

    const speed = Math.hypot(p.vx, p.vz);
    const runBob = Math.abs(Math.sin(time * 10 + p.bobPhase)) * 0.25 * clamp(speed / 4, 0, 1);
    dummy.position.set(p.x, 1.5 + runBob, p.z);
    if (speed > 0.1) dummy.lookAt(p.x + p.vx, 1.5, p.z + p.vz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.getElapsedTime();

  controls.update();
  updateStandColorsSmooth(dt);
  updateCrowd(dt, time);
  updateBall(dt);
  updateTeam(redTeamMesh, redTeamData, blueTeamData, time, dt);
  updateTeam(blueTeamMesh, blueTeamData, redTeamData, time, dt);

  renderer.render(scene, camera);
};

watch(() => store.telemetry.crowdDensity, () => {
  setStandTargetColors();
}, { deep: true });

onMounted(() => { setTimeout(init3D, 100); });
onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  cancelAnimationFrame(animationFrameId);
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
});
</script>
