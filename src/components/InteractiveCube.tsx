import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Text, Float, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const DDC_RED = "#c4364a";
const DDC_RED_DARK = "#8b2535";

export const HUB_DATA = [
  {
    name: "AI & Automation",
    color: DDC_RED,
    description: "Driving intelligent automation and AI-powered solutions that transform how businesses operate and innovate at scale.",
    technologies: ["Machine Learning", "NLP", "RPA", "Predictive Analytics"],
  },
  {
    name: "Data Intelligence",
    color: "#e85d6f",
    description: "Harnessing the power of data to deliver actionable insights, advanced analytics, and real-time decision frameworks.",
    technologies: ["Big Data", "Data Lakes", "BI Dashboards", "ETL Pipelines"],
  },
  {
    name: "Digital Transformation",
    color: DDC_RED,
    description: "End-to-end digital transformation strategies that modernize legacy systems and unlock new business capabilities.",
    technologies: ["Microservices", "API-First", "DevOps", "Agile Delivery"],
  },
  {
    name: "Cloud Infrastructure",
    color: "#a83242",
    description: "Building resilient, scalable cloud architectures that power mission-critical enterprise applications globally.",
    technologies: ["AWS", "Azure", "Kubernetes", "Serverless"],
  },
  {
    name: "Product Engineering",
    color: "#e85d6f",
    description: "Crafting world-class digital products from concept to launch with cutting-edge engineering and design thinking.",
    technologies: ["React", "Mobile Apps", "UX Design", "CI/CD"],
  },
  {
    name: "Innovation Lab",
    color: DDC_RED,
    description: "Our experimental playground — prototyping breakthrough ideas in emerging tech and pushing the boundaries of possibility.",
    technologies: ["AR/VR", "Blockchain", "IoT", "Edge Computing"],
  },
  {
    name: "R&D",
    color: "#a83242",
    description: "Deep research into next-generation technologies, from quantum-resistant security to neuromorphic computing paradigms.",
    technologies: ["Quantum Computing", "Neural Nets", "Materials Science", "Robotics"],
  },
  {
    name: "Strategic Consulting",
    color: "#e85d6f",
    description: "Advisory services that bridge technology and business strategy, guiding enterprises through complex digital landscapes.",
    technologies: ["Tech Strategy", "Change Management", "M&A Advisory", "Digital Roadmaps"],
  },
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

function GlowNode({
  position, color, label, index, onNodeClick, hoveredNode, setHoveredNode, isPaused,
}: {
  position: [number, number, number]; color: string; label: string; index: number;
  onNodeClick: (index: number) => void; hoveredNode: number | null;
  setHoveredNode: (i: number | null) => void; isPaused: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isHovered = hoveredNode === index;
  const baseScale = isPaused ? 0.08 : 0.06;
  const targetScale = isHovered ? 0.14 : baseScale;
  const currentScale = useRef(baseScale);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    currentScale.current += (targetScale - currentScale.current) * Math.min(delta * 8, 1);
    meshRef.current.scale.setScalar(currentScale.current);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onNodeClick(index); }}
        onPointerOver={() => setHoveredNode(index)}
        onPointerOut={() => setHoveredNode(null)}
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 4 : 1.5}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={isHovered ? 0.25 : 0.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.2 : 0.08} />
      </mesh>
      {isHovered && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.1}
          color={color}
          anchorX="center"
          anchorY="bottom"
          font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2"
          outlineWidth={0.004}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function CubeEdge({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const lineObj = useMemo(() => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#3a1a1a", transparent: true, opacity: 0.5 });
    return new THREE.Line(geometry, material);
  }, [start, end]);
  return <primitive object={lineObj} />;
}

function Particles() {
  const count = 250;
  const mesh = useRef<THREE.Points>(null);
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    const posAttr = mesh.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const arr = posAttr.array as Float32Array;
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];
      for (let j = 0; j < 3; j++) {
        if (Math.abs(arr[i * 3 + j]) > 10) arr[i * 3 + j] *= -0.9;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={DDC_RED} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

function TexturedCube() {
  const texture = useLoader(THREE.TextureLoader, mascotTexture);
  return (
    <mesh>
      <boxGeometry args={[2.2, 2.2, 2.2]} />
      <meshPhysicalMaterial
        map={texture}
        metalness={0.7}
        roughness={0.2}
        transparent
        opacity={0.85}
        envMapIntensity={1.5}
        side={THREE.DoubleSide}
        emissive="#1a0505"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function InteractiveCubeScene({ onNodeClick, isPaused }: { onNodeClick: (index: number) => void; isPaused: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const idleTime = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { x, y } = state.pointer;
    const moved = Math.abs(x - lastPointer.current.x) + Math.abs(y - lastPointer.current.y) > 0.001;
    lastPointer.current = { x, y };
    if (moved) { idleTime.current = 0; } else { idleTime.current += delta; }

    if (!isPaused) {
      const mouseInfluence = Math.max(0, 1 - idleTime.current * 0.5);
      targetRotation.current.y = x * Math.PI * 0.5 * mouseInfluence;
      targetRotation.current.x = -y * Math.PI * 0.35 * mouseInfluence;
      if (idleTime.current > 1) {
        const idleFactor = Math.min((idleTime.current - 1) * 0.3, 1);
        targetRotation.current.y += Math.sin(state.clock.elapsedTime * 0.3) * 0.3 * idleFactor;
        targetRotation.current.x += Math.cos(state.clock.elapsedTime * 0.2) * 0.15 * idleFactor;
      }
    }

    const springFactor = isPaused ? 0.03 : 0.05;
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * springFactor;
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * springFactor;
  });

  const scaledVertices = useMemo(
    () => VERTEX_POSITIONS.map((v) => v.map((c) => c * 1.1) as [number, number, number]),
    []
  );

  return (
    <group ref={groupRef}>
      {EDGES.map(([a, b], i) => (
        <CubeEdge key={i} start={scaledVertices[a]} end={scaledVertices[b]} />
      ))}

      <TexturedCube />

      {/* Inner wireframe */}
      <mesh>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshBasicMaterial color={DDC_RED} transparent opacity={0.03} wireframe />
      </mesh>

      {scaledVertices.map((pos, i) => (
        <GlowNode
          key={i} position={pos} color={HUB_DATA[i].color} label={HUB_DATA[i].name}
          index={i} onNodeClick={onNodeClick} hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode} isPaused={isPaused}
        />
      ))}
    </group>
  );
}

export default function InteractiveCube({ onNodeClick, isPaused }: { onNodeClick: (index: number) => void; isPaused: boolean }) {
  return (
    <div className="w-full h-full cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color={DDC_RED} />
        <pointLight position={[-5, -3, 5]} intensity={0.5} color="#e85d6f" />
        <pointLight position={[0, 5, -5]} intensity={0.3} color="#a83242" />
        <pointLight position={[0, -5, 5]} intensity={0.2} color="#ffffff" />

        <Particles />

        <Float speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
          <InteractiveCubeScene onNodeClick={onNodeClick} isPaused={isPaused} />
        </Float>

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.0} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
