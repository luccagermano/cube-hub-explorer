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

      {/* 3D Cube */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="absolute inset-0"
        aria-hidden="true"
      >
        <InteractiveCube
          onNodeClick={handleNodeClick}
          isPaused={selectedNode !== null}
          activeNode={selectedNode}
        />
      </motion.div>

      {/* Hub indicators — accessible navigation dots */}
      <TooltipProvider delayDuration={200}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10"
          role="navigation"
          aria-label="Hub navigation"
        >
          {VERTEX_DATA.map((vertex, i) => (
            vertex.active ? (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleNodeClick(i)}
                    className={`group relative transition-all duration-300 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      selectedNode === i ? "scale-125" : "opacity-50 hover:opacity-100"
                    }`}
                    aria-label={`Open ${vertex.name} section`}
                    aria-pressed={selectedNode === i}
                  >
                    <div
                      className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full"
                      style={{
                        backgroundColor: vertex.color,
                        boxShadow: selectedNode === i ? `0 0 12px ${vertex.color}` : "none",
                      }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">{vertex.name}</TooltipContent>
              </Tooltip>
            ) : null
          ))}
        </motion.div>
      </TooltipProvider>

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
