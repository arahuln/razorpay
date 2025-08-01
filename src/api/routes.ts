import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';

const router = Router();
const paymentController = new PaymentController();

// Health check endpoint
router.get('/health', (req, res) => paymentController.healthCheck(req, res));

// Get available payment providers
router.get('/providers', (req, res) => paymentController.getProviders(req, res));

// Payment endpoints
router.post('/payment/create-order', (req, res) => paymentController.createOrder(req, res));
router.post('/payment/verify-signature', (req, res) => paymentController.verifySignature(req, res));
router.post('/payment/refund', (req, res) => paymentController.refundPayment(req, res));

// Legacy endpoints for backward compatibility
router.post('/create-order', (req, res) => paymentController.createOrder(req, res));
router.post('/verify-signature', (req, res) => paymentController.verifySignature(req, res));

// Webhook endpoint for Razorpay
router.post('/payment/webhook', (req, res) => paymentController.handleWebhook(req, res));

export default router; 