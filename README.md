# 🎙️ Vogen — AI Voice Cloning

Record your voice → AI clones it → you talk to an agent that sounds exactly like you.

**Fully automated. No dashboard setup. Backend & Frontend separated.**

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

```bash
# Root
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend (Python)
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2️⃣ Setup Environment

```bash
# Backend
cd backend
cp .env.local.example .env.local
# Edit .env.local and add your Vogent API key (from app.vogent.ai → API Keys)
# VOGENT_SECRET_KEY=vogent_xxx...

# Frontend
cd ../frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### 3️⃣ Run Both Services

```bash
# Terminal 1 — Backend (Flask, port 5001)
cd backend && source venv/bin/activate && python run.py

# Terminal 2 — Frontend (Next.js, port 3000)
cd frontend && npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
vogen/
├── frontend/                 # Next.js React UI (Port 3000)
│   ├── app/                  # Pages & layout
│   ├── components/           # React components
│   ├── lib/                  # Types & utilities
│   └── package.json
│
├── backend/                  # Flask API Server (Port 5001)
│   ├── app.py                # Flask app
│   ├── run.py                # Entry point
│   ├── config/               # Settings
│   ├── routes/               # API routes
│   ├── utils/vogent.py       # Vogent API client
│   └── requirements.txt
│
└── package.json              # Root config
```

---

## 🎯 How It Works

```
┌─────────────────────┐
│   User Browser      │
│  (Port 3000)        │
└──────────┬──────────┘
           │
    ┌──────▼──────────────────────┐
    │   FRONTEND (Next.js React)   │
    │  - Voice recording UI        │
    │  - Conversation display      │
    │  - WebRTC call interface    │
    └──────┬──────────────────────┘
           │
    ┌──────▼──────────────────────┐
    │   BACKEND (Flask API)        │
    │  - /api/setup                │
    │  - /api/dial                 │
    │  - Vogent integration        │
    │  - Secret key protection     │
    └──────┬──────────────────────┘
           │
    ┌──────▼──────────────────────┐
    │      VOGENT CLOUD            │
    │  - Voice cloning             │
    │  - AI agent creation         │
    │  - WebRTC connection         │
    └──────────────────────────────┘
```

---

## 🔄 API Flow

### Frontend → Backend → Vogent

1. **Setup**: Clone voice + create agent

   ```
   POST /api/setup (audio + name)
   ↓
   Clone voice → POST /api/voices/clone
   ↓
   Create agent → POST /api/agents (with inline prompt)
   ↓
   Return: { voiceId, agentId }
   ```

2. **Call**: Create WebRTC dial

   ```
   POST /api/dial (agentId)
   ↓
   Create dial → POST /api/dials
   ↓
   Return: { dialToken, sessionId, dialId }
   ```

3. **WebRTC**: Browser connects directly to Vogent

---

## 💻 Development

### Run Both Services

```bash
# Terminal 1
cd backend && source venv/bin/activate && python run.py

# Terminal 2
cd frontend && npm run dev
```

### Build for Production

```bash
cd frontend && npm run build
cd frontend && npm start
```

---

## 🚀 Deployment (Free Tier)

### Backend — Render

1. Create account at [render.com](https://render.com)
2. New **Web Service** → Connect GitHub repo
3. **Root Directory:** `backend`
4. **Build:** `pip install -r requirements.txt`
5. **Start:** `gunicorn app:app` (add gunicorn to requirements.txt) or `python run.py`
6. **Environment:** `VOGENT_SECRET_KEY`, `FRONTEND_URL` (set after frontend deploy)

### Frontend — Vercel

1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repo
3. **Root Directory:** `frontend`
4. **Environment:** `NEXT_PUBLIC_BACKEND_URL` = your Render backend URL

### Post-Deploy

- Set `FRONTEND_URL` on Render to your Vercel URL
- Redeploy backend so CORS works

---

## 🔐 Security

✅ **Vogent API key lives ONLY on backend**  
✅ Never exposed to browser  
✅ Frontend uses backend proxy  
✅ CORS configured for frontend URL  
✅ `.env.local` in `.gitignore` — never commit secrets

---

## 🎯 Usage

1. Enter your name (top-right)
2. (Optional) Enter a custom phrase to read
3. Click **Start Recording**
4. Read the sample text (15–20 seconds)
5. Click **Stop & Save**
6. Wait for clone to build (automatic)
7. Click **Call Your Clone**
8. Talk and hear yourself respond!

---

## 🛠️ Tech Stack

| Component    | Technology                    |
| ------------ | ----------------------------- |
| **Frontend** | Next.js 15 + React 19 + TypeScript |
| **Styling**  | Tailwind CSS 3.4              |
| **Backend**  | Flask (Python)                |
| **External** | Vogent (voice cloning + AI)   |
| **WebRTC**   | Vogent Web Client SDK         |

---

## ❓ Troubleshooting

### Backend won't start

- Check `backend/.env.local` has `VOGENT_SECRET_KEY`
- Ensure port 5001 is available
- Activate venv: `source backend/venv/bin/activate`

### Frontend can't reach backend

- Verify backend running at `http://localhost:5001`
- Check `frontend/.env.local` has `NEXT_PUBLIC_BACKEND_URL=http://localhost:5001`

### Voice cloning fails

- Record for at least 15–20 seconds
- Speak clearly and naturally
- Check browser console for detailed errors

---

## 📄 License

MIT
