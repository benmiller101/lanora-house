import { Link, useParams } from "wouter";
import { Helmet } from "react-helmet";
import { locationBySlug, ukAuctionLocations } from "@/data/ukAuctionLocations";
import { MapPin, Hammer, Truck, Monitor, Clock, ArrowRight, ChevronRight, Calendar, Globe } from "lucide-react";

export default function AuctionLocationPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = slug ? locationBySlug[slug] : null;

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Location Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find auction information for this location.</p>
          <Link href="/auction-locations">
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90">
              Browse All Locations
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const nearbyLocations = location.nearby
    .map(s => ukAuctionLocations.find(l => l.slug === s))
    .filter(Boolean);

  const pageTitle = `Auctions in ${location.name} | Antique & Collectible Auctions | Lanora House`;
  const metaDescription = `Looking for auctions in ${location.name}, ${location.county}? Lanora House holds monthly Wednesday auctions at 5pm with nationwide shipping to ${location.name}. Bid online or in person on antiques, collectibles & unique treasures.`;
  const canonicalUrl = `https://lanorahouse.com/auctions-in/${location.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AuctionEvent",
    "name": `Lanora House Auctions - Serving ${location.name}`,
    "description": `Monthly antique and collectible auctions with nationwide shipping to ${location.name}, ${location.county}. Bid online or attend in person.`,
    "url": canonicalUrl,
    "eventSchedule": {
      "@type": "Schedule",
      "repeatFrequency": "P1M",
      "byDay": "Wednesday",
      "startTime": "17:00",
      "scheduleTimezone": "Europe/London"
    },
    "location": {
      "@type": "Place",
      "name": "The Old Foundry Chapel",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Unit 6, Chapel Terrace",
        "addressLocality": "Hayle",
        "addressRegion": "Cornwall",
        "postalCode": "TR27 4AB",
        "addressCountry": "GB"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Lanora House",
      "url": "https://lanorahouse.com"
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "areaServed": {
        "@type": "Country",
        "name": "United Kingdom"
      }
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://lanorahouse.com" },
      { "@type": "ListItem", "position": 2, "name": "Auction Locations", "item": "https://lanorahouse.com/auction-locations" },
      { "@type": "ListItem", "position": 3, "name": `Auctions in ${location.name}`, "item": canonicalUrl }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <nav className="container mx-auto px-6 py-3 text-sm text-gray-500">
          <div className="flex items-center gap-1 flex-wrap">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/auction-locations" className="hover:text-primary">Auction Locations</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">Auctions in {location.name}</span>
          </div>
        </nav>

        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-white/80 mb-3 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{location.county} &middot; {location.region}</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Auctions in {location.name}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Looking for antique auctions near {location.name}? Lanora House holds monthly auctions 
                on the first Wednesday of every month at 5pm, with full nationwide shipping directly to {location.name}, {location.county}. 
                Bid online from the comfort of your home or visit us in person.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Monthly Auctions</h3>
              <p className="text-gray-600">First Wednesday of every month at 5pm at The Old Foundry Chapel, Hayle, Cornwall</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Live Online Bidding</h3>
              <p className="text-gray-600">Bid from {location.name} via our website or BidSpirit. Easy registration, real-time bidding</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Shipped to {location.name}</h3>
              <p className="text-gray-600">Secure nationwide shipping. Your winning lots delivered safely to your door in {location.county}</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About Lanora House Auctions — Serving {location.name}
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  Lanora House is a professional auction house based at The Old Foundry Chapel in Hayle, Cornwall. 
                  We specialise in antiques, collectibles, vintage items, and unique treasures sourced from estates, 
                  collections, and private sellers across the UK.
                </p>
                <p>
                  Although our saleroom is located in Cornwall, we proudly serve buyers and sellers in {location.name} and 
                  throughout {location.county}. With our comprehensive nationwide shipping service, winning your favourite 
                  lot is just as easy from {location.name} as it is from our saleroom floor.
                </p>
                <p>
                  Our auctions are held <strong>on the first Wednesday of every month at 5pm</strong>. Every auction features a carefully 
                  curated catalogue of items, each authenticated and estimated by our team of expert specialists. Whether you're 
                  a seasoned collector, a dealer looking for stock, or simply searching for something special, our auctions 
                  offer something for everyone.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to Bid from {location.name}</h3>
                <p>
                  Bidding with Lanora House couldn't be easier. You have several options:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Live Online Bidding</strong> — Register on our website and bid in real-time during the auction from anywhere in {location.name}</li>
                  <li><strong>BidSpirit</strong> — Our partner platform for live auction bidding with an easy-to-use interface</li>
                  <li><strong>Telephone Bidding</strong> — Call ahead and our team will bid on your behalf during the auction</li>
                  <li><strong>Commission Bidding</strong> — Leave your maximum bid with us and we'll execute it during the sale</li>
                  <li><strong>In Person</strong> — Visit our saleroom at The Old Foundry Chapel, Hayle, Cornwall</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Selling from {location.name}?</h3>
                <p>
                  Have antiques, collectibles, or valuables you'd like to sell? We welcome consignments from {location.name} and 
                  all across {location.county}. Our expert team provides free valuations and can arrange collection of larger 
                  items. We achieve excellent prices for our sellers thanks to our extensive network of buyers both locally 
                  and internationally.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Buyer's Premium</h3>
                <p>
                  Our tiered buyer's premium ranges from 10% to 15%, ensuring competitive rates for all buyers. 
                  Full details are available in our auction terms and conditions.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              <Link href="/auctions">
                <div className="bg-primary text-white rounded-xl p-6 hover:bg-primary/90 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">Browse Auctions</h3>
                      <p className="text-white/80 text-sm">View upcoming catalogues and bid online</p>
                    </div>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              <Link href="/auctions?tab=selling">
                <div className="bg-white border-2 border-primary text-primary rounded-xl p-6 hover:bg-primary/5 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1">Sell With Us</h3>
                      <p className="text-primary/70 text-sm">Get a free valuation for your items</p>
                    </div>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              <Link href="/contact">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">Contact Us</h3>
                      <p className="text-gray-500 text-sm">Get in touch with our team</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              <Link href="/clearance">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">Clearance Services</h3>
                      <p className="text-gray-500 text-sm">House clearance across the UK</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {nearbyLocations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Auctions Near {location.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  Also serving these areas near {location.name}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {nearbyLocations.map((nearby) => nearby && (
                    <Link
                      key={nearby.slug}
                      href={`/auctions-in/${nearby.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-lg text-sm text-gray-700 transition-colors border"
                    >
                      <MapPin className="h-3 w-3" />
                      {nearby.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/auction-locations" className="text-primary hover:underline text-sm">
              View all auction locations across the UK
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
