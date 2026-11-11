import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AvatarConfig } from '../types/game';

interface Props {
  avatar: AvatarConfig;
  className?: string;
  interactive?: boolean;
}

export const Avatar3DViewer: React.FC<Props> = ({
  avatar,
  className = 'w-48 h-48',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationYRef = useRef(0);
  const currentRotationYRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 200;
    const height = container.clientHeight || 200;

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
    scene.background = null; // Transparent background

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 1.35, 3.8);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Environment reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-point lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    dirLight.position.set(2.5, 4, 3);
    dirLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      dirLight.shadow.mapSize.width = 512;
      dirLight.shadow.mapSize.height = 512;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Root Group for Character
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);
    characterGroupRef.current = characterGroup;

    // Build the Procedural 3D Character
    buildProceduralAvatar(characterGroup, avatar, !isSoftwareGl);

    // Contact Shadow Ground Disc
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.01;
    scene.add(shadowMesh);

    // Mouse / Touch Drag to Rotate
    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !interactive) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      targetRotationYRef.current += deltaX * 0.012;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      // Idle subtle breathing animation
      const time = clock.getElapsedTime();
      if (characterGroupRef.current) {
        characterGroupRef.current.position.y = Math.sin(time * 2.5) * 0.025;
        // Damped rotation
        currentRotationYRef.current = THREE.MathUtils.damp(
          currentRotationYRef.current,
          targetRotationYRef.current,
          10,
          delta
        );
        characterGroupRef.current.rotation.y = currentRotationYRef.current;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 200;
      const newH = container.clientHeight || 200;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      // Clean disposal
      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, [avatar, interactive]);

  return (
    <div
      ref={mountRef}
      className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
      title={interactive ? 'Klik dan geser untuk memutar avatar 3D' : undefined}
    />
  );
};

/**
 * Procedural character builder assembling 3–12 parts:
 * Head, eyes, blush, torso, outfit details (cape, armor, reactor, etc.),
 * hair styles (from plain default to roaring legendary flames),
 * headwear (from plain baseball cap to imperial jewel crown),
 * and eyewear (from simple reading glasses to holographic scouter).
 */
function buildProceduralAvatar(group: THREE.Group, config: AvatarConfig, castShadows: boolean) {
  // Clear previous meshes
  while (group.children.length > 0) {
    const child = group.children[0];
    group.remove(child);
  }

  // Base materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.skinColor),
    roughness: 0.55,
    metalness: 0.05,
  });

  const outfitMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.outfitColor),
    roughness: 0.45,
    metalness: config.outfit === 'armor' || config.outfit === 'emperor_armor' ? 0.85 : 0.1,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.hairColor),
    roughness: 0.6,
    metalness: 0.1,
  });

  // Reusable materials
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.95,
    roughness: 0.15,
  });

  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.25,
  });

  const rubyMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.4,
    roughness: 0.1,
    emissive: 0x991b1b,
    emissiveIntensity: 0.5,
  });

  // 1. Head (Stylized rounded cube/sphere)
  const headGeo = new THREE.SphereGeometry(0.48, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.set(0, 1.25, 0);
  headMesh.scale.set(1, 1.05, 0.95);
  headMesh.castShadow = castShadows;
  group.add(headMesh);

  // 2. Eyes & Pupils
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const eyeGleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  [-0.15, 0.15].forEach((xPos) => {
    const eyeWhiteGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    eyeWhite.position.set(xPos, 1.28, 0.42);
    eyeWhite.scale.set(1, 1.2, 0.4);
    group.add(eyeWhite);

    const pupilGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const pupil = new THREE.Mesh(pupilGeo, eyePupilMat);
    pupil.position.set(xPos, 1.28, 0.45);
    pupil.scale.set(1, 1, 0.3);
    group.add(pupil);

    // Eye catchlight / gleam
    const gleamGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const gleam = new THREE.Mesh(gleamGeo, eyeGleamMat);
    gleam.position.set(xPos + 0.02, 1.30, 0.465);
    group.add(gleam);
  });

  // 3. Cute Cheeks (Blush)
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.45 });
  [-0.26, 0.26].forEach((xPos) => {
    const blushGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const blush = new THREE.Mesh(blushGeo, blushMat);
    blush.position.set(xPos, 1.18, 0.4);
    blush.scale.set(1.4, 0.7, 0.2);
    group.add(blush);
  });

  // 4. Torso / Body & Outfit specifics
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.4, 0.65, 18);
  const torsoMesh = new THREE.Mesh(torsoGeo, outfitMat);
  torsoMesh.position.set(0, 0.68, 0);
  torsoMesh.castShadow = castShadows;
  group.add(torsoMesh);

  // 5. Collar / Neckpiece
  const collarGeo = new THREE.TorusGeometry(0.32, 0.05, 12, 24);
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
  });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.98, 0);
  group.add(collar);

  // 6. Arms & Hands
  [-0.42, 0.42].forEach((xPos, idx) => {
    const armGeo = new THREE.CapsuleGeometry(0.1, 0.35, 8, 12);
    const arm = new THREE.Mesh(armGeo, outfitMat);
    arm.position.set(xPos, 0.68, 0);
    arm.rotation.z = idx === 0 ? 0.25 : -0.25;
    arm.castShadow = castShadows;
    group.add(arm);

    // Hands
    const handGeo = new THREE.SphereGeometry(0.09, 10, 10);
    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.set(idx === 0 ? xPos - 0.08 : xPos + 0.08, 0.42, 0);
    group.add(hand);
  });

  // 7. SPECIFIC OUTFIT MESHES (Distinguishing Default vs High-End Exclusive)
  if (config.outfit === 'plain_tee') {
    // DEFAULT: Simple crew-neck cotton t-shirt (already clean cylinder, no ornaments)
    const crewneck = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.03, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
    );
    crewneck.rotation.x = Math.PI / 2;
    crewneck.position.set(0, 0.98, 0);
    group.add(crewneck);
  } else if (config.outfit === 'school') {
    // DEFAULT: Plain student shirt with simple dark tie
    const tieGeo = new THREE.BoxGeometry(0.08, 0.32, 0.03);
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.76, 0.35);
    tie.rotation.x = 0.1;
    group.add(tie);
  } else if (config.outfit === 'emperor_armor') {
    // EXCLUSIVE LEGENDARY: Golden Emperor of Pythagoras Armor
    // Heavy golden chestplate with lion/diamond relief
    const crestGeo = new THREE.BoxGeometry(0.22, 0.22, 0.08);
    const crest = new THREE.Mesh(crestGeo, goldMat);
    crest.position.set(0, 0.76, 0.34);
    crest.rotation.z = Math.PI / 4;
    group.add(crest);

    const rubyGemGeo = new THREE.SphereGeometry(0.06, 10, 10);
    const rubyGem = new THREE.Mesh(rubyGemGeo, rubyMat);
    rubyGem.position.set(0, 0.76, 0.39);
    group.add(rubyGem);

    // Massive Dual Gold Shoulder Pauldrons
    [-0.45, 0.45].forEach((xPos) => {
      const pauldronGeo = new THREE.SphereGeometry(0.18, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const pauldron = new THREE.Mesh(pauldronGeo, goldMat);
      pauldron.position.set(xPos, 0.88, 0);
      pauldron.scale.set(1.2, 0.9, 1.1);
      group.add(pauldron);

      // Pauldron ruby gem
      const pGem = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), rubyMat);
      pGem.position.set(xPos, 0.94, 0.1);
      group.add(pGem);
    });

    // Regal Royal Red Velvet Cape draped down back
    const capeGeo = new THREE.PlaneGeometry(0.72, 0.85);
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 0.58, -0.36);
    cape.rotation.x = -0.15;
    group.add(cape);

    // Golden cape hem
    const hemGeo = new THREE.BoxGeometry(0.74, 0.06, 0.04);
    const hem = new THREE.Mesh(hemGeo, goldMat);
    hem.position.set(0, 0.18, -0.42);
    group.add(hem);
  } else if (config.outfit === 'galaxy_wizard') {
    // EXCLUSIVE EPIC: Celestial Wizard Robe
    // Broad flared golden astral collar
    const astralCollarGeo = new THREE.CylinderGeometry(0.48, 0.36, 0.12, 16, 1, true);
    const astralCollarMat = new THREE.MeshStandardMaterial({
      color: 0x4338ca,
      emissive: 0x312e81,
      emissiveIntensity: 0.5,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });
    const astralCollar = new THREE.Mesh(astralCollarGeo, astralCollarMat);
    astralCollar.position.set(0, 0.92, 0);
    group.add(astralCollar);

    // Glowing Star Brooch at chest
    const starCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xfacc15,
        emissiveIntensity: 1.0,
      })
    );
    starCore.position.set(0, 0.86, 0.35);
    group.add(starCore);

    // 4 Star Points
    for (let i = 0; i < 4; i++) {
      const ray = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.14, 6),
        goldMat
      );
      ray.position.set(0, 0.86, 0.35);
      ray.rotation.z = (i * Math.PI) / 2;
      group.add(ray);
    }
  } else if (config.outfit === 'cyber_exosuit') {
    // EXCLUSIVE EPIC: High-Tech Mecha Exosuit with Glowing Arc-Reactor
    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.32, 0.12),
      darkSteelMat
    );
    chestPlate.position.set(0, 0.72, 0.3);
    group.add(chestPlate);

    // Glowing Arc-Reactor in Center Chest
    const reactorRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.025, 10, 24),
      goldMat
    );
    reactorRim.position.set(0, 0.72, 0.37);
    group.add(reactorRim);

    const reactorCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.5,
        metalness: 0.2,
      })
    );
    reactorCore.rotation.x = Math.PI / 2;
    reactorCore.position.set(0, 0.72, 0.37);
    group.add(reactorCore);

    // Tech shoulder thruster guards
    [-0.44, 0.44].forEach((xPos) => {
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.15, 0.22),
        darkSteelMat
      );
      pad.position.set(xPos, 0.86, 0);
      group.add(pad);
    });
  } else if (config.outfit === 'vip_tuxedo') {
    // EXCLUSIVE PREMIUM: Millionaire VIP Tuxedo with Gold Lapels & Bowtie
    // Golden silk lapels
    [-0.1, 0.1].forEach((xPos, idx) => {
      const lapelGeo = new THREE.BoxGeometry(0.12, 0.34, 0.04);
      const lapel = new THREE.Mesh(lapelGeo, goldMat);
      lapel.position.set(xPos, 0.75, 0.34);
      lapel.rotation.z = idx === 0 ? -0.2 : 0.2;
      group.add(lapel);
    });

    // White shirt front insert
    const shirtGeo = new THREE.BoxGeometry(0.12, 0.32, 0.02);
    const shirt = new THREE.Mesh(shirtGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shirt.position.set(0, 0.75, 0.33);
    group.add(shirt);

    // Gold stud buttons
    [-0.04, 0.04].forEach((yOff) => {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), goldMat);
      btn.position.set(0, 0.72 + yOff, 0.35);
      group.add(btn);
    });

    // Satin Bowtie
    const bowCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    bowCenter.position.set(0, 0.94, 0.35);
    group.add(bowCenter);

    [-0.05, 0.05].forEach((xOff, idx) => {
      const wing = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.08, 6),
        goldMat
      );
      wing.position.set(xOff, 0.94, 0.34);
      wing.rotation.z = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
      group.add(wing);
    });
  } else if (config.outfit === 'cyber') {
    // Cyber Neon Runner jacket with glowing cyan trim
    const neonTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.45, 0.04),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.2,
      })
    );
    neonTrim.position.set(0, 0.68, 0.35);
    group.add(neonTrim);
  } else if (config.outfit === 'hoodie') {
    // Urban hoodie with hood pouch
    const pouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.16, 0.08),
      outfitMat
    );
    pouch.position.set(0, 0.52, 0.33);
    group.add(pouch);
  }

  // 8. HAIR STYLES (Default Plain vs Exclusive Legendary/Epic)
  const hairGroup = new THREE.Group();
  group.add(hairGroup);

  if (config.hairStyle === 'simple_short') {
    // DEFAULT: Very modest, clean everyday short haircut
    const capGeo = new THREE.SphereGeometry(0.495, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const cap = new THREE.Mesh(capGeo, hairMat);
    cap.position.set(0, 1.28, -0.02);
    hairGroup.add(cap);

    // Subtle sideburns
    [-0.46, 0.46].forEach((xPos) => {
      const sideburn = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.16, 0.1),
        hairMat
      );
      sideburn.position.set(xPos, 1.24, 0.08);
      hairGroup.add(sideburn);
    });
  } else if (config.hairStyle === 'spiky') {
    // DEFAULT: Simple casual spiky hair
    const baseCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.49, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      hairMat
    );
    baseCap.position.set(0, 1.27, 0);
    hairGroup.add(baseCap);

    for (let i = 0; i < 6; i++) {
      const coneGeo = new THREE.ConeGeometry(0.12, 0.28, 6);
      const cone = new THREE.Mesh(coneGeo, hairMat);
      const angle = (i / 6) * Math.PI - Math.PI / 2;
      cone.position.set(Math.sin(angle) * 0.38, 1.6 + Math.cos(angle) * 0.06, Math.cos(angle) * 0.15);
      cone.rotation.z = -angle * 0.6;
      hairGroup.add(cone);
    }
  } else if (config.hairStyle === 'flame_spikes') {
    // EXCLUSIVE LEGENDARY: Roaring Neon Flame Spikes!
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.2,
    });

    const flameTipMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfde047,
      emissiveIntensity: 1.4,
    });

    // 11 Sweeping Flaming Spikes curving upward
    const spikeConfigs = [
      { x: 0, y: 1.84, z: 0.05, h: 0.58, r: 0.16, rotZ: 0, rotX: -0.1 },
      { x: -0.22, y: 1.76, z: 0.12, h: 0.5, r: 0.14, rotZ: 0.35, rotX: 0.1 },
      { x: 0.22, y: 1.76, z: 0.12, h: 0.5, r: 0.14, rotZ: -0.35, rotX: 0.1 },
      { x: -0.36, y: 1.65, z: 0, h: 0.44, r: 0.13, rotZ: 0.65, rotX: -0.2 },
      { x: 0.36, y: 1.65, z: 0, h: 0.44, r: 0.13, rotZ: -0.65, rotX: -0.2 },
      { x: -0.18, y: 1.72, z: -0.22, h: 0.48, r: 0.13, rotZ: 0.25, rotX: -0.5 },
      { x: 0.18, y: 1.72, z: -0.22, h: 0.48, r: 0.13, rotZ: -0.25, rotX: -0.5 },
      { x: 0, y: 1.78, z: -0.25, h: 0.52, r: 0.14, rotZ: 0, rotX: -0.4 },
      { x: -0.38, y: 1.5, z: 0.18, h: 0.36, r: 0.11, rotZ: 0.8, rotX: 0.2 },
      { x: 0.38, y: 1.5, z: 0.18, h: 0.36, r: 0.11, rotZ: -0.8, rotX: 0.2 },
      { x: 0, y: 1.62, z: 0.32, h: 0.38, r: 0.12, rotZ: 0, rotX: 0.35 },
    ];

    spikeConfigs.forEach((sc) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(sc.r, sc.h, 7), flameMat);
      cone.position.set(sc.x, sc.y, sc.z);
      cone.rotation.z = sc.rotZ;
      cone.rotation.x = sc.rotX;
      hairGroup.add(cone);

      // Bright yellow flame tip
      const tip = new THREE.Mesh(new THREE.SphereGeometry(sc.r * 0.4, 6, 6), flameTipMat);
      tip.position.set(sc.x, sc.y + sc.h * 0.45, sc.z);
      hairGroup.add(tip);
    });

    // 4 Floating Fire Sparks / Embers
    [
      { x: 0.35, y: 1.95, z: 0.1 },
      { x: -0.38, y: 1.9, z: -0.1 },
      { x: 0.05, y: 2.1, z: -0.05 },
      { x: -0.1, y: 1.98, z: 0.22 },
    ].forEach((pos) => {
      const ember = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), flameTipMat);
      ember.position.set(pos.x, pos.y, pos.z);
      hairGroup.add(ember);
    });
  } else if (config.hairStyle === 'royal_curls') {
    // EXCLUSIVE EPIC: Luxurious Baroque / Renaissance Royal Cascading Curls
    const royalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.hairColor),
      roughness: 0.35,
      metalness: 0.2,
    });

    const crownCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.51, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
      royalMat
    );
    crownCap.position.set(0, 1.28, 0);
    hairGroup.add(crownCap);

    // Cascading coiffed ringlets cascading down the sides and shoulders
    [-0.38, 0.38].forEach((xPos, sideIdx) => {
      for (let j = 0; j < 4; j++) {
        const ringlet = new THREE.Mesh(
          new THREE.TorusGeometry(0.12, 0.05, 8, 16),
          royalMat
        );
        ringlet.position.set(
          sideIdx === 0 ? xPos - 0.04 : xPos + 0.04,
          1.35 - j * 0.16,
          0.1 - j * 0.03
        );
        ringlet.rotation.y = sideIdx === 0 ? 0.4 : -0.4;
        ringlet.rotation.x = Math.PI / 2;
        hairGroup.add(ringlet);
      }
    });

    // Back cascade
    for (let k = 0; k < 6; k++) {
      const curl = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        royalMat
      );
      curl.position.set((k - 2.5) * 0.12, 1.15, -0.42);
      hairGroup.add(curl);
    }
  } else if (config.hairStyle === 'dreadlocks') {
    // EXCLUSIVE EPIC: Cyberpunk Dreadlocks with Polished 24K Gold Rings
    const dreadMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.hairColor),
      roughness: 0.7,
      metalness: 0.1,
    });

    const dreadConfigs = [
      { x: -0.32, z: 0.2, rotX: 0.2, rotZ: 0.4 },
      { x: 0.32, z: 0.2, rotX: 0.2, rotZ: -0.4 },
      { x: -0.42, z: 0, rotX: 0, rotZ: 0.6 },
      { x: 0.42, z: 0, rotX: 0, rotZ: -0.6 },
      { x: -0.36, z: -0.22, rotX: -0.3, rotZ: 0.5 },
      { x: 0.36, z: -0.22, rotX: -0.3, rotZ: -0.5 },
      { x: -0.16, z: -0.38, rotX: -0.4, rotZ: 0.2 },
      { x: 0.16, z: -0.38, rotX: -0.4, rotZ: -0.2 },
    ];

    dreadConfigs.forEach((dc) => {
      const braid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.05, 0.6, 8),
        dreadMat
      );
      braid.position.set(dc.x, 1.25, dc.z);
      braid.rotation.x = dc.rotX;
      braid.rotation.z = dc.rotZ;
      hairGroup.add(braid);

      // Gold bead ring clamped on dreadlock
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.065, 0.015, 8, 16),
        goldMat
      );
      ring.position.set(dc.x * 1.05, 1.15, dc.z * 1.05);
      ring.rotation.x = dc.rotX;
      ring.rotation.z = dc.rotZ;
      hairGroup.add(ring);
    });
  } else if (config.hairStyle === 'ponytail') {
    const capGeo = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, hairMat);
    cap.position.set(0, 1.28, 0);
    hairGroup.add(cap);

    const tailGeo = new THREE.ConeGeometry(0.18, 0.55, 12);
    const tail = new THREE.Mesh(tailGeo, hairMat);
    tail.position.set(0, 1.45, -0.45);
    tail.rotation.x = -1.2;
    hairGroup.add(tail);
  } else if (config.hairStyle === 'curly') {
    for (let i = 0; i < 16; i++) {
      const puffGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const puff = new THREE.Mesh(puffGeo, hairMat);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      puff.position.set(
        Math.sin(phi) * Math.cos(theta) * 0.48,
        1.35 + Math.cos(phi) * 0.4,
        Math.sin(phi) * Math.sin(theta) * 0.48
      );
      hairGroup.add(puff);
    }
  } else if (config.hairStyle === 'bangs') {
    const capGeo = new THREE.SphereGeometry(0.51, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const cap = new THREE.Mesh(capGeo, hairMat);
    cap.position.set(0, 1.26, 0);
    hairGroup.add(cap);

    const fringeGeo = new THREE.BoxGeometry(0.55, 0.16, 0.2);
    const fringe = new THREE.Mesh(fringeGeo, hairMat);
    fringe.position.set(0, 1.5, 0.36);
    fringe.rotation.x = 0.2;
    hairGroup.add(fringe);
  } else if (config.hairStyle === 'beanie') {
    const beanieGeo = new THREE.SphereGeometry(0.52, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const beanieMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8 });
    const beanie = new THREE.Mesh(beanieGeo, beanieMat);
    beanie.position.set(0, 1.28, 0);
    hairGroup.add(beanie);

    const pompomGeo = new THREE.SphereGeometry(0.12, 10, 10);
    const pompom = new THREE.Mesh(pompomGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    pompom.position.set(0, 1.82, 0);
    hairGroup.add(pompom);
  }

  // 9. HEADWEAR (Distinguishing Default Plain vs Highly Exclusive)
  if (config.headwear === 'cap') {
    // DEFAULT: Ordinary Baseball Cap (Plain cotton)
    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.85 })
    );
    capDome.position.set(0, 1.28, 0);
    group.add(capDome);

    // Forward visor peak
    const visorGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.03, 16, 1, false, -Math.PI / 4, Math.PI / 2);
    const visor = new THREE.Mesh(
      visorGeo,
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.85 })
    );
    visor.position.set(0, 1.44, 0.22);
    visor.rotation.x = 0.15;
    group.add(visor);

    // Top fabric button
    const btn = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    btn.position.set(0, 1.78, 0);
    group.add(btn);
  } else if (config.headwear === 'crown') {
    // EXCLUSIVE LEGENDARY: Imperial Gold Crown with Rubies and Spikes!
    const crownGroup = new THREE.Group();

    // 24K Gold Base Rim
    const rimGeo = new THREE.CylinderGeometry(0.48, 0.46, 0.14, 24);
    const rim = new THREE.Mesh(rimGeo, goldMat);
    rim.position.y = 1.74;
    crownGroup.add(rim);

    // Red velvet imperial cap inside
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.44, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.6 })
    );
    cap.position.y = 1.72;
    crownGroup.add(cap);

    // 5 Ornate Golden Spikes around crown
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 6), goldMat);
      spike.position.set(Math.sin(angle) * 0.44, 1.92, Math.cos(angle) * 0.44);
      crownGroup.add(spike);

      // Ruby gemstone on each spike tip
      const ruby = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), rubyMat);
      ruby.position.set(Math.sin(angle) * 0.44, 2.05, Math.cos(angle) * 0.44);
      crownGroup.add(ruby);
    }

    // Center Golden Royal Cross
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), goldMat);
    crossV.position.set(0, 2.04, 0.44);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), goldMat);
    crossH.position.set(0, 2.08, 0.44);
    crownGroup.add(crossV, crossH);

    group.add(crownGroup);
  } else if (config.headwear === 'dragon_horns') {
    // EXCLUSIVE EPIC: Cyber Mecha Dragon Horns with Glowing Red Plasma
    [-0.28, 0.28].forEach((xPos, idx) => {
      const hornGroup = new THREE.Group();

      // Base cyber socket
      const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.1, 10), darkSteelMat);
      socket.position.set(xPos, 1.68, 0);
      hornGroup.add(socket);

      // Segmented curved horn
      for (let s = 0; s < 4; s++) {
        const seg = new THREE.Mesh(
          new THREE.ConeGeometry(0.08 - s * 0.015, 0.22, 6),
          s % 2 === 0
            ? darkSteelMat
            : new THREE.MeshStandardMaterial({
                color: 0xef4444,
                emissive: 0xef4444,
                emissiveIntensity: 1.2,
              })
        );
        seg.position.set(
          idx === 0 ? xPos - s * 0.06 : xPos + s * 0.06,
          1.78 + s * 0.12,
          -s * 0.1
        );
        seg.rotation.z = idx === 0 ? 0.35 + s * 0.1 : -0.35 - s * 0.1;
        seg.rotation.x = -0.4 - s * 0.1;
        hornGroup.add(seg);
      }

      group.add(hornGroup);
    });
  } else if (config.headwear === 'halo') {
    // EXCLUSIVE EPIC: Radiant Seraphim Double Halo
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.1,
      roughness: 0.1,
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 16, 32), haloMat);
    halo.rotation.x = Math.PI / 2 - 0.2;
    halo.position.set(0, 1.95, -0.05);
    group.add(halo);

    // Inner secondary radiant halo ring
    const innerHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.02, 12, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfef08a,
        emissiveIntensity: 1.3,
      })
    );
    innerHalo.rotation.x = Math.PI / 2 - 0.2;
    innerHalo.position.set(0, 1.95, -0.05);
    group.add(innerHalo);
  } else if (config.headwear === 'visor') {
    // EXCLUSIVE PREMIUM: Holographic Quantum Visor
    const visorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.18, 20, 1, false, 0, Math.PI);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.y = -Math.PI / 2;
    visor.position.set(0, 1.3, 0.1);
    group.add(visor);

    // Glowing visor HUD line
    const hudLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.02, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x22d3ee, emissiveIntensity: 1.5 })
    );
    hudLine.position.set(0, 1.3, 0.48);
    group.add(hudLine);
  } else if (config.headwear === 'catears') {
    // EXCLUSIVE PREMIUM: Robotic Mecha Cat Ears with Glowing Neon RGB
    [-0.3, 0.3].forEach((xPos, i) => {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.35, 4),
        darkSteelMat
      );
      ear.position.set(xPos, 1.78, 0.08);
      ear.rotation.z = i === 0 ? 0.3 : -0.3;
      group.add(ear);

      // Glowing Neon Pink/Magenta LED Inner Triangle
      const innerEar = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.24, 4),
        new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xec4899,
          emissiveIntensity: 1.2,
        })
      );
      innerEar.position.set(xPos, 1.77, 0.14);
      innerEar.rotation.z = i === 0 ? 0.3 : -0.3;
      group.add(innerEar);
    });
  } else if (config.headwear === 'tophat') {
    // EXCLUSIVE PREMIUM: Aristocrat Gold-Trimmed Silk Top Hat
    const hatGroup = new THREE.Group();
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 24), darkSteelMat);
    brim.position.y = 1.7;

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.5, 24), darkSteelMat);
    crown.position.y = 1.95;

    // Gold ribbon band
    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.1, 24), goldMat);
    ribbon.position.y = 1.75;

    hatGroup.add(brim, crown, ribbon);
    group.add(hatGroup);
  } else if (config.headwear === 'headset') {
    // EXCLUSIVE STANDARD: RGB Pro Gamer Headset
    const bandGeo = new THREE.TorusGeometry(0.52, 0.05, 12, 24, Math.PI);
    const headsetMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.2 });
    const band = new THREE.Mesh(bandGeo, headsetMat);
    band.rotation.z = Math.PI;
    band.rotation.x = Math.PI / 2;
    band.position.set(0, 1.28, 0);
    group.add(band);

    [-0.52, 0.52].forEach((xPos) => {
      const earCup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16), headsetMat);
      earCup.rotation.z = Math.PI / 2;
      earCup.position.set(xPos, 1.28, 0);
      group.add(earCup);

      // Glowing RGB LED ring on ear cup
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.015, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.2 })
      );
      ring.position.set(xPos > 0 ? xPos + 0.06 : xPos - 0.06, 1.28, 0);
      ring.rotation.y = Math.PI / 2;
      group.add(ring);
    });
  }

  // 10. EYEWEAR (Default Ordinary vs Highly Exclusive)
  if (config.eyewear === 'simple_glasses') {
    // DEFAULT: Plain modest wire reading glasses
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.4, roughness: 0.6 });
    [-0.16, 0.16].forEach((xPos) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 16), wireMat);
      ring.position.set(xPos, 1.28, 0.46);
      group.add(ring);
    });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.015), wireMat);
    bridge.position.set(0, 1.28, 0.47);
    group.add(bridge);
  } else if (config.eyewear === 'cyber_eye') {
    // EXCLUSIVE LEGENDARY: Holographic Dragon-Ball / Cyberpunk Scouter!
    const scouterGroup = new THREE.Group();

    // Ear bracket
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.12), darkSteelMat);
    bracket.position.set(0.5, 1.28, 0.1);
    scouterGroup.add(bracket);

    // Curved connector arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), darkSteelMat);
    arm.position.set(0.38, 1.28, 0.35);
    scouterGroup.add(arm);

    // Glowing Neon Cyan/Green Holo Lens over Eye
    const holoLensMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8,
    });
    const holoLens = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.02), holoLensMat);
    holoLens.position.set(0.17, 1.28, 0.48);
    holoLens.rotation.y = -0.15;
    scouterGroup.add(holoLens);

    // Concentric HUD Targeting Ring
    const reticle = new THREE.Mesh(
      new THREE.TorusGeometry(0.05, 0.01, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 1.5 })
    );
    reticle.position.set(0.17, 1.28, 0.5);
    scouterGroup.add(reticle);

    group.add(scouterGroup);
  } else if (config.eyewear === 'gold_shades') {
    // EXCLUSIVE EPIC: Sultan VIP 24K Gold Aviator Sunglasses
    const goldGlassesGroup = new THREE.Group();
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.05, metalness: 0.95 });

    [-0.17, 0.17].forEach((xPos) => {
      // Golden Rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 20), goldMat);
      rim.position.set(xPos, 1.29, 0.48);
      goldGlassesGroup.add(rim);

      // Jet-Black Mirror Lens
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(xPos, 1.29, 0.47);
      goldGlassesGroup.add(lens);
    });

    // Double Golden Brow Bar
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.025), goldMat);
    topBar.position.set(0, 1.38, 0.49);
    const bridgeBar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.025), goldMat);
    bridgeBar.position.set(0, 1.3, 0.49);
    goldGlassesGroup.add(topBar, bridgeBar);

    group.add(goldGlassesGroup);
  } else if (config.eyewear === 'goggles') {
    // EXCLUSIVE EPIC: Steampunk Brass Gear Goggles
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    [-0.17, 0.17].forEach((xPos) => {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.08, 16), brassMat);
      cyl.rotation.x = Math.PI / 2;
      cyl.position.set(xPos, 1.28, 0.48);
      group.add(cyl);

      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.85 })
      );
      glass.rotation.x = Math.PI / 2;
      glass.position.set(xPos, 1.28, 0.52);
      group.add(glass);
    });
    // Strap around head
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.03, 8, 24), darkSteelMat);
    strap.rotation.x = Math.PI / 2;
    strap.position.set(0, 1.28, 0);
    group.add(strap);
  } else if (config.eyewear === 'monocle') {
    // EXCLUSIVE PREMIUM: Aristocrat Golden Monocle with Chain
    const monocle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 10, 20), goldMat);
    monocle.position.set(0.17, 1.28, 0.48);
    group.add(monocle);

    // Hanging delicate golden chain
    const chain = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.25, 0.015), goldMat);
    chain.position.set(0.26, 1.14, 0.46);
    chain.rotation.z = -0.2;
    group.add(chain);
  } else if (config.eyewear === 'sunglasses') {
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2, metalness: 0.8 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.1, metalness: 0.9 });

    [-0.17, 0.17].forEach((xPos) => {
      const lensGeo = new THREE.BoxGeometry(0.2, 0.12, 0.04);
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(xPos, 1.3, 0.48);
      glassesGroup.add(lens);
    });

    const bridgeGeo = new THREE.BoxGeometry(0.14, 0.03, 0.03);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.position.set(0, 1.32, 0.48);
    glassesGroup.add(bridge);

    group.add(glassesGroup);
  } else if (config.eyewear === 'nerd') {
    const glassesGroup = new THREE.Group();
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
    [-0.17, 0.17].forEach((xPos) => {
      const ringGeo = new THREE.TorusGeometry(0.1, 0.02, 10, 20);
      const ring = new THREE.Mesh(ringGeo, wireMat);
      ring.position.set(xPos, 1.28, 0.48);
      glassesGroup.add(ring);
    });
    group.add(glassesGroup);
  }
}
