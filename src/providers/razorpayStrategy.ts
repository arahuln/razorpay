import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env';
import logger from '../utils/logger';
import {
  PaymentStrategy,
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from './paymentStrategy';

export class RazorpayStrategy implements PaymentStrategy {
  private razorpay: Razorpay;
  private webhookSecret: string;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
    this.webhookSecret = config.razorpay.webhookSecret;
  }

  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      logger.info(`Creating Razorpay order for amount: ${request.amount} ${request.currency}`);

      const orderData: any = {
        amount: request.amount * 100, // Razorpay expects amount in paise
        currency: request.currency,
        receipt: request.receipt,
      };

      if (request.notes) {
        orderData.notes = { notes: request.notes };
      }

      if (request.metadata) {
        orderData.notes = { ...request.metadata };
      }

      const order = await this.razorpay.orders.create(orderData);

      logger.info(`Razorpay order created successfully: ${order.id}`);

      return {
        orderId: order.id,
        amount: request.amount, // Keep as rupees (not paise)
        currency: request.currency,
        receipt: request.receipt,
        status: order.status,
        providerOrderId: order.id, // Razorpay order ID
        createdAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error && error.stack ? error.stack : '';
      
      logger.error(`Error creating Razorpay order: ${errorMessage}`);
      if (errorDetails) {
        logger.error(`Error details: ${errorDetails}`);
      }
      
      throw new Error(`Failed to create payment order: ${errorMessage}`);
    }
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    try {
      logger.info(`Verifying Razorpay payment: ${request.paymentId}`);

      // Verify webhook signature
      const isValidSignature = this.verifyWebhookSignature(
        request.paymentId,
        request.orderId,
        request.signature,
        request.webhookData
      );

      if (!isValidSignature) {
        logger.warn(`Invalid signature for payment: ${request.paymentId}`);
        return {
          isValid: false,
          paymentId: request.paymentId,
          orderId: request.orderId,
          amount: 0,
          currency: '',
          status: 'failed',
          errorCode: 'INVALID_SIGNATURE',
          errorDescription: 'Payment signature verification failed',
        };
      }

      // Fetch payment details from Razorpay
      const payment = await this.razorpay.payments.fetch(request.paymentId);

      logger.info(`Payment verification successful: ${request.paymentId}`);

      return {
        isValid: true,
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: (payment.amount as number) / 100, // Convert from paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact?.toString() || '',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error verifying Razorpay payment: ${errorMessage}`);
      return {
        isValid: false,
        paymentId: request.paymentId,
        orderId: request.orderId,
        amount: 0,
        currency: '',
        status: 'failed',
        errorCode: 'VERIFICATION_FAILED',
        errorDescription: `Payment verification failed: ${errorMessage}`,
      };
    }
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    try {
      logger.info(`Processing refund for payment: ${request.paymentId}`);

      const refundData: any = {
        payment_id: request.paymentId,
      };

      if (request.amount) {
        refundData.amount = request.amount * 100; // Convert to paise
      }

      if (request.reason) {
        refundData.reason = request.reason;
      }

      if (request.notes) {
        refundData.notes = { notes: request.notes };
      }

      const refund = await this.razorpay.payments.refund(request.paymentId, refundData);

      logger.info(`Refund processed successfully: ${refund.id}`);

      return {
        refundId: refund.id,
        paymentId: request.paymentId,
        amount: (refund.amount as number) / 100, // Convert from paise to rupees
        currency: refund.currency,
        status: refund.status,
        reason: request.reason,
        providerRefundId: refund.id,
        createdAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error processing refund: ${errorMessage}`);
      throw new Error(`Failed to process refund: ${errorMessage}`);
    }
  }

  getProviderName(): string {
    return 'razorpay';
  }

  isAvailable(): boolean {
    return !!(config.razorpay.keyId && config.razorpay.keySecret);
  }

  private verifyWebhookSignature(
    paymentId: string,
    orderId: string,
    signature: string,
    _webhookData?: Record<string, any>
  ): boolean {
    try {
      // Create the signature string
      const signatureString = `${orderId}|${paymentId}`;
      
      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signatureString)
        .digest('hex');

      // Compare signatures
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error(`Error verifying webhook signature: ${error}`);
      return false;
    }
  }
} 