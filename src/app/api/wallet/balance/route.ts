import { NextResponse } from "next/server";
import { zcashRpcCall } from "@/lib/zcash";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const balance = await zcashRpcCall("z_gettotalbalance", []);
    return NextResponse.json({ 
      transparent: balance.transparent,
      private: balance.private,
      total: balance.total
    });
  } catch (error) {
    console.error("Balance error:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
