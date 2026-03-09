import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const HUB_DATA = [
  { name: "AI LAB", color: "#00d4ff", description: "Our artificial intelligence research division — pioneering next-gen neural architectures, autonomous systems, and machine consciousness." },
  { name: "QUANTUM", color: "#8b5cf6", description: "Quantum computing division pushing the boundaries of computational physics, building qubits that will reshape cryptography and simulation." },
  { name: "CYBER", color: "#f43f5e", description: "Cybersecurity & digital defense hub — zero-trust architectures, threat intelligence, and real-time intrusion prevention at planetary scale." },
  { name: "ROBOTICS", color: "#10b981", description: "Advanced robotics division creating autonomous machines for space exploration, deep-sea research, and industrial automation." },
  { name: "BIOTECH", color: "#f59e0b", description: "Biotechnology innovation center merging synthetic biology with computational design to engineer solutions for health and sustainability." },
  { name: "SPACE", color: "#6366f1", description: "Space technology division developing next-generation propulsion, orbital habitats, and interplanetary communication networks." },
];

// Face index to face name mapping for click detection
const FACE_NAMES = ["right", "left", "top", "bottom", "front", "back"];

function CubeFace({ position, rotation, text, color }: { position: [number, number, number]; rotation: [number, number, number]; text: string; color: string }) {
  return (
    <group position={position} rotation={rotation}>
      <Text
        fontSize={0.28}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2"
        maxWidth={1.6}
        textAlign="center"
        letterSpacing={0.08}
      >
        {text}
      </Text>
    </group>
  );
}

function Cube({ onFaceClick }: { onFaceClick: (index: number) => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Get mouse position and map to rotation
    const { x, y } = state.pointer;
    targetRotation.current.y = x * Math.PI * 0.4;
    targetRotation.current.x = -y * Math.PI * 0.3;

    // Smooth lerp
    meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.08;
    meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.08;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.face) {
      const normal = e.face.normal.clone();
      // Determine which face was clicked based on the face normal
      const absX = Math.abs(normal.x);
      const absY = Math.abs(normal.y);
      const absZ = Math.abs(normal.z);

      let faceIndex = 0;
      if (absX >= absY && absX >= absZ) {
        faceIndex = normal.x > 0 ? 0 : 1; // right or left
      } else if (absY >= absX && absY >= absZ) {
        faceIndex = normal.y > 0 ? 2 : 3; // top or bottom
      } else {
        faceIndex = normal.z > 0 ? 4 : 5; // front or back
      }
      onFaceClick(faceIndex);
    }
  };

  return (
    <group ref={meshRef}>
      {/* Main cube body */}
      <RoundedBox
        args={[2, 2, 2]}
        radius={0.08}
        smoothness={4}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhysicalMaterial
          color="#0a0f1a"
          metalness={0.9}
          roughness={0.15}
          transparent
          opacity={0.85}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Edge glow */}
      <RoundedBox args={[2.02, 2.02, 2.02]} radius={0.08} smoothness={4}>
        <meshBasicMaterial
          color={hovered ? "#00d4ff" : "#1a2a3a"}
          transparent
          opacity={hovered ? 0.3 : 0.15}
          wireframe
        />
      </RoundedBox>

      {/* Face labels */}
      <CubeFace position={[0, 0, 1.02]} rotation={[0, 0, 0]} text={HUB_DATA[4].name} color={HUB_DATA[4].color} />
      <CubeFace position={[0, 0, -1.02]} rotation={[0, Math.PI, 0]} text={HUB_DATA[5].name} color={HUB_DATA[5].color} />
      <CubeFace position={[1.02, 0, 0]} rotation={[0, Math.PI / 2, 0]} text={HUB_DATA[0].name} color={HUB_DATA[0].color} />
      <CubeFace position={[-1.02, 0, 0]} rotation={[0, -Math.PI / 2, 0]} text={HUB_DATA[1].name} color={HUB_DATA[1].color} />
      <CubeFace position={[0, 1.02, 0]} rotation={[-Math.PI / 2, 0, 0]} text={HUB_DATA[2].name} color={HUB_DATA[2].color} />
      <CubeFace position={[0, -1.02, 0]} rotation={[Math.PI / 2, 0, 0]} text={HUB_DATA[3].name} color={HUB_DATA[3].color} />
    </group>
  );
}

function Scene({ onFaceClick }: { onFaceClick: (index: number) => void }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00d4ff" />
      <pointLight position={[-5, -3, 5]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[0, 5, -5]} intensity={0.4} color="#f43f5e" />
      <Cube onFaceClick={onFaceClick} />
    </>
  );
}

export { HUB_DATA };

export default function InteractiveCube({ onFaceClick }: { onFaceClick: (index: number) => void }) {
  return (
    <div className="w-full h-full cursor-pointer">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <Scene onFaceClick={onFaceClick} />
      </Canvas>
    </div>
  );
}
