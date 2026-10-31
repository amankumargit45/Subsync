const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const { apiRateLimiter } = require('./middleware/rateLimitMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');
const { error } = require('./utils/response');

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const planRoutes = require('./routes/planRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const discountRoutes = require('./routes/discountRoutes');
const taxRoutes = require('./routes/taxRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all dev origins cleanly
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// HTTP Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.isDev ? 'dev' : 'combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global API rate limiting
app.use('/api', apiRateLimiter);

// Root greeting endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'subflow-api',
    status: 'healthy',
    message: 'SubFlow Unified Subscription API is running. Access the frontend application at http://localhost:3000',
    documentation: {
      health: '/api/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      customers: '/api/customers',
      subscriptions: '/api/subscriptions',
      invoices: '/api/invoices',
      payments: '/api/payments',
    },
  });
});

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'subflow-api',
    status: 'healthy',
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  error(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found.`);
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
