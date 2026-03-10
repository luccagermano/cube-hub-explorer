import { useState, useCallback, useRef, useEffect } from "react";
import InteractiveCube, { HUB_DATA } from "@/components/InteractiveCube";
import LiquidGlassModal from "@/components/LiquidGlassModal";
import { motion } from "framer-motion";
import ddcLogo from "@/assets/ddc-logo.png";

const Index = () => {
  const [selectedHub, setSelectedHub] = useState<number | null>(null);
  const [visibleHub, setVisibleHub] = useState<number | null>(null);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNodeClick = useCallback((index: number, _worldX: number) => {
    if (delayTimer.current) clearTimeout(delayTimer.current);

    if (selectedHub === index) {
      setSelectedHub(null);
      setVisibleHub(null);
      return;
    }

    setSelectedHub(index);
    setVisibleHub(null);
    delayTimer.current = setTimeout(() => {
      setVisibleHub(index);
    }, 400);
  }, [selectedHub]);

  const handleClose = useCallback(() => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    setSelectedHub(null);
    setVisibleHub(null);
  }, []);

  useEffect(() => {
    return () => { if (delayTimer.current) clearTimeout(delayTimer.current); };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-background overflow-hidden font-body select-none">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(350_65%_52%_/_0.06)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsl(0_0%_20%_/_0.04)_0%,_transparent_50%)]" />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5"
      >
        <div className="flex items-center gap-3">
          <img src={ddcLogo} alt=".ddc logo" className="h-8 w-auto" />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["About", "Services", "Careers", "Contact"].map((item) => (
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

      {/* 3D Cube */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <InteractiveCube
          onNodeClick={handleNodeClick}
          isPaused={selectedHub !== null}
          activeNode={selectedHub}
        />
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
            onClick={() => handleNodeClick(i, VERTEX_X[i])}
            className={`group relative transition-all duration-300 ${
              selectedHub === i ? "scale-125" : "opacity-50 hover:opacity-100"
            }`}
            title={hub.name}
          >
            <div
              className="w-2 h-2 rounded-[4px]"
              style={{
                backgroundColor: hub.color,
                boxShadow: selectedHub === i ? `0 0 12px ${hub.color}` : "none",
              }}
            />
          </button>
        ))}
      </motion.div>

      {/* Liquid Glass Modal */}
      <LiquidGlassModal
        hub={visibleHub !== null ? HUB_DATA[visibleHub] : null}
        onClose={handleClose}
      />
    </div>
  );
};

// Pre-computed vertex X positions for bottom indicator buttons
const VERTEX_X = [1, -1, 1, -1, 1, -1, 1, -1];

export default Index;
