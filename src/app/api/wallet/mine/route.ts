import { NextResponse } from "next/server";
import { zcashRpcCall } from "@/lib/zcash";

export async function POST() {
  try {
    // 1. Mine 101 blocks to mature the first block's coinbase reward
    await zcashRpcCall("generate", [101]);
    
    // 2. Generate a new Sapling address to hold the shielded funds
    const accountRes = await zcashRpcCall("z_getnewaccount");
    const addressRes = await zcashRpcCall("z_getaddressforaccount", [accountRes.account, ["sapling"]]);
    const zaddr = addressRes.address;
    
    // 3. Shield the mature coinbase UTXO to the new Sapling address
    // Fee must be high enough for 50 UTXOs under ZIP 317 (e.g. 0.01 ZEC)
    const shieldRes = await zcashRpcCall("z_shieldcoinbase", ["*", zaddr, 0.01, 50, "", "NoPrivacy"]);
    const opid = shieldRes.opid;
    
    // 4. Wait for the shielding operation to complete
    let status = "executing";
    while (status === "executing" || status === "queued") {
      await new Promise(resolve => setTimeout(resolve, 500));
      const opStatus = await zcashRpcCall("z_getoperationstatus", [[opid]]);
      if (opStatus && opStatus.length > 0) {
        status = opStatus[0].status;
        if (status === "failed") {
          console.error("Shielding failed:", opStatus[0].error);
          break; // Even if it fails, we continue so the user at least has raw ZEC, though payment may fail
        }
      }
    }
    
    // 5. Mine 1 more block to confirm the shielding transaction
    await zcashRpcCall("generate", [1]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mine error:", error);
    return NextResponse.json({ error: "Failed to mine blocks" }, { status: 500 });
  }
}
