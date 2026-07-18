import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { type Ref } from 'vue';

export function useStadiumScene(
  canvasContainer: Ref<HTMLDivElement | null>
) {
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let resizeObserver: ResizeObserver | undefined;

  const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.25);

  const initScene = () => {
    if (!canvasContainer.value) return null;

    const width = Math.max(1, canvasContainer.value.clientWidth);
    const height = Math.max(1, canvasContainer.value.clientHeight);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.0018);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1200);
    camera.position.set(-80, 120, 180);

    const pixelRatio = getPixelRatio();
    renderer = new THREE.WebGLRenderer({
      antialias: pixelRatio <= 1,
      alpha: false,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // The stadium and its shadow-casting structures are static. Render their
    // shadow map once instead of rebuilding it for every animation frame.
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
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
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
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

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(onWindowResize);
      resizeObserver.observe(canvasContainer.value);
    }

    const dispose = () => {
      resizeObserver?.disconnect();
      resizeObserver = undefined;
      controls?.dispose();

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();

      scene?.traverse((object) => {
        const renderable = object as THREE.Mesh;
        if (renderable.geometry) geometries.add(renderable.geometry);

        const objectMaterials = renderable.material
          ? (Array.isArray(renderable.material) ? renderable.material : [renderable.material])
          : [];
        objectMaterials.forEach((material) => materials.add(material));
      });

      materials.forEach((material) => {
        Object.values(material).forEach((value: unknown) => {
          if (value instanceof THREE.Texture) textures.add(value);
        });
      });
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      scene?.clear();

      renderer?.setAnimationLoop(null);
      renderer?.renderLists.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();

      if (canvasContainer.value && renderer?.domElement?.parentElement === canvasContainer.value) {
        canvasContainer.value.removeChild(renderer.domElement);
      }
    };

    return { scene, camera, renderer, controls, prefersReducedMotion, dispose };
  };

  const onWindowResize = () => {
    if (!canvasContainer.value || !camera || !renderer) return;
    const width = Math.max(1, canvasContainer.value.clientWidth);
    const height = Math.max(1, canvasContainer.value.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const pixelRatio = getPixelRatio();
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
  };

  return {
    initScene,
    onWindowResize
  };
}
