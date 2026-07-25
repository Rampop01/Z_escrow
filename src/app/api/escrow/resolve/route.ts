import { NextResponse } from "next/server";
import { zcash, zcashRpcCall } from "@/lib/zcash";
import { getEscrow, saveEscrow } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, decision } = body;

    if (!id || !decision) {
      return NextResponse.json({ error: "Missing escrow ID or decision" }, { status: 400 });
    }

    const escrow = getEscrow(id);
    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    if (escrow.status !== "disputed") {
      return NextResponse.json({ error: "Escrow is not in disputed state" }, { status: 400 });
    }

    try {
      // Ensure node is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let destinationAddress = "";

      if (decision === "buyer") {
        // Refund Buyer
        destinationAddress = await zcash.getNewAddress();
      } else if (decision === "seller") {
        // Pay Seller
        destinationAddress = escrow.sellerAddress;
      } else {
        return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
      }

      const opid = await zcash.sendMany(
        escrow.depositAddress, 
        destinationAddress, 
        escrow.amount
      );
      
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
      
      await zcashRpcCall("generate", [1]);
      console.log(`Dispute resolved successfully for ${decision}. Operation ID: ${opid}`);
    } catch (rpcError: any) {
      console.error("Zcash RPC Resolution failed", rpcError);
      return NextResponse.json({ error: rpcError.message || "Resolution transaction failed" }, { status: 400 });
    }

    escrow.status = decision === "buyer" ? "refunded" : "released";
    saveEscrow(escrow);

    return NextResponse.json({ success: true, escrow });
  } catch (error: any) {
    console.error("Resolve Escrow Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
