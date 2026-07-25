import fs from 'fs';
import path from 'path';

export interface Escrow {
  id: string;
  title: string;
  amount: number;
  sellerAddress: string;
  depositAddress: string;
  status: "created" | "funded" | "released" | "disputed" | "refunded";
  createdAt: number;
  disputeReason?: string;
}

const dbPath = path.join(process.cwd(), 'escrows.json');

export function getDb(): Record<string, Escrow> {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}));
  }
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

export function saveEscrow(escrow: Escrow) {
  const db = getDb();
  db[escrow.id] = escrow;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function getEscrow(id: string): Escrow | null {
  const db = getDb();
  return db[id] || null;
}
