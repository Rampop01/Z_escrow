"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Zap, CheckCircle2, UserCheck, Briefcase, Globe, Coins, ShieldCheck, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredAudience, setHoveredAudience] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-zcash selection:text-black">
      
      {/* Dynamic Background Glow */}
      <div 
        className="fixed inset-0 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(244,183,40,0.06), transparent 80%)`
        }}
      />
      
      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-4 text-center z-10 pt-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="relative group mb-8"
        >
          <div className="absolute -inset-4 bg-zcash/20 rounded-full blur-2xl group-hover:bg-zcash/30 transition-all duration-700 animate-pulse" />
          
          {/* Rotating Text */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-6 md:-inset-10 z-0 pointer-events-none"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full text-zcash/40">
              <path id="circlePath" d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" fill="none" />
              <text>
                <textPath href="#circlePath" startOffset="0" className="text-[19px] font-bold uppercase tracking-[0.25em] fill-current">
                  • Z-ESCROW • Z-ESCROW • Z-ESCROW
                </textPath>
              </text>
            </svg>
          </motion.div>

          <div className="relative w-24 h-24 md:w-32 md:h-32 bg-black border border-zcash/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,183,40,0.15)] z-10">
            <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-zcash" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
        >
          TRUST <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zcash via-yellow-200 to-white pr-2">
            NOBODY.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl font-light mb-12 leading-relaxed"
        >
          Tired of chargebacks, scams, and nosy middlemen? Lock your ZEC in a 100% shielded escrow that guarantees fair trades without exposing your identity.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/create" className="group relative inline-flex items-center justify-center">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-zcash rounded-full group-hover:w-full group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-zcash text-zcash rounded-full font-bold text-lg uppercase tracking-wide overflow-hidden transition-all group-hover:bg-zcash group-hover:text-black">
              Start Escrow
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </section>

      {/* ----------------- INFINITE MARQUEE ----------------- */}
      <section className="py-6 bg-zcash text-black overflow-hidden relative z-10 border-y-4 border-white/10 rotate-1 scale-105">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-6 text-2xl font-black uppercase tracking-tight">
              <span className="flex items-center gap-3"><Shield className="w-6 h-6" /> 100% Shielded</span>
              <span>•</span>
              <span className="flex items-center gap-3"><Zap className="w-6 h-6" /> Zero Wait Mempool</span>
              <span>•</span>
              <span className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6" /> Fair Arbitration</span>
              <span>•</span>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- HOW IT WORKS (ZIGZAG) ----------------- */}
      <section className="py-32 px-4 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white/10 relative">
            <span className="absolute inset-0 text-white bg-clip-text -translate-y-[2px] -translate-x-[2px]">HOW IT WORKS</span>
            HOW IT WORKS
          </h2>
        </div>

        <div className="space-y-24 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zcash/20 to-transparent -translate-x-1/2 hidden md:block z-0"></div>
          {[
            { step: "01", title: "CREATE", desc: "Define the terms. We generate a unique Sapling Unified Address on the fly.", icon: FileText, align: "left" },
            { step: "02", title: "FUND", desc: "Buyer sends ZEC. Our engine scans the mempool and secures it instantly.", icon: Coins, align: "right" },
            { step: "03", title: "RELEASE", desc: "Delivery approved. Funds are routed completely off-radar to the seller.", icon: ShieldCheck, align: "left" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${item.align === "right" ? "md:flex-row-reverse" : ""}`}
            >
              <div className="flex-1 space-y-4 text-center md:text-left relative">
                <span className="text-2xl md:text-3xl font-mono text-white/20 block">{item.step}</span>
                <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-zcash">{item.title}</h3>
                <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed">{item.desc}</p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-zcash rounded-full blur-2xl opacity-10"></div>
                  <item.icon className="w-24 h-24 md:w-40 md:h-40 text-white/80 relative z-10 drop-shadow-xl" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ----------------- WHO NEEDS IT (HOVER ROWS) ----------------- */}
      <section className="py-24 relative z-10 border-t border-white/10 bg-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center uppercase tracking-wider text-zcash">Target Audience</h2>
          
          <div className="border-t border-white/20">
            {[
              { title: "Freelancers", icon: Globe, desc: "Never write another line of code without the money locked in escrow." },
              { title: "P2P Traders", icon: Briefcase, desc: "Trade high-value digital assets without relying on surveillance exchanges." },
              { title: "Anonymous Buyers", icon: UserCheck, desc: "Buy what you want, when you want. 100% shielded. 100% anonymous." },
            ].map((audience, i) => (
              <div 
                key={i}
                onMouseEnter={() => setHoveredAudience(i)}
                onMouseLeave={() => setHoveredAudience(null)}
                className="group border-b border-white/20 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between cursor-pointer transition-colors hover:bg-zcash/5"
              >
                <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto">
                  <span className="text-xl text-white/30 font-mono hidden md:block">0{i+1}</span>
                  <h3 className={`text-2xl md:text-4xl font-bold uppercase tracking-tight transition-colors duration-300 ${hoveredAudience === i ? "text-zcash" : "text-white"}`}>
                    {audience.title}
                  </h3>
                </div>
                
                <div className={`overflow-hidden transition-all duration-500 max-w-lg text-center md:text-right mt-4 md:mt-0 ${hoveredAudience === i ? "opacity-100 max-h-40" : "opacity-0 max-h-0 md:max-h-40 md:opacity-0"}`}>
                  <p className="text-base md:text-lg text-white/70 font-light italic">
                    "{audience.desc}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="py-12 border-t border-white/10 text-center relative z-10 bg-black">
        <p className="text-white/40 text-sm font-light">
          Built with <span className="text-zcash">♥</span> for the Free Market. <br className="md:hidden" />
          Powered by Zcash.
        </p>
      </footer>

    </div>
  );
}
