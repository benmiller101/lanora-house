import { Router, Request, Response } from "express";
import { PaymentService } from "./payment-service";
import { db } from "./db";
import { orders, orderItems, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schema for order payment
const orderPaymentSchema = z.object({
  orderId: z.number(),
  shippingAddress: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postcode: z.string().min(1),
    country: z.string().min(1),
  }),
  billingAddress: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postcode: z.string().min(1),
    country: z.string().min(1),
  }),
  shippingMethod: z.string().min(1),
});

// Create payment intent for existing order
router.post("/create-order-payment", async (req: any, res: Response) => {
  try {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = orderPaymentSchema.parse(req.body);
    const userId = req.session.userId;

    // Get the existing order and verify ownership
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.id, validatedData.orderId),
        eq(orders.userId, userId)
      ))
      .limit(1);

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found or access denied" });
    }

    // Check if order is in correct status for payment
    if (existingOrder.status !== 'pending' && existingOrder.status !== 'accepted') {
      return res.status(400).json({ 
        error: `Order cannot be paid. Current status: ${existingOrder.status}` 
      });
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, validatedData.orderId));

    if (items.length === 0) {
      return res.status(400).json({ error: "No items found for this order" });
    }

    // Calculate order total from existing order data
    const subtotal = parseFloat(existingOrder.subtotal || "0");
    
    // Create payment intent using existing order data
    const paymentResult = await PaymentService.createPaymentIntent({
      amount: subtotal,
      currency: "gbp",
      orderId: validatedData.orderId.toString(),
      userId,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
      items: items.map(item => ({
        productId: item.productId || undefined,
        raffleId: item.raffleId || undefined,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
        type: item.type,
      })),
    });

    // Update order with payment information and addresses
    await db.update(orders)
      .set({
        shippingAddress: validatedData.shippingAddress,
        billingAddress: validatedData.billingAddress,
        paymentMethod: validatedData.shippingMethod,
        shipping: paymentResult.amounts.shipping.toString(),
        tax: paymentResult.amounts.tax.toString(),
        total: paymentResult.amounts.total.toString(),
        stripePaymentIntentId: paymentResult.paymentIntentId,
        paymentStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, validatedData.orderId));

    res.json({
      clientSecret: paymentResult.clientSecret,
      orderId: validatedData.orderId,
      amounts: paymentResult.amounts,
    });
  } catch (error) {
    console.error("Error creating order payment:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid data provided", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: "Failed to create payment for order" });
  }
});

// Get order details for payment
router.get("/order/:orderId", async (req: any, res: Response) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const orderId = parseInt(req.params.orderId);
    const userId = req.session.userId;

    // Get order with items
    const [order] = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.userId, userId)
      ))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    res.json({
      ...order,
      items
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Confirm order payment
router.post("/confirm-order-payment", async (req: any, res: Response) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ error: "Payment intent ID and order ID are required" });
    }

    // Verify user owns this order
    if (req.session?.userId) {
      const [order] = await db
        .select()
        .from(orders)
        .where(and(
          eq(orders.id, parseInt(orderId)),
          eq(orders.userId, req.session.userId)
        ))
        .limit(1);

      if (!order) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const result = await PaymentService.confirmPayment(paymentIntentId);
    
    if (result.success) {
      // Update order status to processing after successful payment
      await db.update(orders)
        .set({
          status: 'processing',
          paymentStatus: 'paid',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, parseInt(orderId)));
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error confirming order payment:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// Create PayPal order for existing order
router.post("/create-paypal-order", async (req: any, res: Response) => {
  try {
    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const validatedData = orderPaymentSchema.parse(req.body);
    const userId = req.session.userId;

    // Get the existing order and verify ownership
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.id, validatedData.orderId),
        eq(orders.userId, userId)
      ))
      .limit(1);

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found or access denied" });
    }

    // Check if order is in correct status for payment
    if (existingOrder.status !== 'pending' && existingOrder.status !== 'accepted') {
      return res.status(400).json({ 
        error: `Order cannot be paid. Current status: ${existingOrder.status}` 
      });
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, validatedData.orderId));

    if (!items.length) {
      return res.status(400).json({ error: "No items found in order" });
    }

    // Calculate costs
    const shippingCost = PaymentService.calculateShippingCost(
      items.map(item => ({
        productId: item.productId,
        raffleId: item.raffleId,
        name: item.name,
        price: parseFloat(item.price) * 100, // Convert to cents
        quantity: item.quantity,
        type: item.type,
      })),
      validatedData.shippingAddress
    );

    const taxCost = PaymentService.calculateTax(
      parseFloat(existingOrder.subtotal!),
      validatedData.shippingAddress
    );

    const totalAmount = Math.round(
      (parseFloat(existingOrder.subtotal!) + shippingCost + taxCost) * 100
    ); // Convert to cents

    // Update order with shipping details
    await db
      .update(orders)
      .set({
        shippingAddress: JSON.stringify(validatedData.shippingAddress),
        billingAddress: JSON.stringify(validatedData.billingAddress),
        shippingMethod: validatedData.shippingMethod,
        shipping: shippingCost.toString(),
        tax: taxCost.toString(),
        total: (totalAmount / 100).toString(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, validatedData.orderId));

    // Create PayPal order
    const paypalOrder = await PaymentService.createPayPalOrder({
      amount: totalAmount,
      currency: "gbp",
      orderId: existingOrder.id.toString(),
      userId: userId,
      shippingAddress: validatedData.shippingAddress,
      billingAddress: validatedData.billingAddress,
      items: items.map(item => ({
        productId: item.productId,
        raffleId: item.raffleId,
        name: item.name,
        price: parseFloat(item.price) * 100, // Convert to cents
        quantity: item.quantity,
        type: item.type,
      })),
    });

    console.log("✅ PayPal order created successfully:", paypalOrder.orderId);

    res.json({
      success: true,
      paypalOrderId: paypalOrder.orderId,
      approvalUrl: paypalOrder.approvalUrl,
      amount: totalAmount,
    });

  } catch (error: any) {
    console.error("PayPal order creation error:", error);
    res.status(500).json({ 
      error: "Failed to create PayPal order",
      details: error.message 
    });
  }
});

// Capture PayPal payment
router.post("/capture-paypal-payment", async (req: any, res: Response) => {
  try {
    const { paypalOrderId, dbOrderId } = req.body;

    if (!paypalOrderId || !dbOrderId) {
      return res.status(400).json({ 
        error: "PayPal order ID and database order ID are required" 
      });
    }

    // Check authentication
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verify order ownership
    const [order] = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.id, parseInt(dbOrderId)),
        eq(orders.userId, req.session.userId)
      ))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found or access denied" });
    }

    // Capture PayPal payment
    const result = await PaymentService.capturePayPalPayment(paypalOrderId, dbOrderId);

    if (result.success) {
      console.log("✅ PayPal payment captured successfully");
      res.json({ 
        success: true, 
        message: "Payment captured successfully",
        orderId: dbOrderId 
      });
    } else {
      console.error("❌ PayPal payment capture failed:", result.error);
      res.status(400).json({ 
        success: false, 
        error: result.error || "Payment capture failed" 
      });
    }

  } catch (error: any) {
    console.error("PayPal capture error:", error);
    res.status(500).json({ 
      error: "Failed to capture PayPal payment",
      details: error.message 
    });
  }
});

export default router;