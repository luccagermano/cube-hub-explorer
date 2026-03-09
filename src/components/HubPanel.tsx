import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface HubPanelProps {
  hub: { name: string; color: string; description: string } | null;
  onClose: () => void;
}

export default function HubPanel({ hub, onClose }: HubPanelProps) {
  return (
    <AnimatePresence>
      {hub && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-20"
        >
          <div
            className="rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-6 relative overflow-hidden"
            style={{ boxShadow: `0 0 40px ${hub.color}33, 0 0 80px ${hub.color}11` }}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: hub.color }} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <h2
              className="font-display text-2xl font-bold tracking-wider mb-3"
              style={{ color: hub.color }}
            >
              {hub.name}
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-sm">
              {hub.description}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                className="px-4 py-2 rounded-lg text-xs font-display font-semibold tracking-wider transition-all hover:scale-105"
                style={{
                  background: `${hub.color}22`,
                  color: hub.color,
                  border: `1px solid ${hub.color}44`,
                }}
              >
                EXPLORE →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
