import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-glass-border bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <ShieldCheck className="w-8 h-8 text-zcash" />
          <span className="font-bold text-xl tracking-tight">
            Z<span className="text-zcash">-Escrow</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/create" 
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Create Escrow
          </Link>
          <a
            href="https://z.cash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-zcash hover:text-zcash/80 transition-colors"
          >
            About Zcash
          </a>
        </div>
      </div>
    </nav>
  );
}
