import { NextResponse } from "next/server";
import { getEscrow } from "@/lib/db";
import { zcashRpcCall } from "@/lib/zcash";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const escrow = getEscrow(id);

    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    if (escrow.status !== "created") {
      return NextResponse.json({ error: "Escrow already funded" }, { status: 400 });
    }

    // Find a specific transparent address with enough funds because ANY_TADDR ignores coinbase outputs
    // Find a shielded address with enough funds
    const zUnspent = await zcashRpcCall("z_listunspent", [1, 9999999]);
    const zUtxo = zUnspent.find((u: any) => u.amount >= escrow.amount);
    
    let senderAddress;
    if (zUtxo) {
      if (zUtxo.address) {
        senderAddress = zUtxo.address;
      } else if (zUtxo.account !== undefined) {
        const accRes = await zcashRpcCall("z_getaddressforaccount", [zUtxo.account]);
        senderAddress = accRes.address;
      } else {
        throw new Error("Shielded UTXO found but missing address and account.");
      }
    } else {
      // Fallback to checking transparent balance just in case
      const tUnspent = await zcashRpcCall("listunspent");
      const tUtxo = tUnspent.find((u: any) => u.amount >= escrow.amount);
      if (!tUtxo) {
        throw new Error("Insufficient funds. Please mine ZEC first.");
      }
      senderAddress = tUtxo.address;
    }

    // Send the exact ZEC amount to the escrow deposit address
    const opid = await zcashRpcCall("z_sendmany", [
      senderAddress,
      [{ address: escrow.depositAddress, amount: escrow.amount }],
      1 // minconf (auto-calculates ZIP 317 fee and uses default LegacyCompat privacy)
    ]);

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

    return NextResponse.json({ success: true, opid });
  } catch (error: any) {
    console.error("Faucet error:", error);
    return NextResponse.json({ error: error.message || "Failed to fund escrow via faucet" }, { status: 500 });
  }
}
