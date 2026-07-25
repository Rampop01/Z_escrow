"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShieldAlert } from "lucide-react";

export default function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [escrow, setEscrow] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/escrow/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resolvedParams.id, reason }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit dispute");
      }
      
      const data = await res.json();
      if (data.success) {
        // Route back to the escrow status page
        router.push(`/escrow/${resolvedParams.id}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while submitting dispute");
    }
    setSubmitting(false);
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
        className="w-full max-w-lg"
      >
        <button 
          onClick={() => router.push(`/escrow/${resolvedParams.id}`)}
          className="flex items-center text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Escrow
        </button>

        <div className="glass-panel p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500 mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Dispute Transaction</h1>
            <p className="text-sm text-white/60">Dispute resolution requires manual review.</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex justify-between items-center">
              <span className="text-sm text-white/50">Escrow ID</span>
              <span className="font-mono text-sm">{escrow.id.slice(0,8)}...</span>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex justify-between items-center">
              <span className="text-sm text-white/50">Amount in Dispute</span>
              <span className="font-bold text-zcash">{escrow.amount} ZEC</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-white/80 mb-2">
                What happened?
              </label>
              <textarea
                id="reason"
                rows={5}
                required
                placeholder="Please describe the issue in detail..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-lg p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-zcash focus:ring-1 focus:ring-zcash transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="w-full bg-red-500 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Manual Review"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
