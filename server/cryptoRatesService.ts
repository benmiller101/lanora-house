import fetch from 'node-fetch';

interface CryptoRates {
  bitcoin: { gbp: number };
  ethereum: { gbp: number };
}

interface CachedRates {
  btcGbp: number;
  ethGbp: number;
  fetchedAt: Date;
  isStale: boolean;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const FALLBACK_BTC_GBP = 75000; // Fallback if API fails
const FALLBACK_ETH_GBP = 2800;

let cachedRates: CachedRates | null = null;

async function fetchRatesFromCoinGecko(): Promise<CryptoRates | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=gbp',
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json() as CryptoRates;
    
    if (!data.bitcoin?.gbp || !data.ethereum?.gbp) {
      console.error('CoinGecko returned invalid data structure:', data);
      return null;
    }

    console.log(`💰 Crypto rates fetched: BTC=£${data.bitcoin.gbp.toLocaleString()}, ETH=£${data.ethereum.gbp.toLocaleString()}`);
    return data;
  } catch (error) {
    console.error('Failed to fetch crypto rates from CoinGecko:', error);
    return null;
  }
}

export async function getCryptoRates(): Promise<CachedRates> {
  const now = new Date();
  
  // Check if we have valid cached rates
  if (cachedRates && (now.getTime() - cachedRates.fetchedAt.getTime()) < CACHE_TTL_MS) {
    return { ...cachedRates, isStale: false };
  }

  // Try to fetch fresh rates
  const freshRates = await fetchRatesFromCoinGecko();
  
  if (freshRates) {
    cachedRates = {
      btcGbp: freshRates.bitcoin.gbp,
      ethGbp: freshRates.ethereum.gbp,
      fetchedAt: now,
      isStale: false,
    };
    return cachedRates;
  }

  // If fetch failed but we have stale cached rates, use them
  if (cachedRates) {
    console.warn('Using stale crypto rates due to API failure');
    return { ...cachedRates, isStale: true };
  }

  // No cached rates and fetch failed - use fallback
  console.warn('Using fallback crypto rates - no cached or live data available');
  return {
    btcGbp: FALLBACK_BTC_GBP,
    ethGbp: FALLBACK_ETH_GBP,
    fetchedAt: now,
    isStale: true,
  };
}

export function convertGbpToCrypto(gbpAmount: number, cryptoType: 'bitcoin' | 'ethereum', rates: CachedRates): string {
  const rate = cryptoType === 'bitcoin' ? rates.btcGbp : rates.ethGbp;
  const cryptoAmount = gbpAmount / rate;
  const symbol = cryptoType === 'bitcoin' ? 'BTC' : 'ETH';
  
  // Use 8 decimal places for precision
  return `${cryptoAmount.toFixed(8)} ${symbol}`;
}

export function getRateAge(rates: CachedRates): string {
  const ageMs = Date.now() - rates.fetchedAt.getTime();
  const ageMinutes = Math.floor(ageMs / 60000);
  const ageSeconds = Math.floor((ageMs % 60000) / 1000);
  
  if (ageMinutes > 0) {
    return `${ageMinutes}m ${ageSeconds}s ago`;
  }
  return `${ageSeconds}s ago`;
}
