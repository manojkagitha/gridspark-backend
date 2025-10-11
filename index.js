'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow only your frontend domain
const allowedOrigins = [
  'https://www.gridsparksolutions.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  exposedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(express.json()); // Parse JSON bodies

// Logger for requests
app.use(morgan('combined'));

// Rate limiter to protect API from abuse
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // limit each IP to 60 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute.'
});
app.use(limiter);

// Import and use auth routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).send('The CI/CD pipeline works! This is an automated and secure update.');
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server listening
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} [NODE_ENV: ${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown on uncaught errors
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Consider monitoring with a process manager for auto-restart
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
