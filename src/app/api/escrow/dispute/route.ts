import { NextResponse } from "next/server";
import { zcash, zcashRpcCall } from "@/lib/zcash";
import { getEscrow, saveEscrow } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, reason } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing escrow ID" }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: "Missing dispute reason" }, { status: 400 });
    }

    const escrow = getEscrow(id);
    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    if (escrow.status !== "funded") {
      return NextResponse.json({ error: "Escrow is not funded yet" }, { status: 400 });
    }

    // Update state to disputed and record the reason
    // We NO LONGER auto-refund the buyer. The funds are held in the escrow address 
    // pending manual review.
    escrow.status = "disputed";
    escrow.disputeReason = reason;
    saveEscrow(escrow);

    return NextResponse.json({ success: true, escrow });
  } catch (error: any) {
    console.error("Dispute Escrow Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
