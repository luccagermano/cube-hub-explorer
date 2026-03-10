import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Phone, Mail, MapPin, Send, Linkedin, Instagram, Briefcase, Code, Users, Shield, Lightbulb, HeadphonesIcon, GraduationCap } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PopupCategory } from "./InteractiveCube";

interface LiquidGlassModalProps {
  category: PopupCategory;
  onClose: () => void;
}

const DDC_RED = "#c4364a";

/* ── Focus trap hook ── */
function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previousFocus.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Focus first focusable element
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [active]);

  return containerRef;
}

/* ── Glass wrapper shared by all popups ── */
function GlassPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const trapRef = useFocusTrap(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 pointer-events-none"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={trapRef}
        className="relative w-[95%] sm:w-[88%] md:w-[62%] lg:w-[56%] xl:w-[50%] max-h-[88vh] sm:max-h-[82vh] md:max-h-[78vh] overflow-y-auto pointer-events-auto scrollbar-thin"
        style={{
          background: "rgba(14, 14, 16, 0.88)",
          backdropFilter: "blur(32px) saturate(160%)",
          WebkitBackdropFilter: "blur(32px) saturate(160%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          boxShadow: `
            0 0 0 0.5px rgba(255, 255, 255, 0.05),
            0 0 60px rgba(196, 54, 74, 0.06),
            0 24px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.07)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top specular highlight */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
        />
        {/* Internal gradient overlay */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 35%)" }}
        />
        <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Header with close button ── */
function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between mb-8 sm:mb-10">
      <div className="min-w-0">
        <h2
          className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-wide"
          style={{ color: "#f0f0f2" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-[15px] mt-2.5 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {subtitle}
          </p>
        )}
        <div
          className="h-[2px] w-12 mt-5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${DDC_RED}, transparent)` }}
        />
      </div>
      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-shrink-0 ml-6"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
      </button>
    </div>
  );
}

/* ── Info card with tooltip ── */
function InfoCard({ title, text, icon, tooltip, className = "" }: { title: string; text: string; icon?: React.ReactNode; tooltip?: string; className?: string }) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className={`group rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/30 ${className}`}
      style={{
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}
      tabIndex={0}
      role="article"
      aria-label={`${title}: ${text}`}
    >
      {icon && (
        <div className="mb-3.5 w-9 h-9 flex items-center justify-center rounded-lg" style={{ background: `${DDC_RED}14`, color: DDC_RED }}>
          {icon}
        </div>
      )}
      <h4 className="font-display text-[13px] sm:text-sm font-semibold tracking-wide mb-1.5" style={{ color: "#e8e8ea" }}>{title}</h4>
      <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{text}</p>
    </motion.div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent
          className="max-w-[220px] text-xs font-medium"
          style={{
            background: "rgba(20,20,22,0.92)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return card;
}

/* ── A) Solutions Popup ── */
function SolutionsContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalHeader
        title="Solutions & Services"
        subtitle="Agile, innovative solutions to help your business grow, automate processes, and stand out in the market."
        onClose={onClose}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <InfoCard
          icon={<Briefcase size={22} />}
          title="DDC Workspace Platform"
          text="Custom-built ERP tailored for investment offices — streamlining operations and decision-making."
          tooltip="Enterprise resource planning built for the financial sector"
        />
        <InfoCard
          icon={<Code size={22} />}
          title="Custom Software Development"
          text="Bespoke software solutions designed to transform your business with cutting-edge technology."
          tooltip="End-to-end software engineering for your unique needs"
        />
        <InfoCard
          icon={<Lightbulb size={22} />}
          title="Specialized Consulting"
          text="Expert advisors ready to accelerate your digital transformation and business growth."
          tooltip="Strategic IT and digital transformation advisory"
        />
      </div>
      <div className="mt-8">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-display font-semibold tracking-widest uppercase transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}, ${DDC_RED}cc)`,
            color: "#fff",
            boxShadow: `0 4px 20px ${DDC_RED}30`,
          }}
        >
          EXPLORE SOLUTIONS
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>
    </>
  );
}

/* ── B) Contact Popup ── */
function ContactContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalHeader
        title="Get in Touch"
        subtitle="Ready to transform your business? Let's talk."
        onClose={onClose}
      />
      <div
        className="rounded-2xl p-5 sm:p-7"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        <div className="space-y-5">
          {[
            { icon: <Phone size={16} />, label: "Phone", value: "+55 11 99140-8071" },
            { icon: <Mail size={16} />, label: "Email", value: "contato@ddccompany.com.br", breakAll: true },
            { icon: <MapPin size={16} />, label: "Location", value: "Av. João Manoel, 600, Centro, Arujá-SP" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: `${DDC_RED}12`, color: DDC_RED }}>
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-display tracking-widest uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</p>
                <p className={`text-sm font-medium ${item.breakAll ? "break-all" : ""}`} style={{ color: "#e8e8ea" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      <div className="mt-7">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-display font-semibold tracking-widest uppercase transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}, ${DDC_RED}cc)`,
            color: "#fff",
            boxShadow: `0 4px 20px ${DDC_RED}30`,
          }}
        >
          REQUEST A QUOTE
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>
    </>
  );
}

/* ── C) Company Profile Popup ── */
function CompanyContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalHeader
        title="Company Profile"
        subtitle="DDC adapts to fit your business profile with versatility and precision."
        onClose={onClose}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <InfoCard
          icon={<Briefcase size={20} />}
          title="Decision at Your Fingertips"
          text="DDC tools make your decision-making faster and more efficient with real-time data insights."
          tooltip="Real-time business intelligence dashboards"
        />
        <InfoCard
          icon={<Shield size={20} />}
          title="Market-Leading Booster"
          text="Experience the true concept of Fintech — the most complete booster on the market."
          tooltip="Comprehensive fintech acceleration platform"
        />
        <InfoCard
          icon={<HeadphonesIcon size={20} />}
          title="Dedicated Support"
          text="Exclusive support team available to resolve all product and platform inquiries."
          tooltip="Priority support with dedicated account managers"
        />
        <InfoCard
          icon={<GraduationCap size={20} />}
          title="Consulting & Training"
          text="Beyond consulting — built-in training programs to prepare your entire team for success."
          tooltip="Onboarding and continuous education programs"
        />
      </div>
    </>
  );
}

/* ── D) Clients Popup ── */
function ClientsContent({ onClose }: { onClose: () => void }) {
  const partners = [
    { src: "/partners/partner-1.png", name: "Partner 1" },
    { src: "/partners/partner-2.png", name: "Partner 2" },
    { src: "/partners/partner-3.png", name: "Partner 3" },
    { src: "/partners/partner-4.png", name: "Partner 4" },
    { src: "/partners/partner-5.png", name: "Partner 5" },
    { src: "/partners/partner-6.png", name: "Partner 6" },
  ];

  return (
    <>
      <ModalHeader
        title="Our Partners"
        subtitle="Companies that trusted us to accelerate their business."
        onClose={onClose}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {partners.map((partner, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
                className="flex items-center justify-center rounded-2xl p-5 sm:p-6 aspect-square transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/30"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                }}
                tabIndex={0}
                role="img"
                aria-label={partner.name}
              >
                <img
                  src={partner.src}
                  alt={partner.name}
                  className="max-w-[75%] max-h-[75%] object-contain opacity-75 group-hover:opacity-100 transition-opacity duration-300"
                  loading="lazy"
                />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent
              style={{
                background: "rgba(20,20,22,0.92)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {partner.name}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </>
  );
}

/* ── E) Newsletter Popup ── */
function NewsletterContent({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");

  return (
    <>
      <ModalHeader
        title="Stay Informed"
        subtitle="Subscribe to our newsletter and be the first to know about innovations, insights, and exclusive updates from DDC."
        onClose={onClose}
      />
      <div className="max-w-md">
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            aria-label="Email address for newsletter"
            className="flex-1 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl text-sm text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/50"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, ${DDC_RED}, ${DDC_RED}cc)`,
              color: "#fff",
              border: "none",
            }}
            aria-label="Subscribe to newsletter"
          >
            <Send size={14} />
            SUBSCRIBE
          </motion.button>
        </div>
      </div>
    </>
  );
}

/* ── F) Intro / Hero Popup ── */
function IntroContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalHeader
        title="Connecting People, Empowering Business."
        onClose={onClose}
      />
      <p className="text-foreground/70 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mb-6 sm:mb-8">
        Innovation and technology go hand in hand. We are a company specialized in IT solutions that propel businesses into the future. From strategic consulting to software development, we offer cutting-edge technology to turn challenges into opportunities.
      </p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <motion.a
          href="https://www.linkedin.com/company/ddc-company/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}25, ${DDC_RED}10)`,
            color: DDC_RED,
            border: `1px solid ${DDC_RED}25`,
          }}
          aria-label="Visit DDC on LinkedIn"
        >
          <Linkedin size={16} />
          LINKEDIN
        </motion.a>
        <motion.a
          href="https://www.instagram.com/ddc.company/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}25, ${DDC_RED}10)`,
            color: DDC_RED,
            border: `1px solid ${DDC_RED}25`,
          }}
          aria-label="Visit DDC on Instagram"
        >
          <Instagram size={16} />
          INSTAGRAM
        </motion.a>
      </div>
    </>
  );
}

/* ── G) About Popup ── */
function AboutContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalHeader
        title="About DDC"
        subtitle="Since 2020, building the future of finance and technology."
        onClose={onClose}
      />
      <div
        className="rounded-2xl p-5 sm:p-6 md:p-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-foreground/80 text-xs sm:text-sm md:text-base leading-relaxed mb-4">
          With the mission to innovate the financial market, we use technology as the primary tool to reach new administrative heights. DDC is more than just a booster — it's the future.
        </p>
        <p className="text-foreground/60 text-xs sm:text-sm leading-relaxed">
          Our qualified team, driven by a passion for innovation, creates secure, scalable, and efficient solutions so your company can grow with confidence. Come discover the new world built to take you to the top.
        </p>
      </div>
    </>
  );
}

/* ── Main Export ── */
export default function LiquidGlassModal({ category, onClose }: LiquidGlassModalProps) {
  const renderContent = () => {
    switch (category) {
      case "solutions": return <SolutionsContent onClose={onClose} />;
      case "contact": return <ContactContent onClose={onClose} />;
      case "company": return <CompanyContent onClose={onClose} />;
      case "clients": return <ClientsContent onClose={onClose} />;
      case "newsletter": return <NewsletterContent onClose={onClose} />;
      case "intro": return <IntroContent onClose={onClose} />;
      default: return null;
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <AnimatePresence>
        {category && (
          <GlassPanel onClose={onClose}>
            {renderContent()}
          </GlassPanel>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

/* ── About modal (separate export for navbar) ── */
export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <TooltipProvider delayDuration={300}>
      <AnimatePresence>
        {open && (
          <GlassPanel onClose={onClose}>
            <AboutContent onClose={onClose} />
          </GlassPanel>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
