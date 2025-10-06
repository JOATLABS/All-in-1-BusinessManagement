import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { ReservationTableTier } from '../types/content';

const BACKGROUND_COLOR = new THREE.Color('#050307');
const WHITE = new THREE.Color('#ffffff');
const BLACK = new THREE.Color('#000000');

const lerpColor = (color: THREE.Color, target: THREE.Color, intensity: number) => {
  return color.clone().lerp(target, intensity);
};

const parseSeatEstimate = (capacity: string): number => {
  const matches = capacity.match(/\d+/g);
  if (!matches || matches.length === 0) {
    return 6;
  }

  const numbers = matches.map((value) => Number.parseInt(value, 10)).filter((value) => Number.isFinite(value));
  if (numbers.length === 0) {
    return 6;
  }

  return Math.max(...numbers);
};

interface TableVisualProps {
  tier: ReservationTableTier;
  isActive: boolean;
}

const TableVisual = ({ tier, isActive }: TableVisualProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(isActive);

  activeRef.current = isActive;

  const seatCount = useMemo(() => parseSeatEstimate(tier.capacity), [tier.capacity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return () => undefined;
    }

    container.replaceChildren();

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 7);
    camera.lookAt(new THREE.Vector3(0, 1.2, 0));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(BACKGROUND_COLOR, 0);
    renderer.setSize(width, height);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(6, 10, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(tier.visual.accentColor, 1.25, 25);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    const primaryColor = new THREE.Color(tier.visual.primaryColor);
    const secondaryColor = new THREE.Color(tier.visual.secondaryColor);
    const accentColor = new THREE.Color(tier.visual.accentColor);

    const tableTopGeometry = new THREE.CylinderGeometry(1.8, 1.85, 0.22, 48, 1, false);
    const tableTopMaterial = new THREE.MeshStandardMaterial({
      color: lerpColor(primaryColor, WHITE, 0.2),
      metalness: 0.55,
      roughness: 0.25
    });
    const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
    tableTop.position.y = 1.6;
    baseGroup.add(tableTop);

    const rimGeometry = new THREE.CylinderGeometry(1.87, 1.87, 0.08, 48);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: lerpColor(primaryColor, BLACK, 0.25),
      metalness: 0.35,
      roughness: 0.15,
      emissive: lerpColor(accentColor, BLACK, 0.6)
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 1.5;
    baseGroup.add(rim);

    const pedestalGeometry = new THREE.CylinderGeometry(0.55, 0.8, 1.4, 24);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: lerpColor(secondaryColor, BLACK, 0.1),
      metalness: 0.55,
      roughness: 0.4
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = 0.85;
    baseGroup.add(pedestal);

    const stageGeometry = new THREE.CylinderGeometry(2.8, 3.1, 0.25, 64);
    const stageMaterial = new THREE.MeshStandardMaterial({
      color: lerpColor(secondaryColor, BLACK, 0.35),
      metalness: 0.25,
      roughness: 0.6
    });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.y = 0.1;
    baseGroup.add(stage);

    const seatGroup = new THREE.Group();
    const seatsToRender = Math.max(4, Math.min(12, seatCount));
    const seatRadius = 2.5;
    const seatHeight = 0.45;
    const seatGeometry = new THREE.CylinderGeometry(0.35, 0.45, seatHeight, 24);
    const seatMaterial = new THREE.MeshStandardMaterial({
      color: lerpColor(accentColor, WHITE, 0.1),
      metalness: 0.3,
      roughness: 0.45
    });

    for (let index = 0; index < seatsToRender; index += 1) {
      const angle = (index / seatsToRender) * Math.PI * 2;
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.set(Math.cos(angle) * seatRadius, seatHeight / 2, Math.sin(angle) * seatRadius);
      seatGroup.add(seat);
    }

    baseGroup.add(seatGroup);

    const haloGeometry = new THREE.RingGeometry(3.4, 3.6, 64);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: lerpColor(accentColor, WHITE, 0.35),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.05;
    baseGroup.add(halo);

    const floorGeometry = new THREE.PlaneGeometry(18, 18, 1, 1);
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: lerpColor(primaryColor, BLACK, 0.7),
      transparent: true,
      opacity: 0.75
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    baseGroup.add(floor);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = motionQuery.matches;

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
    };

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    let frameId = 0;
    const animate = () => {
      const rotationSpeed = reduceMotion ? 0 : activeRef.current ? 0.01 : 0.004;
      baseGroup.rotation.y += rotationSpeed;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) {
        return;
      }

      const nextWidth = container.clientWidth || width;
      const nextHeight = container.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };

    handleResize();

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;

    if (resizeObserver) {
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      if (typeof motionQuery.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }

      scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material: THREE.Material) => material.dispose());
          } else {
            (object.material as THREE.Material).dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [seatCount, tier.id, tier.visual.accentColor, tier.visual.primaryColor, tier.visual.secondaryColor]);

  return <div ref={containerRef} className="tier-card__visual" aria-hidden="true" />;
};

export default TableVisual;
