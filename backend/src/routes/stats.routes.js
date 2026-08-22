const express = require('express');
const { authMiddleware, requireRole } = require('../auth');
const db = require('../db');

const router = express.Router();

const ROLLING_WINDOW = 10; // look at last N scores
const DRIFT_THRESHOLD = 25; // points of deviation that counts as "drift"

router.get('/drift', authMiddleware, requireRole('senior'), (req, res) => {
  const threats = db.getThreats();

  if (threats.length === 0) {
    return res.json({ rolling_average: null, latest_score: null, drift_warning: false });
  }

  const recent = threats.slice(-ROLLING_WINDOW);
  const rollingAverage = recent.reduce((sum, t) => sum + t.score, 0) / recent.length;
  const latestScore = threats[threats.length - 1].score;
  const driftWarning = Math.abs(latestScore - rollingAverage) > DRIFT_THRESHOLD;

  res.json({
    rolling_average: Math.round(rollingAverage * 10) / 10,
    latest_score: latestScore,
    drift_warning: driftWarning
  });
});

module.exports = router;
