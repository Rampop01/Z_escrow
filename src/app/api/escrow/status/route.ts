import { NextResponse } from "next/server";
import { zcash } from "@/lib/zcash";
import { getEscrow, saveEscrow } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing escrow ID" }, { status: 400 });
  }

  const escrow = getEscrow(id);
  if (!escrow) {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }

  // If the escrow is still awaiting funds, check the blockchain
  if (escrow.status === "created") {
    try {
      const balance = await zcash.getListReceivedByAddress(escrow.depositAddress);
      
      if (balance >= escrow.amount) {
        // Funds have arrived!
        escrow.status = "funded";
        saveEscrow(escrow);
      }
    } catch (error) {
      console.error("Failed to check Zcash balance:", error);
      // We don't fail the request here, just return the current state
    }
  }

  return NextResponse.json({ escrow });
}

// Added a simple POST for testing purposes to manually fund it if node is offline
export async function POST(request: Request) {
  const body = await request.json();
  const { id, simulateStatus } = body;
  
  if (id && simulateStatus) {
    const escrow = getEscrow(id);
    if (escrow) {
      escrow.status = simulateStatus;
      saveEscrow(escrow);
      return NextResponse.json({ escrow });
    }
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
