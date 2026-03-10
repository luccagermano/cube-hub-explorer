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
    <div className="flex items-start justify-between mb-6 sm:mb-8">
      <div>
        <h2
          className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-wider"
          style={{ color: DDC_RED, textShadow: `0 0 30px ${DDC_RED}30` }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-foreground/70 text-xs sm:text-sm md:text-base mt-2 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="h-[2px] w-16 mt-4" style={{ background: `linear-gradient(90deg, ${DDC_RED}80, transparent)` }} />
      </div>
      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="p-2 rounded-xl transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-shrink-0 ml-4"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <X size={18} className="text-foreground/60" />
      </button>
    </div>
  );
}

/* ── Info card with tooltip ── */
function InfoCard({ title, text, icon, tooltip, className = "" }: { title: string; text: string; icon?: React.ReactNode; tooltip?: string; className?: string }) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`group rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary/40 ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
      }}
      tabIndex={0}
      role="article"
      aria-label={`${title}: ${text}`}
    >
      {icon && <div className="mb-3" style={{ color: DDC_RED }}>{icon}</div>}
      <h4 className="text-foreground font-display text-xs sm:text-sm font-semibold tracking-wide mb-2">{title}</h4>
      <p className="text-foreground/60 text-[11px] sm:text-xs leading-relaxed">{text}</p>
    </motion.div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent className="max-w-[200px] text-xs">{tooltip}</TooltipContent>
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
      <div className="mt-6 sm:mt-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}25, ${DDC_RED}10)`,
            color: DDC_RED,
            border: `1px solid ${DDC_RED}25`,
          }}
        >
          EXPLORE SOLUTIONS
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
        className="rounded-2xl p-5 sm:p-6 md:p-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 rounded-xl flex-shrink-0" style={{ background: `${DDC_RED}15` }}>
              <Phone size={18} style={{ color: DDC_RED }} />
            </div>
            <div>
              <p className="text-foreground/50 text-[10px] sm:text-xs font-display tracking-wider uppercase">Phone</p>
              <p className="text-foreground text-xs sm:text-sm font-medium">+55 11 99140-8071</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 rounded-xl flex-shrink-0" style={{ background: `${DDC_RED}15` }}>
              <Mail size={18} style={{ color: DDC_RED }} />
            </div>
            <div>
              <p className="text-foreground/50 text-[10px] sm:text-xs font-display tracking-wider uppercase">Email</p>
              <p className="text-foreground text-xs sm:text-sm font-medium break-all">contato@ddccompany.com.br</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 rounded-xl flex-shrink-0" style={{ background: `${DDC_RED}15` }}>
              <MapPin size={18} style={{ color: DDC_RED }} />
            </div>
            <div>
              <p className="text-foreground/50 text-[10px] sm:text-xs font-display tracking-wider uppercase">Location</p>
              <p className="text-foreground text-xs sm:text-sm font-medium">Av. João Manoel, 600, Centro, Arujá-SP</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}25, ${DDC_RED}10)`,
            color: DDC_RED,
            border: `1px solid ${DDC_RED}25`,
          }}
        >
          REQUEST A QUOTE
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center justify-center rounded-2xl p-4 sm:p-5 aspect-square transition-all duration-300 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary/40"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                tabIndex={0}
                role="img"
                aria-label={partner.name}
              >
                <img
                  src={partner.src}
                  alt={partner.name}
                  className="max-w-[80%] max-h-[80%] object-contain opacity-80 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>{partner.name}</TooltipContent>
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
