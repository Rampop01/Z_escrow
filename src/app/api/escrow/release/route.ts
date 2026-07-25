import { NextResponse } from "next/server";
import { zcash, zcashRpcCall } from "@/lib/zcash";
import { getEscrow, saveEscrow } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing escrow ID" }, { status: 400 });
    }

    const escrow = getEscrow(id);
    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    if (escrow.status !== "funded") {
      return NextResponse.json({ error: "Escrow is not funded yet" }, { status: 400 });
    }

    // Mine 1 block FIRST to confirm the buyer's funding transaction
    // Shielded notes require at least 1 confirmation to be spent!
    try {
      await zcashRpcCall("generate", [1]);
    } catch (e) {
      console.warn("Could not generate block before release:", e);
    }

    // Attempt to release the funds using Zcash RPC
    try {
      // Small delay to ensure the wallet has fully indexed the block we just mined
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const opid = await zcash.sendMany(
        escrow.depositAddress, 
        escrow.sellerAddress, 
        escrow.amount
      );
      
      // Wait for the z_sendmany operation to complete before generating the block
      let status = "executing";
      while (status === "executing" || status === "queued") {
        await new Promise(resolve => setTimeout(resolve, 500));
        const opStatus = await zcashRpcCall("z_getoperationstatus", [[opid]]);
        if (opStatus && opStatus.length > 0) {
          status = opStatus[0].status;
          if (status === "failed") {
            throw new Error(opStatus[0].error.message);
          }
        }
      }
      
      // Mine 1 block to confirm the release transaction immediately for the demo
      await zcashRpcCall("generate", [1]);
      console.log(`Funds released successfully. Operation ID: ${opid}`);
    } catch (rpcError: any) {
      console.error("Zcash RPC Release failed", rpcError);
      return NextResponse.json({ error: rpcError.message || "Release failed" }, { status: 400 });
    }

    // Update state to released
    escrow.status = "released";
    saveEscrow(escrow);

    return NextResponse.json({ success: true, escrow });
  } catch (error: any) {
    console.error("Release Escrow Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
