import * as THREE from 'three';

export const colors = {
  clear: new THREE.Color(0x34d399),
  moderate: new THREE.Color(0xfbbf24),
  packed: new THREE.Color(0xef4444)
};

export const getHeatmapColor = (density: number): THREE.Color => {
  if (density > 80) return colors.packed;
  if (density > 50) return colors.moderate;
  return colors.clear;
};

export function useStadiumHeatmap(scene: THREE.Scene, store: any) {
  const standMaterials: Record<string, THREE.MeshStandardMaterial> = {};
  const standColorState: Record<string, { current: THREE.Color; target: THREE.Color; currentEmissive: number; targetEmissive: number }> = {};
  const stands: Record<string, THREE.Mesh> = {};
  const standHUDMaterials: Record<string, THREE.MeshBasicMaterial> = {};

  const gateMaterials: Record<string, THREE.MeshStandardMaterial> = {};
  const gateColorState: Record<string, { current: THREE.Color; target: THREE.Color; currentEmissive: number; targetEmissive: number }> = {};
  const gates: Record<string, THREE.Mesh> = {};
  const gateHUDMaterials: Record<string, THREE.MeshBasicMaterial> = {};
  
  const dummy = new THREE.Object3D();
  
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

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
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

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
        
        // Standard rect for maximum compatibility
        ctx.beginPath();
        ctx.rect(startX + c * (boxSize + gap), startY + r * (boxSize + gap), boxSize, boxSize);
        ctx.fill();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const createStand = (name: string, width: number, depth: number, x: number, z: number, rotY: number, backHeight: number = 22) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, backHeight);
    shape.lineTo(width * 0.95, backHeight + 2);
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

    const chairGeo = new THREE.BoxGeometry(0.7, 0.6, 0.7);
    const CHAIRS_PER_STAND = 300;
    const standChairMesh = new THREE.InstancedMesh(chairGeo, mat, CHAIRS_PER_STAND);
    scene.add(standChairMesh);

    let chairCounter = 0;
    for (let r = 1; r < 15; r++) {
      for (let c = 0; c < 20; c++) {
        const localX = (r / 15) * width - (width / 2);
        const localY = (r / 15) * backHeight + 0.5;
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

    // Roof canopy
    const roofShape = new THREE.Shape();
    roofShape.moveTo(width * 0.6, backHeight);
    roofShape.lineTo(width, backHeight + 2);
    roofShape.lineTo(width, backHeight + 2.8);
    roofShape.lineTo(width * 0.3, backHeight + 0.8);
    roofShape.lineTo(width * 0.6, backHeight);

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
    const hudGeo = new THREE.PlaneGeometry(48, 12);
    const hudMesh = new THREE.Mesh(hudGeo, hudMat);
    hudMesh.position.set(width * 0.45, backHeight + 10, 0);
    hudMesh.rotation.y = -Math.PI / 2;
    mesh.add(hudMesh); 
    standHUDMaterials[name] = hudMat;
  };

  const createGate = (id: string, x: number, z: number, rotY: number) => {
    const archGeo = new THREE.TorusGeometry(7, 0.6, 12, 40, Math.PI);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.05, metalness: 0.95 });
    const arch = new THREE.Mesh(archGeo, gateMat);
    arch.position.set(x, 0, z);
    arch.rotation.y = rotY;
    scene.add(arch);

    const postGeo = new THREE.CylinderGeometry(0.5, 0.5, 7, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.9, roughness: 0.2 });
    const lp = new THREE.Mesh(postGeo, postMat);
    lp.position.set(x + Math.cos(rotY) * 7, 3.5, z + Math.sin(rotY) * 7);
    scene.add(lp);
    const rp = lp.clone();
    rp.position.set(x - Math.cos(rotY) * 7, 3.5, z - Math.sin(rotY) * 7);
    scene.add(rp);

    const labelMat = new THREE.MeshBasicMaterial({ 
      map: createGateHUDTexture(id, store.telemetry.gateThroughput[id] || 0),
      transparent: true, 
      opacity: 0.9, 
      side: THREE.DoubleSide 
    });
    const labelGeo = new THREE.PlaneGeometry(12, 3);
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(x, 10, z);
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

  const setStandTargetColors = () => {
    const densities = store.telemetry.crowdDensity;
    Object.keys(standMaterials).forEach(section => {
      const density = densities[section] || 0;
      const targetColor = getHeatmapColor(density);
      const state = standColorState[section];
      state.target.copy(targetColor);
      state.targetEmissive = density > 80 ? 0.5 : 0.15;
      
      if (standHUDMaterials[section]) {
        const oldMap = standHUDMaterials[section].map;
        const newMap = createStandHUDTexture(section, density);
        standHUDMaterials[section].map = newMap;
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

      if (gateHUDMaterials[gateId]) {
        const oldMap = gateHUDMaterials[gateId].map;
        const newMap = createGateHUDTexture(gateId, tp);
        gateHUDMaterials[gateId].map = newMap;
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

  const initHeatmap = () => {
    createStand('North Stand', 42, 115, 0, -68, -Math.PI / 2, 34);
    createStand('South Stand', 42, 115, 0, 68, Math.PI / 2, 34);
    createStand('East Stand', 42, 80, 85, 0, 0, 22);
    createStand('West Stand', 42, 80, -85, 0, Math.PI, 22);

    createGate('GateA', -60, -65, -Math.PI / 4);
    createGate('GateB', -60, 65, Math.PI / 4);
    createGate('GateC', 75, 0, Math.PI / 2);

    setStandTargetColors();
  };

  return {
    initHeatmap,
    setStandTargetColors,
    updateStandColorsSmooth
  };
}
