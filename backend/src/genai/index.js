/**
 * OWNED BY: Person C
 * Do not change the function name or return shape without telling the team.
 *
 * explainThreat(input, score, factors) -> Promise<string>
 *
 * This is currently a STUB returning a templated string so the rest of the
 * backend works end-to-end immediately. Replace the internal logic with a
 * real call to an LLM API (Claude, OpenAI, etc.) using a PRE-DEFINED prompt
 * template (constraint: "All GenAI prompts must be pre-defined and not
 * require training"). Keep the function async and keep the same signature.
 *
 * Example real implementation using the Anthropic API:
 *
 * const PROMPT_TEMPLATE = (input, score, factors) => `
 *   You are a cybersecurity analyst assistant. A threat of type "${input.type}"
 *   with value "${input.value}" was scored ${score}/100 for risk.
 *   Contributing factors: ${factors.join(', ')}.
 *   Write a 1-3 sentence, human-readable explanation of why this is risky
 *   (or not), referencing the factors. Be concise and explainable.
 * `;
 *
 * async function explainThreat(input, score, factors) {
 *   const response = await fetch('https://api.anthropic.com/v1/messages', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'x-api-key': process.env.LLM_API_KEY,
 *       'anthropic-version': '2023-06-01'
 *     },
 *     body: JSON.stringify({
 *       model: 'claude-sonnet-4-6',
 *       max_tokens: 200,
 *       messages: [{ role: 'user', content: PROMPT_TEMPLATE(input, score, factors) }]
 *     })
 *   });
 *   const data = await response.json();
 *   return data.content[0].text;
 * }
 */
async function explainThreat(input, score, factors) {
  const { type, value } = input;
  const verdictWord = score <= 33 ? 'low risk' : score <= 66 ? 'moderate risk' : 'high risk';

  // --- STUB LOGIC - replace with real GenAI call ---
  return `This ${type} ("${value}") was assessed as ${verdictWord} (score: ${score}/100). ` +
    `Key contributing factors: ${factors.join(', ')}. This explanation is currently a placeholder ` +
    `and should be replaced with a real GenAI-generated explanation.`;
  // --- END STUB LOGIC ---
}

module.exports = { explainThreat };
