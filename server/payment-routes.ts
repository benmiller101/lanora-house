import { Router, Request, Response } from "express";
import { PaymentService } from "./payment-service";
import { ShippingService } from "./shipping-service";
import { db } from "./db";
import { orders, orderItems, cartItems, users, productOffers } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
// Stripe removed - switching to Paytriot for raffle support

const router = Router();

// Validation schemas
const shippingAddressSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
});

const createPaymentIntentSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.union([z.number(), z.string()]).optional().transform(val => val ? parseInt(val.toString()) : undefined),
    raffleId: z.union([z.number(), z.string()]).optional().transform(val => val ? parseInt(val.toString()) : undefined),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    type: z.string(),
  })),
  checkoutType: z.enum(['cart', 'offer']).optional().default('cart'),
  offerId: z.union([z.number(), z.string()]).optional().transform(val => val ? parseInt(val.toString()) : undefined),
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  shippingMethod: z.string(),
});

// Calculate shipping options
router.post("/shipping-options", async (req: Request, res: Response) => {
  try {
    const { items, destination } = req.body;
    
    if (!items || !destination) {
      return res.status(400).json({ error: "Items and destination are required" });
    }

    const shippingOptions = ShippingService.calculateShippingOptions(items, destination);
    
    res.json({ shippingOptions });
  } catch (error) {
    console.error("Error calculating shipping:", error);
    res.status(500).json({ error: "Failed to calculate shipping options" });
  }
});

// Validate postcode (UK specific)
router.post("/validate-postcode", async (req: Request, res: Response) => {
  try {
    const { postcode } = req.body;
    
    if (!postcode) {
      return res.status(400).json({ error: "Postcode is required" });
    }

    const isValid = ShippingService.validateUKPostcode(postcode);
    
    res.json({ isValid });
  } catch (error) {
    console.error("Error validating postcode:", error);
    res.status(500).json({ error: "Failed to validate postcode" });
  }
});

// Create order payment intent for existing orders
router.post("/create-order-payment", async (req: any, res: Response) => {
  try {
    console.log("🔧 Order payment request received:", req.body);
    
    if (!req.session?.user?.id) {
      console.log("❌ User not authenticated");
      return res.status(401).json({ error: "Authentication required" });
    }

    const { orderId, shipping, billing, shippingMethod } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Get order details from database
    const orderResult = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.userId, req.session.user.id)
      ));

    if (orderResult.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderResult[0];
    
    // Get order items
    const itemsResult = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    if (itemsResult.length === 0) {
      return res.status(400).json({ error: "No items found for this order" });
    }

    // Calculate totals
    const subtotal = parseFloat(order.subtotal || "0");
    const shippingCost = parseFloat(order.shipping || "7.50");
    const taxAmount = parseFloat(order.tax || "0");
    const total = subtotal + shippingCost + taxAmount;

    console.log("💰 Order totals:", { subtotal, shippingCost, taxAmount, total });

    // Create Stripe payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'gbp',
      orderId: orderId.toString(),
      userId: req.session.user.id,
      shippingAddress: shipping,
      billingAddress: billing,
      items: itemsResult.map(item => ({
        productId: item.productId || undefined,
        raffleId: item.raffleId || undefined,
        name: item.name,
        price: parseFloat(item.unitPrice),
        quantity: item.quantity,
        type: item.type || 'product'
      }))
    });

    console.log("✅ Payment intent created:", paymentIntent.id);

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("❌ Order payment creation error:", error);
    res.status(500).json({ 
      error: "Failed to create payment intent",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Create payment intent
router.post("/create-payment-intent", async (req: any, res: Response) => {
  try {
    console.log("💳 Create payment intent request received:", req.body);
    console.log("🔐 Session user:", req.session?.user?.id);
    
    // Check authentication
    if (!req.session?.user?.id) {
      console.log("❌ User not authenticated");
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = createPaymentIntentSchema.parse(req.body);
    const userId = req.session.user.id;

    // Calculate totals
    const subtotal = validatedData.cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    // Create order record first
    const [order] = await db.insert(orders).values({
      userId,
      status: "pending",
      subtotal: subtotal.toString(),
      shipping: "0", // Will be updated after shipping calculation
      tax: "0", // Will be updated after tax calculation
      total: subtotal.toString(), // Will be updated after final calculation
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
      paymentMethod: validatedData.shippingMethod,
      paymentStatus: "pending",
    }).returning();

    if (!order) {
      throw new Error("Failed to create order");
    }

    // Add order items
    for (const item of validatedData.cartItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId || null,
        raffleId: item.raffleId || null,
        name: item.name,
        price: item.price.toString(),
        quantity: item.quantity,
        type: item.type,
      });
    }

    // If this is an offer checkout, mark the offer as completed
    if (validatedData.checkoutType === 'offer' && validatedData.offerId) {
      console.log("🤝 Marking offer as completed:", validatedData.offerId);
      
      await db.update(productOffers)
        .set({ 
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(productOffers.id, validatedData.offerId));
    }

    // Create payment intent
    const paymentResult = await PaymentService.createPaymentIntent({
      amount: subtotal,
      currency: "gbp",
      orderId: order.id.toString(),
      userId,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
      items: validatedData.cartItems,
    });

    // Update order with calculated amounts
    await db.update(orders)
      .set({
        shipping: paymentResult.amounts.shipping.toString(),
        tax: paymentResult.amounts.tax.toString(),
        total: paymentResult.amounts.total.toString(),
        stripePaymentIntentId: paymentResult.paymentIntentId,
      })
      .where(eq(orders.id, order.id));

    res.json({
      clientSecret: paymentResult.clientSecret,
      orderId: order.id,
      amounts: paymentResult.amounts,
    });
  } catch (error) {
    console.error("❌ Error creating payment intent:", error);
    
    if (error instanceof z.ZodError) {
      console.log("📋 Validation errors:", error.errors);
      return res.status(400).json({ 
        error: "Invalid data provided", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to create payment intent",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Confirm payment
router.post("/confirm-payment", async (req: any, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID is required" });
    }

    const result = await PaymentService.confirmPayment(paymentIntentId);
    
    if (result.success && result.orderId) {
      // Clear user's cart after successful payment (only for regular cart checkouts)
      if (req.session?.userId) {
        // Note: For offer-based checkouts, we don't clear the cart since the items weren't in the cart
        await db.delete(cartItems)
          .where(eq(cartItems.userId, req.session.userId));
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// Get payment status
router.get("/payment-status/:paymentIntentId", async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;
    
    const status = await PaymentService.getPaymentStatus(paymentIntentId);
    
    res.json(status);
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({ error: "Failed to get payment status" });
  }
});

// Manual payment confirmation endpoint (development/backup)
router.post("/confirm-payment-manual", async (req: any, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID is required" });
    }

    console.log("🔧 Manual payment confirmation requested for:", paymentIntentId);
    
    // Fetch the payment intent from Stripe to verify its status
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("💳 Payment Intent Status:", paymentIntent.status);
    
    if (paymentIntent.status === 'succeeded') {
      // Process the payment confirmation
      const result = await PaymentService.confirmPayment(paymentIntentId);
      
      if (result.success && result.orderId) {
        // Clear user's cart after successful payment
        if (req.session?.userId) {
          await db.delete(cartItems)
            .where(eq(cartItems.userId, req.session.userId));
          console.log("🛒 Cart cleared for user:", req.session.userId);
        }
        
        console.log("✅ Payment manually confirmed:", result.orderId);
        res.json({ 
          success: true, 
          orderId: result.orderId,
          message: "Payment confirmed successfully" 
        });
      } else {
        res.status(400).json({ error: "Failed to confirm payment" });
      }
    } else {
      res.status(400).json({ 
        error: "Payment not completed", 
        status: paymentIntent.status 
      });
    }
    
  } catch (error) {
    console.error("❌ Manual payment confirmation error:", error);
    res.status(500).json({ error: "Failed to confirm payment manually" });
  }
});

// Stripe webhook endpoint
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("⚠️  Stripe webhook secret not configured - webhook disabled in development");
    console.log("🔗 Webhook received but skipped - use manual confirmation endpoint");
    return res.status(200).json({ received: false, reason: "webhook_secret_missing" });
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });
    
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    await PaymentService.handleWebhook(event);
    console.log("✅ Webhook processed successfully:", event.type);
    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook handling error:", error);
    res.status(500).json({ error: "Webhook handling failed" });
  }
});

// Get order tracking information
router.get("/tracking/:orderId", async (req: any, res: Response) => {
  try {
    const { orderId } = req.params;
    
    // Verify user owns this order or is admin
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== req.session?.userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const trackingInfo = await ShippingService.generateTrackingInfo(parseInt(orderId));
    
    if (!trackingInfo) {
      return res.status(404).json({ error: "Tracking information not available" });
    }

    const estimatedDelivery = ShippingService.estimateDeliveryDate(
      order.paymentMethod,
      new Date(order.createdAt!)
    );

    res.json({
      ...trackingInfo,
      estimatedDelivery: estimatedDelivery.toISOString(),
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("Error getting tracking info:", error);
    res.status(500).json({ error: "Failed to get tracking information" });
  }
});

export default router;