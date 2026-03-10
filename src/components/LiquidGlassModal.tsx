import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Zap } from "lucide-react";
import { useEffect } from "react";

interface HubInfo {
  name: string;
  color: string;
  description: string;
  technologies: string[];
}

interface LiquidGlassModalProps {
  hub: HubInfo | null;
  onClose: () => void;
}

export default function LiquidGlassModal({ hub, onClose }: LiquidGlassModalProps) {
  // ESC key handler
  useEffect(() => {
    if (!hub) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hub, onClose]);

  return (
    <AnimatePresence>
      {hub && (
        <>

          {/* Liquid Glass Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-[90%] md:w-[65%] lg:w-[60%] max-h-[80vh] md:max-h-[70vh] overflow-y-auto pointer-events-auto"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(25px) saturate(180%)",
                WebkitBackdropFilter: "blur(25px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "24px",
                boxShadow: `
                  0 0 80px ${hub.color}12,
                  0 0 160px ${hub.color}06,
                  0 32px 64px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(255, 255, 255, 0.03)
                `,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top light reflection */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px] rounded-t-[24px]"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                }}
              />
              {/* Subtle gradient overlay */}
              <div
                className="absolute inset-0 rounded-[24px] pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)`,
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-8 md:p-12">
                {/* Top section: title + close */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    {/* Status indicator */}
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: hub.color,
                          boxShadow: `0 0 12px ${hub.color}`,
                        }}
                      />
                      <span
                        className="text-[10px] font-display tracking-[0.3em] uppercase"
                        style={{ color: `${hub.color}cc` }}
                      >
                        Active Hub
                      </span>
                    </div>

                    {/* Hub Title */}
                    <h2
                      className="font-display text-3xl md:text-4xl font-bold tracking-wider"
                      style={{
                        color: hub.color,
                        textShadow: `0 0 40px ${hub.color}40`,
                      }}
                    >
                      {hub.name}
                    </h2>

                    {/* Divider */}
                    <div
                      className="h-[2px] w-20 mt-4"
                      style={{
                        background: `linear-gradient(90deg, ${hub.color}80, transparent)`,
                      }}
                    />
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Middle section */}
                <div className="mb-8">
                  <p className="text-muted-foreground font-body leading-relaxed text-sm md:text-base max-w-2xl">
                    {hub.description}
                  </p>
                </div>

                {/* Capabilities grid */}
                <div className="mb-10">
                  <span className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground mb-4 block">
                    Key Capabilities
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {hub.technologies.map((tech, i) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, ease: "easeOut" }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl"
                        style={{
                          background: `${hub.color}08`,
                          border: `1px solid ${hub.color}15`,
                        }}
                      >
                        <Zap size={12} style={{ color: hub.color }} />
                        <span
                          className="text-xs font-body"
                          style={{ color: `${hub.color}dd` }}
                        >
                          {tech}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bottom action */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                    style={{
                      background: `linear-gradient(135deg, ${hub.color}25, ${hub.color}10)`,
                      color: hub.color,
                      border: `1px solid ${hub.color}25`,
                      boxShadow: `0 0 40px ${hub.color}08, 0 8px 32px rgba(0,0,0,0.3)`,
                    }}
                  >
                    EXPLORE HUB
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
