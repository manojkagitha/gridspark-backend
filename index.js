'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================
// ✅ HEALTH CHECK (for Docker + uptime monitors)
// ======================================================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ======================================================
// ✅ SECURITY & PERFORMANCE MIDDLEWARE
// ======================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// ======================================================
// ✅ CORS CONFIGURATION (only allow frontend domain)
// ======================================================
const allowedOrigins = ['https://www.gridsparksolutions.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));

// ======================================================
// ✅ RATE LIMITING
// ======================================================
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max requests per minute
  message: { error: 'Too many requests. Please try again in a minute.' },
});
app.use(limiter);

// ======================================================
// ✅ LOGGING
// ======================================================
app.use(morgan('combined'));

// ======================================================
// ✅ ROUTES
// ======================================================
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Base route (informational)
app.get('/', (req, res) => {
  res.status(200).send('✅ GridSpark API is live and secure 🚀');
});

// ======================================================
// ✅ GLOBAL ERROR HANDLER
// ======================================================
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

// ======================================================
// ✅ START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(`✅ GridSpark API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ======================================================
// ✅ GRACEFUL SHUTDOWN HANDLERS
// ======================================================
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
