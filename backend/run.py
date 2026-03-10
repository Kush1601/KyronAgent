import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app import app
from dotenv import load_dotenv

load_dotenv('.env.local')

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    print(f"✓ Flask server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)