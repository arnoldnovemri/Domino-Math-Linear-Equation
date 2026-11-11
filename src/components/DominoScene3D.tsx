import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArenaTheme } from '../types/themes';

interface Props {
  theme: ArenaTheme;
  className?: string;
}

export const DominoScene3D: React.FC<Props> = ({ theme, className = 'w-full h-full' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // Detect software GL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 5.8, 6.2);
    camera.lookAt(0, 0, 0.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Procedural Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-point Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -6;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color(theme.ambientColor), 1.6);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Outer Wooden Table Frame (Beveled composite model)
    const tableFrameGeo = new THREE.BoxGeometry(9.6, 0.45, 5.6);
    const tableFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e1510,
      roughness: 0.35,
      metalness: 0.15,
    });
    const tableFrame = new THREE.Mesh(tableFrameGeo, tableFrameMat);
    tableFrame.position.set(0, -0.22, 0);
    tableFrame.receiveShadow = !isSoftwareGl;
    rootGroup.add(tableFrame);

    // 2. Brass Corner Brackets
    const bracketMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const cornerOffsets = [
      [-4.7, -2.7],
      [4.7, -2.7],
      [-4.7, 2.7],
      [4.7, 2.7],
    ];
    cornerOffsets.forEach(([x, z]) => {
      const bracketGeo = new THREE.BoxGeometry(0.35, 0.46, 0.35);
      const bracket = new THREE.Mesh(bracketGeo, bracketMat);
      bracket.position.set(x, -0.21, z);
      rootGroup.add(bracket);
    });

    // 3. Recessed 3D Felt Playing Surface
    const feltColor = new THREE.Color(theme.tableSurfaceColor);
    const feltGeo = new THREE.BoxGeometry(9.0, 0.05, 5.0);
    const feltMat = new THREE.MeshStandardMaterial({
      color: feltColor,
      roughness: 0.85,
      metalness: 0.05,
    });
    const felt = new THREE.Mesh(feltGeo, feltMat);
    felt.position.set(0, 0.02, 0);
    felt.receiveShadow = !isSoftwareGl;
    rootGroup.add(felt);

    // 4. Subtle Inner Inlay Border (Gold / Neon line)
    const inlayGeo = new THREE.RingGeometry(2.2, 2.24, 4);
    const inlayMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(theme.accentColor),
      emissive: new THREE.Color(theme.accentColor),
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.8,
    });
    const inlay = new THREE.Mesh(inlayGeo, inlayMat);
    inlay.rotation.x = -Math.PI / 2;
    inlay.position.set(0, 0.055, 0);
    inlay.scale.set(1.9, 1.0, 1.0);
    rootGroup.add(inlay);

    // 5. Floating Dust / Ambient Theme Sparkles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = Math.random() * 4 + 0.2;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(theme.accentColor),
      size: 0.1,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particleSystem);

    // Mouse movement subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Subtle parallax camera damping
      const targetCamX = mouseX * 0.4;
      const targetCamY = 5.8 - mouseY * 0.3;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3, delta);
      camera.lookAt(0, 0, 0.3);

      // Rotate particles gently
      particleSystem.rotation.y = time * 0.08;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [theme]);

  return <div ref={mountRef} className={`relative overflow-hidden ${className}`} />;
};
