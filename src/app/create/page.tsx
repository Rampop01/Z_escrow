"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateEscrow() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatingWallet, setGeneratingWallet] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    sellerAddress: "",
  });

  const handleGenerateWallet = async () => {
    setGeneratingWallet(true);
    try {
      const res = await fetch("/api/wallet/generate-address", { method: "POST" });
      const data = await res.json();
      if (data.address) {
        setFormData({ ...formData, sellerAddress: data.address });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate wallet");
    }
    setGeneratingWallet(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (data.id) {
        // Remember that this browser session is the creator (Seller)
        localStorage.setItem(`is_seller_${data.id}`, "true");
        router.push(`/escrow/${data.id}`);
      } else {
        alert("Failed to create escrow");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zcash/0 via-zcash to-zcash/0" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zcash/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-zcash" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Create Escrow</h2>
          <p className="text-sm text-white/60 mt-2">Secure your transaction with Zcash</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Item / Service Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Website Design"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zcash/50 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Price (ZEC)</label>
            <div className="relative">
              <input 
                required
                type="number" 
                step="0.0001"
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zcash/50 transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-medium">
                ZEC
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/80">Seller's Zcash Address</label>
              <button 
                type="button"
                onClick={handleGenerateWallet}
                disabled={generatingWallet}
                className="text-[10px] text-zcash hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                {generatingWallet ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                [Generate New Seller Wallet]
              </button>
            </div>
            <input 
              required
              type="text" 
              placeholder="z..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-zcash/50 transition-all font-mono text-sm"
              value={formData.sellerAddress}
              onChange={(e) => setFormData({...formData, sellerAddress: e.target.value})}
            />
            <p className="text-xs text-white/40">The funds will be released to this address.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-zcash text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-zcash/90 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Escrow Link"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
