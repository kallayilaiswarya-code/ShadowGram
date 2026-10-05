\# PROGRESS CHECKPOINT — ROLE 2

\## Visual Command Center \& 3D WebGL Lead



\*\*Project:\*\* ShadowGram  

\*\*Hackathon:\*\* HackAthena 2.0  

\*\*Role:\*\* Role 2 — Visual Command Center \& 3D WebGL Lead  

\*\*Assignee:\*\* Aiswarya Kallayil Rajesh  

\*\*Checkpoint Status:\*\* Frontend implementation complete; backend integration pending  

\*\*Date:\*\* 2026-10-05



\---



\# 1. Deliverables Completed



Role 2 frontend implementation has been completed against the agreed ShadowGram

frontend architecture and graph data contract.



The dashboard currently provides:



\- Next.js 14 App Router frontend

\- TypeScript-based frontend architecture

\- Tailwind CSS styling

\- Dark blue-purple ShadowGram visual theme

\- Interactive 3D behavioral graph

\- Interactive 2D graph fallback

\- Suspicious / anomaly / normal node visualization

\- Cluster selection from graph nodes

\- Graph statistics dashboard

\- Cluster intelligence panel

\- "Why are these accounts linked?" evidence card

\- Factual cluster evidence display

\- Quarantine response-action UI

\- Kinetic behavioral spectrogram

\- Optional cyber audio feedback

\- Mock graph dataset for frontend development and testing

\- Backend-ready graph data hook

\- Backend-ready quarantine request structure

\- Responsive dashboard layout

\- Graph error handling and empty-state handling



The frontend is intentionally operating in mock-data mode because the backend

implementation is not yet ready for integration.



\---



\# 2. ShadowGram Frontend Architecture



The current frontend is organized into the following major areas:



```text

frontend/

├── app/

│   ├── globals.css

│   ├── layout.tsx

│   └── page.tsx

│

├── components/

│   ├── CyberAudioEngine.tsx

│   ├── GraphCanvas.tsx

│   ├── KineticSpectrogram.tsx

│   └── WhyCardModal.tsx

│

├── data/

│   └── mockGraph.ts

│

├── hooks/

│   └── useGraphData.ts

│

├── types/

│   └── contracts.ts

│

├── package.json

├── tsconfig.json

└── .env.local

