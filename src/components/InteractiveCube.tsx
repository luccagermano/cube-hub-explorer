import React, { useRef, useState, useMemo, useCallback, useEffect, forwardRef } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Text, Float, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Mobile gesture types ── */
export type GestureState = "idle" | "tapCandidate" | "dragging";

/* ── Resize handler — keeps camera/renderer in sync with viewport ── */
function ViewportResizeHandler() {
  const { camera, gl, size } = useThree();

  useEffect(() => {
    const handleResize = () => {
      const w = gl.domElement.clientWidth;
      const h = gl.domElement.clientHeight;
      if (w === 0 || h === 0) return;
      gl.setSize(w, h, false);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };

    // Fix initial sizing after first paint
    requestAnimationFrame(() => {
      handleResize();
    });

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      // Delay to let mobile browser settle viewport
      setTimeout(handleResize, 150);
      setTimeout(handleResize, 500);
    });
    // Also handle visibility change (returning to tab)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) setTimeout(handleResize, 100);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [camera, gl]);

  return null;
}

const DDC_RED = "#c4364a";
const DDC_RED_DARK = "#8b2535";

// Popup category type
export type PopupCategory =
  | "solutions"
  | "contact"
  | "company"
  | "clients"
  | "newsletter"
  | "intro"
  | null;

export const VERTEX_DATA = [
  // Index 0: top front right — Solutions
  { name: "Soluções", color: DDC_RED, active: true, category: "solutions" as const },
  // Index 1: top front left — Contact
  { name: "Contato", color: "#e85d6f", active: true, category: "contact" as const },
  // Index 2: bottom front right — Clients
  { name: "Clientes", color: DDC_RED, active: true, category: "clients" as const },
  // Index 3: bottom front left — Newsletter
  { name: "Newsletter", color: "#e85d6f", active: true, category: "newsletter" as const },
  // Index 4: top back right — Company
  { name: "Empresa", color: "#a83242", active: true, category: "company" as const },
  // Index 5: top back left — Intro
  { name: "DDC", color: "#e85d6f", active: true, category: "intro" as const },
  // Index 6: bottom back right — INACTIVE
  { name: "", color: "#3a1a1a", active: false, category: null },
  // Index 7: bottom back left — INACTIVE
  { name: "", color: "#3a1a1a", active: false, category: null },
];

const VERTEX_POSITIONS: [number, number, number][] = [
  [1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1],
  [1, 1, -1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1],
];

const EDGES: [number, number][] = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

/* ── Light Beam Effect ─────────────────────────────────────── */
const LightBeam = forwardRef<THREE.Group, { origin: [number, number, number]; color: string; active: boolean }>(function LightBeam({ origin, color, active }, ref) {
  const beamRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const progress = useRef(0);
  const particles = useRef<THREE.Points>(null);

  const particlePositions = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (active) {
      progress.current = Math.min(progress.current + delta * 3, 1);
    } else {
      progress.current = Math.max(progress.current - delta * 4, 0);
    }

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = progress.current * 0.6 * Math.max(0, 1 - progress.current * 0.5);
      beamRef.current.scale.set(
        0.02 + progress.current * 0.08,
        0.02 + progress.current * 0.08,
        progress.current * 4
      );
      beamRef.current.position.set(origin[0], origin[1], origin[2] + progress.current * 2);
    }

    if (glowRef.current) {
      glowRef.current.intensity = progress.current * 8;
    }

    if (particles.current) {
      const mat = particles.current.material as THREE.PointsMaterial;
      mat.opacity = progress.current * 0.8;
      particles.current.scale.setScalar(1 + progress.current * 2);
    }
  });

  if (progress.current <= 0 && !active) return null;

  return (
    <group ref={ref}>
      <mesh ref={beamRef} position={origin}>
        <cylinderGeometry args={[1, 0.3, 1, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} />
      </mesh>
      <pointLight
        ref={glowRef}
        position={origin}
        color={color}
        intensity={0}
        distance={5}
        decay={2}
      />
      <points ref={particles} position={origin}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} count={30} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color={color} transparent opacity={0} toneMapped={false} sizeAttenuation />
      </points>
    </group>
  );
});

/* ── Glow Node ─────────────────────────────────────── */
const GlowNode = forwardRef<THREE.Group, {
  position: [number, number, number]; color: string; label: string; index: number;
  onNodeClick: (index: number) => void; hoveredNode: number | null;
  setHoveredNode: (i: number | null) => void; isPaused: boolean; isActive: boolean;
  isInteractive: boolean; isMobile: boolean;
}>(function GlowNode({
  position, color, label, index, onNodeClick, hoveredNode, setHoveredNode, isPaused, isActive, isInteractive, isMobile,
}, ref) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isHovered = hoveredNode === index;
  const baseScale = isPaused ? 0.08 : 0.06;
  const inactiveScale = 0.04;
  // On mobile, make interactive nodes larger for easier tapping
  const mobileBoost = isMobile && isInteractive ? 1.6 : 1;
  const targetScale = !isInteractive ? inactiveScale : isActive ? 0.16 * mobileBoost : isHovered ? 0.14 * mobileBoost : baseScale * mobileBoost;
  const currentScale = useRef(baseScale);
  const pulseTime = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentScale.current += (targetScale - currentScale.current) * Math.min(delta * 8, 1);

    if (isActive && isInteractive) {
      pulseTime.current += delta * 6;
      const pulse = 1 + Math.sin(pulseTime.current) * 0.08;
      meshRef.current.scale.setScalar(currentScale.current * pulse);
    } else {
      pulseTime.current = 0;
      meshRef.current.scale.setScalar(currentScale.current);
    }
  });

  // Invisible hit area sphere (larger on mobile)
  const hitRadius = isMobile && isInteractive ? 2.5 : 1;

  return (
    <group position={position}>
      {/* Invisible enlarged hit target */}
      {isInteractive && (
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick(index);
          }}
          onPointerOver={() => !isMobile && setHoveredNode(index)}
          onPointerOut={() => !isMobile && setHoveredNode(null)}
        >
          <sphereGeometry args={[hitRadius, 12, 12]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      )}
      {/* Visual sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={!isInteractive ? 0.3 : isActive ? 6 : isHovered ? 4 : 1.5}
          toneMapped={false}
          transparent={!isInteractive}
          opacity={isInteractive ? 1 : 0.3}
        />
      </mesh>
      <mesh scale={!isInteractive ? 0.08 : isActive ? 0.35 : isHovered ? 0.25 : 0.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={!isInteractive ? 0.03 : isActive ? 0.35 : isHovered ? 0.2 : 0.08} />
      </mesh>
      {isInteractive && label && (
        <Text
          position={[0, isMobile ? 0.4 : 0.3, 0]}
          fontSize={isMobile ? 0.11 : 0.09}
          color={isHovered || isActive ? color : "#ffffff"}
          anchorX="center"
          anchorY="bottom"
          font="/fonts/Orbitron.ttf"
          outlineWidth={0.005}
          outlineColor="#000000"
          fillOpacity={isHovered || isActive ? 1 : 0.6}
        >
          {label}
        </Text>
      )}
    </group>
  );
});

/* ── Cube Edge ─────────────────────────────────────── */
const CubeEdge = forwardRef<THREE.Group, { start: [number, number, number]; end: [number, number, number] }>(function CubeEdge({ start, end }, ref) {
  const lineObj = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#3a1a1a", transparent: true, opacity: 0.5 });
    return new THREE.Line(geometry, material);
  }, [start, end]);
  return <primitive object={lineObj} />;
});

/* ── Square Star Particles ─────────────────────────── */
function Particles() {
  const count = 180;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const RED_VARIANTS = useMemo(() => [
    new THREE.Color("#c4364a"),
    new THREE.Color("#8b2535"),
    new THREE.Color("#e85d6f"),
    new THREE.Color("#a83242"),
  ], []);

  const [data] = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        x: (Math.random() - 0.5) * 22,
        y: (Math.random() - 0.5) * 22,
        z: (Math.random() - 0.5) * 22,
        vx: (Math.random() - 0.5) * 0.0015,
        vy: (Math.random() - 0.5) * 0.0015,
        vz: (Math.random() - 0.5) * 0.0015,
        size: 0.015 + Math.random() * 0.025,
        opacity: 0.15 + Math.random() * 0.25,
        colorIdx: Math.floor(Math.random() * 4),
      });
    }
    return [items];
  }, []);

  // Set initial colors
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      meshRef.current.setColorAt(i, RED_VARIANTS[data[i].colorIdx]);
    }
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data, RED_VARIANTS]);

  useFrame(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      const d = data[i];
      d.x += d.vx;
      d.y += d.vy;
      d.z += d.vz;
      for (const axis of ["x", "y", "z"] as const) {
        if (Math.abs(d[axis]) > 11) d[axis] *= -0.9;
      }
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.setScalar(d.size);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.3}
        toneMapped={false}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* ── GLB Model ─────────────────────────────────────── */
function GLBModel() {
  const { scene } = useGLTF("/models/holoseat.glb");
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.emissive = new THREE.Color("#1a0505");
          mat.emissiveIntensity = 0.3;
          mesh.material = mat;
        }
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.2 / maxDim;
    clone.scale.setScalar(scale);
    clone.position.sub(center.multiplyScalar(scale));
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
}

useGLTF.preload("/models/holoseat.glb");

/* ── Scene ─────────────────────────────────────── */
function InteractiveCubeScene({
  onNodeClick, isPaused, activeNode, isMobile, gyroscope,
}: {
  onNodeClick: (index: number) => void;
  isPaused: boolean;
  activeNode: number | null;
  isMobile: boolean;
  gyroscope: { x: number; y: number; available: boolean };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const idleTime = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const cubeScale = useRef(1);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetCubeScale = isPaused ? 1.03 : 1.0;
    cubeScale.current += (targetCubeScale - cubeScale.current) * Math.min(delta * 4, 1);
    groupRef.current.scale.setScalar(cubeScale.current);

    if (!isPaused) {
      if (isMobile) {
        // Mobile: use gyroscope if available, otherwise gentle idle animation only
        if (gyroscope.available) {
          targetRotation.current.y = gyroscope.x * Math.PI * 0.25;
          targetRotation.current.x = -gyroscope.y * Math.PI * 0.15;
        } else {
          // Gentle idle rotation only — no touch drag
          targetRotation.current.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
          targetRotation.current.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
        }
      } else {
        // Desktop: mouse-based rotation
        const { x, y } = state.pointer;
        const moved = Math.abs(x - lastPointer.current.x) + Math.abs(y - lastPointer.current.y) > 0.001;
        lastPointer.current = { x, y };
        if (moved) { idleTime.current = 0; } else { idleTime.current += delta; }

        const mouseInfluence = Math.max(0, 1 - idleTime.current * 0.5);
        targetRotation.current.y = x * Math.PI * 0.5 * mouseInfluence;
        targetRotation.current.x = -y * Math.PI * 0.35 * mouseInfluence;
        if (idleTime.current > 1) {
          const idleFactor = Math.min((idleTime.current - 1) * 0.3, 1);
          targetRotation.current.y += Math.sin(state.clock.elapsedTime * 0.3) * 0.3 * idleFactor;
          targetRotation.current.x += Math.cos(state.clock.elapsedTime * 0.2) * 0.15 * idleFactor;
        }
      }
    }

    const springFactor = isPaused ? 0.015 : isMobile ? 0.03 : 0.05;
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * springFactor;
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * springFactor;
  });

  const scaledVertices = useMemo(
    () => VERTEX_POSITIONS.map((v) => v.map((c) => c * 1.1) as [number, number, number]),
    []
  );

  const handleNodeClick = useCallback((index: number) => {
    onNodeClick(index);
  }, [onNodeClick]);

  return (
    <group ref={groupRef}>
      {EDGES.map(([a, b], i) => (
        <CubeEdge key={i} start={scaledVertices[a]} end={scaledVertices[b]} />
      ))}

      <GLBModel />

      <mesh>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshBasicMaterial color={DDC_RED} transparent opacity={0.03} wireframe />
      </mesh>

      {scaledVertices.map((pos, i) => (
        <GlowNode
          key={i} position={pos} color={VERTEX_DATA[i].color} label={VERTEX_DATA[i].name}
          index={i} onNodeClick={handleNodeClick} hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode} isPaused={isPaused} isActive={activeNode === i}
          isInteractive={VERTEX_DATA[i].active} isMobile={isMobile}
        />
      ))}

      {scaledVertices.map((pos, i) => (
        VERTEX_DATA[i].active ? (
          <LightBeam
            key={`beam-${i}`}
            origin={pos}
            color={VERTEX_DATA[i].color}
            active={activeNode === i}
          />
        ) : null
      ))}
    </group>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function InteractiveCube({
  onNodeClick, isPaused, activeNode,
}: {
  onNodeClick: (index: number) => void;
  isPaused: boolean;
  activeNode: number | null;
}) {
  const bloomIntensity = activeNode !== null ? 1.8 : 1.0;
  const isMobile = useIsMobile();
  const [gyroscope, setGyroscope] = useState({ x: 0, y: 0, available: false });

  // Gyroscope listener — runs only on mobile
  useEffect(() => {
    if (!isMobile) return;
    if (!("DeviceOrientationEvent" in window)) return;

    let mounted = true;
    const raw = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let rafId = 0;
    let hasData = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      hasData = true;
      const maxTilt = 30;
      raw.x = Math.max(-1, Math.min(1, (e.gamma || 0) / maxTilt));
      raw.y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / maxTilt));
    };

    const loop = () => {
      smooth.x += (raw.x - smooth.x) * 0.08;
      smooth.y += (raw.y - smooth.y) * 0.08;
      if (mounted) {
        setGyroscope({ x: smooth.x, y: smooth.y, available: hasData });
      }
      rafId = requestAnimationFrame(loop);
    };

    const startListening = async () => {
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === "function") {
        try {
          const result = await DOE.requestPermission();
          if (result !== "granted") return;
        } catch { return; }
      }
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
      rafId = requestAnimationFrame(loop);
    };

    startListening();

    return () => {
      mounted = false;
      window.removeEventListener("deviceorientation", handleOrientation);
      cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  // Track container dimensions for stable Canvas sizing
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      if (w > 0 && h > 0) setDims({ w, h });
    };
    // Measure immediately + after a frame for safety
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", () => {
      setTimeout(measure, 200);
      setTimeout(measure, 600);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        touchAction: isMobile ? "none" : undefined,
        cursor: "pointer",
      }}
    >
      {dims && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: isMobile ? 55 : 50 }}
          dpr={[1, isMobile ? 1.2 : 1.5]}
          style={{ width: dims.w, height: dims.h }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          gl={{ antialias: true, alpha: false }}
          scene={{ background: new THREE.Color("#252222") }}
        >
          <ViewportResizeHandler />
          <ambientLight intensity={1.2} />
          <directionalLight position={[4, 5, 6]} intensity={3.5} color="#fff5ee" />
          <directionalLight position={[-4, 2, 3]} intensity={1.8} color="#e0e4f0" />
          <directionalLight position={[0, -2, -5]} intensity={2.0} color="#ffd4d4" />
          <pointLight position={[3, 3, 3]} intensity={1.5} color={DDC_RED} distance={12} decay={2} />
          <pointLight position={[-3, -2, 4]} intensity={1.0} color="#e85d6f" distance={10} decay={2} />
          <hemisphereLight intensity={0.8} color="#f0f0ff" groundColor="#1a0808" />

          <Particles />

          <Float speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
            <InteractiveCubeScene
              onNodeClick={onNodeClick}
              isPaused={isPaused}
              activeNode={activeNode}
              isMobile={isMobile}
              gyroscope={gyroscope}
            />
          </Float>

          <EffectComposer>
            <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={bloomIntensity} mipmapBlur />
          </EffectComposer>
        </Canvas>
      )}
    </div>
  );
}
