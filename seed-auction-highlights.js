import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config();
const sql = neon(process.env.DATABASE_URL);

const BASE = 'https://www.easyliveauction.com';

const highlights = [
  // Upcoming
  {
    title: 'Curated Estate Auction: 1000+ Egg Cups, Xena and Star Wars Collectibles, Silver Plate, Bronze and Porcelain Figurines',
    description: 'A rare opportunity to acquire pieces from a thoughtfully assembled private collection, spanning decades of devoted gathering and quirky enthusiasm. This curated estate auction brings together an eclectic mix of treasures with something for every kind of collector.',
    imageUrl: '/uploads/auction-catalogs/catalog-1779626061935-6e67fe4ab956.jpeg',
    ctaUrl: `${BASE}/catalogue/c9b7b4f12858297355470c3aa11cb54a/0af8d24542e81eb9357e7ef448a6646f/curated-estate-auction-1000-egg-cups-xena-and-star-wars-c/`,
    auctionDate: '2026-05-30T10:00:00Z',
    auctionTime: '10:00 AM',
    badgeText: 'Featured Auction',
    displayOrder: 1,
    isActive: true,
  },
  // Previous auctions (newest first)
  {
    title: 'General Auction — Vintage Computer Games, Studio Pottery, Household, Die-Cast Toys, Ceramics, Stamp Collections & More',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/de3f7abc73bda88d148c2c5ba1ac807d/0af8d24542e81eb9357e7ef448a6646f/general-auction-to-include-vintage-computer-games-studio-po/`,
    auctionDate: '2026-04-04T10:00:00Z',
    auctionTime: '10:00 AM',
    badgeText: 'Completed',
    displayOrder: 10,
    isActive: true,
  },
  {
    title: 'Timed General Auction — Jewellery, Gold, Silver, Antiques, Artwork, Studio Pottery, Vintage Electronics, Furniture & More',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/b02c017e05bf4e2ade7b08f7170150a8/0af8d24542e81eb9357e7ef448a6646f/timed-general-auction-to-include-jewellery-gold-silver-an/`,
    auctionDate: '2026-03-23T18:30:00Z',
    auctionTime: '6:30 PM',
    badgeText: 'Completed',
    displayOrder: 11,
    isActive: true,
  },
  {
    title: 'General Auction — Jewellery, Gold, Silver, Antiques, Artwork, Studio Pottery, Vintage Electronics, Furniture & More',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/4659b5315cc528191cf8220eebc60549/0af8d24542e81eb9357e7ef448a6646f/general-auction-to-include-jewellery-gold-silver-antiques/`,
    auctionDate: '2026-03-21T10:30:00Z',
    auctionTime: '10:30 AM',
    badgeText: 'Completed',
    displayOrder: 12,
    isActive: true,
  },
  {
    title: 'Art, Antiques & Collectables — Star Wars, Xena & Lucy Lawless Collection, Elvis, Cornish Studio Pottery, Decorative Arts, Paintings, Ceramics & More',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/168573454881cbd5c19fc07539597e04/0af8d24542e81eb9357e7ef448a6646f/art-antiques-collectables-star-wars-pop-culture-inc-xen/`,
    auctionDate: '2026-02-25T10:00:00Z',
    auctionTime: '10:00 AM',
    badgeText: 'Completed',
    displayOrder: 13,
    isActive: true,
  },
  {
    title: 'Timed Art, Antiques & Collectables — Star Wars, Xena & Lucy Lawless Collection, Elvis, Cornish Studio Pottery, Decorative Arts, Paintings, Ceramics & More',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/1e0740fdf3f103bd46218d119693cdf6/0af8d24542e81eb9357e7ef448a6646f/timed-art-antiques-collectables-star-wars-pop-culture-in/`,
    auctionDate: '2026-02-22T19:00:00Z',
    auctionTime: '7:00 PM',
    badgeText: 'Completed',
    displayOrder: 14,
    isActive: true,
  },
  {
    title: 'Live Auction — Art, Antiques & Collectables, Star Wars, Xena & Lucy Lawless Collection, Elvis, Cornish Studio Pottery, Decorative Arts, Paintings, Ceramics & More',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/15a01b69af6e75a81a716bfd1bb553fc/0af8d24542e81eb9357e7ef448a6646f/live-auction-of-art-antiques-collectables-star-wars-pop/`,
    auctionDate: '2026-02-21T10:00:00Z',
    auctionTime: '10:00 AM',
    badgeText: 'Completed',
    displayOrder: 15,
    isActive: true,
  },
  {
    title: 'Gold, Silver & Diamond Jewellery, Furniture, Art, Antiques, Interiors & Vintage Collectables',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/82f01f22cd88fe6af305c41bf03a6d7c/0af8d24542e81eb9357e7ef448a6646f/gold-silver-diamond-jewellery-furniture-art-antiques-i/`,
    auctionDate: '2026-01-29T19:00:00Z',
    auctionTime: '7:00 PM',
    badgeText: 'Completed',
    displayOrder: 16,
    isActive: true,
  },
  {
    title: 'Something for Everyone Sale — Gold, Silver & Diamond Jewellery, Furniture, Art, Antiques, Interiors & Vintage Collectables',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/2b0ba0a7c40fdeb967abec1185e39163/0af8d24542e81eb9357e7ef448a6646f/something-for-everyone-sale-gold-silver-diamond-jewellery/`,
    auctionDate: '2026-01-28T17:30:00Z',
    auctionTime: '5:30 PM',
    badgeText: 'Completed',
    displayOrder: 17,
    isActive: true,
  },
  {
    title: 'Fine Jewellery, Gold, Silver & Watches',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/36b45c18436c98a701a97af62e0dd4d5/0af8d24542e81eb9357e7ef448a6646f/fine-jewellery-gold-silver-watches/`,
    auctionDate: '2026-01-27T17:30:00Z',
    auctionTime: '5:30 PM',
    badgeText: 'Completed',
    displayOrder: 18,
    isActive: true,
  },
  {
    title: 'The December Grand Finale — Fine Jewellery, Art, Antiques, Gold & Collectables',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/03bc0f785dd29802df9af2b5dc93d4ee/0af8d24542e81eb9357e7ef448a6646f/the-december-grand-finale-fine-jewellery-art-antiques-go/`,
    auctionDate: '2025-12-23T10:00:00Z',
    auctionTime: '10:00 AM',
    badgeText: 'Completed',
    displayOrder: 19,
    isActive: true,
  },
  {
    title: 'Christmas Auction — Antiques & Collectables, Artwork, Vintage Toys, Gold & Silver, Posters, Hi-Fi, Electronics & More',
    description: null,
    imageUrl: null,
    ctaUrl: `${BASE}/catalogue/298238500ee3773ec6134b50fe326a20/0af8d24542e81eb9357e7ef448a6646f/christmas-auction-antiques-collectables-artwork-vintage/`,
    auctionDate: '2025-12-17T17:30:00Z',
    auctionTime: '5:30 PM',
    badgeText: 'Completed',
    displayOrder: 20,
    isActive: true,
  },
];

async function run() {
  console.log(`Inserting ${highlights.length} auction highlights...`);

  for (const h of highlights) {
    await sql`
      INSERT INTO auction_highlights
        (title, description, image_url, cta_url, auction_date, auction_time, badge_text, display_order, is_active)
      VALUES
        (${h.title}, ${h.description}, ${h.imageUrl}, ${h.ctaUrl}, ${h.auctionDate}, ${h.auctionTime}, ${h.badgeText}, ${h.displayOrder}, ${h.isActive})
    `;
    console.log(`  ✓ ${h.title.slice(0, 60)}...`);
  }

  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
