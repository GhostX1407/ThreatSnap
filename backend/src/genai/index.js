// backend/src/genai/index.js

/**
 * Builds the prompt for the LLM based on the threat indicator
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
 * Calls the Groq LLM API with timeout protection
 * Groq uses OpenAI-compatible format (not Anthropic)
 */
async function callLLM(prompt, signal) {
  const apiKey = process.env.LLM_API_KEY;
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',  // Available model on Groq
      messages: [
        { role: 'system', content: 'You are a cybersecurity threat analyst. Be concise and specific.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.3
    }),
    signal
  });
  
  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Main function: Explains a threat indicator using LLM or fallback
 */
async function explainThreat(input, score, factors) {
  const fallback = buildFallback(input, score, factors);
  
  if (!process.env.LLM_API_KEY) {
    return fallback;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    
    const prompt = buildPrompt(input, score, factors);
    const explanation = await callLLM(prompt, controller.signal);
    
    clearTimeout(timeoutId);
    return explanation;
    
  } catch (error) {
    console.warn('LLM API unavailable, using fallback:', error.message);
    return fallback;
  }
}

module.exports = { explainThreat };
