import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Spring2DState,
  createSpring2DState,
  stepSpring2D,
  applyDragDisplacement,
  applyFlickImpulse,
} from '../utils/physics';
import { soundEngine } from '../utils/soundEngine';

export type TileKey = 'mainHero' | 'travelBadge' | 'react' | 'ts' | 'next';

interface ThreeStageProps {
  workPinProgressRef: React.MutableRefObject<number>;
  onTileHoverChange: (hovering: boolean, isDragging: boolean) => void;
  onTileInteraction?: (tileKey: TileKey) => void;
  pulseCount: number;
}

function createSquircleGeometry(size = 1, depth = 0.22, radius = 0.26): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const half = size / 2;
  const r = radius * size;

  shape.moveTo(-half + r, -half);
  shape.lineTo(half - r, -half);
  shape.quadraticCurveTo(half, -half, half, -half + r);
  shape.lineTo(half, half - r);
  shape.quadraticCurveTo(half, half, half - r, half);
  shape.lineTo(-half + r, half);
  shape.quadraticCurveTo(-half, half, -half, half - r);
  shape.lineTo(-half, -half + r);
  shape.quadraticCurveTo(-half, -half, -half + r, -half);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 1,
    bevelSize: 0.048 * size,
    bevelThickness: 0.048 * size,
    curveSegments: 28,
  });
  geo.center();
  return geo;
}

function createIconTexture(type: string, maxAnisotropy: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 512, 512);
    ctx.save();
    ctx.translate(256, 256);

    if (type === 'gold-emblem') {
      const grad = ctx.createLinearGradient(-115, -45, 115, 65);
      grad.addColorStop(0, '#b3842d');
      grad.addColorStop(0.5, '#fae588');
      grad.addColorStop(1, '#9e6f1e');

      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0,0,0,0.28)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;

      // Top Gold Trapezoid Bar
      ctx.beginPath();
      ctx.moveTo(-120, -36);
      ctx.lineTo(120, -36);
      ctx.lineTo(78, 22);
      ctx.lineTo(-78, 22);
      ctx.closePath();
      ctx.fill();

      // Bottom Gold Diamond
      ctx.beginPath();
      ctx.moveTo(-34, 42);
      ctx.lineTo(34, 42);
      ctx.lineTo(0, 78);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'react') {
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 17;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.ellipse(0, 0, 130, 50, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'ts') {
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(-125, -125, 250, 250, 44);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 124px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TS', 0, 8);
    } else if (type === 'next') {
      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(0, 0, 135, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-48, 58);
      ctx.lineTo(-48, -58);
      ctx.lineTo(56, 68);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(46, -58);
      ctx.lineTo(46, 20);
      ctx.stroke();
    }

    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(maxAnisotropy, 8);
  return tex;
}

export const ThreeStage: React.FC<ThreeStageProps> = ({
  workPinProgressRef,
  onTileHoverChange,
  onTileInteraction,
  pulseCount,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onTileHoverChangeRef = useRef(onTileHoverChange);
  const onTileInteractionRef = useRef(onTileInteraction);
  const springsRef = useRef<Record<TileKey, Spring2DState>>({
    mainHero: createSpring2DState(),
    travelBadge: createSpring2DState(),
    react: createSpring2DState(),
    ts: createSpring2DState(),
    next: createSpring2DState(),
  });

  useEffect(() => {
    onTileHoverChangeRef.current = onTileHoverChange;
    onTileInteractionRef.current = onTileInteraction;
  }, [onTileHoverChange, onTileInteraction]);

  // Trigger synchronized spring physics impulse when pulseCount increments
  useEffect(() => {
    if (pulseCount === 0) return;
    const keys: TileKey[] = ['mainHero', 'travelBadge', 'react', 'ts', 'next'];
    keys.forEach((k, idx) => {
      const angle = (idx / keys.length) * Math.PI * 2 + 0.4;
      const speed = k === 'mainHero' ? 6.5 : 8.5;
      springsRef.current[k] = applyFlickImpulse(
        springsRef.current[k],
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (idx % 2 === 0 ? 1 : -1) * 7.2
      );
    });
    soundEngine.playSpringSnap();
  }, [pulseCount]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL per threejs skill
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
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.domElement.id = 'webgl-canvas';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x26221e, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.45);
    keyLight.position.set(4, 7, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffe4c4, 0.7);
    fillLight.position.set(-6, -4, 6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.55);
    rimLight.position.set(0, -6, -4);
    scene.add(rimLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const disposables: Array<{ dispose: () => void }> = [];

    function create3DTile({
      key,
      type,
      bodyColor,
      size = 1,
    }: {
      key: TileKey;
      type: string;
      bodyColor: number;
      size?: number;
    }): THREE.Group {
      const group = new THREE.Group();
      group.userData.tileKey = key;

      // 1. Primary Silhouette: Extruded Beveled Squircle Body
      const bodyGeo = createSquircleGeometry(size, 0.22 * size, 0.25);
      const isDark = bodyColor === 0x151515;
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: isDark ? 0.28 : 0.2,
        metalness: isDark ? 0.35 : 0.08,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.userData.tileKey = key;
      group.add(bodyMesh);

      // 2. Secondary Read: Metallic Rear Bezel Trim Plate
      const trimGeo = createSquircleGeometry(size * 0.92, 0.04 * size, 0.25);
      const trimMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0xd4af37 : 0xd4d4d8,
        roughness: 0.48,
        metalness: 0.72,
      });
      const trimMesh = new THREE.Mesh(trimGeo, trimMat);
      trimMesh.position.z = -0.12 * size;
      trimMesh.userData.tileKey = key;
      group.add(trimMesh);

      // 3. Accent Detail: Crisp Front Icon Decal Plate
      const planeSize = size * 0.78;
      const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
      const iconTex = createIconTexture(type, maxAnisotropy);
      const frontMat = new THREE.MeshBasicMaterial({
        map: iconTex,
        transparent: true,
        depthWrite: false,
      });
      const frontPlate = new THREE.Mesh(planeGeo, frontMat);
      frontPlate.position.z = (0.11 + 0.049) * size + 0.005;
      frontPlate.userData.tileKey = key;
      group.add(frontPlate);

      disposables.push(bodyGeo, bodyMat, trimGeo, trimMat, planeGeo, iconTex, frontMat);
      return group;
    }

    const tiles: Record<TileKey, THREE.Group> = {
      mainHero: create3DTile({ key: 'mainHero', type: 'gold-emblem', bodyColor: 0x151515, size: 2.2 }),
      travelBadge: create3DTile({ key: 'travelBadge', type: 'gold-emblem', bodyColor: 0xffffff, size: 1.0 }),
      react: create3DTile({ key: 'react', type: 'react', bodyColor: 0xffffff, size: 1.0 }),
      ts: create3DTile({ key: 'ts', type: 'ts', bodyColor: 0xffffff, size: 1.0 }),
      next: create3DTile({ key: 'next', type: 'next', bodyColor: 0xffffff, size: 1.0 }),
    };

    const tileGroups = Object.values(tiles);
    tileGroups.forEach((t) => scene.add(t));

    // Pre-allocated Raycaster & Vectors (Zero GC in render loop)
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    const dragStartWorld = new THREE.Vector3();

    let activeDragKey: TileKey | null = null;
    let isHoveringTile = false;
    let lastHoverRaycastTime = 0;
    let lastDragTimestamp = performance.now();

    function getWorldPointFromClient(clientX: number, clientY: number, out: THREE.Vector3): THREE.Vector3 {
      pointerNDC.x = (clientX / window.innerWidth) * 2 - 1;
      pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      raycaster.ray.intersectPlane(dragPlane, out);
      return out;
    }

    function pickTileAtClient(clientX: number, clientY: number): TileKey | null {
      pointerNDC.x = (clientX / window.innerWidth) * 2 - 1;
      pointerNDC.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      const visibleGroups = tileGroups.filter((g) => g.visible);
      const hits = raycaster.intersectObjects(visibleGroups, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) {
          if (obj.userData?.tileKey) {
            return obj.userData.tileKey as TileKey;
          }
          obj = obj.parent;
        }
      }
      return null;
    }

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      // Do not steal clicks from interactive DOM controls or open drawers
      const target = e.target as HTMLElement | null;
      if (target && target.closest('a, button, input, textarea, select, [role="dialog"]')) {
        return;
      }

      const hitKey = pickTileAtClient(e.clientX, e.clientY);
      if (!hitKey) return;

      activeDragKey = hitKey;
      lastDragTimestamp = performance.now();
      getWorldPointFromClient(e.clientX, e.clientY, dragStartWorld);
      // Offset drag start by existing spring offset so re-grabbing is seamless
      dragStartWorld.x -= springsRef.current[hitKey].x;
      dragStartWorld.y -= springsRef.current[hitKey].y;

      springsRef.current[hitKey] = {
        ...springsRef.current[hitKey],
        isDragging: true,
      };

      soundEngine.playClick(460, 0.025);
      onTileHoverChangeRef.current(true, true);
      onTileInteractionRef.current?.(hitKey);
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      const now = performance.now();

      if (activeDragKey) {
        const dt = (now - lastDragTimestamp) / 1000;
        lastDragTimestamp = now;
        getWorldPointFromClient(e.clientX, e.clientY, intersectPoint);
        const offsetX = intersectPoint.x - dragStartWorld.x;
        const offsetY = intersectPoint.y - dragStartWorld.y;

        springsRef.current[activeDragKey] = applyDragDisplacement(
          springsRef.current[activeDragKey],
          offsetX,
          offsetY,
          dt
        );
        return;
      }

      // Throttled hover raycast (20fps max)
      if (now - lastHoverRaycastTime > 50) {
        lastHoverRaycastTime = now;
        const target = e.target as HTMLElement | null;
        if (target && target.closest('a, button, input, textarea, [role="dialog"], .work-floating-card')) {
          if (isHoveringTile) {
            isHoveringTile = false;
            onTileHoverChangeRef.current(false, false);
          }
          return;
        }
        const hoveredKey = pickTileAtClient(e.clientX, e.clientY);
        const nextHover = Boolean(hoveredKey);
        if (nextHover !== isHoveringTile) {
          isHoveringTile = nextHover;
          onTileHoverChangeRef.current(isHoveringTile, false);
        }
      }
    };

    const handlePointerUp = () => {
      if (!activeDragKey) return;
      const key = activeDragKey;
      const current = springsRef.current[key];
      // Even a quick click imparts a satisfying rotational & vertical spring pop
      const minImpulseY = Math.abs(current.vx) + Math.abs(current.vy) < 0.4 ? 3.2 : 0;
      springsRef.current[key] = applyFlickImpulse(
        current,
        current.vx * 0.35,
        current.vy * 0.35 + minImpulseY,
        5.2
      );
      activeDragKey = null;
      soundEngine.playSpringSnap();
      onTileHoverChangeRef.current(isHoveringTile, false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    function getElementWorldPos(id: string) {
      const el = document.getElementById(id);
      if (!el) return { x: 0, y: 0, widthWorld: 1, visible: false };
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return { x: 0, y: 0, widthWorld: 0.001, visible: false };
      }

      const vFov = (camera.fov * Math.PI) / 180;
      const worldHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      const worldWidth = worldHeight * camera.aspect;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      return {
        x: (((cx / window.innerWidth) * 2 - 1) * worldWidth) / 2,
        y: ((-((cy / window.innerHeight) * 2 - 1)) * worldHeight) / 2,
        widthWorld: (rect.width / window.innerWidth) * worldWidth,
        visible: rect.bottom > -200 && rect.top < window.innerHeight + 200,
      };
    }

    let lastFrameTime = performance.now();
    const startTime = lastFrameTime;
    let frameId = 0;

    // Software WebGL fence-sync pacing per threejs skill
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const helpers: Array<{ key: TileKey; mesh: THREE.Group; id: string; speed: number; phase: number; rot: number }> = [
      { key: 'react', mesh: tiles.react, id: 'anchor-react', speed: 1.7, phase: 0, rot: 0.18 },
      { key: 'ts', mesh: tiles.ts, id: 'anchor-ts', speed: 1.4, phase: 2.1, rot: -0.15 },
      { key: 'next', mesh: tiles.next, id: 'anchor-next', speed: 1.6, phase: 4.2, rot: 0.22 },
    ];

    function tick() {
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;
      const t = (now - startTime) / 1000;

      // Step all 5 spring physics states
      (Object.keys(springsRef.current) as TileKey[]).forEach((k) => {
        springsRef.current[k] = stepSpring2D(springsRef.current[k], dt);
      });

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const workSectionEl = document.getElementById('work');
      const workTop = workSectionEl ? workSectionEl.getBoundingClientRect().top : window.innerHeight;
      const heroToWork = Math.max(0, Math.min(1, 1 - workTop / window.innerHeight));
      const workPinProgress = workPinProgressRef.current;

      // 1. Update Main Dark Hero Tile
      const posMain = getElementWorldPos('anchor-main-hero');
      const spMain = springsRef.current.mainHero;
      if (posMain.visible && heroToWork < 0.98) {
        tiles.mainHero.visible = true;
        tiles.mainHero.position.set(
          posMain.x + mouse.x * 0.25 + spMain.x,
          posMain.y + Math.sin(t * 1.5) * 0.1 + mouse.y * 0.18 + spMain.y,
          spMain.isDragging ? 0.65 : 0
        );
        tiles.mainHero.rotation.set(
          0.12 - mouse.y * 0.3 + spMain.rotX,
          -0.24 + mouse.x * 0.4 + heroToWork * 1.1 + spMain.rotY,
          spMain.rotZ
        );
        const dragScaleBoost = spMain.isDragging ? 1.08 : 1.0;
        tiles.mainHero.scale.setScalar(
          Math.max(0.001, (posMain.widthWorld / 2.2) * (1 - heroToWork * 0.85) * dragScaleBoost)
        );
      } else {
        tiles.mainHero.visible = false;
      }

      // 2. Update Travel Badge (Flies from Hero and locks into "Selected [ 3D ] work")
      const posSub = getElementWorldPos('anchor-sub-badge');
      const posSlot = getElementWorldPos('anchor-work-slot');
      const spTravel = springsRef.current.travelBadge;

      if (posSlot.visible || posSub.visible) {
        tiles.travelBadge.visible = true;
        const startX = posSub.visible ? posSub.x : -1.0;
        const startY = posSub.visible ? posSub.y : 0.1;
        const startW = posSub.widthWorld > 0.05 ? posSub.widthWorld : 0.85;

        tiles.travelBadge.position.set(
          THREE.MathUtils.lerp(startX, posSlot.x, heroToWork) +
            mouse.x * 0.1 * (1 - heroToWork * 0.6) +
            spTravel.x,
          THREE.MathUtils.lerp(startY, posSlot.y, heroToWork) +
            Math.sin(t * 2.0) * 0.04 +
            spTravel.y,
          spTravel.isDragging ? 0.55 : 0
        );

        const targetSize = THREE.MathUtils.lerp(startW, posSlot.widthWorld * 0.92, heroToWork);
        const dragBoost = spTravel.isDragging ? 1.12 : 1.0;
        tiles.travelBadge.scale.setScalar(Math.max(0.001, targetSize * dragBoost));

        const pinSpinY = Math.sin(workPinProgress * Math.PI * 2) * 0.28;
        const pinSpinZ = Math.cos(workPinProgress * Math.PI * 2) * 0.06;

        tiles.travelBadge.rotation.set(
          Math.sin(heroToWork * Math.PI) * 0.45 - mouse.y * 0.22 + spTravel.rotX,
          Math.sin(heroToWork * Math.PI) * Math.PI + pinSpinY + mouse.x * 0.32 + spTravel.rotY,
          pinSpinZ + spTravel.rotZ
        );
      } else {
        tiles.travelBadge.visible = false;
      }

      // 3. Update Helper Tiles in Hero (React, TS, Next.js)
      helpers.forEach((h) => {
        const p = getElementWorldPos(h.id);
        const sp = springsRef.current[h.key];
        if (!p.visible || heroToWork >= 0.95) {
          h.mesh.visible = false;
          return;
        }
        h.mesh.visible = true;
        h.mesh.position.set(
          p.x + mouse.x * 0.2 + sp.x,
          p.y + Math.sin(t * h.speed + h.phase) * 0.08 + mouse.y * 0.15 + sp.y,
          sp.isDragging ? 0.5 : 0
        );
        h.mesh.rotation.set(
          -mouse.y * 0.35 + Math.cos(t * h.speed) * 0.06 + sp.rotX,
          h.rot + mouse.x * 0.45 + heroToWork * 1.6 + sp.rotY,
          sp.rotZ
        );
        const dragBoost = sp.isDragging ? 1.12 : 1.0;
        h.mesh.scale.setScalar(Math.max(0.001, p.widthWorld * (1 - heroToWork) * dragBoost));
      });

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [workPinProgressRef]);

  return <div ref={mountRef} aria-hidden="true" />;
};
