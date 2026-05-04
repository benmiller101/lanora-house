import { createServer } from 'http';

// Test script to complete the payment manually
async function completePayment() {
  try {
    console.log("🧪 Completing test payment...");
    
    // Get the current cookies from the browser session
    const response = await fetch('http://localhost:5000/api/payment/confirm-payment-manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'test-script',
      },
      body: JSON.stringify({
        paymentIntentId: "paytriot_1753128946826"
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Payment confirmed:", result);
    } else {
      const error = await response.text();
      console.error("❌ Payment confirmation failed:", error);
    }
  } catch (error) {
    console.error("❌ Error completing payment:", error);
  }
}

completePayment();