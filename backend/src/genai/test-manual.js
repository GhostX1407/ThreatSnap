// Run with: node backend/src/genai/test-manual.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { explainThreat } = require('./index.js');

const testCases = [
  {
    input: { type: "url", value: "http://paypa1-security-update.com/login" },
    score: 94,
    factors: ["no HTTPS", "suspicious keyword in URL path", "recently registered domain"]
  },
  {
    input: { type: "ip", value: "185.220.101.42" },
    score: 72,
    factors: ["public IP address", "known Tor exit node"]
  },
  {
    input: { type: "hash", value: "d41d8cd98f00b204e9800998ecf8427e" },
    score: 15,
    factors: ["no strong risk indicators detected"]
  }
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('THREAT EXPLANATION TEST SUITE');
  console.log('='.repeat(80));
  console.log();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const testNum = i + 1;

    console.log(`TEST ${testNum}: ${testCase.input.type.toUpperCase()}`);
    console.log('-'.repeat(80));
    console.log(`Input Value: ${testCase.input.value}`);
    console.log(`Score: ${testCase.score}`);
    console.log(`Factors: ${testCase.factors.join(', ')}`);
    console.log();

    const startTime = Date.now();
    
    try {
      // explainThreat returns a plain string, not an object
      const explanation = await explainThreat(testCase.input, testCase.score, testCase.factors);
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      // Detect if fallback was used (fallback contains "assessed as" and "Recommendation:")
      const isFallback = explanation.includes('assessed as') && explanation.includes('Recommendation:');

      console.log('Output Explanation:');
      console.log(explanation);
      console.log();
      console.log(`Source: ${isFallback ? 'FALLBACK (no API key or API failed)' : 'REAL (Claude API)'}`);
      console.log(`Time taken: ${timeTaken}ms`);
    } catch (error) {
      const endTime = Date.now();
      const timeTaken = endTime - startTime;
      
      console.log('ERROR:');
      console.log(error.message);
      console.log(`Time taken: ${timeTaken}ms`);
    }

    console.log();
    console.log('='.repeat(80));
    console.log();
  }
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
