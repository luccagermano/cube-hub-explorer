import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Zap } from "lucide-react";

interface HubInfo {
  name: string;
  color: string;
  description: string;
  technologies: string[];
}

interface HubPanelProps {
  hub: HubInfo | null;
  onClose: () => void;
  side: "left" | "right";
}

export default function HubPanel({ hub, onClose, side }: HubPanelProps) {
  const isLeft = side === "left";
  const slideX = isLeft ? -80 : 80;

  return (
    <AnimatePresence>
      {hub && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={onClose}
          />

          {/* Glow overlay flash */}
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-35 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${isLeft ? '20%' : '80%'} 50%, ${hub.color}30, transparent 60%)`,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: slideX, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: slideX, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className={`fixed top-1/2 -translate-y-1/2 w-[400px] max-w-[90vw] z-40 ${
              isLeft ? "left-6" : "right-6"
            }`}
          >
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: "hsl(0 0% 10% / 0.85)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: `1px solid ${hub.color}20`,
                boxShadow: `
                  0 0 80px ${hub.color}15,
                  0 0 160px ${hub.color}06,
                  0 25px 80px hsl(0 0% 2% / 0.8),
                  inset 0 1px 0 hsl(0 0% 100% / 0.05)
                `,
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${hub.color}, transparent)` }}
              />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: `${hub.color}50` }} />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 rounded-tr-2xl" style={{ borderColor: `${hub.color}50` }} />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 rounded-bl-2xl" style={{ borderColor: `${hub.color}25` }} />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 rounded-br-2xl" style={{ borderColor: `${hub.color}25` }} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
              >
                <X size={16} />
              </button>

              {/* Status indicator */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: hub.color, boxShadow: `0 0 10px ${hub.color}` }} />
                <span className="text-[10px] font-display tracking-[0.3em] uppercase" style={{ color: `${hub.color}cc` }}>
                  Active Hub
                </span>
              </div>

              {/* Title */}
              <h2
                className="font-display text-2xl font-bold tracking-wider mb-2"
                style={{ color: hub.color, textShadow: `0 0 30px ${hub.color}40` }}
              >
                {hub.name}
              </h2>

              {/* Divider */}
              <div className="h-px w-16 mb-4" style={{ background: `linear-gradient(90deg, ${hub.color}60, transparent)` }} />

              {/* Description */}
              <p className="text-muted-foreground font-body leading-relaxed text-sm mb-6">
                {hub.description}
              </p>

              {/* Key Capabilities */}
              <div className="mb-7">
                <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                  Key Capabilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {hub.technologies.map((tech, i) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="px-3 py-1.5 rounded-full text-xs font-body flex items-center gap-1.5"
                      style={{
                        background: `${hub.color}10`,
                        color: `${hub.color}dd`,
                        border: `1px solid ${hub.color}18`,
                      }}
                    >
                      <Zap size={10} style={{ color: hub.color }} />
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  background: `linear-gradient(135deg, ${hub.color}30, ${hub.color}12)`,
                  color: hub.color,
                  border: `1px solid ${hub.color}30`,
                  boxShadow: `0 0 30px ${hub.color}10, 0 4px 20px hsl(0 0% 0% / 0.3)`,
                }}
              >
                EXPLORE HUB
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
