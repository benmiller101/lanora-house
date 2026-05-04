// Lanora House Branded Email Templates
// All emails use consistent branding with purple theme (#2e2d7d)

const LOGO_URL = "https://www.lanorahouse.com/logos/lanora-logo-email.png";
const SITE_URL = "https://lanorahouse.com";
const ADDRESS = "First Floor (rear of building), The Old Foundry Chapel, 11–13 Chapel Terrace, Hayle TR27 4AB";
const PHONE = "+44 7843 930927";
const PRIMARY_COLOR = "#2D317C";
const SECONDARY_COLOR = "#292C6D";

interface EmailWrapperOptions {
  title: string;
  preheader?: string;
  headerBanner?: {
    text: string;
    backgroundColor?: string;
  };
  content: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  includeUnsubscribe?: boolean;
  customerEmail?: string;
}

export function wrapInBrandedTemplate(options: EmailWrapperOptions): string {
  const {
    title,
    preheader,
    headerBanner,
    content,
    ctaButton,
    includeUnsubscribe = false,
    customerEmail
  } = options;

  const bannerHtml = headerBanner ? `
          <tr>
            <td style="background-color: ${headerBanner.backgroundColor || PRIMARY_COLOR}; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">${headerBanner.text}</h2>
            </td>
          </tr>` : '';

  const ctaHtml = ctaButton ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 25px 0;">
                    <a href="${ctaButton.url}" style="display: inline-block; background-color: ${PRIMARY_COLOR}; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">${ctaButton.text}</a>
                  </td>
                </tr>
              </table>` : '';

  const unsubscribeHtml = includeUnsubscribe && customerEmail ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #555; margin-top: 15px;">
                <tr>
                  <td style="text-align: center; padding-top: 20px;">
                    <p style="color: #888; margin: 0 0 10px; font-size: 11px;">You're receiving this email because you subscribed to marketing emails from Lanora House.</p>
                    <p style="margin: 0; padding: 15px; background-color: #444; border-radius: 5px;">
                      <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(customerEmail)}" style="color: #ff6b6b; text-decoration: underline; font-size: 14px; font-weight: bold;">Unsubscribe from marketing emails</a>
                    </p>
                  </td>
                </tr>
              </table>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${preheader ? `<span style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background: ${PRIMARY_COLOR}; padding: 30px; text-align: center;">
              <a href="${SITE_URL}"><img src="${LOGO_URL}" alt="Lanora House" style="max-width: 220px; height: auto;" /></a>
            </td>
          </tr>
          ${bannerHtml}
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
              ${ctaHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #333; padding: 30px; text-align: center;">
              <img src="${LOGO_URL}" alt="Lanora House" style="max-width: 160px; height: auto; margin-bottom: 15px; opacity: 0.9;" />
              <p style="color: #aaa; margin: 0 0 5px; font-size: 13px;">${ADDRESS}</p>
              <p style="color: #aaa; margin: 0 0 5px; font-size: 13px;">United Kingdom</p>
              <p style="color: #aaa; margin: 0 0 20px; font-size: 13px;">Phone: ${PHONE}</p>
              <p style="color: #aaa; margin: 0 0 20px; font-size: 12px;">
                <a href="${SITE_URL}/privacy-policy" style="color: #A6C1E4; text-decoration: none;">Privacy Policy</a> | 
                <a href="${SITE_URL}/terms-of-service" style="color: #A6C1E4; text-decoration: none;">Terms of Service</a> | 
                <a href="${SITE_URL}/contact" style="color: #A6C1E4; text-decoration: none;">Contact Us</a>
              </p>
              ${unsubscribeHtml}
              <p style="color: #666; margin: 20px 0 0; font-size: 11px;">&copy; ${new Date().getFullYear()} Lanora House. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Order Confirmation Email
export function getOrderConfirmationHtml(data: {
  customerName: string;
  orderId: string;
  itemsHtml: string;
  subtotal: string;
  shipping: string;
  total: string;
  addressHtml: string;
}): string {
  const content = `
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Dear <strong>${data.customerName}</strong>,</p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Thank you for your order! We're delighted to confirm that we've received your purchase and it's being prepared with care.</p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
      <tr>
        <td style="padding: 25px;">
          <h3 style="color: ${PRIMARY_COLOR}; margin: 0 0 15px; font-size: 18px;">Order Details</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Order Number:</strong> ${data.orderId}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </td>
      </tr>
    </table>
    
    <h3 style="color: ${PRIMARY_COLOR}; margin: 30px 0 15px; font-size: 18px;">Items Ordered</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
      <tr style="background-color: ${PRIMARY_COLOR};">
        <td style="padding: 12px; color: #fff; font-weight: bold;">Item</td>
        <td style="padding: 12px; color: #fff; font-weight: bold; text-align: center;">Qty</td>
        <td style="padding: 12px; color: #fff; font-weight: bold; text-align: right;">Price</td>
      </tr>
      ${data.itemsHtml}
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 15px 12px; color: #333; font-weight: bold; text-align: right;">Subtotal</td>
        <td style="padding: 15px 12px; color: #333; text-align: right;">${data.subtotal}</td>
      </tr>
      <tr style="background-color: #f8f9fa;">
        <td colspan="2" style="padding: 15px 12px; color: #333; text-align: right;">Shipping</td>
        <td style="padding: 15px 12px; color: #333; text-align: right;">${data.shipping}</td>
      </tr>
      <tr style="background-color: ${PRIMARY_COLOR};">
        <td colspan="2" style="padding: 15px 12px; color: #fff; font-weight: bold; font-size: 18px; text-align: right;">Total</td>
        <td style="padding: 15px 12px; color: #fff; text-align: right; font-weight: bold; font-size: 18px;">${data.total}</td>
      </tr>
    </table>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
      <tr>
        <td style="padding: 25px;">
          <h4 style="color: ${PRIMARY_COLOR}; margin: 0 0 10px;">Shipping Address</h4>
          <p style="color: #666; margin: 0;">${data.addressHtml}</p>
        </td>
      </tr>
    </table>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #e8f4fd; border-left: 4px solid ${PRIMARY_COLOR}; border-radius: 4px; margin: 30px 0;">
      <tr>
        <td style="padding: 20px;">
          <h4 style="color: ${PRIMARY_COLOR}; margin: 0 0 10px;">What Happens Next?</h4>
          <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">We'll carefully package your items and send you a shipping confirmation email with tracking details once dispatched.</p>
        </td>
      </tr>
    </table>`;

  return wrapInBrandedTemplate({
    title: `Order Confirmation - ${data.orderId}`,
    headerBanner: { text: "Order Confirmed", backgroundColor: PRIMARY_COLOR },
    content,
    ctaButton: { text: "Browse More Treasures", url: `${SITE_URL}/shop` }
  });
}

// Shipping Notification Email
export function getShippingNotificationHtml(data: {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
  itemsList: string;
}): string {
  const content = `
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Dear <strong>${data.customerName}</strong>,</p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Great news! Your carefully packaged items are now on their way to you.</p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${PRIMARY_COLOR}; border-radius: 8px; margin: 30px 0;">
      <tr>
        <td style="padding: 25px; text-align: center;">
          <h3 style="color: #fff; margin: 0 0 15px; font-size: 20px;">Tracking Information</h3>
          <p style="color: #ddd; margin: 5px 0;"><strong>Carrier:</strong> ${data.carrier}</p>
          <p style="color: #ddd; margin: 5px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
          ${data.estimatedDelivery ? `<p style="color: #ddd; margin: 5px 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
        </td>
      </tr>
    </table>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
      <tr>
        <td style="padding: 25px;">
          <h4 style="color: ${PRIMARY_COLOR}; margin: 0 0 15px;">Order #${data.orderId}</h4>
          <ul style="padding-left: 20px; margin: 0; color: #666;">
            ${data.itemsList}
          </ul>
        </td>
      </tr>
    </table>
    
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">You can track your package using the tracking number above on your carrier's website.</p>`;

  return wrapInBrandedTemplate({
    title: `Your Order Has Shipped - ${data.orderId}`,
    headerBanner: { text: "Your Order Has Shipped!", backgroundColor: PRIMARY_COLOR },
    content,
    ctaButton: { text: "Browse More Treasures", url: `${SITE_URL}/shop` }
  });
}

// Payment Received Email
export function getPaymentReceivedHtml(data: {
  customerName?: string;
  amount: string;
  reference: string;
  paymentMethod?: string;
}): string {
  const content = `
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Dear ${data.customerName || 'Valued Customer'},</p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Thank you for your payment! We are pleased to confirm that your payment has been successfully received and processed.</p>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
      <tr>
        <td style="padding: 25px;">
          <h3 style="color: ${PRIMARY_COLOR}; margin: 0 0 15px; font-size: 18px;">Payment Details</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Amount:</strong> ${data.amount}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Reference:</strong> ${data.reference}</p>
          ${data.paymentMethod ? `<p style="color: #666; margin: 5px 0;"><strong>Method:</strong> ${data.paymentMethod}</p>` : ''}
          <p style="color: #666; margin: 5px 0;"><strong>Status:</strong> <span style="color: ${PRIMARY_COLOR}; font-weight: bold;">Confirmed</span></p>
        </td>
      </tr>
    </table>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #e8f4fd; border-left: 4px solid ${PRIMARY_COLOR}; border-radius: 4px; margin: 30px 0;">
      <tr>
        <td style="padding: 20px;">
          <h4 style="color: ${PRIMARY_COLOR}; margin: 0 0 10px;">What Happens Next?</h4>
          <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">Your order is now being processed and we will send you a shipping notification once your items are dispatched.</p>
        </td>
      </tr>
    </table>`;

  return wrapInBrandedTemplate({
    title: "Payment Received - Lanora House",
    headerBanner: { text: "Payment Received", backgroundColor: PRIMARY_COLOR },
    content,
    ctaButton: { text: "Browse More Treasures", url: `${SITE_URL}/shop` }
  });
}

// Marketing Email Template (for admin to customize content)
export function getMarketingEmailHtml(data: {
  contentHtml: string;
  heroImageUrl?: string;
  customerEmail: string;
}): string {
  const heroHtml = data.heroImageUrl ? `
    <img src="${data.heroImageUrl}" alt="Featured Image" style="width: 100%; height: auto; display: block; margin-bottom: 20px; border-radius: 8px;" />` : '';

  const content = `${heroHtml}${data.contentHtml}`;

  return wrapInBrandedTemplate({
    title: "Lanora House",
    content,
    ctaButton: { text: "Browse More Treasures", url: `${SITE_URL}/shop` },
    includeUnsubscribe: true,
    customerEmail: data.customerEmail
  });
}

export { SITE_URL, ADDRESS, PHONE, PRIMARY_COLOR, LOGO_URL };
