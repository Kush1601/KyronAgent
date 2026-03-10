import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from config.settings import FLASK_PORT, FRONTEND_URL
from routes.api import api

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": FRONTEND_URL}})

app.register_blueprint(api)

@app.errorhandler(404)
def not_found(e):
    return {"error": "Not found"}, 404

@app.errorhandler(500)
def server_error(e):
    return {"error": "Server error"}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=FLASK_PORT, debug=True)