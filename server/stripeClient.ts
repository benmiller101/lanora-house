import Stripe from 'stripe';

function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLIC_KEY;

  if (!secretKey || !publishableKey) {
    throw new Error('Stripe keys not found. Set STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY environment variables.');
  }

  return { publishableKey, secretKey };
}

export async function getUncachableStripeClient() {
  const { secretKey } = getCredentials();
  return new Stripe(secretKey, { apiVersion: '2025-08-27.basil' });
}

export async function getStripePublishableKey() {
  return getCredentials().publishableKey;
}

export async function getStripeSecretKey() {
  return getCredentials().secretKey;
}
