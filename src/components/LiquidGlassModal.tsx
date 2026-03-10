import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Phone, Mail, MapPin, Send, Linkedin, Instagram, Briefcase, Code, Users, Shield, Lightbulb, HeadphonesIcon, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import type { PopupCategory } from "./InteractiveCube";

interface LiquidGlassModalProps {
  category: PopupCategory;
  onClose: () => void;
}

const DDC_RED = "#c4364a";

/* ── Glass wrapper shared by all popups ── */
function GlassPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none"
    >
      <div
        className="relative w-[90%] md:w-[65%] lg:w-[60%] max-h-[80vh] md:max-h-[75vh] overflow-y-auto pointer-events-auto"
        style={{
          background: "rgba(20, 20, 20, 0.85)",
          backdropFilter: "blur(25px) saturate(180%)",
          WebkitBackdropFilter: "blur(25px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          boxShadow: `
            0 0 80px ${DDC_RED}12,
            0 32px 64px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 0 rgba(255, 255, 255, 0.02)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] rounded-t-[24px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
        />
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(0,0,0,0.08) 100%)" }}
        />
        <div className="relative z-10 p-8 md:p-12">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Header with close button ── */
function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h2
          className="font-display text-2xl md:text-3xl font-bold tracking-wider"
          style={{ color: DDC_RED, textShadow: `0 0 30px ${DDC_RED}30` }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-foreground/70 text-sm md:text-base mt-2 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="h-[2px] w-16 mt-4" style={{ background: `linear-gradient(90deg, ${DDC_RED}80, transparent)` }} />
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-xl transition-all duration-200 hover:scale-110 flex-shrink-0 ml-4"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <X size={18} className="text-foreground/60" />
      </button>
    </div>
  );
}

/* ── Info card component ── */
function InfoCard({ title, text, icon, className = "" }: { title: string; text: string; icon?: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`group rounded-2xl p-5 md:p-6 transition-all duration-300 hover:scale-[1.02] ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
      }}
      title={text}
    >
      {icon && <div className="mb-3" style={{ color: DDC_RED }}>{icon}</div>}
      <h4 className="text-foreground font-display text-sm font-semibold tracking-wide mb-2">{title}</h4>
      <p className="text-foreground/60 text-xs leading-relaxed">{text}</p>
    </motion.div>
  );
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          icon={<Briefcase size={22} />}
          title="DDC Workspace Platform"
          text="Custom-built ERP tailored for investment offices — streamlining operations and decision-making."
        />
        <InfoCard
          icon={<Code size={22} />}
          title="Custom Software Development"
          text="Bespoke software solutions designed to transform your business with cutting-edge technology."
        />
        <InfoCard
          icon={<Lightbulb size={22} />}
          title="Specialized Consulting"
          text="Expert advisors ready to accelerate your digital transformation and business growth."
        />
      </div>
      <div className="mt-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] group"
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
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${DDC_RED}15` }}>
              <Phone size={18} style={{ color: DDC_RED }} />
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-display tracking-wider uppercase">Phone</p>
              <p className="text-foreground text-sm font-medium">+55 11 99140-8071</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${DDC_RED}15` }}>
              <Mail size={18} style={{ color: DDC_RED }} />
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-display tracking-wider uppercase">Email</p>
              <p className="text-foreground text-sm font-medium">contato@ddccompany.com.br</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${DDC_RED}15` }}>
              <MapPin size={18} style={{ color: DDC_RED }} />
            </div>
            <div>
              <p className="text-foreground/50 text-xs font-display tracking-wider uppercase">Location</p>
              <p className="text-foreground text-sm font-medium">Av. João Manoel, 600, Centro, Arujá-SP</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] group"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={<Briefcase size={20} />}
          title="Decision at Your Fingertips"
          text="DDC tools make your decision-making faster and more efficient with real-time data insights."
        />
        <InfoCard
          icon={<Shield size={20} />}
          title="Market-Leading Booster"
          text="Experience the true concept of Fintech — the most complete booster on the market."
        />
        <InfoCard
          icon={<HeadphonesIcon size={20} />}
          title="Dedicated Support"
          text="Exclusive support team available to resolve all product and platform inquiries."
        />
        <InfoCard
          icon={<GraduationCap size={20} />}
          title="Consulting & Training"
          text="Beyond consulting — built-in training programs to prepare your entire team for success."
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {partners.map((partner, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="flex items-center justify-center rounded-2xl p-5 aspect-square transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            title={partner.name}
          >
            <img
              src={partner.src}
              alt={partner.name}
              className="max-w-[80%] max-h-[80%] object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </motion.div>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-5 py-3.5 rounded-xl text-sm text-foreground placeholder:text-foreground/30 outline-none transition-all duration-200 focus:ring-1"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              focusRing: DDC_RED,
            }}
          />
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02] whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, ${DDC_RED}, ${DDC_RED}cc)`,
              color: "#fff",
              border: "none",
            }}
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
      <p className="text-foreground/70 text-sm md:text-base leading-relaxed max-w-2xl mb-8">
        Innovation and technology go hand in hand. We are a company specialized in IT solutions that propel businesses into the future. From strategic consulting to software development, we offer cutting-edge technology to turn challenges into opportunities.
      </p>
      <div className="flex flex-wrap gap-3">
        <motion.a
          href="https://www.linkedin.com/company/ddc-company/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}25, ${DDC_RED}10)`,
            color: DDC_RED,
            border: `1px solid ${DDC_RED}25`,
          }}
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
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-semibold tracking-wider transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${DDC_RED}25, ${DDC_RED}10)`,
            color: DDC_RED,
            border: `1px solid ${DDC_RED}25`,
          }}
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
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-foreground/80 text-sm md:text-base leading-relaxed mb-4">
          With the mission to innovate the financial market, we use technology as the primary tool to reach new administrative heights. DDC is more than just a booster — it's the future.
        </p>
        <p className="text-foreground/60 text-sm leading-relaxed">
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
    <AnimatePresence>
      {category && (
        <GlassPanel onClose={onClose}>
          {renderContent()}
        </GlassPanel>
      )}
    </AnimatePresence>
  );
}

/* ── About modal (separate export for navbar) ── */
export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <GlassPanel onClose={onClose}>
          <AboutContent onClose={onClose} />
        </GlassPanel>
      )}
    </AnimatePresence>
  );
}
