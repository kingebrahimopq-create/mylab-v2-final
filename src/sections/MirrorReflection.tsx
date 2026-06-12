import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform float uTime;
  uniform float uWaveSpeed;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uRippleStrength;
  uniform float uBlurFade;

  vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageResolution) {
    vec2 ratio = vec2(
      min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
      min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
    );
    return vec2(
      uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
  }

  vec3 wave(vec2 uv, float time) {
    float x = uv.y * uWaveFrequency + time * uWaveSpeed;
    float y = uv.x * uWaveFrequency + time * uWaveSpeed;
    return vec3(
      sin(x) * uWaveAmplitude,
      sin(y) * uWaveAmplitude,
      cos(x + y) * uRippleStrength
    );
  }

  void main() {
    float t = uTime;
    vec3 d = wave(gl_FragCoord.xy / uResolution, t);
    vec2 mainUv = coverUv(gl_FragCoord.xy / uResolution + d.xy, uResolution, uImageResolution);
    vec2 mirrorUv = vec2(mainUv.x, 1.0 - mainUv.y - d.z * 0.03);
    vec4 reflected = texture2D(uTexture, mirrorUv);
    float mask = smoothstep(0.0, 0.45, gl_FragCoord.y / uResolution.y);
    reflected.rgb *= mask;
    gl_FragColor = vec4(reflected.rgb, 1.0);
  }
`;

export default function MirrorReflection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!canvas || !container || !video) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Wait for video to be ready
    const setupTexture = () => {
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: videoTexture },
          uResolution: { value: new THREE.Vector2(width, height) },
          uImageResolution: { value: new THREE.Vector2(1024, 1024) },
          uTime: { value: 0 },
          uWaveSpeed: { value: 1.0 },
          uWaveAmplitude: { value: 0.08 },
          uWaveFrequency: { value: 3.5 },
          uRippleStrength: { value: 0.6 },
          uBlurFade: { value: 0.7 },
        },
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const clock = new THREE.Clock();
      let animationId: number;

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        material.uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        renderer.setSize(w, h);
        material.uniforms.uResolution.value.set(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
      };
    };

    let cleanup: (() => void) | undefined;

    const onLoaded = () => {
      cleanup = setupTexture();
    };

    if (video.readyState >= 3) {
      onLoaded();
    } else {
      video.addEventListener('loadeddata', onLoaded, { once: true });
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <section className="relative w-full" style={{ height: '80vh', background: 'linear-gradient(180deg, #002A54 0%, #00152A 100%)' }}>
      <div ref={containerRef} className="relative w-full h-full overflow-hidden">
        {/* Top half - video */}
        <div className="absolute top-0 left-0 w-full" style={{ height: '50%' }}>
          <video
            ref={videoRef}
            src="/videos/hero-agent.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Bottom half - reflection with shader */}
        <div className="absolute left-0 w-full" style={{ top: '50%', height: '50%' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-10 pointer-events-none">
          <h2 className="text-glow text-center" style={{ color: '#F5F6F8', fontSize: '32px', fontWeight: 700 }}>
            A Day in the Life
          </h2>
          <p className="text-center mt-4 max-w-md" style={{ color: '#A8D0E6', fontSize: '16px' }}>
            Watch how agents use Command to manage their business on the go — from property showings to client follow-ups.
          </p>
        </div>
      </div>
    </section>
  );
}
