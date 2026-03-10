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
    prompt = f"You are {name}'s AI voice clone. Engage naturally, be warm and helpful. Keep responses concise for voice calls. Do NOT use any markdown formatting like asterisks, bold, italics, or special symbols. Write everything in plain text only. You do not have access to real-time data like weather, stock prices, or current events. If asked about these, politely explain you cannot access real-time information and suggest they check a weather app or news site instead."

    payload = {
        "name": f"{name} Vogen Agent",
        "language": "en",
        "defaultVoiceId": voice_id,
        "defaultVersionedPrompt": {
            "name": f"{name} Vogen Prompt",
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
