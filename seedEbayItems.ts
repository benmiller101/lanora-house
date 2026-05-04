import { db } from './server/db';
import { products } from './shared/schema';

const ebayProducts = [
  {
    name: "Victorian Mahogany Writing Desk",
    description: "Elegant Victorian mahogany writing desk with brass fittings",
    detailedDescription: "A stunning example of Victorian craftsmanship, this mahogany writing desk features original brass handles and fittings. The desk includes multiple drawers with dovetail joints and a leather-inlaid writing surface. Perfect for collectors of period furniture.",
    price: "850.00",
    originalPrice: "1200.00",
    categoryId: 2,
    era: "Victorian",
    condition: "Excellent",
    materials: ["Mahogany", "Brass", "Leather"],
    dimensions: "120cm x 60cm x 80cm",
    origin: "England",
    provenance: "Estate sale from Georgian manor house",
    isFeatured: false,
    isBestSeller: false,
    imageUrl: "/placeholder-image.jpg",
    inStock: true,
    stockQuantity: 1
  },
  {
    name: "Art Deco Crystal Vase",
    description: "1920s Art Deco cut crystal vase with geometric patterns",
    detailedDescription: "Beautiful Art Deco crystal vase featuring intricate geometric cut patterns typical of the 1920s era. The vase shows excellent clarity and brilliant light refraction. Minor wear consistent with age but no chips or cracks.",
    price: "145.00",
    originalPrice: "220.00",
    categoryId: 2,
    era: "Art Deco",
    condition: "Very Good",
    materials: ["Lead Crystal"],
    dimensions: "25cm height x 12cm diameter",
    origin: "Czechoslovakia",
    provenance: "Private collection",
    isFeatured: false,
    isBestSeller: false,
    imageUrl: "/placeholder-image.jpg",
    inStock: true,
    stockQuantity: 1
  },
  {
    name: "Chinese Porcelain Ginger Jar",
    description: "Qing Dynasty blue and white porcelain ginger jar",
    detailedDescription: "Authentic Qing Dynasty porcelain ginger jar featuring traditional blue and white glazework with intricate floral motifs. Hand-painted details show the skill of period artisans. Complete with original wooden lid.",
    price: "380.00",
    originalPrice: "550.00",
    categoryId: 2,
    era: "Qing Dynasty",
    condition: "Good",
    materials: ["Porcelain", "Wood"],
    dimensions: "18cm height x 15cm diameter",
    origin: "China",
    provenance: "Acquired from estate auction",
    isFeatured: false,
    isBestSeller: false,
    imageUrl: "/placeholder-image.jpg",
    inStock: true,
    stockQuantity: 1
  },
  {
    name: "Georgian Silver Candlesticks",
    description: "Pair of Georgian sterling silver candlesticks with hallmarks",
    detailedDescription: "Magnificent pair of Georgian sterling silver candlesticks bearing clear hallmarks from 1785. Classical column design with weighted bases. Excellent patina and minimal wear. A fine example of 18th-century silversmithing.",
    price: "1250.00",
    originalPrice: "1800.00",
    categoryId: 2,
    era: "Georgian",
    condition: "Excellent",
    materials: ["Sterling Silver"],
    dimensions: "28cm height",
    origin: "London, England",
    provenance: "Family collection, documented provenance",
    isFeatured: true,
    isBestSeller: false,
    imageUrl: "/placeholder-image.jpg",
    inStock: true,
    stockQuantity: 1
  },
  {
    name: "Vintage Omega Seamaster Watch",
    description: "1960s Omega Seamaster automatic watch in original condition",
    detailedDescription: "Classic 1960s Omega Seamaster automatic watch featuring the original dial and hands. Stainless steel case with exhibition case back showing the caliber 552 movement. Serviced and keeping excellent time.",
    price: "920.00",
    originalPrice: "1150.00",
    categoryId: 2,
    era: "Mid-Century",
    condition: "Very Good",
    materials: ["Stainless Steel", "Leather"],
    dimensions: "34mm case diameter",
    origin: "Switzerland",
    provenance: "Single owner, with service records",
    isFeatured: false,
    isBestSeller: true,
    imageUrl: "/placeholder-image.jpg",
    inStock: true,
    stockQuantity: 1
  }
];

async function seedEbayItems() {
  try {
    console.log('Starting to seed eBay items...');
    
    for (const product of ebayProducts) {
      await db.insert(products).values(product);
      console.log(`✓ Added: ${product.name}`);
    }

    console.log(`Successfully seeded ${ebayProducts.length} eBay items`);
  } catch (error) {
    console.error('Error seeding eBay items:', error);
  } finally {
    process.exit(0);
  }
}

seedEbayItems();