import { db } from "./server/db";
import { products, categories } from "./shared/schema";

const categoriesData = [
  {
    id: 1,
    name: "Furniture",
    slug: "furniture",
    description: "Antique and vintage furniture pieces",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
  },
  {
    id: 2,
    name: "Ceramics & Pottery",
    slug: "ceramics-pottery",
    description: "Fine ceramics, pottery, and porcelain",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
  },
  {
    id: 3,
    name: "Jewelry & Watches",
    slug: "jewelry-watches", 
    description: "Vintage jewelry and timepieces",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400"
  },
  {
    id: 4,
    name: "Art & Prints",
    slug: "art-prints",
    description: "Original artwork and vintage prints",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
  },
  {
    id: 5,
    name: "Books & Manuscripts",
    slug: "books-manuscripts",
    description: "Rare books and historical documents",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
  },
  {
    id: 6,
    name: "Glassware",
    slug: "glassware",
    description: "Crystal, cut glass, and art glass",
    imageUrl: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400"
  },
  {
    id: 7,
    name: "Collectibles",
    slug: "collectibles",
    description: "Vintage collectibles and memorabilia",
    imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400"
  },
  {
    id: 8,
    name: "Silver & Metalware",
    slug: "silver-metalware",
    description: "Sterling silver and metal antiques",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400"
  }
];

const productsData = [
  // Furniture
  {
    id: 1,
    name: "Victorian Mahogany Writing Desk",
    description: "Elegant Victorian writing desk with leather inlay and brass fittings",
    detailedDescription: "This exquisite Victorian mahogany writing desk features a tooled leather writing surface, multiple drawers with original brass handles, and beautifully turned legs. The desk shows excellent craftsmanship typical of the mid-19th century period.",
    price: "850.00",
    originalPrice: "1200.00",
    categoryId: 1,
    era: "Victorian (1837-1901)",
    condition: "Excellent",
    materials: ["Mahogany", "Leather", "Brass"],
    dimensions: "120cm W x 60cm D x 75cm H",
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    additionalImages: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"],
    provenance: "Estate collection from Cotswolds manor house",
    isFeatured: true,
    isBestSeller: true,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 2,
    name: "Art Deco Walnut Sideboard",
    description: "Stunning 1930s Art Deco sideboard with geometric inlay design",
    detailedDescription: "A magnificent example of Art Deco furniture design, this walnut sideboard features characteristic geometric patterns, chrome handles, and spacious storage compartments perfect for dining room display.",
    price: "1250.00",
    categoryId: 1,
    era: "Art Deco (1920-1940)",
    condition: "Very Good",
    materials: ["Walnut", "Chrome", "Glass"],
    dimensions: "150cm W x 45cm D x 85cm H",
    origin: "France",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 3,
    name: "Georgian Oak Windsor Chair",
    description: "Traditional English Windsor chair in solid oak",
    detailedDescription: "Authentic Georgian period Windsor chair crafted from solid oak with characteristic spindle back and saddle seat. Shows beautiful patina developed over centuries of use.",
    price: "320.00",
    categoryId: 1,
    era: "Georgian (1714-1830)",
    condition: "Good",
    materials: ["Oak"],
    dimensions: "45cm W x 42cm D x 95cm H",
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800",
    isFeatured: false,
    isBestSeller: true,
    inStock: true,
    stockQuantity: 2
  },

  // Ceramics & Pottery
  {
    id: 4,
    name: "Royal Crown Derby Imari Dinner Service",
    description: "Complete 12-place setting in the iconic Imari pattern",
    detailedDescription: "Magnificent Royal Crown Derby dinner service in the famous Imari pattern featuring rich cobalt blue, iron red, and gold decoration. Complete service for 12 people including serving pieces.",
    price: "2800.00",
    originalPrice: "4500.00",
    categoryId: 2,
    era: "Late Victorian (1890-1901)",
    condition: "Excellent",
    materials: ["Fine Bone China", "Gold"],
    origin: "Derby, England",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    isFeatured: true,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 5,
    name: "Staffordshire Pottery Dog Pair",
    description: "Charming pair of Victorian Staffordshire spaniels",
    detailedDescription: "Classic pair of Staffordshire pottery spaniels with traditional white glaze and gold collar details. These decorative figures were popular Victorian mantelpiece ornaments.",
    price: "185.00",
    categoryId: 2,
    era: "Victorian (1837-1901)",
    condition: "Very Good",
    materials: ["Earthenware", "Glaze"],
    dimensions: "25cm H each",
    origin: "Staffordshire, England",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800",
    isFeatured: false,
    isBestSeller: true,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 6,
    name: "Japanese Satsuma Vase",
    description: "Meiji period Satsuma earthenware vase with elaborate decoration",
    detailedDescription: "Beautiful Meiji period Satsuma vase featuring intricate hand-painted scenes of figures in landscapes, with rich gold and polychrome decoration typical of this prestigious Japanese ceramic tradition.",
    price: "650.00",
    categoryId: 2,
    era: "Meiji (1868-1912)",
    condition: "Excellent",
    materials: ["Satsuma Earthenware", "Gold"],
    dimensions: "30cm H x 15cm D",
    origin: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },

  // Jewelry & Watches
  {
    id: 7,
    name: "Edwardian Pearl and Diamond Necklace",
    description: "Elegant Edwardian natural pearl necklace with diamond clasp",
    detailedDescription: "Sophisticated Edwardian necklace featuring graduated natural pearls with an exquisite diamond-set platinum clasp. Accompanied by period fitted case and certificate of authenticity.",
    price: "3200.00",
    categoryId: 3,
    era: "Edwardian (1901-1910)",
    condition: "Excellent",
    materials: ["Natural Pearls", "Diamonds", "Platinum"],
    dimensions: "45cm length",
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    isFeatured: true,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 8,
    name: "Omega Seamaster Vintage Watch",
    description: "1960s Omega Seamaster automatic watch in stainless steel",
    detailedDescription: "Classic 1960s Omega Seamaster with automatic movement, original dial, and stainless steel case. Recently serviced with excellent timekeeping. A perfect example of mid-century Swiss watchmaking.",
    price: "1450.00",
    categoryId: 3,
    era: "Mid-Century (1950-1970)",
    condition: "Very Good",
    materials: ["Stainless Steel", "Leather"],
    dimensions: "34mm case diameter",
    origin: "Switzerland",
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
    isFeatured: false,
    isBestSeller: true,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 9,
    name: "Art Nouveau Silver Brooch",
    description: "Stunning Art Nouveau silver brooch with enamel detailing",
    detailedDescription: "Beautiful Art Nouveau period brooch crafted in sterling silver with characteristic flowing lines and delicate enamel work depicting stylized flowers. Hallmarked Birmingham 1905.",
    price: "280.00",
    categoryId: 3,
    era: "Art Nouveau (1890-1910)",
    condition: "Excellent",
    materials: ["Sterling Silver", "Enamel"],
    dimensions: "5cm x 3cm",
    origin: "Birmingham, England",
    imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },

  // Art & Prints
  {
    id: 10,
    name: "Original Watercolor Landscape",
    description: "19th century English watercolor of the Lake District",
    detailedDescription: "Charming 19th century watercolor painting depicting a serene Lake District scene with mountains and reflective waters. Signed by the artist and presented in a period gilt frame.",
    price: "420.00",
    categoryId: 4,
    era: "19th Century",
    condition: "Very Good",
    materials: ["Watercolor", "Paper", "Gilt Frame"],
    dimensions: "40cm x 30cm (framed)",
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 11,
    name: "Vintage London Underground Poster",
    description: "Original 1930s London Underground travel poster by Edward McKnight Kauffer",
    detailedDescription: "Iconic Art Deco travel poster promoting London Underground services, designed by renowned poster artist Edward McKnight Kauffer. Features bold geometric design and vibrant colors typical of the period.",
    price: "850.00",
    categoryId: 4,
    era: "Art Deco (1920-1940)",
    condition: "Good",
    materials: ["Lithograph", "Paper"],
    dimensions: "100cm x 65cm",
    origin: "London, England",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    isFeatured: true,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },

  // Books & Manuscripts
  {
    id: 12,
    name: "First Edition Charles Dickens",
    description: "First edition of 'Great Expectations' by Charles Dickens, 1861",
    detailedDescription: "Rare first edition of Charles Dickens' 'Great Expectations' published by Chapman & Hall in 1861. Complete in three volumes with original publisher's cloth binding. A significant piece of Victorian literature.",
    price: "2400.00",
    categoryId: 5,
    era: "Victorian (1837-1901)",
    condition: "Very Good",
    materials: ["Paper", "Cloth Binding"],
    dimensions: "19cm x 12cm",
    origin: "London, England",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    isFeatured: true,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 13,
    name: "Illuminated Medieval Manuscript Page",
    description: "Authentic 15th century illuminated manuscript leaf with gold leaf",
    detailedDescription: "Genuine 15th century manuscript leaf from a Book of Hours, featuring beautiful illuminated capitals with gold leaf and vibrant mineral pigments. Written in Latin on vellum.",
    price: "1800.00",
    categoryId: 5,
    era: "Medieval (1400-1500)",
    condition: "Good",
    materials: ["Vellum", "Gold Leaf", "Mineral Pigments"],
    dimensions: "35cm x 25cm",
    origin: "France",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },

  // Glassware
  {
    id: 14,
    name: "Waterford Crystal Decanter Set",
    description: "Vintage Waterford crystal whiskey decanter with matching glasses",
    detailedDescription: "Elegant Waterford crystal decanter set including one large decanter and six matching tumblers. Features the classic Waterford cut crystal pattern with exceptional clarity and weight.",
    price: "350.00",
    categoryId: 6,
    era: "Mid-Century (1950-1970)",
    condition: "Excellent",
    materials: ["Lead Crystal"],
    dimensions: "Decanter: 25cm H, Glasses: 9cm H",
    origin: "Ireland",
    imageUrl: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=800",
    isFeatured: false,
    isBestSeller: true,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 15,
    name: "Venetian Murano Glass Vase",
    description: "Mid-century Murano glass vase with aventurine inclusions",
    detailedDescription: "Beautiful Venetian Murano glass vase from the 1950s featuring swirling aventurine inclusions that create a stunning sparkle effect. Exemplifies the artistic mastery of Murano glassmakers.",
    price: "480.00",
    categoryId: 6,
    era: "Mid-Century (1950-1970)",
    condition: "Excellent",
    materials: ["Murano Glass", "Aventurine"],
    dimensions: "28cm H x 12cm D",
    origin: "Venice, Italy",
    imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },

  // Collectibles
  {
    id: 16,
    name: "Royal Commemorative Mug Collection",
    description: "Complete set of British Royal commemorative mugs 1953-2022",
    detailedDescription: "Comprehensive collection of official Royal commemorative mugs from the Coronation of Queen Elizabeth II in 1953 through to the Platinum Jubilee in 2022. Perfect for collectors of royal memorabilia.",
    price: "220.00",
    categoryId: 7,
    era: "20th-21st Century",
    condition: "Excellent",
    materials: ["Bone China", "Ceramic"],
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800",
    isFeatured: false,
    isBestSeller: true,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 17,
    name: "Vintage Train Set Collection",
    description: "Complete Hornby Dublo train set from the 1950s",
    detailedDescription: "Mint condition Hornby Dublo electric train set including locomotive, carriages, track, and original boxes. A wonderful example of 1950s British toy manufacturing at its finest.",
    price: "650.00",
    categoryId: 7,
    era: "Mid-Century (1950-1970)",
    condition: "Mint",
    materials: ["Die-cast Metal", "Plastic"],
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },

  // Silver & Metalware
  {
    id: 18,
    name: "Georgian Silver Tea Service",
    description: "Complete Georgian sterling silver tea service, hallmarked London 1820",
    detailedDescription: "Magnificent Georgian sterling silver tea service comprising teapot, coffee pot, sugar bowl, and cream jug. Features elegant neoclassical design with beautiful engraving and excellent provenance.",
    price: "3800.00",
    categoryId: 8,
    era: "Georgian (1714-1830)",
    condition: "Excellent",
    materials: ["Sterling Silver"],
    dimensions: "Teapot: 25cm W x 15cm H",
    origin: "London, England",
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800",
    isFeatured: true,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 19,
    name: "Arts & Crafts Pewter Charger",
    description: "Liberty & Co pewter charger in the Arts & Crafts style",
    detailedDescription: "Beautiful Arts & Crafts movement pewter charger by Liberty & Co, featuring characteristic flowing lines and stylized plant motifs. Stamped with maker's marks and in excellent condition.",
    price: "380.00",
    categoryId: 8,
    era: "Arts & Crafts (1880-1920)",
    condition: "Very Good",
    materials: ["Pewter"],
    dimensions: "35cm diameter",
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800",
    isFeatured: false,
    isBestSeller: false,
    inStock: true,
    stockQuantity: 1
  },
  {
    id: 20,
    name: "Victorian Copper Cooking Pot Set",
    description: "Set of five Victorian copper cooking pots with iron handles",
    detailedDescription: "Professional-quality Victorian copper cooking pot set originally from a country house kitchen. Each pot features hand-forged iron handles and shows the beautiful patina of age and use.",
    price: "450.00",
    categoryId: 8,
    era: "Victorian (1837-1901)",
    condition: "Good",
    materials: ["Copper", "Iron"],
    dimensions: "Various sizes: 15cm-30cm diameter",
    origin: "England",
    imageUrl: "https://images.unsplash.com/photo-1603048719539-9ecbfcb5c4d3?w=800",
    isFeatured: false,
    isBestSeller: true,
    inStock: true,
    stockQuantity: 1
  }
];

async function seedDiverseProducts() {
  try {
    console.log("🌱 Starting diverse product seeding...");

    // Insert categories
    console.log("📂 Inserting categories...");
    for (const category of categoriesData) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }

    // Insert products
    console.log("📦 Inserting products...");
    for (const product of productsData) {
      await db.insert(products).values(product).onConflictDoNothing();
    }

    console.log("✅ Successfully seeded database with diverse products!");
    console.log(`📊 Added ${categoriesData.length} categories and ${productsData.length} products`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seeding function
seedDiverseProducts();