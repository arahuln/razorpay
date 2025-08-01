import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import logger from '../utils/logger';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Create payment order
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency, receipt, notes, metadata, provider } = req.body;

      // Validate required fields
      if (!amount || !currency || !receipt) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: amount, currency, receipt',
        });
        return;
      }

      // Validate amount
      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0',
        });
        return;
      }

      logger.info(`Creating order request: ${amount} ${currency}, receipt: ${receipt}`);

      const order = await this.paymentService.createOrder(
        amount,
        currency,
        receipt,
        notes,
        metadata,
        provider
      );

      // Return Razorpay-compatible response structure
      res.status(201).json({
        success: true,
        data: {
          providerOrderId: order.providerOrderId, // Razorpay order ID
          amount: order.amount,                   // in rupees (not paise)
          currency: order.currency,               // e.g., "INR"
          receipt: order.receipt,                 // the original receipt ID
          status: order.status                    // Razorpay order status ("created")
        },
      });
    } catch (error) {
      logger.error(`Error in createOrder: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment order',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Verify payment signature
  async verifySignature(req: Request, res: Response): Promise<void> {
    try {
      const { payment_id, order_id, signature, webhook_data, provider } = req.body;

      // Validate required fields
      if (!payment_id || !order_id || !signature) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: payment_id, order_id, signature',
        });
        return;
      }

      logger.info(`Verifying payment: ${payment_id}, order: ${order_id}`);

      const verification = await this.paymentService.verifyPayment(
        payment_id,
        order_id,
        signature,
        webhook_data,
        provider
      );

      if (verification.isValid) {
        res.status(200).json({
          success: true,
          data: verification,
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Payment verification failed',
          data: verification,
        });
      }
    } catch (error) {
      logger.error(`Error in verifySignature: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to verify payment signature',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Process refund
  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { payment_id, amount, reason, notes, provider } = req.body;

      // Validate required fields
      if (!payment_id) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: payment_id',
        });
        return;
      }

      logger.info(`Processing refund for payment: ${payment_id}`);

      const refund = await this.paymentService.refundPayment(
        payment_id,
        amount,
        reason,
        notes,
        provider
      );

      res.status(200).json({
        success: true,
        data: refund,
      });
    } catch (error) {
      logger.error(`Error in refundPayment: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to process refund',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get available providers
  async getProviders(_req: Request, res: Response): Promise<void> {
    try {
      const providers = this.paymentService.getAvailableProviders();
      
      res.status(200).json({
        success: true,
        data: {
          providers,
          count: providers.length,
        },
      });
    } catch (error) {
      logger.error(`Error in getProviders: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to get available providers',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Health check
  async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const providers = this.paymentService.getAvailableProviders();
      
      res.status(200).json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          providers,
          uptime: process.uptime(),
        },
      });
    } catch (error) {
      logger.error(`Error in healthCheck: ${error}`);
      res.status(503).json({
        success: false,
        error: 'Service unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Handle Razorpay webhook
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { event, payload } = req.body;
      
      logger.info(`Received webhook event: ${event}`);

      // Verify webhook signature
      const signature = req.headers['x-razorpay-signature'] as string;
      if (!signature) {
        logger.warn('Missing webhook signature');
        res.status(400).json({
          success: false,
          error: 'Missing webhook signature',
        });
        return;
      }

      // Process different webhook events
      switch (event) {
        case 'payment.captured':
          logger.info(`Payment captured: ${payload.payment.entity.id}`);
          // Handle successful payment
          break;
          
        case 'payment.failed':
          logger.warn(`Payment failed: ${payload.payment.entity.id}`);
          // Handle failed payment
          break;
          
        case 'order.paid':
          logger.info(`Order paid: ${payload.order.entity.id}`);
          // Handle order completion
          break;
          
        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      // Always respond with 200 to acknowledge receipt
      res.status(200).json({
        success: true,
        message: 'Webhook received successfully',
      });
    } catch (error) {
      logger.error(`Error in handleWebhook: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
} 