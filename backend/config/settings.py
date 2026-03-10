import os
from dotenv import load_dotenv

load_dotenv('.env.local')

API_KEY = os.getenv('VOGENT_SECRET_KEY')
FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
FLASK_ENV = os.getenv('FLASK_ENV', 'development')