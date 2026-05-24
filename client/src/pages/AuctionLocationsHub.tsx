import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { ukAuctionLocations, locationsByRegion } from "@/data/ukAuctionLocations";
import { MapPin, Hammer, ArrowRight } from "lucide-react";

const regionOrder = [
  "South West", "South East", "London", "East of England",
  "West Midlands", "East Midlands", "North West", "Yorkshire",
  "North East", "Wales", "Scotland"
];

export default function AuctionLocationsHub() {
  return (
    <>
      <Helmet>
        <title>Auction Locations Across the UK | Lanora House Auctions</title>
        <meta name="description" content="Find Lanora House auctions near you. We ship nationwide across the UK. Browse our auction coverage areas and bid online from anywhere. Monthly Saturday auctions at 10am — online only." />
        <meta property="og:title" content="Auction Locations Across the UK | Lanora House" />
        <meta property="og:description" content="Find antique and collectible auctions near you. Lanora House ships nationwide with live online bidding available from anywhere in the UK." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://lanorahouse.com/auction-locations" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Auctions Across the UK
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Based at The Old Foundry Chapel in Hayle, Cornwall, Lanora House ships nationwide. 
              Wherever you are in the UK, you can bid on our expertly curated antiques, collectibles, and unique treasures.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/90">
              <div className="flex items-center gap-2">
                <Hammer className="h-5 w-5" />
                <span>Monthly Saturday Auctions at 10am — Online Only</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Nationwide Shipping</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Auctions Near You</h2>
            <p className="text-gray-600 text-lg">
              We cover {ukAuctionLocations.length}+ locations across the United Kingdom. 
              Select your area below to learn more about our auction services in your region.
            </p>
          </div>

          <div className="space-y-10">
            {regionOrder.map((region) => {
              const locations = locationsByRegion[region];
              if (!locations || locations.length === 0) return null;

              const sortedLocations = [...locations].sort((a, b) => a.name.localeCompare(b.name));

              return (
                <div key={region}>
                  <h3 className="text-xl font-bold text-primary mb-4 border-b-2 border-primary/20 pb-2">
                    {region}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                    {sortedLocations.map((loc) => (
                      <Link
                        key={loc.slug}
                        href={`/auctions-in/${loc.slug}`}
                        className="text-gray-700 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-md transition-colors text-sm flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3 flex-shrink-0 text-primary/40" />
                        {loc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-white rounded-xl shadow-sm border p-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find Your Location?
            </h2>
            <p className="text-gray-600 mb-6">
              Don't worry - we ship to every corner of the UK. No matter where you are, 
              you can bid online and have items delivered safely to your door.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auctions">
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                  Browse Auctions <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
