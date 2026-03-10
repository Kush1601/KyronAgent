import { NextRequest, NextResponse } from "next/server";
import { createDial } from "@/lib/vogent";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.VOGENT_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "VOGENT_SECRET_KEY not set in environment" },
        { status: 500 }
      );
    }

    const { agentId } = await req.json();
    if (!agentId) {
      return NextResponse.json({ error: "agentId required" }, { status: 400 });
    }

    const dial = await createDial(apiKey, agentId);
    return NextResponse.json(dial);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/dial]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
