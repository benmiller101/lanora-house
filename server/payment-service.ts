// Stripe removed - switching to Paytriot for raffle support
import { Client, Environment } from "@paypal/paypal-server-sdk";
import { db, pool } from "./db";
import { orders, orderItems, users, products } from "@shared/schema";
import { eq } from "drizzle-orm";

// Paytriot integration for payment processing - no Stripe needed
const stripe = null;

// PayPal configuration
let paypalClient: Client | null = null;

if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  paypalClient = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    environment: Environment.Sandbox, // Use Environment.Production for live
  });
  console.log("✅ PayPal SDK initialized successfully");
} else {
  console.log("⚠️ PayPal credentials not found - PayPal payments disabled");
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface PaymentIntent {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  items: Array<{
    productId?: number;
    raffleId?: number;
    name: string;
    price: number;
    quantity: number;
    type: string;
  }>;
}

export class PaymentService {
  /**
   * Calculate shipping cost based on items and destination
   */
  static calculateShippingCost(items: PaymentIntent['items'], destination: ShippingAddress): number {
    // Check if all items are digital (raffle tickets)
    const isDigitalOnly = items.every(item => item.type === 'raffle_ticket');
    
    if (isDigitalOnly) {
      return 0; // No shipping for digital items
    }
    
    const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 1), 0); // Assume 1kg per item
    const isUK = destination.country.toLowerCase() === 'uk' || destination.country.toLowerCase() === 'united kingdom';
    
    // UK shipping rates
    if (isUK) {
      if (totalWeight <= 2) return 4.95; // Small items
      if (totalWeight <= 10) return 9.95; // Medium items
      return 19.95; // Large items
    }
    
    // International shipping
    if (totalWeight <= 2) return 12.95;
    if (totalWeight <= 10) return 24.95;
    return 49.95;
  }

  /**
   * Calculate tax - NO TAX APPLIED
   */
  static calculateTax(subtotal: number, shippingAddress: ShippingAddress): number {
    console.log("💰 No tax applied - business decision");
    return 0; // No tax at all
  }

  /**
   * Create a Stripe Payment Intent with proper metadata
   */
  static async createPaymentIntent(paymentData: PaymentIntent) {
    try {
      const subtotal = paymentData.amount;
      const shipping = 0; // NO SHIPPING - digital items only
      const tax = 0; // NO TAX - business decision
      const total = subtotal; // Only subtotal, no additional charges

      console.log("💳 PAYMENT CALCULATION (SIMPLIFIED):");
      console.log("  - Subtotal:", subtotal);
      console.log("  - Shipping:", shipping);
      console.log("  - Tax:", tax);
      console.log("  - Total:", total);
      console.log("  - Stripe amount (pence):", Math.round(total * 100));

      // Get user email for receipt
      const [user] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, paymentData.userId))
        .limit(1);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to pence/cents
        currency: paymentData.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: user?.email || paymentData.shippingAddress.email,
        shipping: {
          name: paymentData.shippingAddress.name,
          address: {
            line1: paymentData.shippingAddress.address1,
            line2: paymentData.shippingAddress.address2 || undefined,
            city: paymentData.shippingAddress.city,
            state: paymentData.shippingAddress.state,
            postal_code: paymentData.shippingAddress.postcode,
            country: paymentData.shippingAddress.country === 'UK' ? 'GB' : paymentData.shippingAddress.country,
          },
          phone: paymentData.shippingAddress.phone,
        },
        metadata: {
          orderId: paymentData.orderId,
          userId: paymentData.userId,
          itemCount: paymentData.items.length.toString(),
          subtotal: subtotal.toString(),
          shipping: shipping.toString(),
          tax: tax.toString(),
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amounts: {
          subtotal,
          shipping,
          tax,
          total
        }
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error("Failed to create payment intent");
    }
  }

  /**
   * Confirm payment and update order status
   */
  static async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const orderId = paymentIntent.metadata?.orderId;
        
        if (orderId) {
          // Get order items to update product inventory  
          const orderItems = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId));

          console.log('🛒 Updating inventory for order:', orderId, 'Items:', orderItems.length);

          // Process each order item
          for (const item of orderItems) {
            // Handle product inventory updates
            if (item.productId) {
              // Get current stock
              const [product] = await db
                .select({ stockQuantity: products.stockQuantity })
                .from(products)
                .where(eq(products.id, item.productId))
                .limit(1);

              if (product) {
                const newStock = product.stockQuantity - item.quantity;
                const isStillInStock = newStock > 0;

                console.log(`📦 Product ${item.productId}: ${product.stockQuantity} -> ${newStock} (inStock: ${isStillInStock})`);

                // Update product stock
                await db
                  .update(products)
                  .set({
                    stockQuantity: newStock,
                    inStock: isStillInStock,
                    updatedAt: new Date(),
                  })
                  .where(eq(products.id, item.productId));
              }
            }
            
            // Handle raffle ticket entries
            if (item.type === 'raffle_ticket' && item.raffleId) {
              console.log(`🎫 Creating raffle entry for raffle ${item.raffleId}, user: ${paymentIntent.metadata?.userId}, quantity: ${item.quantity}`);
              
              // Import raffle functions
              const { generateRandomTicketNumbers } = await import("./new-order-system");
              
              // Generate random ticket numbers for this entry
              const ticketNumbers = await generateRandomTicketNumbers(item.raffleId, item.quantity);
              
              console.log(`🎲 Generated ticket numbers for raffle ${item.raffleId}:`, ticketNumbers);
              
              // Create raffle entry in database
              await pool.query(
                `INSERT INTO raffle_entries (raffle_id, user_id, ticket_count, ticket_numbers, created_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [item.raffleId, paymentIntent.metadata?.userId, item.quantity, JSON.stringify(ticketNumbers)]
              );
              
              // Update raffle tickets sold count
              await pool.query(
                `UPDATE raffles SET tickets_sold = tickets_sold + $1 WHERE id = $2`,
                [item.quantity, item.raffleId]
              );
              
              console.log(`✅ Created raffle entry for user ${paymentIntent.metadata?.userId} in raffle ${item.raffleId}`);
            }
          }

          // Update order payment status
          await db
            .update(orders)
            .set({
              paymentStatus: 'paid',
              status: 'processing',
              stripePaymentIntentId: paymentIntentId,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

          console.log('✅ Payment confirmed and inventory updated for order:', orderId);
        }
        
        return { success: true, orderId };
      }
      
      return { success: false, error: 'Payment not completed' };
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw new Error("Failed to confirm payment");
    }
  }

  /**
   * Create PayPal order
   */
  static async createPayPalOrder(paymentData: PaymentIntent): Promise<{ orderId: string; approvalUrl: string }> {
    if (!paypalClient) {
      throw new Error("PayPal not configured");
    }

    try {
      const { ordersController } = paypalClient;

      const orderRequest = {
        body: {
          intent: "CAPTURE",
          purchaseUnits: [
            {
              referenceId: paymentData.orderId,
              amount: {
                currencyCode: paymentData.currency.toUpperCase(),
                value: (paymentData.amount / 100).toFixed(2), // Convert cents to pounds
              },
              description: `Order #${paymentData.orderId} - Lanora House Antiques`,
              items: paymentData.items.map(item => ({
                name: item.name,
                quantity: item.quantity.toString(),
                unitAmount: {
                  currencyCode: paymentData.currency.toUpperCase(),
                  value: (item.price / 100).toFixed(2),
                },
              })),
            },
          ],
          applicationContext: {
            returnUrl: `${process.env.FRONTEND_URL || 'https://your-domain.com'}/order-confirmation?success=true`,
            cancelUrl: `${process.env.FRONTEND_URL || 'https://your-domain.com'}/checkout?cancelled=true`,
            brandName: "Lanora House",
            userAction: "PAY_NOW",
          },
        },
      };

      const response = await ordersController.ordersCreate(orderRequest);
      
      if (response.result && response.result.id) {
        const approvalUrl = response.result.links?.find(link => link.rel === 'approve')?.href;
        
        if (!approvalUrl) {
          throw new Error("PayPal approval URL not found");
        }

        console.log('✅ PayPal order created:', response.result.id);
        
        return {
          orderId: response.result.id,
          approvalUrl: approvalUrl,
        };
      }

      throw new Error("Failed to create PayPal order");
    } catch (error) {
      console.error("PayPal order creation error:", error);
      throw new Error("Failed to create PayPal order");
    }
  }

  /**
   * Capture PayPal payment
   */
  static async capturePayPalPayment(paypalOrderId: string, dbOrderId: string): Promise<{ success: boolean; error?: string }> {
    if (!paypalClient) {
      throw new Error("PayPal not configured");
    }

    try {
      const { ordersController } = paypalClient;

      const response = await ordersController.ordersCapture({
        id: paypalOrderId,
        body: {},
      });

      if (response.result && response.result.status === 'COMPLETED') {
        console.log('✅ PayPal payment captured:', paypalOrderId);
        
        // Update order status in database similar to Stripe
        await db
          .update(orders)
          .set({
            paymentStatus: 'paid',
            status: 'processing',
            paypalOrderId: paypalOrderId,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, parseInt(dbOrderId)));

        // Process inventory and raffle entries (same logic as Stripe)
        await this.processOrderFulfillment(dbOrderId);

        return { success: true };
      }

      return { success: false, error: 'Payment not completed' };
    } catch (error) {
      console.error("PayPal capture error:", error);
      return { success: false, error: 'Failed to capture payment' };
    }
  }

  /**
   * Process order fulfillment (shared between Stripe and PayPal)
   */
  private static async processOrderFulfillment(orderId: string) {
    // Get order items to update product inventory
    const orderItemsData = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, parseInt(orderId)));

    console.log('🛒 Updating inventory for order:', orderId, 'Items:', orderItemsData.length);

    // Process each order item
    for (const item of orderItemsData) {
      // Handle product inventory updates
      if (item.productId) {
        // Get current stock
        const [product] = await db
          .select({ stockQuantity: products.stockQuantity })
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product) {
          const newStock = product.stockQuantity! - item.quantity;
          const isStillInStock = newStock > 0;

          console.log(`📦 Product ${item.productId}: ${product.stockQuantity} -> ${newStock} (inStock: ${isStillInStock})`);

          // Update product stock
          await db
            .update(products)
            .set({
              stockQuantity: newStock,
              inStock: isStillInStock,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
      }
      
      // Handle raffle ticket entries
      if (item.type === 'raffle_ticket' && item.raffleId) {
        console.log(`🎫 Creating raffle entry for raffle ${item.raffleId}, quantity: ${item.quantity}`);
        
        // Import raffle functions
        const { generateRandomTicketNumbers } = await import("./new-order-system");
        
        // Generate random ticket numbers for this entry
        const ticketNumbers = await generateRandomTicketNumbers(item.raffleId, item.quantity);
        
        console.log(`🎲 Generated ticket numbers for raffle ${item.raffleId}:`, ticketNumbers);
        
        // Create raffle entry in database
        await pool.query(
          `INSERT INTO raffle_entries (raffle_id, user_id, ticket_count, ticket_numbers, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [item.raffleId, 'user_from_order', item.quantity, JSON.stringify(ticketNumbers)]
        );
        
        // Update raffle tickets sold count
        await pool.query(
          `UPDATE raffles SET tickets_sold = tickets_sold + $1 WHERE id = $2`,
          [item.quantity, item.raffleId]
        );
        
        console.log(`✅ Created raffle entry in raffle ${item.raffleId}`);
      }
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.confirmPayment(paymentIntent.id);
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          const failedOrderId = failedPayment.metadata?.orderId;
          
          if (failedOrderId) {
            await db
              .update(orders)
              .set({
                paymentStatus: 'failed',
                status: 'cancelled',
                updatedAt: new Date(),
              })
              .where(eq(orders.id, parseInt(failedOrderId)));
          }
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error("Error handling webhook:", error);
      throw error;
    }
  }

  /**
   * Get payment intent status
   */
  static async getPaymentStatus(paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error("Error retrieving payment status:", error);
      throw new Error("Failed to get payment status");
    }
  }
}