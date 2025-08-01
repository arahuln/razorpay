# 🚀 Deploy to Render

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/razorpay-gateway.git
git push -u origin main
```

### 2. Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name:** `razorpay-gateway`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`

### 3. Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```env
NODE_ENV=production
PORT=3000
RAZORPAY_KEY_ID=rzp_test_gYowpjeZKdnDNc
RAZORPAY_KEY_SECRET=7FHB8nYjATiC0yaFnLl8AXDi
RAZORPAY_WEBHOOK_SECRET=whsec_render_test_2025
```

### 4. Deploy

Click **"Create Web Service"** and wait for deployment.

## Your Live URL

After deployment, you'll get a URL like:
```
https://razorpay-gateway.onrender.com
```

## Update Razorpay Dashboard

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. In "Submit details for verification":
   - **Website URL:** `https://razorpay-gateway.onrender.com`
   - **Login Required:** No

## Test Your Live API

```bash
# Health check
curl https://razorpay-gateway.onrender.com/api/health

# Create order
curl -X POST https://razorpay-gateway.onrender.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR", "receipt": "live_test_001"}'

# Verify payment
curl -X POST https://razorpay-gateway.onrender.com/api/payment/verify-signature \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "pay_xxx", "order_id": "order_xxx", "signature": "xxx"}'

# Refund payment
curl -X POST https://razorpay-gateway.onrender.com/api/payment/refund \
  -H "Content-Type: application/json" \
  -d '{"payment_id": "pay_xxx", "amount": 50, "reason": "Test refund"}'
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/providers` - List payment providers
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify-signature` - Verify payment signature
- `POST /api/payment/refund` - Process refund
- `POST /api/payment/webhook` - Razorpay webhook endpoint

## Monitoring

- **Logs:** Available in Render dashboard
- **Health Checks:** Automatic monitoring via `/api/health`
- **Uptime:** Render provides 99.9% uptime SLA 