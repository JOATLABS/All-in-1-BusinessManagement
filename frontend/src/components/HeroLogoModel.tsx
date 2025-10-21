import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface HeroLogoModelProps {
  src: string;
  posterUrl?: string;
  className?: string;
}

export const HeroLogoModel = ({ src, posterUrl, className }: HeroLogoModelProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    const ResizeObserverCtor = window.ResizeObserver;
    if (!ResizeObserverCtor) {
      console.warn('ResizeObserver is not available in this environment. Hero logo model will not resize dynamically.');
      return () => undefined;
    }

    const container = containerRef.current;
    if (!container) {
      return () => undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    camera.position.set(0, 0, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(3, 5, 6);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(-4, -2, -3);

    scene.add(ambientLight);
    scene.add(keyLight);
    scene.add(rimLight);

    const loader = new GLTFLoader();
    let frameId: number | null = null;
    let currentModel: THREE.Object3D | null = null;
    let disposed = false;

    const resize = () => {
      if (!container) {
        return;
      }
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      camera.aspect = container.clientWidth / container.clientHeight || 1;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserverCtor(resize);
    resizeObserver.observe(container);
    resize();

    loader.load(
      src,
      (gltf) => {
        if (disposed) {
          return;
        }

        currentModel = gltf.scene;
        currentModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });

        const boundingBox = new THREE.Box3().setFromObject(currentModel);
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.6 / maxDimension;
        currentModel.scale.setScalar(scale);

        const center = boundingBox.getCenter(new THREE.Vector3());
        currentModel.position.sub(center);

        scene.add(currentModel);
        setIsLoaded(true);

        const animate = () => {
          frameId = window.requestAnimationFrame(animate);
          if (currentModel) {
            currentModel.rotation.y += 0.01;
          }
          renderer.render(scene, camera);
        };

        animate();
      },
      undefined,
      (error) => {
        if (!disposed) {
          console.error('Failed to load hero logo model', error);
          setHasError(true);
        }
      }
    );

    return () => {
      disposed = true;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      resizeObserver.disconnect();
      if (currentModel) {
        scene.remove(currentModel);
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src]);

  const showPoster = Boolean(posterUrl && (!isLoaded || hasError));

  return (
    <div ref={containerRef} className={className} data-loaded={isLoaded && !hasError}>
      {posterUrl ? (
        <img src={posterUrl} alt="" className="hero__logo-poster" aria-hidden={!showPoster} />
      ) : null}
      {hasError ? <span className="visually-hidden">3D logo failed to load</span> : null}
    </div>
  );
};
