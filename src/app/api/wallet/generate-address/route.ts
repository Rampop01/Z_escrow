import { NextResponse } from "next/server";
import { zcash } from "@/lib/zcash";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const address = await zcash.getNewAddress();
    return NextResponse.json({ address });
  } catch (error) {
    console.error("Generate address error:", error);
    return NextResponse.json({ error: "Failed to generate address" }, { status: 500 });
  }
}
