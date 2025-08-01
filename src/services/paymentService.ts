import { PaymentStrategy } from '../providers/paymentStrategy';
import { RazorpayStrategy } from '../providers/razorpayStrategy';
import logger from '../utils/logger';

export class PaymentService {
  private strategies: Map<string, PaymentStrategy>;
  private defaultProvider: string;

  constructor() {
    this.strategies = new Map();
    this.defaultProvider = 'razorpay';
    
    // Register payment strategies
    this.registerStrategy(new RazorpayStrategy());
    
    logger.info('Payment service initialized with strategies:', Array.from(this.strategies.keys()));
  }

  private registerStrategy(strategy: PaymentStrategy): void {
    if (strategy.isAvailable()) {
      this.strategies.set(strategy.getProviderName(), strategy);
      logger.info(`Registered payment strategy: ${strategy.getProviderName()}`);
    } else {
      logger.warn(`Payment strategy ${strategy.getProviderName()} is not available`);
    }
  }

  private getStrategy(provider?: string): PaymentStrategy {
    const providerName = provider || this.defaultProvider;
    const strategy = this.strategies.get(providerName);
    
    if (!strategy) {
      throw new Error(`Payment provider '${providerName}' is not available`);
    }
    
    return strategy;
  }

  async createOrder(
    amount: number,
    currency: string,
    receipt: string,
    notes?: string,
    metadata?: Record<string, any>,
    provider?: string
  ) {
    try {
      logger.info(`Creating payment order: ${amount} ${currency}, receipt: ${receipt}`);
      
      const strategy = this.getStrategy(provider);
      
      const response = await strategy.createOrder({
        amount,
        currency,
        receipt,
        notes,
        metadata,
      });
      
      logger.info(`Payment order created successfully: ${response.orderId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to create payment order: ${error}`);
      throw error;
    }
  }

  async verifyPayment(
    paymentId: string,
    orderId: string,
    signature: string,
    webhookData?: Record<string, any>,
    provider?: string
  ) {
    try {
      logger.info(`Verifying payment: ${paymentId}, order: ${orderId}`);
      
      const strategy = this.getStrategy(provider);
      
      const response = await strategy.verifyPayment({
        paymentId,
        orderId,
        signature,
        webhookData,
      });
      
      if (response.isValid) {
        logger.info(`Payment verification successful: ${paymentId}`);
      } else {
        logger.warn(`Payment verification failed: ${paymentId}, error: ${response.errorDescription}`);
      }
      
      return response;
    } catch (error) {
      logger.error(`Failed to verify payment: ${error}`);
      throw error;
    }
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string,
    notes?: string,
    provider?: string
  ) {
    try {
      logger.info(`Processing refund for payment: ${paymentId}`);
      
      const strategy = this.getStrategy(provider);
      
      const response = await strategy.refundPayment({
        paymentId,
        amount,
        reason,
        notes,
      });
      
      logger.info(`Refund processed successfully: ${response.refundId}`);
      return response;
    } catch (error) {
      logger.error(`Failed to process refund: ${error}`);
      throw error;
    }
  }

  getAvailableProviders(): string[] {
    return Array.from(this.strategies.keys());
  }

  isProviderAvailable(provider: string): boolean {
    return this.strategies.has(provider);
  }
} 