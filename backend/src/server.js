require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for mobile app and web frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for STB / dev console
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root friendly welcome
app.get('/', (req, res) => {
  res.json({
    service: 'SIGAP Microservice Core (TST x PWAM)',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: '/api/...',
  });
});

// Mount API routes under /api
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan pada layanan SIGAP.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SIGAP SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada layanan SIGAP.',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 SIGAP Microservice Core Service running on port ${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Auth Modes: Bearer JWT (Users) & X-API-Key (Peers)`);
  console.log(`=======================================================`);
});

module.exports = app;
