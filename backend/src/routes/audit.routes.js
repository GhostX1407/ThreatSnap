const express = require('express');
const { authMiddleware, requireRole } = require('../auth');
const audit = require('../audit');

const router = express.Router();

router.get('/', authMiddleware, requireRole('senior'), (req, res) => {
  res.json({ entries: audit.getAll() });
});

module.exports = router;
