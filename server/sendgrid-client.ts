import sgMail from '@sendgrid/mail';

const DEFAULT_FROM_EMAIL = 'info@lanorahouse.com';
const DEFAULT_FROM_NAME = 'Lanora House';

export async function getUncachableSendGridClient() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    throw new Error('SendGrid not configured — set SENDGRID_API_KEY in environment variables');
  }
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: { email: DEFAULT_FROM_EMAIL, name: DEFAULT_FROM_NAME },
  };
}
