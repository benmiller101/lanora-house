import { Request, Response } from "express";
import { db } from "./db";
import { isAdminUser } from "./adminAuth";

export async function getAdminOrders(req: Request, res: Response) {
  try {
    // Authentication is handled by requireAdmin middleware
    console.log('📋 Fetching admin orders...');

    // Get orders with their items and user information
    const ordersResult = await db.execute(`
      SELECT 
        o.id, 
        o.user_id, 
        o.status, 
        o.total, 
        o.subtotal,
        o.shipping,
        o.tax,
        o.discount,
        o.shipping_address, 
        o.billing_address,
        o.payment_method,
        o.payment_status,
        o.fulfillment_method,
        o.collection_date,
        o.collection_time_slot,
        o.created_at,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    const orders = ordersResult.rows || [];
    
    // Get order items for each order
    const orderIds = orders.map((order: any) => order.id);
    let orderItems: any[] = [];
    
    if (orderIds.length > 0) {
      // For simplicity, fetch all order items first and filter in memory
      const itemsResult = await db.execute(`
        SELECT 
          order_id,
          product_id,
          raffle_id,
          name,
          type,
          price,
          quantity
        FROM order_items
      `);
      const allItems = itemsResult.rows || [];
      orderItems = allItems.filter((item: any) => orderIds.includes(item.order_id));
    }
    
    const formattedOrders = orders.map((order: any) => {
      let userEmail = 'Guest';
      let userName = 'Guest User';
      let parsedShippingAddress = null;
      let parsedBillingAddress = null;
      
      // Parse shipping address and normalize field names
      try {
        if (order.shipping_address) {
          const rawAddress = typeof order.shipping_address === 'string' 
            ? JSON.parse(order.shipping_address) 
            : order.shipping_address;
          // Normalize field names to standard format
          parsedShippingAddress = {
            name: rawAddress.name || rawAddress.fullName || '',
            email: rawAddress.email || '',
            phone: rawAddress.phone || rawAddress.phoneNumber || '',
            line1: rawAddress.line1 || rawAddress.addressLine1 || rawAddress.address1 || '',
            line2: rawAddress.line2 || rawAddress.addressLine2 || rawAddress.address2 || '',
            city: rawAddress.city || rawAddress.town || '',
            state: rawAddress.state || rawAddress.region || rawAddress.county || '',
            postcode: rawAddress.postcode || rawAddress.postalCode || rawAddress.zipCode || '',
            country: rawAddress.country || 'United Kingdom'
          };
        }
      } catch (e) {
        console.log('Parsing shipping address:', e);
      }
      
      // Parse billing address and normalize field names
      try {
        if (order.billing_address) {
          const rawAddress = typeof order.billing_address === 'string' 
            ? JSON.parse(order.billing_address) 
            : order.billing_address;
          // Normalize field names to standard format
          parsedBillingAddress = {
            name: rawAddress.name || rawAddress.fullName || '',
            email: rawAddress.email || '',
            phone: rawAddress.phone || rawAddress.phoneNumber || '',
            line1: rawAddress.line1 || rawAddress.addressLine1 || rawAddress.address1 || '',
            line2: rawAddress.line2 || rawAddress.addressLine2 || rawAddress.address2 || '',
            city: rawAddress.city || rawAddress.town || '',
            state: rawAddress.state || rawAddress.region || rawAddress.county || '',
            postcode: rawAddress.postcode || rawAddress.postalCode || rawAddress.zipCode || '',
            country: rawAddress.country || 'United Kingdom'
          };
        }
      } catch (e) {
        console.log('Parsing billing address:', e);
      }
      
      // Try to get user info from joined user table first
      if (order.user_email) {
        userEmail = order.user_email;
        userName = `${order.user_first_name || ''} ${order.user_last_name || ''}`.trim() || 'User';
      } else if (parsedShippingAddress) {
        // Fallback to shipping address
        userEmail = parsedShippingAddress.email || 'Guest';
        userName = parsedShippingAddress.name || 'Guest User';
      }
      
      // Get items for this order
      const items = orderItems.filter((item: any) => item.order_id === order.id);
      
      return {
        id: order.id.toString(),
        userId: order.user_id || '',
        userEmail,
        userName,
        status: order.status || 'completed',
        total: order.total || '0',
        subtotal: order.subtotal || '0',
        shipping: order.shipping || '0',
        tax: order.tax || '0',
        paymentMethod: order.payment_method || 'stripe',
        paymentStatus: order.payment_status || 'paid',
        shippingAddress: parsedShippingAddress,
        billingAddress: parsedBillingAddress,
        fulfillmentMethod: order.fulfillment_method || 'delivery',
        collectionDate: order.collection_date,
        collectionTimeSlot: order.collection_time_slot,
        items: items,
        createdAt: order.created_at
      };
    });

    console.log(`Found ${formattedOrders.length} orders for admin display`);
    res.json(formattedOrders);
    
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}