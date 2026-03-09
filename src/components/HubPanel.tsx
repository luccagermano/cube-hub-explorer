import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface HubInfo {
  name: string;
  color: string;
  description: string;
  technologies: string[];
}

interface HubPanelProps {
  hub: HubInfo | null;
  onClose: () => void;
}

export default function HubPanel({ hub, onClose }: HubPanelProps) {
  return (
    <AnimatePresence>
      {hub && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 w-[380px] max-w-[90vw] z-40"
          >
            <div
              className="glass-panel rounded-2xl p-8 relative overflow-hidden"
              style={{
                boxShadow: `0 0 60px ${hub.color}22, 0 0 120px ${hub.color}08, 0 20px 60px hsl(0 0% 4% / 0.8)`,
                borderColor: `${hub.color}25`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${hub.color}, transparent)` }}
              />
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: `${hub.color}50` }} />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 rounded-tr-2xl" style={{ borderColor: `${hub.color}50` }} />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: hub.color, boxShadow: `0 0 8px ${hub.color}` }} />
                <span className="text-[10px] font-display tracking-[0.3em] uppercase" style={{ color: `${hub.color}cc` }}>
                  Active Hub
                </span>
              </div>

              <h2
                className="font-display text-2xl font-bold tracking-wider mb-4"
                style={{ color: hub.color, textShadow: `0 0 20px ${hub.color}40` }}
              >
                {hub.name}
              </h2>

              <p className="text-muted-foreground font-body leading-relaxed text-sm mb-6">
                {hub.description}
              </p>

              <div className="mb-6">
                <span className="text-[10px] font-display tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                  Key Technologies
                </span>
                <div className="flex flex-wrap gap-2">
                  {hub.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-full text-xs font-body"
                      style={{
                        background: `${hub.color}12`,
                        color: `${hub.color}dd`,
                        border: `1px solid ${hub.color}20`,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  background: `linear-gradient(135deg, ${hub.color}25, ${hub.color}10)`,
                  color: hub.color,
                  border: `1px solid ${hub.color}30`,
                  boxShadow: `0 0 20px ${hub.color}10`,
                }}
              >
                EXPLORE HUB
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
