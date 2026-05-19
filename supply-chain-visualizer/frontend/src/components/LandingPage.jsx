import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  GitBranch,
  Brain,
  FileSearch,
  ArrowRight,
  Scan,
  Lock,
  Zap,
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED DOT-GRID BACKGROUND
   ═══════════════════════════════════════════════════════════════════════════ */
function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, transparent 0%, var(--bg-primary) 100%)",
        }}
      />
      <motion.div
        className="absolute inset-0 grid-pattern"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 1.5 }}
      />
      {/* Soft ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 800,
          height: 500,
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)",
          filter: "blur(100px)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE CARD
   ═══════════════════════════════════════════════════════════════════════════ */
function FeatureCard({ icon: Icon, title, description, accentColor, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      animate={controls}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group w-full h-full"
    >
      <div
        className="surface-card p-8 h-full min-h-[240px] flex flex-col items-center text-center justify-start relative overflow-hidden"
        style={{ transition: "all 0.25s var(--ease-smooth)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
          e.currentTarget.style.borderColor = `${accentColor}55`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "var(--shadow-card)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        {/* Top glow line */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />

        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl mb-6"
          style={{
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}20`,
          }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>

        <h3 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TECH BADGE PILL
   ═══════════════════════════════════════════════════════════════════════════ */
function TechBadge({ label, value }) {
  return (
    <div
      className="flex flex-col items-center px-5 py-2"
      style={{ minWidth: 80 }}
    >
      <span
        className="text-sm font-bold tracking-tight"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
      >
        {value}
      </span>
      <span
        className="text-[10px] uppercase tracking-widest font-medium mt-0.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <DotGrid />

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mt-6 self-center w-[90%] max-w-5xl rounded-full px-6 py-3 flex justify-between items-center shadow-lg z-50 transition-colors duration-300"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px) saturate(1.8)",
          WebkitBackdropFilter: "blur(16px) saturate(1.8)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <Shield size={20} style={{ color: "var(--accent)" }} />
          <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            ShieldGraph
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/app")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap w-fit flex-shrink-0"
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              boxShadow: "0 1px 6px var(--accent-glow)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
          >
            Launch App
            <ArrowRight size={12} />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <main className="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        {/* Trust pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Lock size={11} style={{ color: "var(--accent)" }} />
          <span className="text-[11px] font-medium tracking-wide" style={{ color: "var(--text-muted)" }}>
            100% Local Execution · Zero Cloud Dependencies
          </span>
        </motion.div>

        {/* Headline — clean, high-contrast, no gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-center max-w-4xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)", lineHeight: 1.15 }}
        >
          Visualize Your Software Supply Chain.
          <br />
          <span style={{ color: "var(--accent)" }}>Expose Hidden Vulnerabilities.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center max-w-2xl mt-6 text-sm sm:text-base leading-relaxed mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Upload standard CycloneDX SBOMs to automatically parse dependencies,
          map trust-chain depth, and generate local AI-powered remediation
          advice using Llama 3 — entirely offline.
        </motion.p>

        {/* CTA + Badge wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-col items-center gap-10 mt-8 w-full"
        >
          {/* CTA row - FIXED WITH FLEX-WRAP */}
          <div className="flex flex-row flex-wrap items-center justify-center gap-6 w-full">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/app")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap w-fit flex-shrink-0"
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 12px var(--accent-glow)",
              }}
            >
              <Scan size={15} />
              Analyze SBOM
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.02 }}
              href="https://cyclonedx.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap w-fit flex-shrink-0"
              style={{
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <FileSearch size={14} />
              Learn CycloneDX
            </motion.a>
          </div>

          {/* Tech badge row */}
          <div
            className="inline-flex items-center justify-center flex-wrap rounded-2xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <TechBadge value="OSV" label="Database" />
            <div className="w-px h-8" style={{ background: "var(--border)" }} />
            <TechBadge value="Llama 3" label="Local AI" />
            <div className="w-px h-8" style={{ background: "var(--border)" }} />
            <TechBadge value="CycloneDX" label="Standard" />
            <div className="w-px h-8 hidden sm:block" style={{ background: "var(--border)" }} />
            <div className="hidden sm:block">
              <TechBadge value="100%" label="Offline" />
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── FEATURES ── */}
      <section className="relative z-10 w-full flex justify-center px-6 py-20">
        <div className="w-full max-w-5xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center max-w-3xl w-full mx-auto"
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase mb-4"
              style={{
                background: "var(--bg-surface-2)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              <Zap size={10} />
              Core Capabilities
            </span>
            <h2
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-center w-full"
              style={{ color: "var(--text-primary)" }}
            >
              Enterprise-Grade Security Analysis
            </h2>
            <p
              className="mt-3 max-w-lg mx-auto text-center text-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Three pillars of supply chain intelligence, running entirely on your
              local infrastructure.
            </p>
          </motion.div>

          {/* Centered Symmetric Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <FeatureCard
              icon={GitBranch}
              title="React Flow Canvas"
              description="Beautifully untangle complex nested package dependency trees with auto-layout algorithms. Zoom, pan, and inspect any node."
              accentColor="#0EA5E9"
              delay={0.1}
            />
            <FeatureCard
              icon={Brain}
              title="Ollama + Llama 3 Integration"
              description="Generate localized security insights and remediation suggestions on demand with zero external API dependencies."
              accentColor="#8B5CF6"
              delay={0.2}
            />
            <FeatureCard
              icon={FileSearch}
              title="CycloneDX Ingestion"
              description="Seamless validation of software components, versions, and licenses against live OSV vulnerability databases."
              accentColor="#10B981"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 py-8 text-center"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <p className="text-xs">
          Built with React · FastAPI · Ollama · React Flow — 100% local, zero telemetry.
        </p>
      </footer>
    </div>
  );
}