import { getUncachableSendGridClient } from './sendgrid-client';
import { 
  wrapInBrandedTemplate, 
  getOrderConfirmationHtml, 
  getShippingNotificationHtml, 
  getPaymentReceivedHtml,
  SITE_URL,
  PRIMARY_COLOR 
} from './email-templates';

interface WinnerEmailData {
  winnerEmail: string;
  winnerName: string;
  raffleName: string;
  raffleDescription: string;
  winningTicketNumber: number;
  prizeDetails: string;
}

export async function sendWinnerNotification(data: WinnerEmailData): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();
    
    const emailContent = {
      to: data.winnerEmail,
      from: fromEmail,
      subject: `🎉 Congratulations! You've won: ${data.raffleName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Raffle Winner Notification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #8B4513;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .prize-details {
              background: white;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #8B4513;
              border-radius: 5px;
            }
            .ticket-info {
              background: #8B4513;
              color: white;
              padding: 15px;
              text-align: center;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              background: #333;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
            }
            .cta-button {
              display: inline-block;
              background: #8B4513;
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Congratulations ${data.winnerName}!</h1>
            <h2>You're a Winner!</h2>
          </div>
          
          <div class="content">
            <p>We're thrilled to inform you that you've won our raffle:</p>
            
            <div class="prize-details">
              <h3>${data.raffleName}</h3>
              <p>${data.raffleDescription}</p>
              <p><strong>Prize Details:</strong> ${data.prizeDetails}</p>
            </div>
            
            <div class="ticket-info">
              <h3>Your Winning Ticket</h3>
              <p><strong>Winning Ticket Number: #${data.winningTicketNumber}</strong></p>
            </div>
            
            <p>To claim your prize, please reply to this email with:</p>
            <ul>
              <li>Your full name and address</li>
              <li>Phone number for contact</li>
              <li>Preferred method of prize delivery</li>
            </ul>
            
            <p>We'll contact you within 48 hours to arrange prize collection or delivery.</p>
            
            <a href="mailto:${fromEmail}" class="cta-button">Reply to Claim Prize</a>
          </div>
          
          <div class="footer">
            <p>Thank you for participating in our raffle!</p>
            <p>Lanora House</p>
            <p>If you have any questions, please contact us at ${fromEmail}</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Congratulations ${data.winnerName}!
        
        You've won our raffle: ${data.raffleName}
        
        Prize Details: ${data.prizeDetails}
        Your Winning Ticket Number: #${data.winningTicketNumber}
        
        To claim your prize, please reply to this email with:
        - Your full name and address
        - Phone number for contact
        - Preferred method of prize delivery
        
        We'll contact you within 48 hours to arrange prize collection or delivery.
        
        Thank you for participating!
        Lanora House
      `
    };

    await sgMail.send(emailContent);
    console.log(`✅ Winner notification email sent to ${data.winnerEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending winner notification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetUrl: string
): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: email,
      from: fromEmail,
      subject: 'Reset Your Lanora House Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2B4C8C; margin: 0;">Lanora House</h1>
            <p style="color: #666; margin: 5px 0;">Unique Items & Treasures</p>
          </div>
          
          <h2 style="color: #333;">Password Reset Request</h2>
          
          <p>Hello ${firstName},</p>
          
          <p>We received a request to reset your password for your Lanora House account. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2B4C8C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2B4C8C;">${resetUrl}</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 14px;">
            This email was sent by Lanora House. If you have any questions, please contact us.
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`✅ Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export async function testEmailService(): Promise<boolean> {
  const testData: WinnerEmailData = {
    winnerEmail: 'test@example.com',
    winnerName: 'Test Winner',
    raffleName: 'Test Raffle',
    raffleDescription: 'This is a test raffle for email functionality',
    winningTicketNumber: 123,
    prizeDetails: 'Test prize details'
  };

  return await sendWinnerNotification(testData);
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number | string;
}

interface OrderConfirmationData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  shippingAddress: {
    line1?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();
    
    const itemsHtml = data.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 15px 12px; color: #333;">${item.name}</td>
        <td style="padding: 15px 12px; color: #333; text-align: center;">${item.quantity}</td>
        <td style="padding: 15px 12px; color: #333; text-align: right;">£${Number(item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const addressLines = [
      data.shippingAddress.line1,
      data.shippingAddress.line2,
      data.shippingAddress.city,
      data.shippingAddress.county,
      data.shippingAddress.postcode,
      data.shippingAddress.country
    ].filter(Boolean).join('<br>');

    const html = getOrderConfirmationHtml({
      customerName: data.customerName,
      orderId: data.orderId,
      itemsHtml,
      subtotal: `£${Number(data.subtotal).toFixed(2)}`,
      shipping: `£${Number(data.shipping).toFixed(2)}`,
      total: `£${Number(data.total).toFixed(2)}`,
      addressHtml: addressLines
    });

    const emailContent = {
      to: data.customerEmail,
      from: fromEmail,
      subject: `Order Confirmation - ${data.orderId} | Lanora House`,
      html,
      text: `
Order Confirmed!

Dear ${data.customerName},

Thank you for your order! We're pleased to confirm that we've received your order and are preparing it for shipment.

Order #${data.orderId}

Items:
${data.items.map(item => `- ${item.name} x${item.quantity}: £${Number(item.price).toFixed(2)}`).join('\n')}

Subtotal: £${Number(data.subtotal).toFixed(2)}
Shipping: £${Number(data.shipping).toFixed(2)}
Total: £${Number(data.total).toFixed(2)}

Shipping Address:
${[data.shippingAddress.line1, data.shippingAddress.line2, data.shippingAddress.city, data.shippingAddress.county, data.shippingAddress.postcode, data.shippingAddress.country].filter(Boolean).join('\n')}

We'll send you another email with tracking information once your order has been shipped.

Thank you for shopping with Lanora House!
Visit: ${SITE_URL}/shop
      `
    };

    await sgMail.send(emailContent);
    console.log(`✅ Order confirmation email sent to ${data.customerEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    return false;
  }
}

interface ShippingNotificationData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
  items: OrderItem[];
}

export async function sendShippingNotificationEmail(data: ShippingNotificationData): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();
    
    const itemsList = data.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('');

    const html = getShippingNotificationHtml({
      customerName: data.customerName,
      orderId: data.orderId,
      trackingNumber: data.trackingNumber,
      carrier: data.carrier,
      estimatedDelivery: data.estimatedDelivery,
      itemsList
    });

    const emailContent = {
      to: data.customerEmail,
      from: fromEmail,
      subject: `Your Order Has Shipped! - ${data.orderId} | Lanora House`,
      html,
      text: `
Your Order Has Shipped!

Dear ${data.customerName},

Great news! Your order has been shipped and is on its way to you.

Tracking Information:
Carrier: ${data.carrier}
Tracking Number: ${data.trackingNumber}
${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ''}

Order #${data.orderId}
Items:
${data.items.map(item => `- ${item.name} x${item.quantity}`).join('\n')}

You can track your package using the tracking number above on your carrier's website.

Thank you for shopping with Lanora House!
Visit: ${SITE_URL}/shop
      `
    };

    await sgMail.send(emailContent);
    console.log(`✅ Shipping notification email sent to ${data.customerEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending shipping notification email:', error);
    return false;
  }
}

interface CryptoPaymentConfirmedData {
  orderId: string;
  cryptoType: string;
  items: { name: string; quantity: number; price: string | number }[];
  total: string | number;
}

export async function sendCryptoPaymentConfirmedEmail(customerEmail: string, data: CryptoPaymentConfirmedData): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();
    
    const itemsList = data.items.map(item => `<li>${item.name} x${item.quantity} - £${Number(item.price).toFixed(2)}</li>`).join('');

    const emailContent = {
      to: customerEmail,
      from: fromEmail,
      subject: `Payment Confirmed - Order ${data.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #2D317C; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">✅ ${data.cryptoType} Payment Confirmed!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
            <p>Thank you for your cryptocurrency payment. We have successfully received and verified your ${data.cryptoType} payment.</p>
            
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #eee;">
              <h4 style="margin-top: 0; color: #2D317C;">Order #${data.orderId}</h4>
              <ul style="padding-left: 20px;">
                ${itemsList}
              </ul>
              <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
              <p style="text-align: right; font-size: 18px; font-weight: bold; color: #2D317C;">Total: £${Number(data.total).toFixed(2)}</p>
            </div>
            
            <p>Your order is now being processed and we will notify you when it ships.</p>
            
            <p>You can track your order status in your Members Portal.</p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">Thank you for shopping with Lanora House!</p>
            <p style="margin: 10px 0 0; font-size: 12px;">If you have any questions, please contact us at ${fromEmail}</p>
          </div>
        </body>
        </html>
      `,
      text: `
${data.cryptoType} Payment Confirmed!

Thank you for your cryptocurrency payment. We have successfully received and verified your ${data.cryptoType} payment.

Order #${data.orderId}
Items:
${data.items.map(item => `- ${item.name} x${item.quantity} - £${Number(item.price).toFixed(2)}`).join('\n')}

Total: £${Number(data.total).toFixed(2)}

Your order is now being processed and we will notify you when it ships.

Thank you for shopping with Lanora House!
      `
    };

    await sgMail.send(emailContent);
    console.log(`✅ Crypto payment confirmation email sent to ${customerEmail}`);
    return true;

  } catch (error) {
    console.error('❌ Error sending crypto payment confirmation email:', error);
    return false;
  }
}

// ─── Contact Form Notifications ──────────────────────────────────────────────

interface ContactFormNotificationData {
  name: string;
  email: string;
  phone?: string | null;
  inquiryType?: string | null;
  location?: string | null;
  subject: string;
  message: string;
  imageUrls?: string[];
  submittedAt: Date;
}

export async function sendContactFormAdminNotification(data: ContactFormNotificationData): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@lanorahouse.com';
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();

    const html = wrapInBrandedTemplate({
      title: `New Contact: ${data.subject}`,
      preheader: `New enquiry from ${data.name}`,
      content: `
      <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">New Contact Form Submission</h2>
      <p>A customer has sent a message via the website contact form.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Name</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.name}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Email</td><td style="padding:10px;border-bottom:1px solid #ddd;"><a href="mailto:${data.email}" style="color:${PRIMARY_COLOR};">${data.email}</a></td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Phone</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.phone || 'Not provided'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Enquiry Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.inquiryType || 'General'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Location</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.location || 'Not provided'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Subject</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.subject}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Received</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td></tr>
      </table>

      <h3 style="color:${PRIMARY_COLOR};">Message</h3>
      <p style="background:#f9f9f9;padding:15px;border-left:4px solid ${PRIMARY_COLOR};white-space:pre-wrap;">${data.message}</p>
      ${data.imageUrls && data.imageUrls.length > 0 ? `
      <h3 style="color:${PRIMARY_COLOR};margin-top:24px;">Attached Photos (${data.imageUrls.length})</h3>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          ${data.imageUrls.map(url => {
            const absoluteUrl = url.startsWith('http') ? url : `https://www.lanorahouse.com${url}`;
            return `<td style="padding:4px;width:${Math.min(100, Math.floor(100 / data.imageUrls!.length))}%;vertical-align:top;">
              <a href="${absoluteUrl}" target="_blank">
                <img src="${absoluteUrl}" alt="Uploaded photo" style="width:100%;max-width:180px;height:160px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block;" />
              </a>
            </td>`;
          }).join('')}
        </tr>
      </table>` : ''}
      `,
      ctaButton: {
        text: 'Reply to Customer',
        url: `mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}`,
      },
    });

    await sgMail.send({
      to: adminEmail,
      from: fromEmail,
      subject: `New Enquiry: ${data.subject} – ${data.name}`,
      html,
      replyTo: data.email,
    });

    console.log(`✅ Contact form admin notification sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending contact form admin notification:', error);
    return false;
  }
}

export async function sendContactFormConfirmation(data: ContactFormNotificationData): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();

    const html = wrapInBrandedTemplate({
      title: "We've Received Your Message",
      preheader: "Thank you for getting in touch with Lanora House.",
      content: `
      <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">Thanks for Getting in Touch!</h2>
      <p>Hi ${data.name},</p>
      <p>We've received your message and will get back to you as soon as possible — usually within 1 business day.</p>

      <h3 style="color:${PRIMARY_COLOR};">Your Message</h3>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Subject</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.subject}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Enquiry Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.inquiryType || 'General'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Sent</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td></tr>
      </table>

      <p style="background:#f9f9f9;padding:15px;border-left:4px solid ${PRIMARY_COLOR};white-space:pre-wrap;">${data.message}</p>

      <p style="margin-top:20px;color:#666;font-size:14px;">If your enquiry is urgent, you can also call us or email us directly at <a href="mailto:info@lanorahouse.com" style="color:${PRIMARY_COLOR};">info@lanorahouse.com</a>.</p>
      `,
      ctaButton: {
        text: 'Visit Lanora House',
        url: SITE_URL,
      },
    });

    await sgMail.send({
      to: data.email,
      from: fromEmail,
      subject: `We've received your message – ${data.subject}`,
      html,
    });

    console.log(`✅ Contact form confirmation sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending contact form confirmation:', error);
    return false;
  }
}

// ─── Item Submission Notifications ───────────────────────────────────────────

interface SubmissionNotificationData {
  customerName: string;
  customerEmail: string;
  title: string;
  description: string;
  type: string;
  condition: string;
  estimatedValue?: string;
  photos?: string[];
  submittedAt: Date;
}

export async function sendSubmissionAdminNotification(data: SubmissionNotificationData): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@lanorahouse.com';
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();

    const photoList = data.photos && data.photos.length > 0
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>${
          data.photos.map(p => {
            const absoluteUrl = p.startsWith('http') ? p : `https://www.lanorahouse.com${p}`;
            return `<td style="padding:4px;width:${Math.min(100, Math.floor(100 / data.photos!.length))}%;vertical-align:top;">
              <a href="${absoluteUrl}" target="_blank">
                <img src="${absoluteUrl}" alt="Item photo" style="width:100%;max-width:180px;height:160px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block;" />
              </a>
            </td>`;
          }).join('')
        }</tr></table>`
      : '<p style="color:#888;font-style:italic;">No photos uploaded</p>';

    const html = wrapInBrandedTemplate({
      title: `New Item Submission: ${data.title}`,
      preheader: `${data.customerName} has submitted an item for valuation`,
      content: `
      <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">New Item Submission</h2>
      <p>A customer has submitted an item for valuation. Here are the details:</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Customer Name</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.customerName}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Customer Email</td><td style="padding:10px;border-bottom:1px solid #ddd;"><a href="mailto:${data.customerEmail}" style="color:${PRIMARY_COLOR};">${data.customerEmail}</a></td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Item Title</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.title}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Category</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.type}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Condition</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.condition || 'Not specified'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Est. Value</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.estimatedValue || 'Not specified'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Submitted At</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td></tr>
      </table>

      <h3 style="color:${PRIMARY_COLOR};">Description</h3>
      <p style="background:#f9f9f9;padding:15px;border-left:4px solid ${PRIMARY_COLOR};white-space:pre-wrap;">${data.description}</p>

      <h3 style="color:${PRIMARY_COLOR};">Photos</h3>
      ${photoList}
      `,
      ctaButton: {
        text: 'Review in Admin Dashboard',
        url: 'https://www.lanorahouse.com/admin/submissions',
      },
    });

    await sgMail.send({
      to: adminEmail,
      from: fromEmail,
      subject: `New Item Submission: ${data.title}`,
      html,
    });

    console.log(`✅ Admin submission notification sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin submission notification:', error);
    return false;
  }
}

export async function sendSubmissionConfirmation(data: SubmissionNotificationData): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();

    const html = wrapInBrandedTemplate({
      title: `Your Submission Has Been Received – ${data.title}`,
      preheader: "Thank you for submitting your item. We'll be in touch soon.",
      content: `
      <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">We've Received Your Submission!</h2>
      <p>Hi ${data.customerName},</p>
      <p>Thank you for submitting your item to Lanora House. Our team will review it and get back to you with a valuation as soon as possible.</p>

      <h3 style="color:${PRIMARY_COLOR};">Your Submission Summary</h3>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Item</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.title}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Category</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.type}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Condition</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.condition || 'Not specified'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Submitted</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td></tr>
      </table>

      <p>You can track the status of your submission at any time through your Members Portal.</p>
      <p style="margin-top:20px;color:#666;font-size:14px;">If you have any questions, please contact us at <a href="mailto:info@lanorahouse.com" style="color:${PRIMARY_COLOR};">info@lanorahouse.com</a>.</p>
      `,
      ctaButton: {
        text: 'View My Submissions',
        url: `${SITE_URL}/members`,
      },
    });

    await sgMail.send({
      to: data.customerEmail,
      from: fromEmail,
      subject: `Your Submission Has Been Received – ${data.title}`,
      html,
    });

    console.log(`✅ Submission confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending submission confirmation email:', error);
    return false;
  }
}

interface ClearanceQuoteNotificationData {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  propertyType?: string | null;
  clearanceType?: string | null;
  timeframe?: string | null;
  additionalInfo?: string | null;
  imageUrls?: string[];
  requestType?: string;
  submittedAt: Date;
}

export async function sendClearanceQuoteAdminNotification(data: ClearanceQuoteNotificationData): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@lanorahouse.com';
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();

    const html = wrapInBrandedTemplate({
      title: `New Quote Request – ${data.name}`,
      preheader: `New clearance quote request from ${data.name}`,
      content: `
      <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">New Clearance Quote Request</h2>
      <p>A customer has submitted a quote request via the website.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Name</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.name}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Email</td><td style="padding:10px;border-bottom:1px solid #ddd;"><a href="mailto:${data.email}" style="color:${PRIMARY_COLOR};">${data.email}</a></td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Phone</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.phone || 'Not provided'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Address / Location</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.address || 'Not provided'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Property Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.propertyType || 'Not specified'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Clearance Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.clearanceType || 'Not specified'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Timeframe</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.timeframe || 'Not specified'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Request Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.requestType || 'clearance'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Submitted</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td></tr>
      </table>

      ${data.additionalInfo ? `
      <h3 style="color:${PRIMARY_COLOR};">Additional Information</h3>
      <p style="background:#f9f9f9;padding:15px;border-left:4px solid ${PRIMARY_COLOR};white-space:pre-wrap;">${data.additionalInfo}</p>
      ` : ''}

      ${data.imageUrls && data.imageUrls.length > 0 ? `
      <h3 style="color:${PRIMARY_COLOR};margin-top:24px;">Uploaded Photos (${data.imageUrls.length})</h3>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          ${data.imageUrls.map(url => {
            const absoluteUrl = url.startsWith('http') ? url : `https://www.lanorahouse.com${url}`;
            return `<td style="padding:4px;width:${Math.min(50, Math.floor(100 / data.imageUrls!.length))}%;vertical-align:top;">
              <a href="${absoluteUrl}" target="_blank">
                <img src="${absoluteUrl}" alt="Property photo" style="width:100%;max-width:200px;height:160px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block;" />
              </a>
            </td>`;
          }).join('')}
        </tr>
      </table>` : ''}
      `,
      ctaButton: {
        text: 'Reply to Customer',
        url: `mailto:${data.email}?subject=Re: Your Clearance Quote Request`,
      },
    });

    await sgMail.send({
      to: adminEmail,
      from: fromEmail,
      subject: `New Quote Request: ${data.clearanceType || 'Clearance'} – ${data.name}`,
      html,
      replyTo: data.email,
    });

    console.log(`✅ Clearance quote admin notification sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending clearance quote admin notification:', error);
    return false;
  }
}

export async function sendClearanceQuoteConfirmation(data: ClearanceQuoteNotificationData): Promise<boolean> {
  try {
    const { client: sgMail, fromEmail } = await getUncachableSendGridClient();

    const html = wrapInBrandedTemplate({
      title: "We've Received Your Quote Request",
      preheader: "Thanks for getting in touch — we'll be back to you shortly.",
      content: `
      <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">Thanks, ${data.name}!</h2>
      <p>We've received your clearance quote request and will be in touch within <strong>24 hours</strong> with a personalised quote.</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:40%;border-bottom:1px solid #ddd;">Address</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.address || 'As provided'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Clearance Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.clearanceType || 'To be confirmed'}</td></tr>
        <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Preferred Timeframe</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.timeframe || 'To be confirmed'}</td></tr>
      </table>

      <p>In the meantime, if you have any questions please call us on <strong>07843 930 927</strong> or email <a href="mailto:info@lanorahouse.com" style="color:${PRIMARY_COLOR};">info@lanorahouse.com</a>.</p>
      <p style="color:#666;font-size:14px;">— The Lanora House Team</p>
      `,
      ctaButton: {
        text: 'View Our Services',
        url: 'https://www.lanorahouse.com/clearance',
      },
    });

    await sgMail.send({
      to: data.email,
      from: fromEmail,
      subject: 'Your Clearance Quote Request – Lanora House',
      html,
    });

    console.log(`✅ Clearance quote confirmation sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending clearance quote confirmation:', error);
    return false;
  }
}