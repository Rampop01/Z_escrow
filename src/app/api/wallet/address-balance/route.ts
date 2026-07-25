import { NextResponse } from "next/server";
import { zcash } from "@/lib/zcash";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const balance = await zcash.getListReceivedByAddress(address);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error("Address balance error:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
