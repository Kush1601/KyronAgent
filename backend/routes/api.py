from flask import Blueprint, request, jsonify
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from utils.vogent import clone_voice, create_agent, create_dial
from config.settings import API_KEY

api = Blueprint('api', __name__, url_prefix='/api')

sessions = {}

@api.route('/setup', methods=['POST'])
def setup():
    try:
        if not API_KEY:
            return jsonify({"error": "VOGENT_SECRET_KEY not set"}), 500
        
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file"}), 400
        
        audio = request.files['audio']
        name = request.form.get('voiceName', 'My Clone')
        
        print(f"[Setup] Step 1: Cloning voice for {name}")
        voice_id = clone_voice(API_KEY, name, audio.read())
        print(f"[Setup] voice_id: {voice_id}")
        
        print(f"[Setup] Step 2: Creating agent")
        agent_id = create_agent(API_KEY, name, voice_id)
        print(f"[Setup] agent_id: {agent_id}")
        
        sessions[agent_id] = {
            "name": name,
            "voice_id": voice_id,
            "created_at": "now"
        }
        
        return jsonify({"voiceId": voice_id, "agentId": agent_id}), 200
    
    except Exception as e:
        print(f"[/api/setup] Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/dial', methods=['POST'])
def dial():
    try:
        if not API_KEY:
            return jsonify({"error": "VOGENT_SECRET_KEY not set"}), 500
        
        data = request.get_json()
        agent_id = data.get('agentId')
        
        if not agent_id:
            return jsonify({"error": "agentId required"}), 400
        
        dial_data = create_dial(API_KEY, agent_id)
        return jsonify(dial_data), 200
    
    except Exception as e:
        print(f"[/api/dial] Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/health', methods=['GET'])
def health():
    return jsonify({"ok": True, "sessions": len(sessions)}), 200