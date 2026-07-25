"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

export default function JudgePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [escrow, setEscrow] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<"buyer" | "seller" | null>(null);

  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        const res = await fetch(`/api/escrow/status?id=${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setEscrow(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEscrow();
  }, [resolvedParams.id]);

  const handleResolve = async (finalDecision: "buyer" | "seller") => {
    setDecision(finalDecision);
    setSubmitting(true);
    try {
      const res = await fetch("/api/escrow/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resolvedParams.id, decision: finalDecision }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to resolve dispute");
      }
      
      const data = await res.json();
      if (data.success) {
        alert("Dispute successfully resolved!");
        router.push(`/escrow/${resolvedParams.id}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while resolving dispute");
    }
    setSubmitting(false);
    setDecision(null);
  };

  if (!escrow) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zcash" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <button 
          onClick={() => router.push(`/escrow/${resolvedParams.id}`)}
          className="flex items-center text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Escrow
        </button>

        <div className="glass-panel p-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto text-purple-400 mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Judge Dashboard</h1>
            <p className="text-sm text-white/60">Review the dispute details and issue a final resolution.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <span className="block text-xs text-white/50 uppercase tracking-wider mb-1">Escrow ID</span>
              <span className="font-mono text-sm">{escrow.id.slice(0,8)}...</span>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <span className="block text-xs text-white/50 uppercase tracking-wider mb-1">Amount</span>
              <span className="font-bold text-zcash">{escrow.amount} ZEC</span>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
              Buyer's Claim
            </h3>
            <p className="text-sm text-white/70 italic p-4 bg-white/5 rounded border-l-2 border-red-500">
              "{escrow.disputeReason || 'No reason provided.'}"
            </p>
          </div>

          {escrow.status === "disputed" ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleResolve("buyer")}
                disabled={submitting}
                className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting && decision === "buyer" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Refund Buyer
                  </>
                )}
              </button>

              <button
                onClick={() => handleResolve("seller")}
                disabled={submitting}
                className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting && decision === "seller" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Release to Seller
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-white/60">
                This dispute has already been resolved. Status: <strong className="text-white uppercase">{escrow.status}</strong>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
