require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const threatRoutes = require('./src/routes/threat.routes');
const auditRoutes = require('./src/routes/audit.routes');
const statsRoutes = require('./src/routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple request logger - helps debugging during the hackathon
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ThreatSnap backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/threat', threatRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`ThreatSnap backend listening on http://localhost:${PORT}`);
});
