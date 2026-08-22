# ThreatSnap — Complete Project Handoff Document

This document contains full context on the ThreatSnap project. If you are an AI assistant reading this, treat everything below as ground truth for this project. Do not deviate from the contract, folder ownership, or scope defined here without the human explicitly telling you to.

---

## 1. Project Overview

**ThreatSnap** is a mobile-first threat intelligence platform built for the myOnsite Ascend Hackathon 2026, Round 2 (6-hour build, team of 4).

**Problem it solves:** Security analysts get fragmented, unverified threat reports from multiple sources and need to quickly assess and validate them. ThreatSnap lets an analyst submit a threat indicator (URL, IP, or file hash), and the system returns an AI-generated risk score (0–100) plus a human-readable, explainable verdict — in real time, behind authentication, with a full audit trail.

**Repo (single monorepo, already pushed):** `https://github.com/YOUR_USERNAME/threatsnap`

```
threatsnap/
  /backend    <- Node/Express API: auth, scoring, GenAI explanation, audit trail, storage
  /mobile     <- Mobile app: threat input form, verdict + explanation display
  README.md
```

---

## 2. Original PRD (source of truth for requirements)

**Background:** A mobile-first threat intelligence platform is needed to help security analysts quickly assess and validate emerging cyber threats. Analysts often receive fragmented, unverified reports from multiple sources, requiring manual correlation and risk scoring before any action can be taken.

**Problem Statement:** Cybersecurity teams face a deluge of suspicious activity alerts from diverse sources—some legitimate, others false positives. With only 6 hours to build, the team must create a mobile application that ingests raw threat data, applies AI-driven risk scoring, and generates a real-time, explainable verdict using GenAI. The system must also enforce strict security policies to prevent unauthorized access or tampering during the analysis process.

**MVP Scope:**
- Mobile app interface for threat ingestion and verdict display
- Backend API endpoint to receive threat data
- GenAI component to generate a risk explanation
- AI/ML model to score threat likelihood (0–100)
- Cybersecurity layer to validate user identity and prevent tampering
- Secure storage of threat data with audit trail
- Real-time display of verdict and explanation on mobile

**Bonus Scope (all four are in scope for this build):**
- Live threat feed (VirusTotal API) for real-time validation
- Role-based access control (RBAC) for analyst tiers
- Model drift detection mechanism for AI scoring
- "Threat confidence" metric based on source reliability

**Constraints:**
- MVP fully functional within 6 hours
- No external cloud services beyond Firebase or AWS Amplify
- AI/ML models pre-trained and hosted locally or via API (no training)
- No third-party auth beyond basic JWT
- GenAI prompts pre-defined, not requiring training

**Deliverables:**
- Running mobile app with threat ingestion and verdict display
- Backend API endpoint accepting threat data
- AI/ML model scoring and GenAI explanation pipeline
- Cybersecurity audit log of user actions
- Live demo video showing threat input → verdict output

---

## 3. Current Build Status (as of handoff)

**Already built and tested by Person A (coordinator):**
- Full Express backend server with working routes
- JWT authentication with role claims (`junior` / `senior`)
- RBAC middleware protecting `/api/audit` and `/api/stats/drift` (senior-only)
- Audit logging — every threat analysis is recorded with user, action, resource ID, timestamp
- Storage layer (lowdb, JSON-file-backed)
- Model drift detection endpoint (rolling average + deviation check)
- Stub implementations for scoring and GenAI explanation — these return realistic fake data so the full pipeline already runs end-to-end right now

**Not yet built (this is what's being divided among the team):**
- Real scoring logic + VirusTotal integration (Person B)
- Real GenAI explanation calls (Person C)
- The entire mobile app (Person D)
- Final integration, testing, demo video (Person A, after B/C/D's work lands)

---

## 4. The Contract (do not deviate from these shapes)

### 4.1 Auth

`POST /api/auth/login`
```json
// Request
{ "username": "analyst1", "password": "demo1234" }
// Response
{ "token": "eyJhbGciOi...", "role": "senior" }
```
Two hardcoded demo users exist already: `analyst1`/`demo1234` (role: `junior`), `analyst2`/`demo1234` (role: `senior`). `senior` role is required for `/api/audit` and `/api/stats/drift`.

### 4.2 Threat analysis (the core endpoint)

`POST /api/threat/analyze`
Header: `Authorization: Bearer <token>`
```json
// Request
{ "type": "url", "value": "http://malicious-example.com/login" }
// type is one of: "url", "ip", "hash"

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
`verdict`: 0–33 = `low_risk`, 34–66 = `medium_risk`, 67–100 = `high_risk`.
`confidence` (0–100): reliability of the score — higher when VirusTotal data was used, lower on heuristic-only fallback.
`source`: `"virustotal+heuristic"` or `"heuristic"`.

### 4.3 Audit log

`GET /api/audit` (senior role only)
```json
{ "entries": [{ "user": "analyst1", "action": "threat_analyzed", "resource_id": "a1b2c3d4", "timestamp": "..." }] }
```

### 4.4 Drift stats (bonus)

`GET /api/stats/drift` (senior role only)
```json
{ "rolling_average": 62.4, "latest_score": 91, "drift_warning": true }
```

### 4.5 Internal backend function contracts

`src/scoring/index.js` (Person B owns this file only):
```js
async function scoreThreats(input) {
  // input: { type: "url"|"ip"|"hash", value: string }
  // returns: { score: number (0-100), factors: string[], confidence: number (0-100), source: string }
}
module.exports = { scoreThreats };
```
Must include VirusTotal integration with a ~1.5s timeout and a graceful fallback to heuristic-only scoring if VirusTotal fails, times out, or no API key is set. Never let it hang or crash the request.

`src/genai/index.js` (Person C owns this file only):
```js
async function explainThreat(input, score, factors) {
  // input: { type, value }, score: number, factors: string[]
  // returns: string (1-3 sentence human-readable explanation)
}
module.exports = { explainThreat };
```
Must use a pre-defined prompt template (not user-editable, not requiring training) calling a real LLM API.

---

## 5. Folder / File Ownership — THE RULE THAT PREVENTS MERGE CONFLICTS

**Every person only edits files inside their own assigned folder. No exceptions without telling the team first.**

| Person | Repo location owned | Files they touch |
|---|---|---|
| **A (coordinator)** | `/backend` root | `server.js`, `src/auth/`, `src/routes/`, `src/audit/`, `src/db/`, `src/routes/stats.routes.js`, root `package.json` |
| **B** | `/backend/src/scoring/` | Only `src/scoring/index.js` (and any new files inside `src/scoring/` they create) |
| **C** | `/backend/src/genai/` | Only `src/genai/index.js` (and any new files inside `src/genai/` they create) |
| **D** | `/mobile/` | Everything inside `/mobile` — their own project, framework of choice |

**Why this prevents merge conflicts:** Git only flags a conflict when two people change the *same lines of the same file*. Since B, C, D, and A never edit outside their own folder, and never touch each other's files, their changes are structurally incapable of overlapping. The only shared files are ones only Person A touches (`server.js`, root `package.json`) — so no one else should ever edit those. If B needs a new npm package, they tell A the package name; A adds it.

---

## 6. Git Workflow (same pattern for everyone)

1. Clone: `git clone https://github.com/YOUR_USERNAME/threatsnap.git`
2. Branch: `git checkout -b feature/YOUR-TASK-NAME` (branch names given per person below)
3. Work only inside your assigned folder
4. Commit as you go: `git add .` then `git commit -m "description"`
5. Push your branch: `git push origin feature/YOUR-TASK-NAME`
6. Open a Pull Request on GitHub (compare `feature/YOUR-TASK-NAME` → `main`)
7. Person A reviews and merges

Before starting any new chunk of work, always run `git checkout main && git pull origin main` first, then branch again — keeps you based on the latest merged code.

---

## 7. Timeline

- **0:00–0:20** — Team reads this doc, confirms contract, everyone clones repo and sets up environment
- **0:20–3:00** — Parallel build: B builds scoring, C builds GenAI, D builds mobile UI (against the contract, using mock data if backend isn't reachable yet), A stands by for questions / starts on polish
- **3:00–3:30** — Checkpoint 1: B and C open PRs, A merges into backend, swaps stubs for real logic, smoke-tests
- **3:30–5:00** — D finishes wiring mobile to the real (now fully live) backend; A/B/C polish, add error handling, test edge cases
- **5:00–5:45** — Checkpoint 2: full integration test on a real device/emulator, fix any breakage
- **5:45–6:00** — Record demo video (threat input → verdict output), submit via the hackathon platform

---

## 8. Non-Functional Requirements Checklist (graded — don't skip)

- [x] JWT auth protects `/api/threat/analyze`, `/api/audit`, `/api/stats/drift`
- [ ] HTTPS in deployment (deploy to Render/Railway free tier for this — gives HTTPS automatically)
- [x] Audit log records every analysis with user + timestamp
- [x] Explanation traceable to inputs via the `factors` array
- [ ] Mobile responsive on Android/iOS (Person D's framework choice should give this natively — e.g. React Native/Expo)
- [ ] Response time under 2s (ensure VirusTotal calls have the 1.5s timeout + fallback so they can't blow this budget)
- [ ] Encryption at rest — **known limitation**: with a JSON-file store built in 6 hours, meaningful at-rest encryption isn't realistic. Document this honestly in the final README as a scoping decision, don't fake it.

---

## 9. What Each Person Is Building (summary — full detail in their individual prompt)

- **Person A (coordinator):** Backend infrastructure (already done), final integration of B/C/D's PRs, deployment, demo video
- **Person B:** Real risk-scoring logic inside `src/scoring/index.js`, including VirusTotal API integration with fallback
- **Person C:** Real GenAI explanation logic inside `src/genai/index.js`, calling an LLM API with a pre-defined prompt
- **Person D:** The entire mobile app in `/mobile` — login, threat input form, verdict/score/confidence display, audit log view (senior only), drift warning banner (senior only)

---

## 10. Rules for AI assistants helping build any part of this

If you are an AI (e.g. Claude, ChatGPT, Copilot) being used by a teammate to help build their part:

1. **Only generate/edit code inside the folder assigned to that person** (see Section 5). Do not touch `server.js`, root `package.json`, or another person's folder.
2. **Never change the function signature, JSON field names, or response shape defined in Section 4.** If a change seems necessary, tell the human to check with the team first — do not silently modify the contract.
3. **Keep the fallback behavior intact** for anything calling an external API (VirusTotal, LLM API) — never let an external call hang or crash the main request path.
4. **Do not touch git branches other than the one specified** for that person's task.
5. **Do not add new files outside the assigned folder** without flagging it to the human first.
