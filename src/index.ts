import { createApp } from './app';
import { config } from './config/env';
import logger from './utils/logger';

async function startServer(): Promise<void> {
  try {
    const app = createApp();
    
    const server = app.listen(config.server.port, () => {
      logger.info(`🚀 Payment Gateway server started on port ${config.server.port}`);
      logger.info(`📊 Environment: ${config.server.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${config.server.port}/api/health`);
      logger.info(`📝 API Documentation: http://localhost:${config.server.port}/`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 