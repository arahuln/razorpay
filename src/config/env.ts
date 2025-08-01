import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Environment variables schema
const envSchema = Joi.object({
  // Server Configuration
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  
  // Razorpay Configuration
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().required(),
  
  // Payment Configuration
  PAYMENT_CURRENCY: Joi.string().default('INR'),
  PAYMENT_TIMEOUT: Joi.number().default(1800),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  // Security
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

// Export validated environment variables
export const config = {
  server: {
    port: envVars.PORT,
    nodeEnv: envVars.NODE_ENV,
  },
  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
    webhookSecret: envVars.RAZORPAY_WEBHOOK_SECRET,
  },
  payment: {
    currency: envVars.PAYMENT_CURRENCY,
    timeout: envVars.PAYMENT_TIMEOUT,
  },
  logging: {
    level: envVars.LOG_LEVEL,
  },
  security: {
    corsOrigin: envVars.CORS_ORIGIN,
    rateLimitWindowMs: envVars.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
} as const; 