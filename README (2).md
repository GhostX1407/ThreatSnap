# ThreatSnap

AI-powered, mobile-first threat intelligence platform. Submit a URL, IP address, or file hash and get back a real-time, explainable risk verdict — built for the myOnsite Ascend Hackathon 2026 (6-hour build).

**Live backend:** https://threatsnap-backend.onrender.com

---

## Problem Statement

Security analysts are flooded with fragmented, unverified threat alerts from multiple sources — some real, most noise — and have to manually correlate and score each one before acting. ThreatSnap gives analysts a single mobile tool to submit an indicator and immediately get an AI-generated risk score (0–100) with a human-readable explanation of *why*, backed by authentication, an audit trail, and access controls, so triage that used to take manual effort now takes seconds.

## What We Built

- **Threat ingestion** — submit a URL, IP, or file hash from the mobile app
- **AI/ML risk scoring** — heuristic rule-based scoring blended with live VirusTotal reputation lookups, with automatic fallback if VirusTotal is slow or unavailable
- **GenAI explanation** — an LLM call using a fixed prompt template turns the score + contributing factors into a plain-English explanation, so every verdict is traceable back to specific evidence
- **Authentication & RBAC** — JWT-based login with two analyst tiers (junior/senior); senior analysts get additional access to the audit log and model drift stats
- **Audit trail** — every analysis is logged with user, action, resource ID, and timestamp
- **Model drift detection** — tracks a rolling average of recent scores and flags when the latest score deviates significantly, as an early signal the scoring model may need review
- **Threat confidence metric** — each verdict reports a confidence score reflecting whether it was backed by live threat-intel data or heuristics alone

## Tech Stack

**Backend:** Node.js, Express, JWT (jsonwebtoken), lowdb (JSON-file storage), VirusTotal API v3, LLM API (Claude/GPT) for explanations. Deployed on Render.

**Mobile:** Cross-platform mobile app (React Native/Expo) with a login screen, dashboard, threat analysis form, verdict display, history, and a senior-only audit log — all consuming the backend over a REST API secured with bearer tokens.

## Architecture

```
threatsnap/
├── README.md                      <- this file
├── backend/
│   ├── server.js                  <- Express app entry point, mounts all routes
│   ├── CONTRACT.md                <- API + internal function contract
│   ├── package.json
│   ├── .env.example                <- required env vars (JWT secret, API keys)
│   └── src/
│       ├── auth/
│       │   └── index.js           <- login logic, JWT sign/verify, RBAC middleware
│       ├── routes/
│       │   ├── auth.routes.js     <- POST /api/auth/login
│       │   ├── threat.routes.js   <- POST /api/threat/analyze, GET /api/threat/history
│       │   ├── audit.routes.js    <- GET /api/audit (senior only)
│       │   └── stats.routes.js    <- GET /api/stats/drift (senior only)
│       ├── scoring/
│       │   └── index.js           <- risk scoring engine: heuristics + VirusTotal + fallback
│       ├── genai/
│       │   └── index.js           <- GenAI explanation generator (LLM call + fallback)
│       ├── audit/
│       │   └── index.js           <- audit log read/write helpers
│       └── db/
│           └── index.js           <- JSON-file-backed storage (lowdb)
└── mobile/
    └── ...                        <- mobile app source (screens, API client, state)
```

## API Reference

### `POST /api/auth/login`
```json
// Request
{ "username": "analyst1", "password": "demo1234" }
// Response
{ "token": "eyJhbGciOi...", "role": "junior" }
```

### `POST /api/threat/analyze` (requires `Authorization: Bearer <token>`)
```json
// Request
{ "type": "url", "value": "http://malicious-example.com/login" }
// type: "url" | "ip" | "hash"

// Response
{
  "id": "a1b2c3d4",
  "type": "url",
  "value": "http://malicious-example.com/login",
  "score": 82,
  "verdict": "high_risk",
  "explanation": "This URL is likely a phishing attempt because...",
  "factors": ["no HTTPS", "suspicious domain pattern"],
  "confidence": 78,
  "source": "virustotal+heuristic",
  "timestamp": "2026-08-22T15:40:00Z"
}
```
`verdict`: `low_risk` (0–33) / `medium_risk` (34–66) / `high_risk` (67–100)
`source`: `"virustotal+heuristic"` if live threat-intel was used, `"heuristic"` on fallback

### `GET /api/audit` — senior role only
Returns every analysis action: user, action, resource ID, timestamp.

### `GET /api/stats/drift` — senior role only
```json
{ "rolling_average": 62.4, "latest_score": 91, "drift_warning": true }
```

## User Flow

1. Analyst logs in (`analyst1` / `demo1234` → junior, or `analyst2` / `demo1234` → senior)
2. Lands on Dashboard — scan counts by risk level, and (senior only) rolling drift stats
3. Goes to Analyze — picks indicator type (URL/IP/hash), enters a value, submits
4. Sees a real-time verdict: score, color-coded risk badge, GenAI explanation, contributing factors, confidence, and data source
5. Result is saved to History and, in parallel, logged to the Audit trail
6. Senior analysts can additionally review the full Audit Log across all users

## Security & Compliance with Requirements

- All threat-analysis and audit endpoints require a valid JWT (`Authorization: Bearer <token>`)
- Role-based access control restricts audit/drift data to senior analysts
- Every action is logged with user, action, and timestamp for auditability
- GenAI prompts are pre-defined templates (not user-editable, no fine-tuning/training involved)
- External calls (VirusTotal, LLM API) use short timeouts with automatic fallback so a slow/failed external service never breaks the user-facing request
- **Known limitation:** data is stored in a local JSON file (not a managed database) with encryption in transit (HTTPS via Render) but not at rest — a deliberate scope trade-off given the 6-hour build window, called out here rather than left unstated

## Running Locally

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # fill in JWT_SECRET, VT_API_KEY, LLM_API_KEY
npm start               # runs on http://localhost:3000
```

**Mobile:**
```bash
cd mobile
npm install
npm start                # follow Expo/CLI instructions to open on device or emulator
```
Point the mobile app's API base URL at either `http://localhost:3000` (local backend) or `https://threatsnap-backend.onrender.com` (deployed).

## Demo Accounts

| Username | Password | Role |
|---|---|---|
| analyst1 | demo1234 | junior |
| analyst2 | demo1234 | senior |

## Team

Built by a 4-person team in a single 6-hour session: backend/infra, AI scoring engine, GenAI explanation pipeline, and mobile app were each owned independently and integrated via a shared API contract to avoid merge conflicts.
