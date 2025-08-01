# Razorpay Payment Gateway

A modular, extensible, and configurable payment gateway service built with Node.js and TypeScript. This service uses the Strategy Design Pattern to support multiple payment providers, starting with Razorpay integration.

## Features

- **Modular Architecture**: Strategy pattern for easy addition of new payment providers
- **TypeScript**: Full type safety and better developer experience
- **12-Factor App**: Follows cloud-native principles
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Logging**: Winston-based structured logging
- **Docker Support**: Containerized for easy deployment
- **Health Checks**: Built-in health monitoring
- **API Documentation**: Clear API endpoints and responses

## API Endpoints

### Core Payment APIs

#### 1. Create Payment Order
```http
POST /api/payment/create-order
```

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "order_123",
  "notes": "Payment for order #123",
  "metadata": {
    "order_id": "123",
    "user_id": "456"
  },
  "provider": "razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_abc123",
    "amount": 1000,
    "currency": "INR",
    "receipt": "order_123",
    "status": "created",
    "providerOrderId": "order_abc123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Verify Payment Signature
```http
POST /api/payment/verify-signature
```

**Request Body:**
```json
{
  "payment_id": "pay_abc123",
  "order_id": "order_abc123",
  "signature": "abc123...",
  "webhook_data": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "paymentId": "pay_abc123",
    "orderId": "order_abc123",
    "amount": 1000,
    "currency": "INR",
    "status": "captured",
    "method": "card",
    "email": "user@example.com",
    "contact": "+919876543210"
  }
}
```

### Utility APIs

#### Health Check
```http
GET /api/health
```

#### Get Available Providers
```http
GET /api/providers
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Payment Configuration
PAYMENT_CURRENCY=INR
PAYMENT_TIMEOUT=1800

# Logging
LOG_LEVEL=info

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd razorpay-gateway
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your Razorpay credentials
```

3. **Start development server:**
```bash
npm run dev
```

### Docker Development

```bash
# Build and run with docker-compose
docker-compose up payment-gateway-dev

# Or build and run manually
docker build -f Dockerfile.dev -t razorpay-gateway-dev .
docker run -p 3000:3000 --env-file .env razorpay-gateway-dev
```

### Production Deployment

```bash
# Build production image
docker build -t razorpay-gateway .

# Run production container
docker run -p 3000:3000 --env-file .env razorpay-gateway
```

## Project Structure

```
razorpay-gateway/
├── src/
│   ├── api/
│   │   └── routes.ts          # API route definitions
│   ├── config/
│   │   └── env.ts             # Environment configuration
│   ├── controllers/
│   │   └── paymentController.ts # HTTP request handlers
│   ├── providers/
│   │   ├── paymentStrategy.ts # Payment provider interface
│   │   └── razorpayStrategy.ts # Razorpay implementation
│   ├── services/
│   │   └── paymentService.ts  # Business logic orchestration
│   ├── utils/
│   │   └── logger.ts          # Logging utility
│   ├── app.ts                 # Express app setup
│   └── index.ts               # Application entry point
├── tests/                     # Test files
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Production Docker image
├── Dockerfile.dev             # Development Docker image
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Adding New Payment Providers

To add a new payment provider (e.g., Stripe):

1. **Create a new strategy class:**
```typescript
// src/providers/stripeStrategy.ts
import { PaymentStrategy } from './paymentStrategy';

export class StripeStrategy implements PaymentStrategy {
  // Implement all required methods
}
```

2. **Register the strategy in PaymentService:**
```typescript
// src/services/paymentService.ts
import { StripeStrategy } from '../providers/stripeStrategy';

constructor() {
  this.registerStrategy(new StripeStrategy());
}
```

3. **Add environment variables for the new provider**

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Logging

The application uses Winston for structured logging. Logs are written to:
- Console (development)
- `logs/all.log` (all levels)
- `logs/error.log` (error level only)

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **Environment Variables**: Secure configuration management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details 