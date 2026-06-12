import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uAmp;
  uniform float uDensity;
  uniform float uRidgeLimit;
  uniform float uRidgeAmp;

  float ridgedNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453123);
    float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453123);
    float v = mix(a, b, f.x);
    return 1.0 - abs(v * 2.0 - 1.0);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float t = uTime * uSpeed;
    float n = ridgedNoise(vec2(pos.x * uDensity + t, pos.y * uDensity * 0.6 + t * 0.3));
    n = pow(n, 3.0);
    if (n > uRidgeLimit) {
      pos.z -= (n - uRidgeLimit) * uRidgeAmp;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uHue1;
  uniform vec3 uHue2;
  uniform float uBandOffset;
  uniform float uBandWidth;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float stripe = step(fract(vUv.y * uBandOffset + uTime * uSpeed * 0.2 + vUv.x * 0.4), uBandWidth);
    float noise = hash(vUv * 200.0 + uTime * 0.5);
    float finalStripe = stripe * noise;
    vec3 col = mix(uHue2, uHue1, finalStripe);
    float fade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
    col *= fade;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function EnergyTerrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#002A54');
    scene.fog = new THREE.FogExp2('#002A54', 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 4, 9);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Terrain material
    const terrainMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      wireframe: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.6 },
        uAmp: { value: 1.0 },
        uDensity: { value: 1.8 },
        uHue1: { value: new THREE.Color('#00A9E0') },
        uHue2: { value: new THREE.Color('#002A54') },
        uBandOffset: { value: 1.5 },
        uBandWidth: { value: 0.4 },
        uRidgeLimit: { value: 0.55 },
        uRidgeAmp: { value: 0.6 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
    });

    // Terrain mesh
    const isMobile = width < 768;
    const segments = isMobile ? 64 : 128;
    const geometry = new THREE.PlaneGeometry(25, 25, segments, segments);
    const terrain = new THREE.Mesh(geometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Reflection plane
    const planeGeo = new THREE.PlaneGeometry(25, 25);
    const planeMat = terrainMaterial;
    const planeReflect = new THREE.Mesh(planeGeo, planeMat);
    planeReflect.position.set(0, -0.5, 0);
    planeReflect.rotation.x = Math.PI / 2;
    scene.add(planeReflect);

    const localPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.5);
    renderer.localClippingEnabled = true;
    planeReflect.material.clippingPlanes = [localPlane];

    // Mouse state
    const state = {
      currentMouse: { x: 0, y: 0 },
      targetMouse: { x: 0, y: 0 },
    };

    const handleMouseMove = (e: MouseEvent) => {
      state.targetMouse.x = (e.clientX / width) * 2 - 1;
      state.targetMouse.y = -(e.clientY / height) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Clock
    const clock = new THREE.Clock();
    let animationId: number;

    // Animation loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      terrainMaterial.uniforms.uTime.value = clock.getElapsedTime();

      // Lerp mouse
      state.currentMouse.x += (state.targetMouse.x - state.currentMouse.x) * 0.04;
      state.currentMouse.y += (state.targetMouse.y - state.currentMouse.y) * 0.04;

      const tiltX = state.currentMouse.y * 0.3;
      const tiltY = state.currentMouse.x * 0.4;

      terrain.rotation.z = tiltY * 0.08;
      terrain.rotation.x = -Math.PI / 2 + tiltX;

      planeReflect.position.x = terrain.position.x;
      planeReflect.rotation.x = Math.PI / 2 + terrain.rotation.x;
      planeReflect.rotation.z = -terrain.rotation.z;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      terrainMaterial.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
