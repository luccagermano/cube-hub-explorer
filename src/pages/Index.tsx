import { useState, useCallback, useRef, useEffect } from "react";
import InteractiveCube, { VERTEX_DATA } from "@/components/InteractiveCube";
import type { PopupCategory } from "@/components/InteractiveCube";
import LiquidGlassModal, { AboutModal } from "@/components/LiquidGlassModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import ddcLogo from "@/assets/ddc-logo.png";

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [visibleCategory, setVisibleCategory] = useState<PopupCategory>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNodeClick = useCallback((index: number) => {
    if (delayTimer.current) clearTimeout(delayTimer.current);

    const vertex = VERTEX_DATA[index];
    if (!vertex.active) return;

    if (selectedNode === index) {
      setSelectedNode(null);
      setVisibleCategory(null);
      return;
    }

    setSelectedNode(index);
    setVisibleCategory(null);
    setAboutOpen(false);
    delayTimer.current = setTimeout(() => {
      setVisibleCategory(vertex.category);
    }, 400);
  }, [selectedNode]);

  const handleClose = useCallback(() => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    setSelectedNode(null);
    setVisibleCategory(null);
  }, []);

  const handleAboutClick = useCallback(() => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    setSelectedNode(null);
    setVisibleCategory(null);
    setAboutOpen(true);
  }, []);

  const handleAboutClose = useCallback(() => {
    setAboutOpen(false);
  }, []);

  useEffect(() => {
    return () => { if (delayTimer.current) clearTimeout(delayTimer.current); };
  }, []);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden font-body select-none touch-none">
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
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3">
          <img src={ddcLogo} alt="DDC Company logo" className="h-6 sm:h-8 w-auto" />
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={handleAboutClick}
            className="text-xs font-display tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1"
            aria-label="Abrir seção Sobre"
          >
            Sobre
          </button>
        </div>

        <div className="w-12 sm:w-20" />
      </motion.nav>

      {/* 3D Cube — centered with padding for nav/capsules */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="absolute inset-0 top-14 sm:top-16 bottom-16 sm:bottom-20"
        aria-hidden="true"
      >
        <InteractiveCube
          onNodeClick={handleNodeClick}
          isPaused={selectedNode !== null}
          activeNode={selectedNode}
        />
      </motion.div>

      {/* Hub navigation — capsule indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10 flex-wrap justify-center max-w-[95vw]"
        role="navigation"
        aria-label="Navegação principal"
      >
        {VERTEX_DATA.map((vertex, i) => {
          if (!vertex.active) return null;
          const isActive = selectedNode === i;
          return (
            <button
              key={i}
              onClick={() => handleNodeClick(i)}
              className="relative rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-display font-semibold tracking-[0.12em] uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${vertex.color}30, ${vertex.color}18)`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? `${vertex.color}50` : "rgba(255,255,255,0.08)"}`,
                color: isActive ? "#f0f0f2" : "rgba(255,255,255,0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: isActive
                  ? `0 0 20px ${vertex.color}20, 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
                  : "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
              aria-label={`Abrir seção ${vertex.name}`}
              aria-pressed={isActive}
            >
              {/* Active glow dot */}
              {isActive && (
                <span
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: vertex.color, boxShadow: `0 0 6px ${vertex.color}` }}
                />
              )}
              <span className={isActive ? "ml-2" : ""}>{vertex.name}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Liquid Glass Modal for vertex popups */}
      <LiquidGlassModal
        category={visibleCategory}
        onClose={handleClose}
      />

      {/* About Modal (navbar) */}
      <AboutModal open={aboutOpen} onClose={handleAboutClose} />
    </div>
  );
};

export default Index;
