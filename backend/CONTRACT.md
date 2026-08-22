# ThreatSnap API & Function Contract

Read this before writing any code. Do not change field names without telling the whole team first.

## 1. Auth

`POST /api/auth/login`

Request:
```json
{ "username": "analyst1", "password": "demo1234" }
```
Response:
```json
{ "token": "eyJhbGciOi...", "role": "senior" }
```
Role is one of: `"junior"`, `"senior"`. Encoded inside the JWT payload too, so the backend
can check it without a DB lookup. `senior` can access `/api/audit` and `/api/stats/drift`;
`junior` gets a 403 on those two routes.

## 2. Threat analysis (core endpoint)

`POST /api/threat/analyze`
Header: `Authorization: Bearer <token>`

Request:
```json
{
  "type": "url",
  "value": "http://malicious-example.com/login"
}
```
`type` is one of: `"url"`, `"ip"`, `"hash"`

Response:
```json
{
  "id": "a1b2c3d4",
  "type": "url",
  "value": "http://malicious-example.com/login",
  "score": 82,
  "verdict": "high_risk",
  "explanation": "This URL is likely a phishing attempt because it mimics a known login page pattern and uses a suspicious non-HTTPS domain.",
  "factors": ["no HTTPS", "suspicious domain pattern", "recently registered domain"],
  "confidence": 78,
  "source": "virustotal+heuristic",
  "timestamp": "2026-08-22T15:40:00Z"
}
```
`verdict` derived from `score`: 0–33 = `low_risk`, 34–66 = `medium_risk`, 67–100 = `high_risk`.
`confidence` (0-100): how reliable the score is. Higher when VirusTotal data was available,
lower when falling back to heuristic-only scoring. `source` is `"virustotal+heuristic"` or
just `"heuristic"` if VirusTotal was unavailable/timed out.

## 2b. Drift stats (bonus - model drift detection)

`GET /api/stats/drift` (protected, `senior` role only)
Response:
```json
{ "rolling_average": 62.4, "latest_score": 91, "drift_warning": true }
```
`drift_warning` is `true` when the latest score deviates significantly (e.g. more than 25
points) from the rolling average of the last N scores. Person A implements this endpoint;
it reads from the same `db.json` threat history Person A already stores.

## 3. Internal function contract (inside backend only)

**Person B implements** `src/scoring/index.js`:
```js
async function scoreThreats(input) {
  // input: { type: "url"|"ip"|"hash", value: string }
  // returns: { score: number (0-100), factors: string[], confidence: number (0-100), source: string }
}
module.exports = { scoreThreats };
```
Note: this function is now `async` because it may call the VirusTotal API (bonus feature).
It MUST have a fallback: if VirusTotal fails, times out (use a ~1.5s timeout), or no API
key is set, fall back to heuristic-only scoring, set `confidence` lower, and set
`source: "heuristic"`. Never let a VirusTotal failure crash or hang the request.

**Person C implements** `src/genai/index.js`:
```js
async function explainThreat(input, score, factors) {
  // input: { type, value }, score: number, factors: string[]
  // returns: string (1-3 sentence human-readable explanation)
}
module.exports = { explainThreat };
```

Both currently contain STUB implementations returning fake data matching these shapes. Replace the logic inside, keep the function signature and return shape identical.

## 4. Audit log

`GET /api/audit` (protected, same JWT)
Response:
```json
{
  "entries": [
    { "user": "analyst1", "action": "threat_analyzed", "resource_id": "a1b2c3d4", "timestamp": "2026-08-22T15:40:00Z" }
  ]
}
```

## 5. Folder ownership (do not edit outside your folder)

| Folder | Owner |
|---|---|
| `src/auth`, `src/routes`, `src/audit`, `src/db`, `server.js` | Person A |
| `src/scoring` | Person B |
| `src/genai` | Person C |

Mobile team (Person D) never touches this repo — they only call the two endpoints above over HTTP.
