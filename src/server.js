const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const billingJob = require('./jobs/billingJob');

let server;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    server = app.listen(env.PORT, () => {
      console.log('==================================================');
      console.log(`🚀 SUBFLOW API Server running on port ${env.PORT}`);
      console.log(`🌐 Base URL: http://localhost:${env.PORT}`);
      console.log(`🔌 Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`💻 Environment: ${env.NODE_ENV}`);
      console.log('==================================================');
    });

    // Start recurring billing scheduler
    if (env.NODE_ENV !== 'test') {
      billingJob.start();
    }
  } catch (err) {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  billingJob.stop();
  if (server) {
    server.close(() => {
      console.log('🔌 HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();
