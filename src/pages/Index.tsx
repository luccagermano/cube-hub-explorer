import { useState, useCallback } from "react";
import InteractiveCube, { HUB_DATA } from "@/components/InteractiveCube";
import HubPanel from "@/components/HubPanel";
import { motion } from "framer-motion";

const Index = () => {
  const [selectedHub, setSelectedHub] = useState<number | null>(null);

  const handleNodeClick = useCallback((index: number) => {
    setSelectedHub((prev) => (prev === index ? null : index));
  }, []);

  const handleClose = useCallback(() => setSelectedHub(null), []);

  return (
    <div className="relative w-screen h-screen bg-background overflow-hidden font-body select-none">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(190_100%_50%_/_0.05)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(260_80%_60%_/_0.03)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(320_80%_55%_/_0.03)_0%,_transparent_50%)]" />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-primary/30 flex items-center justify-center bg-primary/5">
            <div className="w-3 h-3 rounded-sm bg-primary/80" />
          </div>
          <span className="font-display text-lg font-bold tracking-[0.15em] text-foreground">
            NEXUS
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["About", "Divisions", "Careers", "Contact"].map((item) => (
            <span
              key={item}
              className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="w-20" />
      </motion.nav>

      {/* Title overlay */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
      >
        <h1 className="font-display text-5xl md:text-7xl font-black tracking-[0.25em] text-primary text-glow-cyan">
          NEXUS
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm mt-3 tracking-[0.4em] font-display uppercase">
          Innovation Hub Network
        </p>
      </motion.div>

      {/* 3D Cube - full screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <InteractiveCube
          onNodeClick={handleNodeClick}
          isPaused={selectedHub !== null}
        />
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-[12%] left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
      >
        <p className="text-muted-foreground text-[10px] md:text-xs tracking-[0.35em] font-display uppercase">
          Explore the Future
        </p>
        <p className="text-muted-foreground/50 text-[9px] mt-2 tracking-[0.2em]">
          Hover nodes to preview • Click to explore
        </p>
      </motion.div>

      {/* Hub indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10"
      >
        {HUB_DATA.map((hub, i) => (
          <button
            key={hub.name}
            onClick={() => handleNodeClick(i)}
            className={`group relative transition-all duration-300 ${
              selectedHub === i ? "scale-125" : "opacity-50 hover:opacity-100"
            }`}
            title={hub.name}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: hub.color,
                boxShadow: selectedHub === i ? `0 0 12px ${hub.color}` : "none",
              }}
            />
          </button>
        ))}
      </motion.div>

      {/* Hub Panel */}
      <HubPanel
        hub={selectedHub !== null ? HUB_DATA[selectedHub] : null}
        onClose={handleClose}
      />
    </div>
  );
};

export default Index;
