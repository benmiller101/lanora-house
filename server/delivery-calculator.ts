import fetch from 'node-fetch';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  // Convert to miles
  return distanceKm * 0.621371;
}

// Coordinates for Hayle, Cornwall TR27 4AB
const HAYLE_LAT = 50.1885;
const HAYLE_LON = -5.4199;

// Delivery tiers configuration
const DELIVERY_TIERS = [
  {
    tier: 1,
    name: 'Local',
    counties: ['Cornwall', 'Devon'],
    ratePerMile: 1.20,
  },
  {
    tier: 2,
    name: 'Regional',
    counties: ['Somerset', 'Dorset'],
    ratePerMile: 1.50,
  },
  {
    tier: 3,
    name: 'Extended',
    counties: ['Wiltshire', 'Gloucestershire'],
    ratePerMile: 2.00,
  },
  {
    tier: 4,
    name: 'National',
    counties: [], // All others
    ratePerMile: null, // Quote required
  },
];

export interface DeliveryCalculationResult {
  success: boolean;
  postcode?: string;
  distance?: number;
  tier?: number;
  tierName?: string;
  ratePerMile?: number | null;
  cost?: number | null;
  county?: string;
  error?: string;
  quoteRequired?: boolean;
}

export async function calculateDeliveryCost(postcode: string): Promise<DeliveryCalculationResult> {
  try {
    // Clean up postcode (remove spaces and convert to uppercase)
    const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
    
    // Fetch postcode data from postcodes.io
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
    
    if (!response.ok) {
      return {
        success: false,
        error: 'Invalid UK postcode. Please check and try again.',
      };
    }
    
    const data: any = await response.json();
    
    if (data.status !== 200 || !data.result) {
      return {
        success: false,
        error: 'Invalid UK postcode. Please check and try again.',
      };
    }
    
    const { latitude, longitude, admin_county } = data.result;
    
    // Calculate distance from Hayle
    const distance = calculateDistance(HAYLE_LAT, HAYLE_LON, latitude, longitude);
    
    // Determine delivery tier based on county
    let selectedTier = DELIVERY_TIERS.find(tier => 
      tier.counties.some(county => admin_county?.includes(county))
    );
    
    // If no specific tier found, it's National (Tier 4)
    if (!selectedTier) {
      selectedTier = DELIVERY_TIERS[3]; // National tier
    }
    
    // Calculate cost if not quote required
    let cost: number | null = null;
    let quoteRequired = false;
    
    if (selectedTier.ratePerMile !== null) {
      cost = Number((distance * selectedTier.ratePerMile).toFixed(2));
    } else {
      quoteRequired = true;
    }
    
    return {
      success: true,
      postcode: cleanPostcode,
      distance: Number(distance.toFixed(2)),
      tier: selectedTier.tier,
      tierName: selectedTier.name,
      ratePerMile: selectedTier.ratePerMile,
      cost,
      county: admin_county || 'Unknown',
      quoteRequired,
    };
  } catch (error) {
    console.error('Error calculating delivery cost:', error);
    return {
      success: false,
      error: 'Failed to calculate delivery cost. Please try again.',
    };
  }
}
