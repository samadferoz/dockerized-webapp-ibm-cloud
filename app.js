const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');
const path = require('path');

const app = express();
const startedAt = Date.now();
let visitorCount = 0;
let requestCount = 0;

app.disable('x-powered-by');
app.use(helmet());
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));
app.use(express.json());

app.use((req, res, next) => {
  requestCount++;
  next();
});

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Health check (liveness/readiness probe for Code Engine / Kubernetes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptimeSeconds: Math.floor(process.uptime()) });
});

// System / container info
app.get('/api/info', (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    project: 'Dockerized Web App Deployment on IBM Cloud',
    version: require('./package.json').version,
    hostname: os.hostname(),
    platform: `${os.platform()} (${os.arch()})`,
    nodeVersion: process.version,
    cpuCores: os.cpus().length,
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryMB: Math.round(mem.rss / 1024 / 1024),
    totalRequests: requestCount,
    startedAt: new Date(startedAt).toISOString(),
    timestamp: new Date().toISOString()
  });
});

// Visitor counter (in-memory; resets when container restarts)
app.post('/api/visit', (req, res) => {
  visitorCount++;
  res.json({ visitors: visitorCount, servedBy: os.hostname() });
});
app.get('/api/visit', (req, res) => res.json({ visitors: visitorCount }));

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
