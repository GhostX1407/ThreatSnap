// backend/src/genai/index.js

/**
 * Builds the prompt for the Claude API based on the threat indicator
 * @param {Object} input - The threat indicator {type, value}
 * @param {number} score - Risk score 0-100
 * @param {string[]} factors - Array of risk factors
 * @returns {string} The formatted prompt
 */
function buildPrompt(input, score, factors) {
  const verdict = score > 66 ? 'HIGH RISK' : score > 33 ? 'MODERATE RISK' : 'LOW RISK';
  
  return `You are a cybersecurity threat analyst. A ${input.type} indicator was analyzed.
Indicator: "${input.value}"
Risk Score: ${score}/100 (${verdict})
Flagged Factors: ${factors.join(', ')}

Write a concise 1-3 sentence explanation of WHY this indicator received this risk score. Reference the specific factors above. Then add 1 sentence with a recommended action. Be direct and technical — this is for a security analyst.`;
}

/**
 * Generates a fallback explanation when the API is unavailable
 * @param {Object} input - The threat indicator {type, value}
 * @param {number} score - Risk score 0-100
 * @param {string[]} factors - Array of risk factors
 * @returns {string} Fallback explanation string
 */
function buildFallback(input, score, factors) {
  const verdict = score > 66 ? 'HIGH RISK' : score > 33 ? 'MODERATE RISK' : 'LOW RISK';
  const recommendation = score > 66 
    ? 'Block immediately and investigate.' 
    : score > 33 
    ? 'Monitor closely and verify source.' 
    : 'No immediate action required.';
  
  return `This ${input.type} ("${input.value}") was assessed as ${verdict} (score: ${score}/100). Key contributing factors: ${factors.join(', ')}. Recommendation: ${recommendation}`;
}

/**
 * Calls the Claude API with timeout protection
 * @param {string} prompt - The prompt to send
 * @param {AbortSignal} signal - Abort signal for timeout
 * @returns {Promise<string>} The API response text
 */
async function callClaudeAPI(prompt, signal) {
  const apiKey = process.env.LLM_API_KEY;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }),
    signal // Attach the abort signal for timeout enforcement
  });
  
  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

/**
 * Main function: Explains a threat indicator using Claude AI or fallback
 * @param {Object} input - Shape: {type: "url"|"ip"|"hash", value: string}
 * @param {number} score - Risk score from 0-100
 * @param {string[]} factors - Array of flagged risk factors
 * @returns {Promise<string>} A 1-3 sentence explanation + 1 recommendation
 */
async function explainThreat(input, score, factors) {
  // Always have a fallback ready in case of API failure
  const fallback = buildFallback(input, score, factors);
  
  // If no API key is configured, return fallback immediately
  if (!process.env.LLM_API_KEY) {
    return fallback;
  }
  
  try {
    // Create AbortController for 3.5 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    
    // Build the prompt with threat details
    const prompt = buildPrompt(input, score, factors);
    
    // Call Claude API with timeout protection
    const explanation = await callClaudeAPI(prompt, controller.signal);
    
    // Clear timeout if request succeeds
    clearTimeout(timeoutId);
    
    return explanation;
    
  } catch (error) {
    // Log error for debugging but never crash
    console.warn('Claude API unavailable, using fallback:', error.message);
    
    // Return fallback on any error (timeout, network, API error, etc.)
    return fallback;
  }
}

module.exports = { explainThreat };
