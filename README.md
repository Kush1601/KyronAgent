# 🏥 Kyron Medical — AI Voice Agents for Healthcare

**Modernize patient access and insurance workflows.**

Record a quick voice sample → AI clones it → you get a fully functional, conversational AI agent representing Kyron Medical that can handle eligibility, claim status, and prior authorizations.

**Fully automated. Premium animated UI. Backend & Frontend separated.**

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
# Edit .env.local and add your API key (from app.vogent.ai → API Keys)
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

```text
kyron-app/
├── frontend/                 # Next.js React UI (Port 3000)
│   ├── app/                  # Pages & layout (Inter font, globals.css)
│   ├── components/           # React components (KyronApp, RecordStep, SetupStep, CallStep)
│   ├── public/               # Static assets (kyron_logo.png)
│   └── package.json
│
├── backend/                  # Flask API Server (Port 5001)
│   ├── app.py                # Flask app
│   ├── run.py                # Entry point
│   ├── utils/vogent.py       # API client & Kyron Medical AI Prompt
│   └── requirements.txt
│
└── package.json              # Root config
```

---

## 🎯 Features & UI Polish

*   **Healthcare Prompting:** The AI is deeply prompted to act as a Kyron Medical agent, capable of discussing eligibility & benefits, claim status, prior authorizations, and denial appeals.
*   **Premium Animations:** Features Next-Gen CSS animations including floating ambient orbs, morphing record pulses, gradient hover borders, and glowing active states to simulate AI thinking.
*   **Professional Typography:** Uses the `Inter` font family and a clinical slate color palette to match `kyronmedical.com`.

---

## 🔄 API Flow

### Frontend → Backend → Vogent

1. **Setup**: Clone voice + create agent

   ```text
   POST /api/setup (audio + name)
   ↓
   Clone voice → POST /api/voices/clone
   ↓
   Create agent → POST /api/agents (with comprehensive Kyron Medical prompt)
   ↓
   Return: { voiceId, agentId }
   ```

2. **Call**: Create WebRTC dial

   ```text
   POST /api/dial (agentId)
   ↓
   Create dial → POST /api/dials
   ↓
   Return: { dialToken, sessionId, dialId }
   ```

3. **WebRTC**: Browser connects directly via voice

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
5. **Start:** `gunicorn app:app` (add gunicorn to requirements.txt)
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

✅ **API keys live ONLY on backend**  
✅ Never exposed to browser  
✅ Frontend uses backend proxy  
✅ CORS configured for frontend URL  
✅ `.env.local` in `.gitignore` — never commit secrets

---

## 🎯 Usage

1. Enter your name (top-right)
2. (Optional) Enter a custom phrase to read (default is Kyron-specific)
3. Click **Start Recording**
4. Read the sample text (15–20 seconds)
5. Click **Stop & Save**
6. Wait for clone to build (automatic)
7. Click **Call Your Clone**
8. Talk and hear your agent handle healthcare tasks!

---

## 🛠️ Tech Stack

| Component    | Technology                    |
| ------------ | ----------------------------- |
| **Frontend** | Next.js 15 + React 19 + TypeScript |
| **Styling**  | Tailwind CSS 3.4 (Custom animations) |
| **Backend**  | Flask (Python)                |
| **External** | Vogent (voice cloning + AI)   |

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
