import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AvatarConfig } from '../types/game';

interface Props {
  avatar: AvatarConfig;
  isHumanTurn: boolean;
  isDragging: boolean;
  className?: string;
}

/**
 * First Person View 3D arms and hands resting on table edge and gesturing
 * with realistic procedural materials reflecting the player's avatar configuration.
 */
export const PlayerFirstPerson3D: React.FC<Props> = ({
  avatar,
  isHumanTurn,
  isDragging,
  className = 'w-full h-24 md:h-28',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const armsGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 120;

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
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    // Positioned as if eyes looking down towards table
    camera.position.set(0, 1.1, 1.4);
    camera.lookAt(0, 0.1, 0);

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

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    dirLight.position.set(1.5, 3, 2);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-2, 1, -1);
    scene.add(rimLight);

    // Arms Root Group
    const armsGroup = new THREE.Group();
    scene.add(armsGroup);
    armsGroupRef.current = armsGroup;

    // Skin Material
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(avatar.skinColor),
      roughness: 0.55,
      metalness: 0.05,
    });

    // Outfit Material
    const outfitMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(avatar.outfitColor),
      roughness: 0.5,
      metalness:
        avatar.outfit === 'armor' || avatar.outfit === 'emperor_armor'
          ? 0.9
          : avatar.outfit === 'cyber_exosuit'
          ? 0.7
          : 0.1,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.95,
      roughness: 0.15,
    });

    // Build Left Arm and Right Arm
    const buildArm = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      const xSign = isLeft ? -1 : 1;

      // Forearm / Sleeve
      const sleeveGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 16);
      const sleeve = new THREE.Mesh(sleeveGeo, outfitMat);
      sleeve.position.set(xSign * 0.75, 0.35, 0.45);
      sleeve.rotation.x = 1.1; // Reaching forward
      sleeve.rotation.z = xSign * -0.4;
      armGroup.add(sleeve);

      // Outfit-specific arm adornments
      if (avatar.outfit === 'emperor_armor') {
        // Golden gauntlet plate & ruby stud
        const gauntlet = new THREE.Mesh(
          new THREE.TorusGeometry(0.14, 0.03, 8, 16),
          goldMat
        );
        gauntlet.position.set(xSign * 0.65, 0.15, 0.15);
        gauntlet.rotation.x = 1.1;
        armGroup.add(gauntlet);
      } else if (avatar.outfit === 'cyber_exosuit') {
        // Glowing cyan energy line
        const neonRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.13, 0.02, 8, 16),
          new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x06b6d4,
            emissiveIntensity: 1.5,
          })
        );
        neonRing.position.set(xSign * 0.65, 0.15, 0.15);
        neonRing.rotation.x = 1.1;
        armGroup.add(neonRing);
      } else if (avatar.outfit === 'vip_tuxedo') {
        // White shirt cuff & gold cufflink
        const cuff = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        cuff.position.set(xSign * 0.64, 0.12, 0.12);
        cuff.rotation.x = 1.1;
        armGroup.add(cuff);

        const cufflink = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), goldMat);
        cufflink.position.set(xSign * 0.76, 0.13, 0.12);
        armGroup.add(cufflink);
      }

      // Hand Palm
      const handGeo = new THREE.BoxGeometry(0.18, 0.07, 0.22);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.set(xSign * 0.52, 0.05, -0.05);
      hand.rotation.y = xSign * 0.2;
      hand.rotation.x = -0.1;
      armGroup.add(hand);

      // Fingers resting on the wooden table edge
      for (let f = 0; f < 4; f++) {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.022, 0.1, 6, 8),
          skinMat
        );
        finger.position.set(
          xSign * 0.52 + (f - 1.5) * 0.045,
          0.04,
          -0.18
        );
        finger.rotation.x = 0.4; // Curved slightly over edge
        armGroup.add(finger);
      }

      // Thumb
      const thumb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.025, 0.08, 6, 8),
        skinMat
      );
      thumb.position.set(xSign * (0.52 - xSign * 0.08), 0.06, -0.08);
      thumb.rotation.z = xSign * -0.5;
      thumb.rotation.y = xSign * -0.4;
      armGroup.add(thumb);

      return armGroup;
    };

    const leftArm = buildArm(true);
    const rightArm = buildArm(false);
    armsGroup.add(leftArm, rightArm);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Subtle breathing motion of arms resting on table
      if (armsGroupRef.current) {
        const targetLift = isDragging ? 0.08 : isHumanTurn ? 0.03 : 0;
        armsGroupRef.current.position.y =
          Math.sin(time * 2.2) * 0.012 + targetLift;
        armsGroupRef.current.position.z =
          Math.cos(time * 1.5) * 0.01 + (isDragging ? -0.1 : 0);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 400;
      const newH = container.clientHeight || 120;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [avatar, isHumanTurn, isDragging]);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none select-none relative overflow-hidden ${className}`}
      title="Tangan dan Lengan Pemain (First Person View 3D)"
    />
  );
};
