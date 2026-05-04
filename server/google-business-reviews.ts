/**
 * Google Business Profile API – Reviews Service
 *
 * Uses OAuth 2.0 (offline access / refresh token) to authenticate with the
 * Google Business Profile API and fetch ALL reviews for the verified business
 * location, bypassing the 5-review cap of the Places API.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID       – OAuth 2.0 client ID (Web application type)
 *   GOOGLE_CLIENT_SECRET   – OAuth 2.0 client secret
 *   GOOGLE_REDIRECT_URI    – Must match exactly what is registered in Google Cloud Console
 *                            e.g. https://your-app.replit.app/api/admin/google-business-callback
 *
 * Written to the token file after first OAuth authorization:
 *   google-business-tokens.json  (root of project, never committed)
 */

import fs from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), "google-business-tokens.json");
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const STAR_RATING_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

// ─── Token file helpers ────────────────────────────────────────────────────

interface TokenStore {
  refreshToken: string;
  accessToken: string;
  accessTokenExpiry: number; // Unix ms
  accountName: string;       // e.g. "accounts/123456789"
  locationName: string;      // e.g. "accounts/123456789/locations/987654321"
}

export function readTokenStore(): TokenStore | null {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    const raw = fs.readFileSync(TOKEN_FILE, "utf8");
    return JSON.parse(raw) as TokenStore;
  } catch {
    return null;
  }
}

export function writeTokenStore(store: TokenStore): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function isConfigured(): boolean {
  const store = readTokenStore();
  return !!(store?.refreshToken && store?.accountName && store?.locationName);
}

// ─── OAuth helpers ─────────────────────────────────────────────────────────

export function buildAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI must be set");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/business.manage",
    access_type: "offline",
    prompt: "consent", // force consent screen so we always get a refresh token
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{ refreshToken: string; accessToken: string; accessTokenExpiry: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = (await resp.json()) as any;
  if (!resp.ok || !data.refresh_token) {
    throw new Error(`Token exchange failed: ${data.error_description || JSON.stringify(data)}`);
  }
  return {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    accessTokenExpiry: Date.now() + (data.expires_in - 60) * 1000,
  };
}

// ─── Access token (auto-refresh) ───────────────────────────────────────────

async function getAccessToken(store: TokenStore): Promise<{ accessToken: string; store: TokenStore }> {
  if (store.accessToken && Date.now() < store.accessTokenExpiry) {
    return { accessToken: store.accessToken, store };
  }

  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: store.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = (await resp.json()) as any;
  if (!resp.ok || !data.access_token) {
    throw new Error(`Token refresh failed: ${data.error_description || JSON.stringify(data)}`);
  }

  const updated: TokenStore = {
    ...store,
    accessToken: data.access_token,
    accessTokenExpiry: Date.now() + (data.expires_in - 60) * 1000,
  };
  writeTokenStore(updated);
  return { accessToken: updated.accessToken, store: updated };
}

// ─── Account / location discovery ─────────────────────────────────────────

export async function discoverAccountAndLocation(accessToken: string): Promise<{ accountName: string; locationName: string }> {
  // 1. List accounts
  const accountsResp = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const accountsData = (await accountsResp.json()) as any;
  if (!accountsResp.ok) throw new Error(`Accounts list failed: ${JSON.stringify(accountsData)}`);

  const accounts: any[] = accountsData.accounts || [];
  if (!accounts.length) throw new Error("No Business Profile accounts found for this Google account");

  // Use first account (most businesses have one)
  const accountName: string = accounts[0].name; // e.g. "accounts/123456789"

  // 2. List locations for that account
  const locationsResp = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const locationsData = (await locationsResp.json()) as any;
  if (!locationsResp.ok) throw new Error(`Locations list failed: ${JSON.stringify(locationsData)}`);

  const locations: any[] = locationsData.locations || [];
  if (!locations.length) throw new Error("No locations found for this Business Profile account");

  // Use first location
  const locationName: string = locations[0].name; // e.g. "accounts/123/locations/456"

  return { accountName, locationName };
}

// ─── Fetch all reviews with pagination ────────────────────────────────────

export interface BusinessReview {
  id: string;
  customerName: string;
  platform: "Google";
  rating: number;
  reviewText: string;
  reviewDate: string;
  location: string;
  serviceType: null;
  platformUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  profilePhoto: string | null;
}

async function fetchAllReviewsRaw(accessToken: string, locationName: string): Promise<any[]> {
  const all: any[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "50" });
    if (pageToken) params.set("pageToken", pageToken);

    const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews?${params}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = (await resp.json()) as any;

    if (!resp.ok) {
      console.error("Business Profile Reviews API error:", data);
      break;
    }

    const batch: any[] = data.reviews || [];
    all.push(...batch);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}

function mapReview(raw: any, idx: number): BusinessReview {
  const starString: string = raw.starRating || "ONE";
  const rating = STAR_RATING_MAP[starString] ?? 1;
  const reviewText: string = raw.comment || "";
  const date = raw.createTime
    ? new Date(raw.createTime).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return {
    id: `gbp-${raw.reviewId || idx}`,
    customerName: raw.reviewer?.displayName || "Google Customer",
    platform: "Google",
    rating,
    reviewText,
    reviewDate: date,
    location: "Cornwall",
    serviceType: null,
    platformUrl: null,
    isActive: true,
    displayOrder: idx,
    profilePhoto: raw.reviewer?.profilePhotoUrl || null,
  };
}

// ─── Cache ─────────────────────────────────────────────────────────────────

interface ReviewCache {
  data: BusinessReview[];
  fetchedAt: number;
}
let reviewCache: ReviewCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function clearReviewCache(): void {
  reviewCache = null;
}

// ─── Places API fallback (max 5 reviews – used until GBP is connected) ────

async function getPlacesApiFallback(minRating: number): Promise<BusinessReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return [];

  try {
    const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount",
        "Content-Type": "application/json",
      },
    });
    const data = (await resp.json()) as any;
    if (!resp.ok || !data.reviews) return [];

    return (data.reviews as any[])
      .filter((r: any) => r.rating >= minRating)
      .map((r: any, idx: number) => ({
        id: `places-${idx}`,
        customerName: r.authorAttribution?.displayName || "Google Customer",
        platform: "Google" as const,
        rating: r.rating,
        reviewText: r.text?.text || "",
        reviewDate: r.publishTime
          ? new Date(r.publishTime).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        location: "Cornwall",
        serviceType: null,
        platformUrl: r.authorAttribution?.uri || null,
        isActive: true,
        displayOrder: idx,
        profilePhoto: r.authorAttribution?.photoUri || null,
      }))
      .filter((r) => r.reviewText.trim().length > 0);
  } catch {
    return [];
  }
}

// ─── Main public function ──────────────────────────────────────────────────

export async function getGoogleBusinessReviews(minRating = 4): Promise<BusinessReview[]> {
  const now = Date.now();
  if (reviewCache && now - reviewCache.fetchedAt < CACHE_TTL_MS) {
    return reviewCache.data.filter((r) => r.rating >= minRating);
  }

  const store = readTokenStore();

  // ── Not yet connected to Business Profile API → fall back to Places API ──
  if (!store?.refreshToken || !store?.locationName) {
    console.info("Google Business Profile not connected — using Places API fallback (max 5 reviews).");
    return getPlacesApiFallback(minRating);
  }

  const { accessToken } = await getAccessToken(store);
  const raw = await fetchAllReviewsRaw(accessToken, store.locationName);

  const reviews: BusinessReview[] = raw
    .map(mapReview)
    .filter((r) => r.reviewText.trim().length > 0);

  reviewCache = { data: reviews, fetchedAt: now };
  return reviews.filter((r) => r.rating >= minRating);
}
