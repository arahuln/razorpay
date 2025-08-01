// Payment order creation request
export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

// Payment order response
export interface CreateOrderResponse {
  orderId?: string; // Optional for backward compatibility
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  providerOrderId: string; // Primary field for Razorpay order ID
  createdAt: Date;
}

// Payment verification request
export interface VerifyPaymentRequest {
  paymentId: string;
  orderId: string;
  signature: string;
  webhookData?: Record<string, any> | undefined;
}

// Payment verification response
export interface VerifyPaymentResponse {
  isValid: boolean;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  email?: string;
  contact?: string;
  errorCode?: string;
  errorDescription?: string;
}

// Payment refund request
export interface RefundPaymentRequest {
  paymentId: string;
  amount?: number | undefined;
  reason?: string | undefined;
  notes?: string | undefined;
}

// Payment refund response
export interface RefundPaymentResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string | undefined;
  providerRefundId?: string;
  createdAt: Date;
}

// Common interface for all payment providers
export interface PaymentStrategy {
  // Create a payment order
  createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse>;
  
  // Verify payment signature
  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  
  // Process refund
  refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse>;
  
  // Get provider name
  getProviderName(): string;
  
  // Check if provider is available
  isAvailable(): boolean;
} 