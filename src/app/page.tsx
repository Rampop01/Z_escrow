"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl space-y-8"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Privacy-First <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zcash to-yellow-200">
            Digital Escrow
          </span>
        </h1>
        
        <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          The safest way to transact online. Lock your ZEC in a shielded escrow address until the goods or services are delivered.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/create"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-black bg-zcash rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start an Escrow <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20">
          {[
            { icon: Shield, title: "Shielded", desc: "100% private transactions using Zcash shielded addresses." },
            { icon: Lock, title: "Secure", desc: "Funds are locked on-chain until both parties are satisfied." },
            { icon: Zap, title: "Fast", desc: "No sign-ups required. Create an escrow link in seconds." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="glass-panel p-6 flex flex-col items-center text-center space-y-4 hover:border-glass-border-hover transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-zcash/10 flex items-center justify-center text-zcash">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
