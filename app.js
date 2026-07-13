const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Health check route (useful for IBM Cloud Code Engine / Kubernetes probes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'App is healthy' });
});

// Simple API route to prove the app is dynamic, not just static files
app.get('/api/info', (req, res) => {
  res.json({
    project: 'Dockerized Web App Deployment on IBM Cloud',
    hostname: require('os').hostname(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
