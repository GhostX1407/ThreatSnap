# ThreatSnap

Mobile-first threat intelligence platform — ingests threat data (URL/IP/hash), scores risk via
a scoring engine, generates a human-readable explanation via GenAI, and enforces JWT auth +
audit logging. Built for myOnsite Ascend Hackathon 2026, Round 2.

## Repo structure

```
/backend    <- Node/Express API: auth, scoring, GenAI explanation, audit trail, storage
/mobile     <- Mobile app: threat input form, verdict + explanation display
```

## Team & ownership

| Person | Owns |
|---|---|
| A | `/backend/src/auth`, `/routes`, `/audit`, `/db`, `server.js` |
| B | `/backend/src/scoring` |
| C | `/backend/src/genai` |
| D | `/mobile` (entire folder) |

Full API/function contract: [`backend/CONTRACT.md`](./backend/CONTRACT.md)

## Running the backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```
See `backend/README.md` for curl test commands.

## Running mobile

```bash
cd mobile
# see mobile/README.md
```

## Demo

Live demo video: (link added at submission time)
