import { useState, useCallback, useRef, useEffect } from "react";
import InteractiveCube, { VERTEX_DATA } from "@/components/InteractiveCube";
import type { PopupCategory } from "@/components/InteractiveCube";
import LiquidGlassModal, { AboutModal } from "@/components/LiquidGlassModal";
import { motion, AnimatePresence } from "framer-motion";
import ddcLogo from "@/assets/ddc-logo.svg";

const MENU_ITEMS = [
  { label: "Sobre", action: "about" as const },
  { label: "Soluções", action: "node" as const, nodeIndex: 0 },
  { label: "Perfil da Empresa", action: "node" as const, nodeIndex: 4 },
  { label: "Clientes", action: "node" as const, nodeIndex: 2 },
  { label: "Boletim", action: "node" as const, nodeIndex: 3 },
  { label: "Contato", action: "node" as const, nodeIndex: 1 },
];

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [visibleCategory, setVisibleCategory] = useState<PopupCategory>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleMenuItemClick = useCallback((item: typeof MENU_ITEMS[number]) => {
    setMenuOpen(false);
    // Small delay so drawer closes first
    setTimeout(() => {
      if (item.action === "about") {
        handleAboutClick();
      } else if (item.nodeIndex !== undefined) {
        handleNodeClick(item.nodeIndex);
      }
    }, 300);
  }, [handleAboutClick, handleNodeClick]);

  useEffect(() => {
    return () => { if (delayTimer.current) clearTimeout(delayTimer.current); };
  }, []);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div
      className="fixed inset-0 bg-background overflow-hidden font-body select-none touch-none"
      style={{ width: "100vw", height: "100dvh" }}
    >
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
        aria-label="Navegação principal"
      >
        <div className="flex items-center gap-3">
          <img src={ddcLogo} alt="DDC Company logo" className="h-6 sm:h-8 w-auto" />
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="relative z-30 flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            background: "hsl(0 0% 12% / 0.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            boxShadow: "0 2px 12px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
          }}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          <span
            className="block w-4.5 h-[1.5px] rounded-full bg-foreground transition-all duration-300 origin-center"
            style={{
              width: "18px",
              transform: menuOpen ? "translateY(1px) rotate(45deg)" : "translateY(-3px)",
              backgroundColor: menuOpen ? "hsl(var(--primary))" : "hsl(var(--foreground))",
            }}
          />
          <span
            className="block h-[1.5px] rounded-full bg-foreground transition-all duration-300"
            style={{
              width: "18px",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-4.5 h-[1.5px] rounded-full bg-foreground transition-all duration-300 origin-center"
            style={{
              width: "18px",
              transform: menuOpen ? "translateY(-1px) rotate(-45deg)" : "translateY(3px)",
              backgroundColor: menuOpen ? "hsl(var(--primary))" : "hsl(var(--foreground))",
            }}
          />
        </button>
      </motion.nav>

      {/* 3D Canvas — fullscreen background */}
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

      {/* Slide-out menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Soft backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-30"
              style={{ backgroundColor: "hsl(0 0% 0% / 0.3)" }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 z-40 w-[280px] sm:w-[340px] flex flex-col"
              style={{
                background: "hsl(0 0% 10% / 0.85)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                borderLeft: "1px solid hsl(0 0% 100% / 0.06)",
                boxShadow: "-8px 0 40px hsl(0 0% 0% / 0.4), inset 1px 0 0 hsl(0 0% 100% / 0.03)",
              }}
              role="dialog"
              aria-label="Menu de navegação"
            >
              {/* Header area with close */}
              <div className="flex items-center justify-between px-6 sm:px-8 pt-5 pb-4">
                <span className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground">
                  Navegação
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Fechar menu"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13" />
                    <line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className="mx-6 sm:mx-8 h-px bg-[hsl(0_0%_100%_/_0.06)]" />

              {/* Menu items */}
              <nav className="flex-1 flex flex-col gap-1 px-4 sm:px-6 py-6">
                {MENU_ITEMS.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    onClick={() => handleMenuItemClick(item)}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-[hsl(0_0%_100%_/_0.04)]"
                  >
                    {/* Accent line */}
                    <span
                      className="w-[3px] h-5 rounded-full transition-all duration-300 opacity-30 group-hover:opacity-100"
                      style={{ backgroundColor: "hsl(var(--primary))" }}
                    />
                    <span className="text-sm sm:text-base font-display tracking-[0.08em] uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </nav>

              {/* Footer branding */}
              <div className="px-6 sm:px-8 pb-6 pt-2">
                <div className="h-px bg-[hsl(0_0%_100%_/_0.06)] mb-4" />
                <div className="flex items-center gap-2">
                  <img src={ddcLogo} alt="" className="h-4 w-auto opacity-40" />
                  <span className="text-[9px] font-display tracking-[0.2em] uppercase text-muted-foreground/40">
                    Booster Tech
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Liquid Glass Modal for vertex popups */}
      <LiquidGlassModal
        category={visibleCategory}
        onClose={handleClose}
      />

      {/* About Modal */}
      <AboutModal open={aboutOpen} onClose={handleAboutClose} />
    </div>
  );
};

export default Index;
