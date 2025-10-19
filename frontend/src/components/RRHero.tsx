import { useEffect, useRef, useState } from 'react';
import '../styles/glass.css';

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
};

const GoldStaticLogo = () => (
  <span className="rr-logo-fallback" aria-hidden="true">
    <svg viewBox="0 0 120 60" role="img" aria-label="Rhythm+Root Logo">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="60%" stopColor="#c49b2e" />
          <stop offset="100%" stopColor="#f0d46a" />
        </linearGradient>
      </defs>
      <g fill="url(#g)">
        <path d="M10 10h18c6 0 10 4 10 10 0 5-3 8-7 9l9 21h-8l-9-20h-5v20H10zm8 6v12h9c4 0 6-2 6-6s-2-6-6-6z" />
        <path d="M57 10h18c6 0 10 4 10 10 0 5-3 8-7 9l9 21h-8l-9-20h-5v20H57zm8 6v12h9c4 0 6-2 6-6s-2-6-6-6z" />
        <rect x="36" y="8" width="10" height="10" rx="1" />
        <rect x="36" y="22" width="10" height="10" rx="1" />
        <rect x="30" y="16" width="10" height="10" rx="1" />
        <rect x="42" y="16" width="10" height="10" rx="1" />
      </g>
    </svg>
  </span>
);

export const RRHero = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftWordRef = useRef<HTMLSpanElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!containerRef.current) return;

    const setup = async () => {
      if (!isWebGLAvailable()) {
        setUseFallback(true);
        return;
      }

      try {
        const [{ WebGLRenderer, PerspectiveCamera, Scene, AmbientLight, DirectionalLight, Box3, Vector3, SRGBColorSpace, Mesh, MeshPhysicalMaterial, Group }, gltf, geometries] = await Promise.all([
          import('three').then((m) => ({
            WebGLRenderer: m.WebGLRenderer,
            PerspectiveCamera: m.PerspectiveCamera,
            Scene: m.Scene,
            AmbientLight: m.AmbientLight,
            DirectionalLight: m.DirectionalLight,
            Box3: m.Box3,
            Vector3: m.Vector3,
            SRGBColorSpace: m.SRGBColorSpace,
            Mesh: m.Mesh,
            MeshPhysicalMaterial: m.MeshPhysicalMaterial,
            Group: m.Group
          })),
          import('three/examples/jsm/loaders/GLTFLoader.js').then((m) => m),
          import('three/examples/jsm/geometries/RoundedBoxGeometry.js').then((m) => m)
        ]);

        if (!mounted || !containerRef.current) return;

        const container = containerRef.current;
        const scene = new Scene();
        const camera = new PerspectiveCamera(35, 1, 0.1, 50);
        camera.position.z = 5;

        const renderer = new WebGLRenderer({ alpha: true, antialias: true });
        renderer.outputColorSpace = SRGBColorSpace;
        container.appendChild(renderer.domElement);

        const ambient = new AmbientLight(0xffffff, 0.8);
        const key = new DirectionalLight(0xffffff, 1.0);
        key.position.set(3, 3, 4);
        const rim = new DirectionalLight(0xffffff, 0.5);
        rim.position.set(-3, 1, -3);
        scene.add(ambient, key, rim);

        let logo: any = null;
        const loader = new gltf.GLTFLoader();

        const resizeToText = () => {
          const h = Math.ceil((leftWordRef.current?.getBoundingClientRect().height ?? 64));
          container.style.width = `${h}px`;
          container.style.height = `${h}px`;
          renderer.setSize(h, h, false);
          camera.aspect = 1;
          camera.updateProjectionMatrix();
        };

        const animate = () => {
          if (!mounted) return;
          requestAnimationFrame(animate);
          if (logo) logo.rotation.y += 0.0022;
          renderer.render(scene, camera);
        };

        const onLoad = (gltfScene: any) => {
          logo = gltfScene.scene;
          scene.add(logo);
          const box = new Box3().setFromObject(logo);
          const size = new Vector3();
          box.getSize(size);
          const scale = 1.8 / Math.max(size.x, size.y, size.z);
          logo.scale.setScalar(scale);
          const center = new Vector3();
          box.getCenter(center);
          logo.position.sub(center.multiplyScalar(scale));

          try {
            const { RoundedBoxGeometry } = geometries as any;
            const capHeight = size.y * scale;
            const plusSize = capHeight * 0.3;
            const thickness = plusSize * 0.22;
            const baseDepth = Math.max(size.z * scale, thickness * 0.5);
            const plusDepth = baseDepth * 1.2;
            const radius = Math.max(thickness * 0.18, 0.002);
            const segments = 4;

            const material = new MeshPhysicalMaterial({
              color: 0xd4af37,
              metalness: 1,
              roughness: 0.28,
              clearcoat: 0.5,
              envMapIntensity: 1
            });

            const vertical = new RoundedBoxGeometry(thickness, plusSize, plusDepth, segments, radius);
            const horizontal = new RoundedBoxGeometry(plusSize, thickness, plusDepth, segments, radius);
            const vBar = new Mesh(vertical, material);
            const hBar = new Mesh(horizontal, material);
            const plus = new Group();
            plus.name = 'PlusMark';
            plus.add(vBar);
            plus.add(hBar);

            const halfWidth = (size.x * scale) / 2;
            const minX = -halfWidth;
            const splitX = minX + halfWidth; // approximate right edge of left R
            plus.position.x = splitX + (plusSize * 0.275);
            plus.position.y = 0; // midline alignment
            plus.position.z = plusDepth * 0.08; // cast faint edge shadow

            logo.add(plus);
          } catch {}
          resizeToText();
          animate();
        };

        const onError = () => {
          setUseFallback(true);
        };

        loader.load('/assets/RR.glb', onLoad, undefined, onError);
        window.addEventListener('resize', resizeToText);

        return () => {
          mounted = false;
          window.removeEventListener('resize', resizeToText);
          try {
            renderer.dispose();
          } catch {}
        };
      } catch {
        setUseFallback(true);
      }
    };

    const cleanupPromise = setup();
    return () => {
      mounted = false;
      void cleanupPromise;
    };
  }, []);

  return (
    <div className="rr-hero">
      <div className="rr-card">
        <div className="rr-row">
          <span ref={leftWordRef} className="rr-word">Rhythm</span>
          <div ref={containerRef} className="rr-logo3d" aria-hidden={useFallback}></div>
          <span className="rr-word">Root</span>
        </div>
        {useFallback && <GoldStaticLogo />}
      </div>
    </div>
  );
};

export default RRHero;
