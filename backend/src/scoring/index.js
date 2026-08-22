async function checkVirusTotal(type, value) {
  if (!process.env.VT_API_KEY)  return null;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  
  try {
    let endpoint = '';
    if (type === 'url') {
      const safeId = Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      endpoint = `urls/${safeId}`;
    } else if (type === 'ip') {
      endpoint = `ip_addresses/${value}`;
    } else if (type === 'hash') {
      endpoint = `files/${value}`;
    } else {
      clearTimeout(timeout);
      return null;
    }

    const res = await fetch(`https://www.virustotal.com/api/v3/${endpoint}`, {
      headers: { 'x-apikey': process.env.VT_API_KEY },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
}

async function scoreThreats(input) {
  const { type, value } = input;
  let score = 50;
  const factors = [];

  // --- Step 1: Improved Heuristics ---
  if (type === 'url' && value) {
    if (value.startsWith('http://')) {
      score +=20;
      factors.push('no HTTPS');
    }
    if (/login|verify|secure|account|update|auth/i.test(value)) {
      score += 15;
      factors.push('suspicious keyword in URL path');
    }
    try {
      const urlObj = new URL(value.startsWith('http') ? value : 'http://' + value);
      if (/\.(xyz|top|cc|tk|ml|ga|cf|gq)$/i.test(urlObj.hostname)) {
        score += 20;
        factors.push('suspicious TLD');
      }
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname)) {
        score += 25;
        factors.push('IP address used as domain');
      }
      if (/^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|cutt\.ly)$/i.test(urlObj.hostname)) {
        score += 15;
        factors.push('URL shortener detected');
      }
      if (/xn--/i.test(urlObj.hostname)) {
        score += 30;
        factors.push('Punycode/homograph domain detected');
      }
    } catch(e) {}
    if ((value.match(/\./g) || []).length > 3) {
      score += 10;
      factors.push('excessive subdomains');
    }
  }

  if (type === 'ip' && value) {
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.)/.test(value)) {
      score -= 30;
      factors.push('private/loopback IP range, low external risk');
    }
  }

  if (type === 'hash' && value) {
    const len = value.length;
    if (len === 32) {
      score += 10;
      factors.push('MD5 hash format (weaker, commonly used by malware)');
    } else if (len === 40) {
      score += 5;
      factors.push('SHA1 hash format');
    } else if (len === 64) {
      score -= 5;
      factors.push('SHA256 hash format (strong standard)');
    } else {
      score += 30;
      factors.push('malformed hash length');
    }
  }

  score = Math.max(0, Math.min(100, score));
  if (factors.length === 0) factors.push('no strong risk indicators detected');

  // --- Step 2: VirusTotal Integration ---
  const vtResult = await checkVirusTotal(type, value);
  if (vtResult && vtResult.data && vtResult.data.attributes && vtResult.data.attributes.last_analysis_stats) {
    const stats = vtResult.data.attributes.last_analysis_stats;
    const maliciousCount = stats.malicious || 0;
    const suspiciousCount = stats.suspicious || 0;
    
    if (maliciousCount > 0 || suspiciousCount > 0) {
      score = Math.min(100, score + (maliciousCount * 10) + (suspiciousCount * 5));
      factors.push(`VirusTotal flagged malicious (${maliciousCount}) / suspicious (${suspiciousCount})`);
    } else {
      score = Math.max(0, score - 20);
      factors.push('VirusTotal reports clean');
    }
    
    return { score, factors, confidence: 90, source: 'virustotal+heuristic' };
  }

  // Fallback path
  return { score, factors, confidence: 55, source: 'heuristic' };
}

module.exports = { scoreThreats }; 
