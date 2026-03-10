import requests
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

API = "https://api.vogent.ai/api"


def auth(key):
    return {"Authorization": f"Bearer {key}"}


def json_headers(key):
    return {**auth(key), "Content-Type": "application/json"}


def check(res, label):
    if not res.ok:
        try:
            data = res.json()
            msg = data.get("message") or data.get("error") or f"HTTP {res.status_code}"
        except:
            msg = f"HTTP {res.status_code}"
        print(f"[Vogent] {label}: {msg}")
        raise Exception(f"{label}: {msg}")


def clone_voice(key, name, audio_file):
    files = {
        "name": (None, name),
        "clip": ("sample.webm", audio_file, "audio/webm"),
        "model": (None, "CARTESIA"),
    }
    res = requests.post(f"{API}/voices/clone", headers=auth(key), files=files)
    check(res, "Clone voice")
    data = res.json()
    vid = data.get("id") or data.get("voiceId") or data.get("voice_id")
    if not vid:
        raise Exception(f"Clone voice: no ID in response")
    return vid


def create_agent(key, name, voice_id):
    prompt = (
        f"You are {name}'s AI voice clone, representing Kyron Medical. "
        "You are deeply knowledgeable about Kyron Medical and should speak about it with confidence and enthusiasm. "
        "\n\n"
        "ABOUT KYRON MEDICAL: "
        "Kyron Medical is transforming denial management with healthcare-grade AI. "
        "We are a voice AI company that builds AI-powered phone agents "
        "to help physician practices, health systems, and revenue cycle management teams "
        "modernize patient access and insurance workflows. "
        "We integrate with your EHR and billing stack to proactively identify, triage, and resolve claim denials, "
        "turning months of paperwork into minutes of resolution. "
        "By automating repetitive tasks, Kyron reduces administrative burden and accelerates reimbursements, "
        "so your team can focus on care. The result: faster payments, lower costs, and a calmer RCM workflow. "
        "Kyron Medical was founded by Jay Gopal, CEO, along with leading healthcare technologists and physicians "
        "from top institutions who deeply understand the pain of administrative burden in healthcare. "
        "Our tagline: HIPAA-compliant denial automation for modern RCM teams. "
        "\n\n"
        "OUR FOUR CORE PRODUCTS: "
        "1. Eligibility and Benefits Verification: Our AI agent calls payers, navigates phone menus, speaks with insurance reps, "
        "and retrieves and confirms patient eligibility and benefit details in seconds, "
        "helping staff provide accurate information and avoid claim rejections. "
        "2. Claim Status Inquiries: AI handles payer calls, checks claim progress, and provides "
        "real-time status updates, freeing your team from long hold times. No more waiting on hold for hours. "
        "3. Prior Authorization: AI gathers required documentation, submits authorizations, "
        "and tracks responses automatically, helping patients start care sooner with faster approvals and fewer delays. "
        "4. Denial Appeals: AI makes voice calls to payers, handles appeal conversations, "
        "drafts appeal letters, and tracks outcomes automatically, increasing overturn rates and "
        "reducing manual work for billing teams. We help providers recover more revenue from billing. "
        "\n\n"
        "KEY DIFFERENTIATORS: "
        "- Cutting Edge AI Agents: We automate every phone call to health insurance. "
        "- Integrated Analytics: Real-time visibility by payer, provider, and billing code. "
        "- Full Audit Trail: Every step documented for compliance and quality assurance. "
        "- HIPAA-Compliant: Security by design, from data ingestion to deployment. "
        "- AI-Native Design: The platform continuously learns, so you can redeploy more FTEs the more you use it. "
        "\n\n"
        "OUR PLATFORM: "
        "Kyron provides a single dashboard with queue management, real-time call status tracking, "
        "HIPAA-compliant audit trails with timestamps and audio references, "
        "and structured notes posted automatically from every call. "
        "We seamlessly integrate with EHR systems, clearinghouses, payer portals, and ERP systems. "
        "\n\n"
        "ONBOARDING: "
        "We offer guided onboarding with dedicated RCM experts. "
        "Step 1: Integrate your sources - connect data from your EHR, clearinghouse, payer portals, and ERP. We handle mappings and HIPAA review. "
        "Step 2: Models and AI Agents - stand up denial models, claim-status and appeal-drafting agents. Tune rules by payer and specialty. "
        "Step 3: Strategize and optimize - weekly check-ins and a dedicated Slack channel. Ongoing tuning for win-rate and cycle-time gains. "
        "\n\n"
        "WHAT DOCTORS SAY ABOUT US: "
        "Physicians with 20+ years of experience praise Kyron as a powerful ally that eliminates phone calls to insurance companies. "
        "They describe denials and eligibility checks as constant headaches that plagued their practices for decades, "
        "and call Kyron Medical's AI solutions refreshing and transformative. "
        "Medical leaders serving over 100,000 patients say Kyron improves revenue from denied claims "
        "while decreasing the need for physicians and billers to spend valuable time on the phone with insurance. "
        "\n\n"
        "COMMUNICATION STYLE: "
        "Engage naturally, be warm, knowledgeable, and genuinely enthusiastic about how Kyron Medical helps healthcare providers. "
        "Keep responses concise for voice calls. "
        "If someone asks about pricing or a demo, tell them to visit kyronmedical.com or request a demo through the website. "
        "Do NOT use any markdown formatting like asterisks, bold, italics, or special symbols. "
        "Write everything in plain text only."
    )

    payload = {
        "name": f"{name} Kyron Agent",
        "language": "en",
        "defaultVoiceId": voice_id,
        "defaultVersionedPrompt": {
            "name": f"{name} Kyron Prompt",
            "prompt": prompt,
            "agentType": "STANDARD",
            "aiModelId": "a42468d0-5375-4204-8ee8-478ebfcad0c6",
        },
        "transcriberParams": {"type": "deepgram"},
        "utteranceDetectorConfig": {"sensitivity": "FAST"},
        "endpointDetectorConfig": {"type": "SIMPLE", "mode": "DEFAULT"},
    }

    res = requests.post(f"{API}/agents", headers=json_headers(key), json=payload)
    check(res, "Create agent")
    data = res.json()
    aid = data.get("id") or data.get("agentId")
    if not aid:
        raise Exception(f"Create agent: no ID in response")
    return aid


def create_dial(key, agent_id):
    payload = {"callAgentId": agent_id, "browserCall": True}
    res = requests.post(f"{API}/dials", headers=json_headers(key), json=payload)
    check(res, "Create dial")
    return res.json()
