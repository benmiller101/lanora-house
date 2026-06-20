import { Resend } from "resend";
import { wrapInBrandedTemplate, SITE_URL, PRIMARY_COLOR } from "./email-templates";

const FROM_ADDRESS = "Lanora House <noreply@lanorahouse.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@lanorahouse.com";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY environment variable is not set");
  return new Resend(apiKey);
}

// ─── Clearance Quote ─────────────────────────────────────────────────────────

export interface ClearanceQuoteNotificationData {
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

export async function sendClearanceQuoteAdminNotification(
  data: ClearanceQuoteNotificationData
): Promise<boolean> {
  try {
    const resend = getResend();

    const imageHtml =
      data.imageUrls && data.imageUrls.length > 0
        ? `<h3 style="color:${PRIMARY_COLOR};margin-top:24px;">Uploaded Photos (${data.imageUrls.length})</h3>
           <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
             ${data.imageUrls
               .map((url) => {
                 const abs = url.startsWith("http") ? url : `https://www.lanorahouse.com${url}`;
                 return `<td style="padding:4px;width:${Math.min(50, Math.floor(100 / data.imageUrls!.length))}%;vertical-align:top;">
                   <a href="${abs}" target="_blank">
                     <img src="${abs}" alt="Property photo" style="width:100%;max-width:200px;height:160px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block;" />
                   </a></td>`;
               })
               .join("")}
           </tr></table>`
        : "";

    const html = wrapInBrandedTemplate({
      title: `New Quote Request – ${data.name}`,
      preheader: `New clearance quote request from ${data.name}`,
      content: `
        <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">New Clearance Quote Request</h2>
        <p>A customer has submitted a quote request via the website.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Name</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.name}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Email</td><td style="padding:10px;border-bottom:1px solid #ddd;"><a href="mailto:${data.email}" style="color:${PRIMARY_COLOR};">${data.email}</a></td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Phone</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.phone || "Not provided"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Address / Location</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.address || "Not provided"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Property Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.propertyType || "Not specified"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Clearance Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.clearanceType || "Not specified"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Timeframe</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.timeframe || "Not specified"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Submitted</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString("en-GB", { timeZone: "Europe/London" })}</td></tr>
        </table>
        ${data.additionalInfo ? `<h3 style="color:${PRIMARY_COLOR};">Additional Information</h3><p style="background:#f9f9f9;padding:15px;border-left:4px solid ${PRIMARY_COLOR};white-space:pre-wrap;">${data.additionalInfo}</p>` : ""}
        ${imageHtml}
      `,
      ctaButton: { text: "Reply to Customer", url: `mailto:${data.email}?subject=Re: Your Clearance Quote Request` },
    });

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `New Quote Request: ${data.clearanceType || "Clearance"} – ${data.name}`,
      html,
    });

    console.log(`✅ Clearance quote admin notification sent to ${ADMIN_EMAIL}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending clearance quote admin notification:", error);
    return false;
  }
}

export async function sendClearanceQuoteConfirmation(
  data: ClearanceQuoteNotificationData
): Promise<boolean> {
  try {
    const resend = getResend();

    const html = wrapInBrandedTemplate({
      title: "We've Received Your Quote Request",
      preheader: "Thanks for getting in touch — we'll be back to you shortly.",
      content: `
        <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">Thanks, ${data.name}!</h2>
        <p>We've received your clearance quote request and will be in touch within <strong>24 hours</strong> with a personalised quote.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:40%;border-bottom:1px solid #ddd;">Address</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.address || "As provided"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Clearance Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.clearanceType || "To be confirmed"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Preferred Timeframe</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.timeframe || "To be confirmed"}</td></tr>
        </table>
        <p>If you have any questions please call us on <strong>07456 809 049</strong> or email <a href="mailto:info@lanorahouse.com" style="color:${PRIMARY_COLOR};">info@lanorahouse.com</a>.</p>
        <p style="color:#666;font-size:14px;">— The Lanora House Team</p>
      `,
      ctaButton: { text: "View Our Services", url: "https://www.lanorahouse.com/clearance" },
    });

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.email,
      subject: "Your Clearance Quote Request – Lanora House",
      html,
    });

    console.log(`✅ Clearance quote confirmation sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending clearance quote confirmation:", error);
    return false;
  }
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

export interface ContactFormNotificationData {
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

export async function sendContactFormAdminNotification(
  data: ContactFormNotificationData
): Promise<boolean> {
  try {
    const resend = getResend();

    const imageHtml =
      data.imageUrls && data.imageUrls.length > 0
        ? `<h3 style="color:${PRIMARY_COLOR};margin-top:24px;">Attached Photos (${data.imageUrls.length})</h3>
           <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
             ${data.imageUrls
               .map((url) => {
                 const abs = url.startsWith("http") ? url : `https://www.lanorahouse.com${url}`;
                 return `<td style="padding:4px;width:${Math.min(100, Math.floor(100 / data.imageUrls!.length))}%;vertical-align:top;">
                   <a href="${abs}" target="_blank">
                     <img src="${abs}" alt="Uploaded photo" style="width:100%;max-width:180px;height:160px;object-fit:cover;border-radius:6px;border:1px solid #ddd;display:block;" />
                   </a></td>`;
               })
               .join("")}
           </tr></table>`
        : "";

    const html = wrapInBrandedTemplate({
      title: `New Contact: ${data.subject}`,
      preheader: `New enquiry from ${data.name}`,
      content: `
        <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">New Contact Form Submission</h2>
        <p>A customer has sent a message via the website contact form.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Name</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.name}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Email</td><td style="padding:10px;border-bottom:1px solid #ddd;"><a href="mailto:${data.email}" style="color:${PRIMARY_COLOR};">${data.email}</a></td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Phone</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.phone || "Not provided"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Enquiry Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.inquiryType || "General"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Location</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.location || "Not provided"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Subject</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.subject}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Received</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString("en-GB", { timeZone: "Europe/London" })}</td></tr>
        </table>
        <h3 style="color:${PRIMARY_COLOR};">Message</h3>
        <p style="background:#f9f9f9;padding:15px;border-left:4px solid ${PRIMARY_COLOR};white-space:pre-wrap;">${data.message}</p>
        ${imageHtml}
      `,
      ctaButton: {
        text: "Reply to Customer",
        url: `mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}`,
      },
    });

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `New Enquiry: ${data.subject} – ${data.name}`,
      html,
    });

    console.log(`✅ Contact form admin notification sent to ${ADMIN_EMAIL}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending contact form admin notification:", error);
    return false;
  }
}

export async function sendContactFormConfirmation(
  data: ContactFormNotificationData
): Promise<boolean> {
  try {
    const resend = getResend();

    const html = wrapInBrandedTemplate({
      title: "We've Received Your Message",
      preheader: "Thank you for getting in touch with Lanora House.",
      content: `
        <h2 style="color:${PRIMARY_COLOR};margin:0 0 20px;">Thanks for Getting in Touch!</h2>
        <p>Hi ${data.name},</p>
        <p>We've received your message and will get back to you as soon as possible — usually within 1 business day.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;width:35%;border-bottom:1px solid #ddd;">Subject</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.subject}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Enquiry Type</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.inquiryType || "General"}</td></tr>
          <tr><td style="padding:10px;background:#f4f4f8;font-weight:bold;border-bottom:1px solid #ddd;">Sent</td><td style="padding:10px;border-bottom:1px solid #ddd;">${data.submittedAt.toLocaleString("en-GB", { timeZone: "Europe/London" })}</td></tr>
        </table>
        <p style="background:#f9f9f9;padding:15px;border-left:4px solid ${PRIMARY_COLOR};white-space:pre-wrap;">${data.message}</p>
        <p style="margin-top:20px;color:#666;font-size:14px;">If your enquiry is urgent, email us directly at <a href="mailto:info@lanorahouse.com" style="color:${PRIMARY_COLOR};">info@lanorahouse.com</a>.</p>
      `,
      ctaButton: { text: "Visit Lanora House", url: SITE_URL },
    });

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.email,
      subject: `We've received your message – ${data.subject}`,
      html,
    });

    console.log(`✅ Contact form confirmation sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending contact form confirmation:", error);
    return false;
  }
}

// ─── Stub — kept so routes.ts import doesn't break ───────────────────────────

export async function sendOrderConfirmationEmail(_data: unknown): Promise<boolean> {
  return false;
}
