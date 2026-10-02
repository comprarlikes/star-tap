import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShopItem } from '../types';

interface ThreeSkinViewerProps {
  item: ShopItem;
  autoRotate: boolean;
  zoomLevel: number;
  testBurst: boolean;
  onPointerStateChange?: (isInteracting: boolean) => void;
}

export const ThreeSkinViewer: React.FC<ThreeSkinViewerProps> = ({
  item,
  autoRotate,
  zoomLevel,
  testBurst,
  onPointerStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInteractingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const rotVelRef = useRef({ x: 0, y: 0 });
  const rotAngleRef = useRef({ x: 0.2, y: 0.4 });
  const shockwavesRef = useRef<THREE.Mesh[]>([]);

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 280;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 5.0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Extract Item Color
    const itemColorHex = item.color || '#06b6d4';
    const threeColor = new THREE.Color(itemColorHex);

    // 4. Create Main 3D Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Helper: Create Text Texture for Avatars/Icons
    const createIconCanvasTexture = (iconText: string, bgHex: string) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Deep cyber backdrop
        const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
        grad.addColorStop(0, bgHex);
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Cyber circuit lines
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(256, 256, 220, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '220px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconText, 256, 270);
      }
      return new THREE.CanvasTexture(c);
    };

    let mainMesh: THREE.Object3D;

    if (item.type === 'avatar' || item.type === 'character') {
      // 3D Holographic Medallion / Trophy with embossed icon
      const medalGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.28, 48);
      medalGeo.rotateX(Math.PI / 2);

      const iconTex = createIconCanvasTexture(item.icon, itemColorHex);
      const matFace = new THREE.MeshStandardMaterial({
        map: iconTex,
        metalness: 0.5,
        roughness: 0.2,
      });
      const matRim = new THREE.MeshStandardMaterial({
        color: threeColor,
        emissive: threeColor.clone().multiplyScalar(0.4),
        metalness: 0.9,
        roughness: 0.1,
      });

      mainMesh = new THREE.Mesh(medalGeo, [matRim, matFace, matFace]);
      modelGroup.add(mainMesh);

      // Add a crown / crest ring
      const crestGeo = new THREE.TorusGeometry(1.4, 0.05, 12, 48);
      const crestMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0x854d0e,
        metalness: 0.95,
        roughness: 0.1,
      });
      const crest = new THREE.Mesh(crestGeo, crestMat);
      crest.rotation.x = Math.PI / 2;
      modelGroup.add(crest);
    } else {
      // Star Skin or Theme: High quality Extruded 5-pointed Star with Diamond facets
      const starShape = new THREE.Shape();
      const numPoints = 5;
      const outerR = 1.35;
      const innerR = 0.62;

      for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / numPoints - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) starShape.moveTo(x, y);
        else starShape.lineTo(x, y);
      }
      starShape.closePath();

      const starGeo = new THREE.ExtrudeGeometry(starShape, {
        depth: 0.35,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.14,
        bevelThickness: 0.18,
      });
      starGeo.center();

      const starMat = new THREE.MeshStandardMaterial({
        color: threeColor,
        emissive: threeColor.clone().multiplyScalar(0.35),
        metalness: 0.85,
        roughness: 0.15,
      });

      mainMesh = new THREE.Mesh(starGeo, starMat);
      modelGroup.add(mainMesh);
    }

    // 5. 3D Holographic Pedestal
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -1.6;
    scene.add(pedestalGroup);

    // Base cylinder
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    pedestalGroup.add(baseMesh);

    // Glowing emitter ring on top of base
    const emitterGeo = new THREE.RingGeometry(1.2, 1.5, 32);
    emitterGeo.rotateX(-Math.PI / 2);
    const emitterMat = new THREE.MeshBasicMaterial({
      color: threeColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const emitterMesh = new THREE.Mesh(emitterGeo, emitterMat);
    emitterMesh.position.y = 0.11;
    pedestalGroup.add(emitterMesh);

    // Orbiting Torus Rings
    const ring1Geo = new THREE.TorusGeometry(1.8, 0.025, 8, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: threeColor,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2.3;
    pedestalGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.4, 0.02, 8, 36);
    const ring2 = new THREE.Mesh(ring2Geo, ring1Mat);
    ring2.rotation.x = -Math.PI / 2.8;
    pedestalGroup.add(ring2);

    // 6. Ambient 3D Cosmic Dust Swarm
    const dustCount = 45;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 4.5;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 7. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(threeColor, 1.8);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 2.5, 8);
    rimLight.position.set(0, 2, 2);
    scene.add(rimLight);

    // 8. Shockwave Ring function
    const triggerShockwave = () => {
      const shockGeo = new THREE.RingGeometry(0.2, 0.35, 32);
      shockGeo.rotateX(Math.PI / 2);
      const shockMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const shockMesh = new THREE.Mesh(shockGeo, shockMat);
      shockMesh.position.y = 0;
      scene.add(shockMesh);
      shockwavesRef.current.push(shockMesh);
    };

    // 9. Pointer drag handlers
    const onPointerDown = (e: PointerEvent) => {
      isInteractingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      onPointerStateChange?.(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isInteractingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      rotVelRef.current.y += dx * 0.007;
      rotVelRef.current.x += dy * 0.005;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isInteractingRef.current = false;
      onPointerStateChange?.(false);
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 10. Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Apply velocity and inertia
      rotAngleRef.current.y += rotVelRef.current.y;
      rotAngleRef.current.x += rotVelRef.current.x;
      rotVelRef.current.x *= 0.92;
      rotVelRef.current.y *= 0.92;

      // Clamp X tilt
      rotAngleRef.current.x = Math.max(-0.6, Math.min(0.6, rotAngleRef.current.x));

      // Auto rotation when idle
      if (autoRotateRef.current && !isInteractingRef.current) {
        rotAngleRef.current.y += dt * 0.95;
      }

      // Apply angles to model
      modelGroup.rotation.y = rotAngleRef.current.y;
      modelGroup.rotation.x = rotAngleRef.current.x;

      // Floating bobbing
      modelGroup.position.y = Math.sin(time * 0.0022) * 0.12;

      // Pedestal rings rotation
      ring1.rotation.z += 0.8 * dt;
      ring2.rotation.z -= 0.6 * dt;
      dustPoints.rotation.y += 0.15 * dt;

      // Animate shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.scale.multiplyScalar(1 + dt * 4);
        const mat = sw.material as THREE.MeshBasicMaterial;
        mat.opacity -= dt * 1.5;
        if (mat.opacity <= 0.01) {
          scene.remove(sw);
          sw.geometry.dispose();
          mat.dispose();
          shockwavesRef.current.splice(i, 1);
        }
      }

      // Camera Zoom Lerp
      const targetZ = 5.0 / zoomRef.current;
      camera.position.z += (targetZ - camera.position.z) * 0.15;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // Listen to test burst changes
    if (testBurst) {
      triggerShockwave();
    }

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 300;
      const nh = container.clientHeight || 280;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Clean up shockwaves
      shockwavesRef.current.forEach((sw) => {
        scene.remove(sw);
        sw.geometry.dispose();
        (sw.material as THREE.Material).dispose();
      });
      shockwavesRef.current = [];

      baseGeo.dispose();
      baseMat.dispose();
      emitterGeo.dispose();
      emitterMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring1Mat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [item]);

  // Trigger shockwave when testBurst changes to true
  useEffect(() => {
    if (testBurst) {
      rotVelRef.current.y += 0.8;
    }
  }, [testBurst]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none relative"
      style={{ touchAction: 'none' }}
    />
  );
};
