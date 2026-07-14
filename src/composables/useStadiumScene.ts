import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { type Ref } from 'vue';

export function useStadiumScene(
  canvasContainer: Ref<HTMLDivElement | null>
) {
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;

  const initScene = () => {
    if (!canvasContainer.value) return null;

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
    renderer.toneMappingExposure = 1.6;
    canvasContainer.value.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 30;
    controls.maxDistance = 500;
    controls.target.set(0, 0, 0);

    // Prefers-reduced-motion check for camera rotation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.3;

    // Lighting — bright stadium floodlight night look
    scene.add(new THREE.AmbientLight(0xfff5e6, 0.5));         // warmer, stronger fill
    scene.add(new THREE.HemisphereLight(0x2a2a6e, 0x0a0a0a, 0.6)); // rich sky/ground bounce

    const sunLight = new THREE.DirectionalLight(0xfff0d0, 1.8);
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

    // Extra fill light from opposite side to eliminate harsh shadows
    const fillLight = new THREE.DirectionalLight(0xaad4ff, 0.6);
    fillLight.position.set(-80, 100, -80);
    scene.add(fillLight);

    return { scene, camera, renderer, controls, prefersReducedMotion };
  };

  const onWindowResize = () => {
    if (!canvasContainer.value || !camera || !renderer) return;
    const width = canvasContainer.value.clientWidth;
    const height = canvasContainer.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  return {
    initScene,
    onWindowResize
  };
}
