import { Request, Response } from 'express';

// Klarna API Configuration
const KLARNA_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.klarna.com' 
  : 'https://api.playground.klarna.com';

const KLARNA_USERNAME = process.env.KLARNA_USERNAME || 'PLACEHOLDER_USERNAME';
const KLARNA_PASSWORD = process.env.KLARNA_PASSWORD || 'PLACEHOLDER_PASSWORD';

interface KlarnaOrderLine {
  type: string;
  reference: string;
  name: string;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
  total_discount_amount: number;
  total_tax_amount: number;
}

interface KlarnaSessionRequest {
  intent: 'buy' | 'tokenize' | 'buy_and_tokenize';
  purchase_country: string;
  purchase_currency: string;
  locale: string;
  order_amount: number;
  order_tax_amount: number;
  order_lines: KlarnaOrderLine[];
  merchant_urls: {
    terms: string;
    checkout: string;
    confirmation: string;
    push: string;
  };
  billing_address?: {
    given_name?: string;
    family_name?: string;
    email?: string;
    street_address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
}

interface KlarnaSessionResponse {
  session_id: string;
  client_token: string;
  payment_method_categories: Array<{
    identifier: string;
    name: string;
    asset_urls: {
      descriptive: string;
      standard: string;
    };
  }>;
}

/**
 * Create a Klarna payment session
 */
export async function createKlarnaSession(req: Request, res: Response) {
  try {
    const { cartItems, shippingAddress, billingAddress } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Convert cart items to Klarna order lines
    let totalAmount = 0;
    let totalTax = 0;
    
    const orderLines: KlarnaOrderLine[] = cartItems.map((item: any) => {
      const itemTotal = item.price * item.quantity;
      const itemTax = Math.round(itemTotal * 0.20); // 20% VAT
      totalAmount += itemTotal;
      totalTax += itemTax;

      return {
        type: item.type === 'raffle_ticket' ? 'digital' : 'physical',
        reference: item.productId?.toString() || item.raffleId?.toString() || item.id,
        name: item.name,
        quantity: item.quantity,
        quantity_unit: 'pcs',
        unit_price: item.price * 100, // Klarna expects amounts in minor units (pence)
        tax_rate: 2000, // 20% in basis points
        total_amount: itemTotal * 100,
        total_discount_amount: 0,
        total_tax_amount: itemTax * 100
      };
    });

    // Add shipping if applicable
    const shippingCost = 795; // £7.95 shipping
    if (shippingCost > 0) {
      const shippingTax = Math.round(shippingCost * 0.20);
      totalAmount += shippingCost;
      totalTax += shippingTax;

      orderLines.push({
        type: 'shipping_fee',
        reference: 'shipping',
        name: 'DPD Next Working Day Delivery',
        quantity: 1,
        quantity_unit: 'pcs',
        unit_price: shippingCost * 100,
        tax_rate: 2000,
        total_amount: shippingCost * 100,
        total_discount_amount: 0,
        total_tax_amount: shippingTax * 100
      });
    }

    const sessionData: KlarnaSessionRequest = {
      intent: 'buy',
      purchase_country: 'GB',
      purchase_currency: 'GBP',
      locale: 'en-GB',
      order_amount: totalAmount * 100, // Convert to pence
      order_tax_amount: totalTax * 100,
      order_lines: orderLines,
      merchant_urls: {
        terms: `${process.env.BASE_URL || `https://${process.env.CUSTOM_DOMAIN}` || 'http://localhost:5000'}/terms`,
        checkout: `${process.env.BASE_URL || `https://${process.env.CUSTOM_DOMAIN}` || 'http://localhost:5000'}/checkout`,
        confirmation: `${process.env.BASE_URL || `https://${process.env.CUSTOM_DOMAIN}` || 'http://localhost:5000'}/order-confirmation`,
        push: `${process.env.BASE_URL || `https://${process.env.CUSTOM_DOMAIN}` || 'http://localhost:5000'}/api/klarna/push`
      }
    };

    // Add billing address if provided
    if (billingAddress) {
      sessionData.billing_address = {
        given_name: billingAddress.name?.split(' ')[0],
        family_name: billingAddress.name?.split(' ').slice(1).join(' '),
        email: billingAddress.email,
        street_address: `${billingAddress.address1} ${billingAddress.address2 || ''}`.trim(),
        postal_code: billingAddress.postcode,
        city: billingAddress.city,
        country: 'GB',
        phone: billingAddress.phone
      };
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${KLARNA_USERNAME}:${KLARNA_PASSWORD}`).toString('base64');
    
    const response = await fetch(`${KLARNA_API_BASE}/payments/v1/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Klarna session creation failed:', response.status, errorData);
      
      // Check if it's an authentication issue
      if (response.status === 401) {
        return res.status(400).json({ 
          error: 'Klarna authentication failed',
          details: 'Please check your Klarna API credentials. You need to set up a Klarna merchant account and add your API credentials.',
          needsCredentials: true
        });
      }
      
      return res.status(400).json({ 
        error: 'Failed to create Klarna session',
        details: errorData 
      });
    }

    const sessionResponse: KlarnaSessionResponse = await response.json();
    
    res.json({
      session_id: sessionResponse.session_id,
      client_token: sessionResponse.client_token,
      payment_method_categories: sessionResponse.payment_method_categories
    });

  } catch (error) {
    console.error('Klarna session creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Authorize Klarna payment
 */
export async function authorizeKlarnaPayment(req: Request, res: Response) {
  try {
    const { session_id, authorization_token } = req.body;

    if (!session_id || !authorization_token) {
      return res.status(400).json({ error: 'Missing session_id or authorization_token' });
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${KLARNA_USERNAME}:${KLARNA_PASSWORD}`).toString('base64');
    
    const response = await fetch(`${KLARNA_API_BASE}/payments/v1/sessions/${session_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Klarna authorization failed:', response.status, errorData);
      return res.status(400).json({ 
        error: 'Failed to authorize Klarna payment',
        details: errorData 
      });
    }

    const sessionData = await response.json();
    
    res.json({
      success: true,
      authorization_token,
      session_data: sessionData
    });

  } catch (error) {
    console.error('Klarna authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create Klarna order after authorization
 */
export async function createKlarnaOrder(req: Request, res: Response) {
  try {
    const { authorization_token, order_data } = req.body;

    if (!authorization_token || !order_data) {
      return res.status(400).json({ error: 'Missing authorization_token or order_data' });
    }

    // Create Basic Auth header
    const credentials = Buffer.from(`${KLARNA_USERNAME}:${KLARNA_PASSWORD}`).toString('base64');
    
    const response = await fetch(`${KLARNA_API_BASE}/payments/v1/authorizations/${authorization_token}/order`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order_data)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Klarna order creation failed:', response.status, errorData);
      return res.status(400).json({ 
        error: 'Failed to create Klarna order',
        details: errorData 
      });
    }

    const orderResponse = await response.json();
    
    res.json({
      success: true,
      order_id: orderResponse.order_id,
      fraud_status: orderResponse.fraud_status
    });

  } catch (error) {
    console.error('Klarna order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle Klarna push notifications
 */
export async function handleKlarnaPush(req: Request, res: Response) {
  try {
    const { order_id, event_type } = req.body;
    
    console.log('Klarna push notification:', { order_id, event_type });
    
    // Handle different event types
    switch (event_type) {
      case 'order_created':
        // Update order status in your database
        break;
      case 'order_captured':
        // Mark order as captured
        break;
      case 'order_cancelled':
        // Mark order as cancelled
        break;
      default:
        console.log('Unknown Klarna event type:', event_type);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Klarna push notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}