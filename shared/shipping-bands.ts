export interface ShippingBandDetails {
  code: string;
  title: string;
  price: number;
  dimensions: string;
  weight: string;
  description: string;
}

export const SHIPPING_BANDS: { [key: string]: ShippingBandDetails } = {
  'band-a0': {
    code: 'band-a0',
    title: 'Band A0 – Small Lite',
    price: 6.00,
    dimensions: '35 × 25 × 10 cm',
    weight: '1 kg',
    description: 'Small lightweight items'
  },
  'band-a1': {
    code: 'band-a1',
    title: 'Band A1 – Small',
    price: 8.30,
    dimensions: '35 × 25 × 16 cm',
    weight: '1.5 kg',
    description: 'Small items'
  },
  'band-a2': {
    code: 'band-a2',
    title: 'Band A2 – Small+',
    price: 8.30,
    dimensions: '40 × 30 × 20 cm',
    weight: '2 kg',
    description: 'Small plus items'
  },
  'band-b1': {
    code: 'band-b1',
    title: 'Band B1 – Medium',
    price: 11.30,
    dimensions: '45 × 35 × 20 cm',
    weight: '3 kg',
    description: 'Medium items'
  },
  'band-b2': {
    code: 'band-b2',
    title: 'Band B2 – Medium+',
    price: 13.00,
    dimensions: '50 × 40 × 25 cm',
    weight: '5 kg',
    description: 'Medium plus items'
  },
  'band-c1': {
    code: 'band-c1',
    title: 'Band C1 – Large',
    price: 16.20,
    dimensions: '60 × 45 × 35 cm',
    weight: '7 kg',
    description: 'Large items'
  },
  'band-c2': {
    code: 'band-c2',
    title: 'Band C2 – Heavy Small Box',
    price: 19.10,
    dimensions: '30 × 30 × 30 cm',
    weight: 'up to 20 kg',
    description: 'Heavy small box items'
  },
  'band-c3': {
    code: 'band-c3',
    title: 'Band C3 – Large+',
    price: 19.10,
    dimensions: '70 × 50 × 40 cm',
    weight: '10 kg',
    description: 'Large plus items'
  },
  'band-c4': {
    code: 'band-c4',
    title: 'Band C4 – XL',
    price: 19.10,
    dimensions: '80 × 60 × 40 cm',
    weight: '15 kg',
    description: 'Extra large items'
  },
  'band-c5': {
    code: 'band-c5',
    title: 'Band C5 – XL+',
    price: 19.10,
    dimensions: '90 × 60 × 45 cm',
    weight: '20 kg',
    description: 'Extra large plus items'
  },
  'band-d1': {
    code: 'band-d1',
    title: 'Band D1 – Oversize',
    price: 43.00,
    dimensions: '100 × 70 × 50 cm',
    weight: '25 kg',
    description: 'Oversize items'
  },
  'band-d2': {
    code: 'band-d2',
    title: 'Band D2 – Oversize+',
    price: 43.00,
    dimensions: '110 × 75 × 55 cm',
    weight: '30 kg',
    description: 'Oversize plus items'
  },
  'band-d3': {
    code: 'band-d3',
    title: 'Band D3 – Max Size',
    price: 43.00,
    dimensions: '120 × 80 × 60 cm',
    weight: '30 kg',
    description: 'Maximum size items'
  },
  'band-e1': {
    code: 'band-e1',
    title: 'Band E1 – Square Large',
    price: 20.40,
    dimensions: '60 × 60 × 40 cm',
    weight: '8 kg',
    description: 'Square large items'
  },
  'band-f1': {
    code: 'band-f1',
    title: 'Band F1 – Tube Small',
    price: 13.10,
    dimensions: '100 × 12 × 12 cm',
    weight: '5 kg',
    description: 'Small tube items'
  },
  'band-f2': {
    code: 'band-f2',
    title: 'Band F2 – Tube Large',
    price: 16.00,
    dimensions: '120 × 15 × 15 cm',
    weight: '8 kg',
    description: 'Large tube items'
  }
};

export const getShippingBandPrice = (bandCode: string | null): number | null => {
  if (!bandCode) return null;
  return SHIPPING_BANDS[bandCode]?.price || null;
};

export const getShippingBandDetails = (bandCode: string | null): ShippingBandDetails | null => {
  if (!bandCode) return null;
  return SHIPPING_BANDS[bandCode] || null;
};

export const getAllShippingBands = (): ShippingBandDetails[] => {
  return Object.values(SHIPPING_BANDS);
};
