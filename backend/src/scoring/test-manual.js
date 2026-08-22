const { scoreThreats } = require('./index.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runTests() {
  console.log('=== Testing Threat Scoring ===\n');
  console.log('API KEY LOADED:', !!process.env.VT_API_KEY);

  const testCases = [
    { type: 'url', value: 'http://login.secure-update-account.com' },
    { type: 'url', value: 'https://tinyurl.com/free-money-now' },
    { type: 'url', value: 'https://google.com' },
    { type: 'ip', value: '192.168.1.5' },
    { type: 'ip', value: '8.8.8.8' },
    { type: 'hash', value: '44d88612fea8a8f36de82e1278abb02f' },
    { type: 'hash', value: 'malformed-hash-123' },
  ];

  for (const tc of testCases) {
    console.log('\nTesting [' + tc.type + '] ' + tc.value);
    const result = await scoreThreats(tc);
    console.log('Result:', result);
  }
}

runTests();
