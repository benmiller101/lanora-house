// Shipping rates and calculation logic based on Royal Mail pricing

// Parcel types in order of size
export const PARCEL_TYPES = ['letter', 'large_letter', 'small_parcel', 'medium_parcel', 'large_parcel'] as const;
export type ParcelType = typeof PARCEL_TYPES[number];

// Weight limits for each parcel type (in grams)
export const PARCEL_WEIGHT_LIMITS: Record<ParcelType, number> = {
  letter: 100,
  large_letter: 750,
  small_parcel: 2000,
  medium_parcel: 20000,
  large_parcel: 30000,
};

// Packing & Handling Charges
export const PACKING_HANDLING_BASE = 2.00; // £2.00 per order
export const PACKING_HANDLING_ADDITIONAL = 0.30; // £0.30 per additional item

// Shipping service types
export type ShippingService = 'tracked_48' | 'tracked_24' | 'special_delivery';

export interface ShippingServiceInfo {
  id: ShippingService;
  name: string;
  description: string;
  deliveryTime: string;
  isDefault: boolean;
}

export const SHIPPING_SERVICES: ShippingServiceInfo[] = [
  { id: 'tracked_48', name: 'Royal Mail Tracked 48', description: 'Standard tracked delivery', deliveryTime: '2-3 working days', isDefault: true },
  { id: 'tracked_24', name: 'Royal Mail Tracked 24', description: 'Next day tracked delivery', deliveryTime: '1-2 working days', isDefault: false },
  { id: 'special_delivery', name: 'Special Delivery Guaranteed', description: 'Guaranteed next day by 1pm with insurance', deliveryTime: 'Next working day by 1pm', isDefault: false },
];

// UK Shipping Rates (Tracked 48 - default service)
export const UK_RATES: Record<string, number> = {
  'letter_100': 2.95,
  'large_letter_250': 4.25,
  'large_letter_500': 4.25,
  'large_letter_750': 4.25,
  'small_parcel_1000': 4.25,
  'small_parcel_2000': 4.25,
  'medium_parcel_5000': 6.95,
  'medium_parcel_10000': 8.60,
  'medium_parcel_20000': 12.85,
  'large_parcel_30000': 22.00,
};

// UK Tracked 24 Rates (faster delivery)
export const UK_TRACKED_24_RATES: Record<string, number> = {
  'letter_100': 3.95,
  'large_letter_250': 5.25,
  'large_letter_500': 5.25,
  'large_letter_750': 5.25,
  'small_parcel_1000': 5.85,
  'small_parcel_2000': 5.85,
  'medium_parcel_5000': 9.25,
  'medium_parcel_10000': 11.45,
  'medium_parcel_20000': 17.15,
  'large_parcel_30000': 29.35,
};

// UK Special Delivery Guaranteed Rates (premium with insurance)
export const UK_SPECIAL_DELIVERY_RATES: Record<string, number> = {
  'letter_100': 7.65,
  'large_letter_250': 8.95,
  'large_letter_500': 9.85,
  'large_letter_750': 10.75,
  'small_parcel_1000': 11.85,
  'small_parcel_2000': 14.45,
  'medium_parcel_5000': 19.95,
  'medium_parcel_10000': 24.95,
  'medium_parcel_20000': 34.95,
  'large_parcel_30000': 49.95,
};

// International Zones
export type ShippingZone = 'uk' | 'europe' | 'world_zone_1' | 'world_zone_2' | 'world_zone_3' | 'world_zone_4_13';

// Countries by zone (includes all Stripe-supported countries)
export const ZONE_COUNTRIES: Record<ShippingZone, string[]> = {
  uk: ['United Kingdom', 'UK', 'GB', 'England', 'Scotland', 'Wales', 'Northern Ireland', 'Gibraltar'],
  europe: [
    'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
    'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Faroe Islands', 'Finland',
    'France', 'Georgia', 'Germany', 'Greece', 'Greenland', 'Hungary', 'Iceland', 'Ireland',
    'Italy', 'Kazakhstan', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
    'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal',
    'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'Turkey', 'Ukraine', 'Vatican City'
  ],
  world_zone_1: ['Canada', 'Hong Kong', 'Japan', 'New Zealand', 'Singapore', 'South Africa'],
  world_zone_2: ['Australia', 'China', 'Israel', 'Malaysia', 'Saudi Arabia', 'Thailand', 'India', 'Indonesia', 'United Arab Emirates'],
  world_zone_3: ['United States', 'United States of America', 'USA', 'US'],
  world_zone_4_13: ['Brazil', 'Mexico', 'Côte d\'Ivoire', 'Ghana', 'Kenya', 'Nigeria'], // Other countries including Stripe-supported
};

// List of all Stripe-supported countries for validation
export const STRIPE_SUPPORTED_COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Côte d\'Ivoire', 'Croatia',
  'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Ghana',
  'Gibraltar', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Ireland', 'Italy',
  'Japan', 'Kenya', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malaysia', 'Malta',
  'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Poland', 'Portugal', 'Romania',
  'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'Spain', 'Sweden', 'Switzerland',
  'Thailand', 'United Arab Emirates', 'United Kingdom', 'United States'
];

// International rates (approximations for small/medium parcels)
export const INTERNATIONAL_RATES: Record<ShippingZone, Record<string, number>> = {
  uk: UK_RATES,
  europe: {
    'letter_100': 3.40,
    'large_letter_250': 5.80,
    'large_letter_500': 7.20,
    'large_letter_750': 9.55,
    'small_parcel_1000': 13.55,
    'small_parcel_2000': 16.25,
    'medium_parcel_5000': 23.00,
    'medium_parcel_10000': 35.00,
    'medium_parcel_20000': 52.50,
    'large_parcel_30000': 67.50,
  },
  world_zone_1: {
    'letter_100': 3.40,
    'large_letter_250': 7.70,
    'large_letter_500': 10.80,
    'large_letter_750': 16.00,
    'small_parcel_1000': 26.20,
    'small_parcel_2000': 33.55,
    'medium_parcel_5000': 40.00,
    'medium_parcel_10000': 60.00,
    'medium_parcel_20000': 100.00,
    'large_parcel_30000': 130.00,
  },
  world_zone_2: {
    'letter_100': 3.40,
    'large_letter_250': 9.00,
    'large_letter_500': 13.10,
    'large_letter_750': 20.10,
    'small_parcel_1000': 29.15,
    'small_parcel_2000': 38.85,
    'medium_parcel_5000': 52.50,
    'medium_parcel_10000': 85.00,
    'medium_parcel_20000': 140.00,
    'large_parcel_30000': 200.00,
  },
  world_zone_3: { // USA
    'letter_100': 3.40,
    'large_letter_250': 8.00,
    'large_letter_500': 11.50,
    'large_letter_750': 17.10,
    'small_parcel_1000': 30.05,
    'small_parcel_2000': 35.70,
    'medium_parcel_5000': 50.00,
    'medium_parcel_10000': 77.50,
    'medium_parcel_20000': 127.50,
    'large_parcel_30000': 187.50,
  },
  world_zone_4_13: {
    'letter_100': 3.40,
    'large_letter_250': 10.00,
    'large_letter_500': 14.50,
    'large_letter_750': 21.50,
    'small_parcel_1000': 36.00,
    'small_parcel_2000': 47.50,
    'medium_parcel_5000': 70.00,
    'medium_parcel_10000': 125.00,
    'medium_parcel_20000': 210.00,
    'large_parcel_30000': 315.00,
  },
};

// Get shipping zone from country
export function getShippingZone(country: string): ShippingZone {
  const normalizedCountry = country.trim();
  
  for (const [zone, countries] of Object.entries(ZONE_COUNTRIES)) {
    if (countries.some(c => c.toLowerCase() === normalizedCountry.toLowerCase())) {
      return zone as ShippingZone;
    }
  }
  
  return 'world_zone_4_13'; // Default for unknown countries
}

// Get the appropriate rate key based on weight
function getRateKey(parcelType: ParcelType, weightGrams: number): string {
  // Find the appropriate weight band
  let weightBand: number;
  
  if (parcelType === 'letter') {
    weightBand = 100;
  } else if (parcelType === 'large_letter') {
    if (weightGrams <= 250) weightBand = 250;
    else if (weightGrams <= 500) weightBand = 500;
    else weightBand = 750;
  } else if (parcelType === 'small_parcel') {
    if (weightGrams <= 1000) weightBand = 1000;
    else weightBand = 2000;
  } else if (parcelType === 'medium_parcel') {
    if (weightGrams <= 5000) weightBand = 5000;
    else if (weightGrams <= 10000) weightBand = 10000;
    else weightBand = 20000;
  } else {
    weightBand = 30000;
  }
  
  return `${parcelType}_${weightBand}`;
}

// Calculate which parcel type is needed based on combined weight
export function getRequiredParcelType(totalWeightGrams: number, items: { parcelType: ParcelType }[]): ParcelType {
  // Find the largest parcel type from items
  let maxParcelIndex = 0;
  for (const item of items) {
    const index = PARCEL_TYPES.indexOf(item.parcelType);
    if (index > maxParcelIndex) {
      maxParcelIndex = index;
    }
  }
  
  // Check if we need to upgrade based on total weight
  for (let i = maxParcelIndex; i < PARCEL_TYPES.length; i++) {
    const parcelType = PARCEL_TYPES[i];
    if (totalWeightGrams <= PARCEL_WEIGHT_LIMITS[parcelType]) {
      return parcelType;
    }
  }
  
  // If too heavy, return large parcel (may need multiple shipments)
  return 'large_parcel';
}

// Calculate shipping cost for a single item
export function calculateItemShipping(
  weightGrams: number,
  parcelType: ParcelType,
  zone: ShippingZone
): number {
  const rates = INTERNATIONAL_RATES[zone];
  const rateKey = getRateKey(parcelType, weightGrams);
  
  // Try exact match first
  if (rates[rateKey]) {
    return rates[rateKey];
  }
  
  // Fallback to UK rates if zone rate not found
  if (UK_RATES[rateKey]) {
    return UK_RATES[rateKey];
  }
  
  // Default fallback
  return 10.00;
}

// Calculate combined shipping for multiple items
export interface CartItem {
  productId: number;
  name: string;
  weightGrams: number;
  parcelType: ParcelType;
}

export interface ShippingOption {
  serviceId: ShippingService;
  serviceName: string;
  description: string;
  deliveryTime: string;
  shippingCost: number;
  packingHandling: number;
  totalShipping: number;
  isDefault: boolean;
  upgradeAmount: number; // Amount more than default option
}

export interface ShippingCalculation {
  items: CartItem[];
  totalWeight: number;
  requiredParcelType: ParcelType;
  zone: ShippingZone;
  shippingCost: number;
  packingHandling: number;
  totalShipping: number;
  breakdown: {
    baseShipping: number;
    packingBase: number;
    packingAdditional: number;
  };
  // Available shipping options (for UK only, international has single option)
  shippingOptions: ShippingOption[];
  selectedService: ShippingService;
}

// Get shipping cost for a specific service
function getServiceShippingCost(
  weightGrams: number,
  parcelType: ParcelType,
  zone: ShippingZone,
  service: ShippingService
): number {
  const rateKey = getRateKey(parcelType, weightGrams);
  
  // For UK, we have multiple service options
  if (zone === 'uk') {
    let rates: Record<string, number>;
    switch (service) {
      case 'tracked_24':
        rates = UK_TRACKED_24_RATES;
        break;
      case 'special_delivery':
        rates = UK_SPECIAL_DELIVERY_RATES;
        break;
      default:
        rates = UK_RATES;
    }
    if (rates[rateKey]) return rates[rateKey];
    if (UK_RATES[rateKey]) return UK_RATES[rateKey];
    return 10.00;
  }
  
  // For international, only tracked service is available
  const rates = INTERNATIONAL_RATES[zone];
  if (rates[rateKey]) return rates[rateKey];
  if (UK_RATES[rateKey]) return UK_RATES[rateKey];
  return 10.00;
}

export function calculateCombinedShipping(
  items: CartItem[],
  country: string,
  selectedService: ShippingService = 'tracked_48'
): ShippingCalculation {
  if (items.length === 0) {
    return {
      items: [],
      totalWeight: 0,
      requiredParcelType: 'letter',
      zone: 'uk',
      shippingCost: 0,
      packingHandling: 0,
      totalShipping: 0,
      breakdown: {
        baseShipping: 0,
        packingBase: 0,
        packingAdditional: 0,
      },
      shippingOptions: [],
      selectedService: 'tracked_48',
    };
  }
  
  const zone = getShippingZone(country);
  const totalWeight = items.reduce((sum, item) => sum + item.weightGrams, 0);
  const requiredParcelType = getRequiredParcelType(totalWeight, items);
  
  // Calculate packing & handling (same for all services)
  const packingBase = PACKING_HANDLING_BASE;
  const packingAdditional = items.length > 1 ? (items.length - 1) * PACKING_HANDLING_ADDITIONAL : 0;
  const packingHandling = packingBase + packingAdditional;
  
  // Calculate shipping options
  const shippingOptions: ShippingOption[] = [];
  
  // Get base cost for comparison (Tracked 48 is always the base)
  const baseCost = getServiceShippingCost(totalWeight, requiredParcelType, zone, 'tracked_48');
  
  if (zone === 'uk') {
    // UK has multiple service options
    for (const service of SHIPPING_SERVICES) {
      const serviceCost = getServiceShippingCost(totalWeight, requiredParcelType, zone, service.id);
      shippingOptions.push({
        serviceId: service.id,
        serviceName: service.name,
        description: service.description,
        deliveryTime: service.deliveryTime,
        shippingCost: serviceCost,
        packingHandling,
        totalShipping: serviceCost + packingHandling,
        isDefault: service.isDefault,
        upgradeAmount: serviceCost - baseCost,
      });
    }
  } else {
    // International only has tracked service
    const internationalCost = getServiceShippingCost(totalWeight, requiredParcelType, zone, 'tracked_48');
    shippingOptions.push({
      serviceId: 'tracked_48',
      serviceName: 'International Tracked',
      description: 'Tracked international delivery',
      deliveryTime: '5-14 working days',
      shippingCost: internationalCost,
      packingHandling,
      totalShipping: internationalCost + packingHandling,
      isDefault: true,
      upgradeAmount: 0,
    });
  }
  
  // Get the selected service cost (or default to tracked_48)
  const selectedOption = shippingOptions.find(o => o.serviceId === selectedService) || shippingOptions[0];
  const shippingCost = selectedOption.shippingCost;
  
  return {
    items,
    totalWeight,
    requiredParcelType,
    zone,
    shippingCost,
    packingHandling,
    totalShipping: shippingCost + packingHandling,
    breakdown: {
      baseShipping: shippingCost,
      packingBase,
      packingAdditional,
    },
    shippingOptions,
    selectedService: selectedOption.serviceId,
  };
}

// Get human-readable parcel type name
export function getParcelTypeName(parcelType: ParcelType): string {
  const names: Record<ParcelType, string> = {
    letter: 'Letter',
    large_letter: 'Large Letter',
    small_parcel: 'Small Parcel',
    medium_parcel: 'Medium Parcel',
    large_parcel: 'Large Parcel',
  };
  return names[parcelType] || parcelType;
}

// Get human-readable zone name
export function getZoneName(zone: ShippingZone): string {
  const names: Record<ShippingZone, string> = {
    uk: 'United Kingdom',
    europe: 'Europe',
    world_zone_1: 'World Zone 1 (Canada, Hong Kong, Japan, etc.)',
    world_zone_2: 'World Zone 2 (Australia, China, etc.)',
    world_zone_3: 'USA',
    world_zone_4_13: 'Rest of World',
  };
  return names[zone] || zone;
}
