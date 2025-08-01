import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import logger from './utils/logger';
import routes from './api/routes';

export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: config.security.corsOrigin,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMaxRequests,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
  });

  // API routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Razorpay Payment Gateway API',
      version: '1.0.0',
      documentation: '/api/health',
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.originalUrl,
    });
  });

  // Global error handler
  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(`Unhandled error: ${error.message}`, { stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: config.server.nodeEnv === 'development' ? error.message : 'Something went wrong',
    });
  });

  return app;
} 