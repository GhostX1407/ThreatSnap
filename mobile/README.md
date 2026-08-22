# ThreatSnap Mobile

Person D owns this entire folder.

Talks to the backend only via HTTP — see `../backend/CONTRACT.md` for the exact
request/response JSON shapes for `/api/auth/login` and `/api/threat/analyze`.

## Setup (fill in once framework is chosen, e.g. React Native / Expo / Flutter)

```bash
# npm install
# npm start
```

## Screens needed (per PRD)
- Login screen (username/password -> JWT, store token in memory/state)
- Threat input form (type: url/ip/hash, value: text field)
- Verdict display (score, color-coded by verdict: low_risk=green, medium_risk=yellow, high_risk=red)
- Explanation display (the GenAI-generated text)
- Loading state while waiting on `/api/threat/analyze` (should resolve within ~2s per NFR)
