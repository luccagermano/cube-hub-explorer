import { useState, useCallback } from "react";
import InteractiveCube, { HUB_DATA } from "@/components/InteractiveCube";
import HubPanel from "@/components/HubPanel";
import { motion } from "framer-motion";

const Index = () => {
  const [selectedHub, setSelectedHub] = useState<number | null>(null);

  const handleFaceClick = useCallback((index: number) => {
    setSelectedHub((prev) => (prev === index ? null : index));
  }, []);

  const handleClose = useCallback(() => setSelectedHub(null), []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-body">
      {/* Background grid effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(190_100%_50%_/_0.06)_0%,_transparent_70%)]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center pt-10"
      >
        <h1 className="font-display text-4xl md:text-6xl font-black tracking-[0.2em] text-primary text-glow-cyan">
          NEXUS
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-2 tracking-[0.3em] font-display uppercase">
          Innovation Hub Network
        </p>
      </motion.header>

      {/* 3D Cube */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0"
      >
        <InteractiveCube onFaceClick={handleFaceClick} />
      </motion.div>

      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-[75%] left-1/2 -translate-x-1/2 text-muted-foreground text-xs tracking-[0.25em] font-display uppercase select-none"
      >
        Move cursor to rotate • Click a face to explore
      </motion.p>

      {/* Hub Panel */}
      <HubPanel
        hub={selectedHub !== null ? HUB_DATA[selectedHub] : null}
        onClose={handleClose}
      />

      {/* Bottom hub indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10"
      >
        {HUB_DATA.map((hub, i) => (
          <button
            key={hub.name}
            onClick={() => handleFaceClick(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedHub === i ? "scale-150" : "opacity-40 hover:opacity-80"}`}
            style={{ backgroundColor: hub.color }}
            title={hub.name}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Index;
