import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Phone, Mail, MapPin, Send, Linkedin, Instagram, Briefcase, Code, Users, Shield, Lightbulb, HeadphonesIcon, GraduationCap, Rocket } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PopupCategory } from "./InteractiveCube";
import ddcLogo from "@/assets/ddc-logo.svg";

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
          background: `hsl(var(--glass-bg))`,
          backdropFilter: "blur(32px) saturate(160%)",
          WebkitBackdropFilter: "blur(32px) saturate(160%)",
          border: `1px solid hsl(var(--glass-border))`,
          borderRadius: "20px",
          boxShadow: `
            0 0 0 0.5px hsl(var(--glass-border)),
            0 0 60px rgba(196, 54, 74, 0.06),
            0 24px 80px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 hsl(var(--glass-border))
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top specular highlight */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--glass-border)), transparent)" }}
        />
        {/* Internal gradient overlay */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{ background: "linear-gradient(180deg, hsl(var(--glass-card-bg)) 0%, transparent 35%)" }}
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
          style={{ color: "hsl(var(--glass-text))" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-[15px] mt-2.5 max-w-xl leading-relaxed" style={{ color: "hsl(var(--glass-text-sub))" }}>
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
        aria-label="Fechar"
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
        title="Soluções & Serviços"
        subtitle="Tecnologia sob medida para acelerar seu negócio. Desenvolvemos, integramos e otimizamos para você crescer mais rápido."
        onClose={onClose}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <InfoCard
          icon={<Briefcase size={22} />}
          title="DDC Workspace Platform"
          text="ERP customizado para escritórios de investimento — decisões mais rápidas com dados em tempo real."
          tooltip="Plataforma de gestão inteligente para o setor financeiro"
        />
        <InfoCard
          icon={<Code size={22} />}
          title="Desenvolvimento Sob Medida"
          text="Software projetado do zero para transformar operações e escalar seu negócio com tecnologia de ponta."
          tooltip="Engenharia de software completa para suas necessidades"
        />
        <InfoCard
          icon={<Lightbulb size={22} />}
          title="Consultoria Especializada"
          text="Especialistas prontos para acelerar sua transformação digital e impulsionar resultados."
          tooltip="Assessoria estratégica em TI e transformação digital"
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
          EXPLORAR SOLUÇÕES
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
        title="Fale Conosco"
        subtitle="Pronto para acelerar seu negócio? Vamos conversar."
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
            { icon: <Phone size={16} />, label: "Telefone", value: "+55 11 99140-8071" },
            { icon: <Mail size={16} />, label: "E-mail", value: "contato@ddccompany.com.br", breakAll: true },
            { icon: <MapPin size={16} />, label: "Endereço", value: "Av. João Manoel, 600, Centro, Arujá-SP" },
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
          SOLICITAR ORÇAMENTO
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
        title="Perfil da Empresa"
        subtitle="A DDC é uma Booster Tech — impulsionamos negócios com tecnologia estratégica, engenharia de alta performance e inovação contínua."
        onClose={onClose}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <InfoCard
          icon={<Rocket size={20} />}
          title="Aceleração Digital"
          text="Ferramentas e estratégias que colocam dados em tempo real na palma da sua mão para decisões mais rápidas."
          tooltip="Business intelligence e dashboards em tempo real"
        />
        <InfoCard
          icon={<Shield size={20} />}
          title="Booster de Mercado"
          text="O conceito mais completo de Fintech — a plataforma que impulsiona seu negócio ao próximo nível."
          tooltip="Plataforma completa de aceleração fintech"
        />
        <InfoCard
          icon={<HeadphonesIcon size={20} />}
          title="Suporte Dedicado"
          text="Equipe exclusiva disponível para resolver todas as dúvidas sobre produtos e plataforma."
          tooltip="Suporte prioritário com gerentes de conta dedicados"
        />
        <InfoCard
          icon={<GraduationCap size={20} />}
          title="Consultoria & Treinamento"
          text="Além de consultoria — programas de capacitação integrados para preparar toda a sua equipe."
          tooltip="Programas de onboarding e educação contínua"
        />
      </div>
    </>
  );
}

/* ── D) Clients Popup ── */
function ClientsContent({ onClose }: { onClose: () => void }) {
  const partners = [
    { src: "/partners/partner-1.png", name: "Parceiro 1" },
    { src: "/partners/partner-2.png", name: "Parceiro 2" },
    { src: "/partners/partner-3.png", name: "Parceiro 3" },
    { src: "/partners/partner-4.png", name: "Parceiro 4" },
    { src: "/partners/partner-5.png", name: "Parceiro 5" },
    { src: "/partners/partner-6.png", name: "Parceiro 6" },
  ];

  return (
    <>
      <ModalHeader
        title="Nossos Parceiros"
        subtitle="Empresas que confiaram na DDC para acelerar seus resultados."
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
        title="Fique por Dentro"
        subtitle="Assine nossa newsletter e receba em primeira mão novidades, insights e atualizações exclusivas da DDC."
        onClose={onClose}
      />
      <div className="max-w-md">
        <label htmlFor="newsletter-email" className="sr-only">Endereço de e-mail</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            aria-label="Endereço de e-mail para newsletter"
            className="flex-1 px-5 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/40"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e8e8ea",
            }}
          />
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-display font-semibold tracking-widest uppercase transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, ${DDC_RED}, ${DDC_RED}cc)`,
              color: "#fff",
              boxShadow: `0 4px 20px ${DDC_RED}30`,
            }}
            aria-label="Assinar newsletter"
          >
            <Send size={13} />
            ASSINAR
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
        title="Impulsionamos Negócios com Tecnologia."
        onClose={onClose}
      />
      <div className="flex items-center gap-4 mb-6">
        <img src={ddcLogo} alt="DDC Company" className="h-8 sm:h-10 w-auto" />
        <span className="text-[10px] sm:text-xs font-display tracking-[0.25em] uppercase" style={{ color: DDC_RED }}>
          BOOSTER TECH
        </span>
      </div>
      <p className="text-sm sm:text-[15px] leading-relaxed max-w-2xl mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
        Somos uma Booster Tech especializada em acelerar empresas através de engenharia de software, consultoria estratégica e soluções digitais de alto impacto. Da concepção à execução, transformamos desafios em crescimento real.
      </p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {[
          { href: "https://www.linkedin.com/company/ddc-company/", icon: <Linkedin size={15} />, label: "LinkedIn" },
          { href: "https://www.instagram.com/ddc.company/", icon: <Instagram size={15} />, label: "Instagram" },
        ].map((link, i) => (
          <motion.a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-xs font-display font-semibold tracking-widest uppercase transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "#e8e8ea",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            aria-label={`Visite a DDC no ${link.label}`}
          >
            {link.icon}
            {link.label.toUpperCase()}
          </motion.a>
        ))}
      </div>
    </>
  );
}

/* ── G) About Popup ── */
function AboutContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <ModalHeader
        title="Sobre a DDC"
        subtitle="Desde 2020, construindo o futuro da tecnologia e dos negócios."
        onClose={onClose}
      />
      <div className="flex items-center gap-4 mb-6">
        <img src={ddcLogo} alt="DDC Company" className="h-7 sm:h-9 w-auto" />
        <span className="text-[10px] sm:text-xs font-display tracking-[0.25em] uppercase" style={{ color: DDC_RED }}>
          BOOSTER TECH
        </span>
      </div>
      <div
        className="rounded-2xl p-6 sm:p-7"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        <p className="text-sm sm:text-[15px] leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
          Com a missão de impulsionar o mercado, usamos tecnologia como ferramenta principal para alcançar novos patamares. A DDC é mais do que um booster — somos o parceiro estratégico que acelera sua transformação digital.
        </p>
        <p className="text-[13px] sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
          Nossa equipe qualificada, movida por inovação e execução, cria soluções seguras, escaláveis e de alta performance para que sua empresa cresça com confiança. Venha descobrir o novo patamar construído para levar você ao topo.
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
