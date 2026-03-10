import { NextRequest, NextResponse } from "next/server";
import { cloneVoice, createAgent } from "@/lib/vogent";
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.VOGENT_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "VOGENT_SECRET_KEY not set in .env.local" },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const audio = formData.get("audio") as Blob | null;
    const voiceName = (formData.get("voiceName") as string) || "My Clone";

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    // Step 1: Clone the voice
    console.log("[setup] Step 1 — cloning voice:", voiceName);
    const voiceId = await cloneVoice(apiKey, voiceName, audio);
    console.log("[setup] voiceId:", voiceId);

    // Step 2: Create agent with inline versioned prompt
    console.log("[setup] Step 2 — creating agent...");
    const agentId = await createAgent(apiKey, voiceName, voiceId);
    console.log("[setup] agentId:", agentId);

    console.log("[setup] ✓ Complete:", { voiceId, agentId });
    return NextResponse.json({ voiceId, agentId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/setup] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
