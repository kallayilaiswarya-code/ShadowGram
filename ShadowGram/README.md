# ShadowGram

Behavioral graph detection of coordinated AI-fraud accounts.

## MVP
- FastAPI deterministic analysis API
- Synthetic 10-account dataset
- Multi-signal behavioral similarity
- Isolation Forest anomaly signal
- NetworkX relationship graph
- Explainable “Why are these accounts linked?” evidence layer
- Next.js dashboard

The demo deliberately reports **signals consistent with coordinated operation**, not identity claims.

## Run

Backend:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:
```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000
