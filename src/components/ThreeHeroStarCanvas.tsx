import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CelestialStarGraphic } from './CelestialStarGraphic';
import { StarType } from '../types';

interface ThreeHeroStarCanvasProps {
  type?: 'golden' | 'supernova' | 'diamond' | 'rainbow' | 'freeze';
  isBooped?: boolean;
  onTap?: (e?: any) => void;
  className?: string;
}

export const ThreeHeroStarCanvas: React.FC<ThreeHeroStarCanvasProps> = ({
  type = 'golden',
  isBooped = false,
  onTap,
  className = 'w-24 h-24 sm:w-28 sm:h-28',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    starMesh: THREE.Mesh;
    haloRing: THREE.Mesh;
    particles: THREE.Points;
    pointLight: THREE.PointLight;
    reqId: number | null;
  } | null>(null);

  const isBoopedRef = useRef(isBooped);
  isBoopedRef.current = isBooped;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeObserver: ResizeObserver | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let starGeo: THREE.ExtrudeGeometry | null = null;
    let starMat: THREE.MeshStandardMaterial | null = null;
    let torusGeo: THREE.TorusGeometry | null = null;
    let torusMat: THREE.MeshStandardMaterial | null = null;
    let particleGeo: THREE.BufferGeometry | null = null;
    let particleMat: THREE.PointsMaterial | null = null;

    try {
      const width = container.clientWidth || 100;
      const height = container.clientHeight || 100;

      // 1. Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.2);

      // 2. Renderer
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

    // 3. Create 3D Star Shape with ExtrudeGeometry & Bevel
    const starShape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.25;
    const innerRadius = 0.58;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        starShape.moveTo(x, y);
      } else {
        starShape.lineTo(x, y);
      }
    }
    starShape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.14,
      bevelThickness: 0.16,
    };

    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    starGeo.center();

    // 4. Color theme based on star type
    let mainColor = 0xf59e0b;
    let emissiveColor = 0x78350f;
    let metalness = 0.85;
    let roughness = 0.15;

    if (type === 'diamond') {
      mainColor = 0x38bdf8;
      emissiveColor = 0x0369a1;
      metalness = 0.3;
      roughness = 0.05;
    } else if (type === 'supernova') {
      mainColor = 0xf43f5e;
      emissiveColor = 0x9f1239;
      metalness = 0.8;
      roughness = 0.2;
    } else if (type === 'rainbow') {
      mainColor = 0xec4899;
      emissiveColor = 0x831843;
      metalness = 0.7;
      roughness = 0.1;
    } else if (type === 'freeze') {
      mainColor = 0xbae6fd;
      emissiveColor = 0x0284c7;
      metalness = 0.2;
      roughness = 0.05;
    }

    const starMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.35,
      metalness: metalness,
      roughness: roughness,
    });

    const starMesh = new THREE.Mesh(starGeo, starMat);
    scene.add(starMesh);

    // 5. Orbiting Holographic Torus Halo Ring
    const torusGeo = new THREE.TorusGeometry(1.65, 0.03, 8, 36);
    const torusMat = new THREE.MeshBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: 0.55,
      wireframe: true,
    });
    const haloRing = new THREE.Mesh(torusGeo, torusMat);
    haloRing.rotation.x = Math.PI / 2.6;
    scene.add(haloRing);

    // 6. Floating 3D Sparkle Dust Particles
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 1.3 + Math.random() * 1.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(3, 4, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(mainColor, 1.4);
    dirLight2.position.set(-3, -2, -3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 8);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 8. Animation Loop
    let lastTime = performance.now();
    let spinVelocity = 0;

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isBoopedRef.current) {
        spinVelocity = 12;
      }

      // Smooth deceleration for boop spin
      spinVelocity = Math.max(0, spinVelocity - dt * 14);

      starMesh.rotation.y += (0.9 + spinVelocity) * dt;
      starMesh.rotation.x = Math.sin(time * 0.0018) * 0.22;
      starMesh.rotation.z = Math.cos(time * 0.0012) * 0.12;

      // Bobbing floating height
      starMesh.position.y = Math.sin(time * 0.0025) * 0.12;

      // Halo ring rotation
      haloRing.rotation.z += 0.6 * dt;
      haloRing.rotation.y += 0.4 * dt;

      // Particles orbit
      particles.rotation.y += 0.25 * dt;

      renderer.render(scene, camera);
      if (sceneRef.current) {
        sceneRef.current.reqId = requestAnimationFrame(animate);
      }
    };

    sceneRef.current = {
      renderer,
      scene,
      camera,
      starMesh,
      haloRing,
      particles,
      pointLight,
      reqId: null,
    };
    sceneRef.current.reqId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth || 100;
      const newH = container.clientHeight || 100;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    } catch (err) {
      console.warn('ThreeHeroStarCanvas WebGL init fallback:', err);
      setWebglError(true);
    }

    return () => {
      resizeObserver?.disconnect();
      if (sceneRef.current?.reqId) {
        cancelAnimationFrame(sceneRef.current.reqId);
      }
      starGeo?.dispose();
      starMat?.dispose();
      torusGeo?.dispose();
      torusMat?.dispose();
      particleGeo?.dispose();
      particleMat?.dispose();
      renderer?.dispose();
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type]);

  if (webglError) {
    const starTypeMap: Record<string, StarType> = {
      golden: 'golden',
      supernova: 'supernova',
      diamond: 'diamond',
      rainbow: 'rainbow',
      freeze: 'freeze',
    };
    return (
      <div
        onClick={onTap}
        className={`relative cursor-pointer select-none flex items-center justify-center filter drop-shadow-[0_0_24px_rgba(245,158,11,0.85)] ${className}`}
      >
        <CelestialStarGraphic
          type={starTypeMap[type] || 'golden'}
          size={84}
          isTapped={isBooped}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={onTap}
      className={`relative cursor-pointer select-none filter drop-shadow-[0_0_24px_rgba(245,158,11,0.85)] ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
