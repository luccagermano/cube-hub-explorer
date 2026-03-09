import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

export const HUB_DATA = [
  {
    name: "AI Research",
    color: "#00d4ff",
    description: "Pioneering next-gen neural architectures, autonomous systems, and machine consciousness at the frontier of artificial intelligence.",
    technologies: ["Deep Learning", "LLMs", "Computer Vision", "Reinforcement Learning"],
  },
  {
    name: "Robotics",
    color: "#8b5cf6",
    description: "Creating autonomous machines for space exploration, deep-sea research, and industrial automation with human-level dexterity.",
    technologies: ["Autonomous Systems", "Haptic Feedback", "Swarm Intelligence", "Exoskeletons"],
  },
  {
    name: "Quantum Computing",
    color: "#06b6d4",
    description: "Pushing the boundaries of computational physics, building stable qubits that will reshape cryptography and molecular simulation.",
    technologies: ["Superconducting Qubits", "Error Correction", "Quantum ML", "Post-Quantum Crypto"],
  },
  {
    name: "Space Technology",
    color: "#f43f5e",
    description: "Developing next-generation propulsion systems, orbital habitats, and interplanetary communication networks for humanity's expansion.",
    technologies: ["Ion Propulsion", "Space Mining", "Orbital Stations", "Deep Space Comms"],
  },
  {
    name: "Advanced Materials",
    color: "#10b981",
    description: "Engineering metamaterials, programmable matter, and self-healing composites that redefine what's physically possible.",
    technologies: ["Graphene Synthesis", "Smart Polymers", "Nano-fabrication", "4D Printing"],
  },
  {
    name: "Bioengineering",
    color: "#f59e0b",
    description: "Merging synthetic biology with computational design to engineer solutions for longevity, disease, and sustainable ecosystems.",
    technologies: ["Gene Editing", "Synthetic Organs", "Bioinformatics", "Microbiome Engineering"],
  },
  {
    name: "Neural Interfaces",
    color: "#ec4899",
    description: "Building direct brain-computer links that expand human cognition, enabling thought-driven control of digital systems.",
    technologies: ["BCI Implants", "Neural Decoding", "Thought-to-Text", "Sensory Augmentation"],
  },
  {
    name: "Future Labs",
    color: "#6366f1",
    description: "Our experimental playground — incubating moonshot ideas from zero-point energy to digital consciousness and reality engineering.",
    technologies: ["Fusion Energy", "Digital Twins", "AGI Research", "Reality Simulation"],
  },
];

// Cube vertex positions (8 corners of a cube)
const VERTEX_POSITIONS: [number, number, number][] = [
  [1, 1, 1],
  [-1, 1, 1],
  [1, -1, 1],
  [-1, -1, 1],
  [1, 1, -1],
  [-1, 1, -1],
  [1, -1, -1],
  [-1, -1, -1],
];

// Cube edges as pairs of vertex indices
const EDGES: [number, number][] = [
  [0, 1], [2, 3], [4, 5], [6, 7], // horizontal pairs
  [0, 2], [1, 3], [4, 6], [5, 7], // vertical pairs  
  [0, 4], [1, 5], [2, 6], [3, 7], // depth pairs
];

function GlowNode({
  position,
  color,
  label,
  index,
  onNodeClick,
  hoveredNode,
  setHoveredNode,
  isPaused,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  index: number;
  onNodeClick: (index: number) => void;
  hoveredNode: number | null;
  setHoveredNode: (i: number | null) => void;
  isPaused: boolean;
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
      {/* Core sphere */}
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

      {/* Outer glow sphere */}
      <mesh scale={isHovered ? 0.25 : 0.15}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.2 : 0.08}
        />
      </mesh>

      {/* Label */}
      {isHovered && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color={color}
          anchorX="center"
          anchorY="bottom"
          font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2"
          outlineWidth={0.005}
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
    const material = new THREE.LineBasicMaterial({ color: "#1a3a4a", transparent: true, opacity: 0.4 });
    return new THREE.Line(geometry, material);
  }, [start, end]);

  return <primitive object={lineObj} />;
}

function Particles() {
  const count = 300;
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
      // Wrap around
      for (let j = 0; j < 3; j++) {
        if (Math.abs(arr[i * 3 + j]) > 10) arr[i * 3 + j] *= -0.9;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#00d4ff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

function InteractiveCubeScene({
  onNodeClick,
  isPaused,
}: {
  onNodeClick: (index: number) => void;
  isPaused: boolean;
}) {
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

    if (moved) {
      idleTime.current = 0;
    } else {
      idleTime.current += delta;
    }

    if (!isPaused) {
      // Mouse-driven rotation
      const mouseInfluence = Math.max(0, 1 - idleTime.current * 0.5);
      targetRotation.current.y = x * Math.PI * 0.5 * mouseInfluence;
      targetRotation.current.x = -y * Math.PI * 0.35 * mouseInfluence;

      // Idle rotation
      if (idleTime.current > 1) {
        const idleFactor = Math.min((idleTime.current - 1) * 0.3, 1);
        targetRotation.current.y += Math.sin(state.clock.elapsedTime * 0.3) * 0.3 * idleFactor;
        targetRotation.current.x += Math.cos(state.clock.elapsedTime * 0.2) * 0.15 * idleFactor;
      }
    }

    // Elastic spring interpolation
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
      {/* Edges */}
      {EDGES.map(([a, b], i) => (
        <CubeEdge
          key={i}
          start={scaledVertices[a]}
          end={scaledVertices[b]}
        />
      ))}

      {/* Semi-transparent faces */}
      <mesh>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshPhysicalMaterial
          color="#050a15"
          metalness={0.95}
          roughness={0.1}
          transparent
          opacity={0.15}
          envMapIntensity={2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Holographic inner glow */}
      <mesh>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.02}
          wireframe
        />
      </mesh>

      {/* Vertex nodes */}
      {scaledVertices.map((pos, i) => (
        <GlowNode
          key={i}
          position={pos}
          color={HUB_DATA[i].color}
          label={HUB_DATA[i].name}
          index={i}
          onNodeClick={onNodeClick}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          isPaused={isPaused}
        />
      ))}
    </group>
  );
}

export default function InteractiveCube({
  onNodeClick,
  isPaused,
}: {
  onNodeClick: (index: number) => void;
  isPaused: boolean;
}) {
  return (
    <div className="w-full h-full cursor-pointer">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00d4ff" />
        <pointLight position={[-5, -3, 5]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[0, 5, -5]} intensity={0.3} color="#f43f5e" />
        <pointLight position={[0, -5, 5]} intensity={0.2} color="#10b981" />

        <Particles />

        <Float speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
          <InteractiveCubeScene onNodeClick={onNodeClick} isPaused={isPaused} />
        </Float>

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.2}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
