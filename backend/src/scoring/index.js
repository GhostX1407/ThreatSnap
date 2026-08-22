/**
 * OWNED BY: Person B
 * Do not change the function name or return shape without telling the team.
 *
 * scoreThreats(input) -> Promise<{ score, factors, confidence, source }>
 *
 * This is currently a STUB with heuristic-only scoring. Two things to add:
 * 1. Improve the heuristic rules below (real logic per type).
 * 2. Add a VirusTotal API call (bonus feature) with a fallback to heuristics
 *    if the call fails, times out, or no API key is configured. NEVER let a
 *    slow/broken VirusTotal call hang the request - use a short timeout
 *    (~1.5s) and always fall back gracefully.
 *
 * Example VirusTotal integration pattern (fill in with real key + endpoint):
 *
 * async function checkVirusTotal(type, value) {
 *   const controller = new AbortController();
 *   const timeout = setTimeout(() => controller.abort(), 1500);
 *   try {
 *     const res = await fetch(`https://www.virustotal.com/api/v3/...`, {
 *       headers: { 'x-apikey': process.env.VT_API_KEY },
 *       signal: controller.signal
 *     });
 *     clearTimeout(timeout);
 *     if (!res.ok) return null;
 *     return await res.json();
 *   } catch (err) {
 *     clearTimeout(timeout);
 *     return null; // signals fallback to heuristic-only
 *   }
 * }
 */
async function scoreThreats(input) {
  const { type, value } = input;

  // --- Heuristic scoring (always runs, used as fallback or blended with VT) ---
  let score = 50;
  const factors = [];

  if (type === 'url' && value && value.startsWith('http://')) {
    score += 20;
    factors.push('no HTTPS');
  }
  if (type === 'url' && value && /login|verify|secure|account/i.test(value)) {
    score += 15;
    factors.push('suspicious keyword in URL path');
  }
  if (type === 'ip' && value && value.startsWith('192.168')) {
    score -= 30;
    factors.push('private IP range, low external risk');
  }
  if (type === 'hash' && value && value.length === 32) {
    score += 10;
    factors.push('MD5 hash format (weaker, commonly used by malware)');
  }

  score = Math.max(0, Math.min(100, score));
  if (factors.length === 0) factors.push('no strong risk indicators detected');

  // --- VirusTotal integration point (bonus) ---
  // const vtResult = await checkVirusTotal(type, value);
  // if (vtResult) {
  //   // blend vtResult into score/factors, set confidence higher, source "virustotal+heuristic"
  //   return { score: blendedScore, factors: [...factors, ...vtFactors], confidence: 90, source: 'virustotal+heuristic' };
  // }

  // Fallback path (also the current default since VT isn't wired up yet in this stub)
  return { score, factors, confidence: 55, source: 'heuristic' };
}

module.exports = { scoreThreats };
