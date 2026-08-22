# ThreatSnap Backend

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Server runs at `http://localhost:3000`.

## Folder ownership (see CONTRACT.md for full detail)

- `src/auth`, `src/routes`, `src/audit`, `src/db`, `server.js` → Person A
- `src/scoring` → Person B (currently a stub, see comments in the file)
- `src/genai` → Person C (currently a stub, see comments in the file)

## Quick test (curl)

1. Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"analyst1","password":"demo1234"}'
```
Copy the `token` from the response.

2. Analyze a threat:
```bash
curl -X POST http://localhost:3000/api/threat/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"type":"url","value":"http://malicious-example.com/login"}'
```

3. Check audit log:
```bash
curl http://localhost:3000/api/audit \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

## Deploying quickly (so mobile team has a real URL)

Render.com or Railway.app both support a free Node web service — connect this repo, set the start command to `npm start`, add the `JWT_SECRET` env var, deploy. Takes about 5 minutes and gives you a public URL like `https://threatsnap-backend.onrender.com`.
