import { db } from "./server/db";
import { products, categories } from "./shared/schema";

const testProducts = [
  {
    name: "Victorian Mahogany Writing Desk",
    description: "Elegant Victorian writing desk crafted from rich mahogany wood, featuring intricate carved details and brass hardware.",
    detailedDescription: "This stunning Victorian writing desk dates from the 1870s and showcases the finest craftsmanship of the era. The rich mahogany wood has been carefully maintained and displays beautiful grain patterns. Features include multiple drawers with original brass handles, a leather-inlaid writing surface, and delicate carved details along the edges. Perfect for any study or home office seeking authentic period character.",
    sku: "TEST-VIC-001",
    price: "850.00",
    originalPrice: "1200.00",
    categoryId: 1,
    era: "victorian",
    condition: "excellent",
    materials: ["mahogany", "brass", "leather"],
    dimensions: "120cm L x 60cm W x 75cm H",
    origin: "England",
    isFeatured: true,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Originally owned by the Henderson family estate, documented in family records from 1875",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  },
  {
    name: "Art Deco Silver Cigarette Case",
    description: "Exquisite Art Deco silver cigarette case with geometric engraving and original hallmarks.",
    detailedDescription: "A beautiful example of Art Deco design from the 1920s, this sterling silver cigarette case features the characteristic geometric patterns of the era. The case bears Birmingham hallmarks and maker's marks, confirming its authenticity and dating. The interior is gold-plated and in excellent condition. A perfect collector's piece showcasing the elegance and sophistication of the Jazz Age.",
    sku: "TEST-ART-002",
    price: "245.00",
    originalPrice: "320.00",
    categoryId: 3,
    era: "art_deco",
    condition: "excellent",
    materials: ["sterling silver", "gold plating"],
    dimensions: "9cm L x 6cm W x 1cm H",
    origin: "Birmingham, England",
    isFeatured: false,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Purchased from a Birmingham antique dealer, with original documentation",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  },
  {
    name: "Georgian Longcase Clock",
    description: "Magnificent Georgian longcase clock with eight-day movement and moon phase dial.",
    detailedDescription: "This exceptional Georgian longcase clock dates from approximately 1780 and represents the pinnacle of English clockmaking. The eight-day movement features a moon phase dial and strikes on the hour and half-hour. The case is crafted from solid oak with beautiful figuring and original brass fittings. The clock has been recently serviced and keeps excellent time. A centerpiece for any period home.",
    sku: "TEST-GEO-003",
    price: "3250.00",
    originalPrice: "4200.00",
    categoryId: 1,
    era: "georgian",
    condition: "good",
    materials: ["oak", "brass", "steel"],
    dimensions: "210cm H x 50cm W x 25cm D",
    origin: "London, England",
    isFeatured: true,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Originally from Thornfield Manor, Yorkshire, with clockmaker's signature visible",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  },
  {
    name: "Ming Dynasty Porcelain Vase",
    description: "Rare Ming Dynasty blue and white porcelain vase with traditional dragon motifs.",
    detailedDescription: "An extraordinary Ming Dynasty porcelain vase dating from the 16th century, featuring the classic blue and white glazing technique perfected during this period. The vase depicts traditional dragon motifs surrounded by cloud patterns, executed with remarkable skill and precision. Despite its age, the piece remains in remarkable condition with only minor age-related crazing. Accompanied by a certificate of authenticity from the Oriental Ceramics Society.",
    sku: "TEST-MIN-004",
    price: "12500.00",
    originalPrice: "15000.00",
    categoryId: 4,
    era: "renaissance",
    condition: "good",
    materials: ["porcelain", "cobalt blue glaze"],
    dimensions: "35cm H x 18cm diameter",
    origin: "Jingdezhen, China",
    isFeatured: true,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Acquired by European collector in the 1920s, family collection since",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  },
  {
    name: "Edwardian Ruby and Diamond Ring",
    description: "Stunning Edwardian ruby and diamond cluster ring in 18ct gold setting.",
    detailedDescription: "This exquisite Edwardian ring features a central Burmese ruby of approximately 1.5 carats, surrounded by old-cut diamonds totaling approximately 0.8 carats. The 18ct gold setting displays the characteristic delicate workmanship of the Edwardian period. The ruby displays excellent color and clarity, with the distinctive 'pigeon blood' red highly prized by collectors. Complete with modern gemological assessment and insurance valuation.",
    sku: "TEST-EDW-005",
    price: "4750.00",
    originalPrice: "5500.00",
    categoryId: 3,
    era: "edwardian",
    condition: "excellent",
    materials: ["18ct gold", "ruby", "diamonds"],
    dimensions: "Ring size M (UK), resizable",
    origin: "London, England",
    isFeatured: false,
    isBestSeller: true,
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Originally purchased from Garrard & Co, London, with original receipt from 1908",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  },
  {
    name: "Mid-Century Teak Sideboard",
    description: "Classic Danish mid-century teak sideboard with sliding doors and tapered legs.",
    detailedDescription: "A beautiful example of Danish modern design from the 1960s, this teak sideboard embodies the clean lines and functional beauty of Scandinavian furniture. Features sliding doors, adjustable shelving, and the characteristic tapered legs of the period. The teak has developed a lovely patina over the decades while maintaining its structural integrity. Perfect for modern interiors seeking authentic vintage pieces.",
    sku: "TEST-MID-006",
    price: "1850.00",
    originalPrice: "2200.00",
    categoryId: 1,
    era: "mid_century",
    condition: "excellent",
    materials: ["teak", "brass hardware"],
    dimensions: "180cm L x 45cm W x 80cm H",
    origin: "Denmark",
    isFeatured: false,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Imported directly from Denmark in the 1960s, single family ownership",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  },
  {
    name: "Art Nouveau Stained Glass Panel",
    description: "Beautiful Art Nouveau stained glass panel featuring flowing floral motifs.",
    detailedDescription: "This stunning Art Nouveau stained glass panel dates from approximately 1905 and showcases the characteristic flowing, organic forms of the movement. The design features stylized poppies and flowing stems in rich reds, greens, and amber glass. The lead came is in excellent condition and the glass retains its original brilliance. Originally part of a grand Victorian house, now perfect for modern installation or display.",
    sku: "TEST-NOV-007",
    price: "950.00",
    originalPrice: "1200.00",
    categoryId: 2,
    era: "art_nouveau",
    condition: "good",
    materials: ["stained glass", "lead came"],
    dimensions: "60cm W x 90cm H",
    origin: "Glasgow, Scotland",
    isFeatured: false,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Salvaged from demolished Glasgow townhouse, architectural records available",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  },
  {
    name: "Victorian Silver Tea Service",
    description: "Complete Victorian silver tea service with teapot, sugar bowl, and cream jug.",
    detailedDescription: "An elegant Victorian silver tea service dating from 1885, hallmarked in Sheffield. The set includes a teapot, sugar bowl, and cream jug, all featuring matching decorative borders and the original maker's marks. The pieces show beautiful craftsmanship with hand-chased details and original ivory handles on the teapot. A perfect example of Victorian domestic silver, ideal for collectors or those seeking authentic period pieces for entertaining.",
    sku: "TEST-VIC-008",
    price: "1650.00",
    originalPrice: "2000.00",
    categoryId: 5,
    era: "victorian",
    condition: "excellent",
    materials: ["sterling silver", "ivory"],
    dimensions: "Teapot: 25cm L x 15cm H",
    origin: "Sheffield, England",
    isFeatured: true,
    isBestSeller: false,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop",
    additionalImages: [],
    provenance: "Estate sale from Derbyshire manor house, family ownership since purchase",
    inStock: true,
    stockQuantity: 1,
    tags: ["test-data"]
  }
];

async function seedTestProducts() {
  try {
    console.log('🌱 Starting to seed test products...');
    
    for (const product of testProducts) {
      await db.insert(products).values(product);
      console.log(`✅ Added: ${product.name}`);
    }
    
    console.log(`🎉 Successfully seeded ${testProducts.length} test products!`);
    console.log('📝 All products are tagged with "test-data" for easy deletion later');
  } catch (error) {
    console.error('❌ Error seeding test products:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestProducts().then(() => process.exit(0));
}

export { seedTestProducts };