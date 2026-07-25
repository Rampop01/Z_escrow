"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Check, QrCode, Copy, ShieldAlert, ArrowRightCircle, Loader2, Wallet, Pickaxe, Lock, XCircle } from "lucide-react";

type EscrowStatus = "created" | "funded" | "released" | "disputed";

import { useRouter } from "next/navigation";

export default function EscrowStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<EscrowStatus>("created");
  const [escrow, setEscrow] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [walletBalance, setWalletBalance] = useState("0.00");
  const [sellerWalletBalance, setSellerWalletBalance] = useState("0.00");
  const [mining, setMining] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  // Polling for status updates
  useEffect(() => {
    setIsSeller(localStorage.getItem(`is_seller_${resolvedParams.id}`) === "true");
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/escrow/status?id=${resolvedParams.id}`);
        const data = await res.json();
        if (data.escrow) {
          setEscrow(data.escrow);
          setStatus(data.escrow.status);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchWallet = async (currentEscrow: any) => {
      try {
        const res = await fetch("/api/wallet/balance");
        const data = await res.json();
        if (data.total !== undefined) {
          setWalletBalance(data.total);
        }

        if (currentEscrow?.sellerAddress) {
          const sellerRes = await fetch(`/api/wallet/address-balance?address=${currentEscrow.sellerAddress}`);
          const sellerData = await sellerRes.json();
          if (sellerData.balance !== undefined) {
            setSellerWalletBalance(sellerData.balance);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    fetchWallet(escrow);
    
    // Poll every 5 seconds if not released
    const interval = setInterval(() => {
      if (status !== "released") {
        fetchStatus();
        fetchWallet(escrow);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [resolvedParams.id, status]);

  const copyToClipboard = () => {
    if (escrow) navigator.clipboard.writeText(escrow.depositAddress);
  };

  const handleRelease = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resolvedParams.id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to release funds");
      }
      
      const data = await res.json();
      if (data.success) {
        setStatus("released");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while releasing funds");
    }
    setLoadingAction(false);
  };



  const handleMine = async () => {
    setMining(true);
    try {
      await fetch("/api/wallet/mine", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    setMining(false);
  };

  const fundEscrow = async () => {
    setLoadingAction(true);
    try {
      const response = await fetch("/api/escrow/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resolvedParams.id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fund escrow");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to run testnet faucet");
    }
    setLoadingAction(false);
  };

  if (!escrow) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zcash" /></div>;
  }

  const steps = [
    { id: "created", label: "Escrow Created" },
    { id: "funded", label: "Funds Secured" },
    { id: "released", label: "Payment Released" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 space-y-8">
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
        {!isSeller && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white/80" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-white/40 mb-1 uppercase">Buyer's Wallet</p>
                <div className="text-2xl font-bold flex items-baseline gap-2">
                  <span className="text-zcash">{Number(walletBalance).toFixed(4)} ZEC</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleMine}
              disabled={mining}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {mining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pickaxe className="w-4 h-4 text-zcash" />}
              {mining ? "Mining..." : "Mine Free ZEC"}
            </button>
          </motion.div>
        )}

        {isSeller && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white/80" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-widest text-white/40 mb-1 uppercase">Seller's Wallet</p>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold flex items-baseline gap-2">
                  <span className="text-zcash">{Number(sellerWalletBalance).toFixed(4)} ZEC</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Address</p>
                  <code className="text-xs text-white/50 bg-black/50 px-2 py-1 rounded">
                    {escrow.sellerAddress.slice(0,8)}...
                  </code>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Escrow #{escrow.id.slice(0, 6)}</h2>
        <p className="text-white/60">{escrow.title} • {escrow.amount} ZEC</p>
      </div>

      <div className="w-full max-w-3xl relative py-8">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-zcash -translate-y-1/2 rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentStepIndex >= 0 ? currentStepIndex / (steps.length - 1) : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStepIndex >= index || status === "disputed";
            const isActive = currentStepIndex === index && status !== "disputed";
            const isDisputed = status === "disputed" && step.id === "released";
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-3">
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: isDisputed ? "#ef4444" : (isCompleted ? "#f4b728" : "#1a1a1a"),
                    borderColor: isDisputed ? "#ef4444" : (isActive ? "#f4b728" : "transparent"),
                    scale: isActive ? 1.2 : 1
                  }}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10"
                >
                  {isDisputed ? (
                    <XCircle className="w-5 h-5 text-black" />
                  ) : isCompleted ? (
                    <Check className="w-5 h-5 text-black" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  )}
                </motion.div>
                <span className={`text-xs font-medium ${isActive || isDisputed ? "text-white" : "text-white/40"}`}>
                  {isDisputed ? "Transaction Disputed" : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div layout className="glass-panel w-full max-w-xl p-8">
        {status === "created" && (
          <>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/60 mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">Awaiting Funds</h3>
              <p className="text-sm text-white/60">The buyer needs to deposit {escrow.amount} ZEC to secure the transaction.</p>
            </div>
            
            {!isSeller ? (
              <div className="space-y-4">
                <button 
                  onClick={fundEscrow}
                  disabled={loadingAction || Number(walletBalance) < Number(escrow.amount)}
                  className="w-full bg-zcash text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-zcash/90 transition-colors disabled:opacity-50 disabled:hover:bg-zcash"
                >
                  {loadingAction ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay {escrow.amount} ZEC from Wallet <ArrowRightCircle className="w-5 h-5" /></>}
                </button>
                {Number(walletBalance) < Number(escrow.amount) && (
                  <p className="text-xs text-center text-red-400">Insufficient balance. Click "Mine Free ZEC" above.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/10 rounded-lg p-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-zcash mx-auto mb-3" />
                  <p className="text-sm text-white/80 font-medium">Waiting for Buyer</p>
                  <p className="text-xs text-white/50 mt-2">Do not deliver goods until funds are secured.</p>
                </div>
                
                <div className="bg-zcash/10 border border-zcash/30 rounded-lg p-4 flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-zcash">Share this page with the Buyer</p>
                  <div className="flex items-center w-full gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={typeof window !== 'undefined' ? window.location.href : ''} 
                      className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white/60 focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Payment link copied to clipboard!');
                      }}
                      className="bg-zcash text-black px-4 py-2 rounded font-bold text-xs hover:bg-zcash-light transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {status === "funded" && (
          <>
            <div className="w-16 h-16 bg-zcash/20 rounded-2xl flex items-center justify-center mx-auto text-zcash mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">Funds Secured</h3>
              <p className="text-sm text-white/60">The ZEC is safely locked in escrow. The seller should now deliver the goods.</p>
            </div>
            
            {!isSeller ? (
              <div className="space-y-4">
                <button 
                  onClick={handleRelease}
                  disabled={loadingAction}
                  className="w-full bg-zcash text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-zcash/90 transition-colors disabled:opacity-70"
                >
                  {loadingAction ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Approve & Release Funds <ArrowRightCircle className="w-5 h-5" /></>}
                </button>
                <button 
                  onClick={() => router.push(`/escrow/${resolvedParams.id}/dispute`)}
                  disabled={loadingAction}
                  className="w-full text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 flex items-center justify-center py-2"
                >
                  Dispute Transaction
                </button>
              </div>
            ) : (
              <div className="bg-black/40 border border-white/10 rounded-lg p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-zcash mx-auto mb-3" />
                <p className="text-sm text-white/80 font-medium">Waiting for Buyer Approval</p>
                <p className="text-xs text-white/50 mt-2">The buyer will release the funds once they receive the goods.</p>
              </div>
            )}
          </>
        )}

        {status === "disputed" && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500 mb-6">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2 text-red-400">Transaction Disputed</h3>
              <p className="text-sm text-white/60">The funds are currently frozen pending manual review.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => router.push("/")}
                className="text-zcash hover:text-white transition-colors font-medium text-sm"
              >
                Start New Escrow
              </button>
              
              <button 
                onClick={() => router.push(`/escrow/${resolvedParams.id}/judge`)}
                className="text-xs text-purple-400/50 hover:text-purple-400 transition-colors uppercase tracking-widest mt-8"
              >
                Admin: Judge Panel
              </button>
            </div>
          </>
        )}

        {status === "released" && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto text-green-400">
              <Check className="w-8 h-8" />
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-2">Transaction Complete</h3>
              <p className="text-sm text-white/60">The funds have been released to the seller's Zcash address.</p>
            </div>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="text-sm text-zcash hover:text-zcash/80 transition-colors font-medium mt-4 block mx-auto"
            >
              Start New Escrow
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
