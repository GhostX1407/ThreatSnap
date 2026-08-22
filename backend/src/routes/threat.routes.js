const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../auth');
const { scoreThreats } = require('../scoring');
const { explainThreat } = require('../genai');
const db = require('../db');
const audit = require('../audit');

const router = express.Router();

const VALID_TYPES = ['url', 'ip', 'hash'];

function scoreToVerdict(score) {
  if (score <= 33) return 'low_risk';
  if (score <= 66) return 'medium_risk';
  return 'high_risk';
}

router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.status(400).json({ error: 'type and value are required' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    const { score, factors, confidence, source } = await scoreThreats({ type, value });
    const explanation = await explainThreat({ type, value }, score, factors);
    const verdict = scoreToVerdict(score);

    const result = {
      id: uuidv4().slice(0, 8),
      type,
      value,
      score,
      verdict,
      explanation,
      factors,
      confidence,
      source,
      timestamp: new Date().toISOString()
    };

    db.saveThreat(result);
    audit.record(req.user, 'threat_analyzed', result);

    res.json(result);
  } catch (err) {
    console.error('Error in /analyze:', err);
    res.status(500).json({ error: 'Internal server error while analyzing threat' });
  }
});

router.get('/history', authMiddleware, (req, res) => {
  res.json({ threats: db.getThreats() });
});

module.exports = router;
