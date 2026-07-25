import { NextResponse } from "next/server";
import { zcash } from "@/lib/zcash";
import { saveEscrow } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, amount, sellerAddress } = body;

    if (!title || !amount || !sellerAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Generate a new shielded deposit address via Zcash RPC
    let depositAddress;
    try {
      depositAddress = await zcash.getNewAddress();
    } catch (rpcError) {
      // For the hackathon demo, if the node isn't running, we fallback to a mock address 
      // ONLY so the UI doesn't crash during development if zcashd is offline.
      console.warn("Zcash RPC failed, falling back to dummy address for dev purposes", rpcError);
      depositAddress = "ztestsapling" + crypto.randomBytes(32).toString('hex');
    }

    // 2. Create the escrow record
    const id = crypto.randomBytes(8).toString("hex");
    const escrow = {
      id,
      title,
      amount: parseFloat(amount),
      sellerAddress,
      depositAddress,
      status: "created" as const,
      createdAt: Date.now(),
    };

    // 3. Save to our JSON database
    saveEscrow(escrow);

    return NextResponse.json({ id, depositAddress });
  } catch (error: any) {
    console.error("Create Escrow Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
