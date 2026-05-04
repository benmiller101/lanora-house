import sgMail from '@sendgrid/mail';

const DEFAULT_FROM_EMAIL = 'info@lanorahouse.com';
const DEFAULT_FROM_NAME = 'Lanora House';

async function getCredentials() {
  // First try environment variable (priority)
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    return {
      apiKey: process.env.SENDGRID_API_KEY,
      email: DEFAULT_FROM_EMAIL,
      name: DEFAULT_FROM_NAME
    };
  }

  // Fallback to Replit connector
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('SendGrid not configured - please set SENDGRID_API_KEY');
  }

  try {
    const connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (connectionSettings?.settings?.api_key?.startsWith('SG.')) {
      return {
        apiKey: connectionSettings.settings.api_key,
        email: connectionSettings.settings.from_email || DEFAULT_FROM_EMAIL,
        name: DEFAULT_FROM_NAME
      };
    }
  } catch (e) {
    console.error('Failed to fetch SendGrid connector:', e);
  }

  throw new Error('SendGrid not configured - API key must start with SG.');
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSendGridClient() {
  const {apiKey, email, name} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: { email, name }
  };
}
