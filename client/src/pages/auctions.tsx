import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import SEOHead from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  FiCalendar,
  FiPackage,
  FiArrowRight,
  FiClock,
  FiSearch,
  FiCamera,
  FiMail,
  FiPhone,
  FiTruck,
  FiShield,
  FiMapPin,
  FiCheck,
  FiX,
  FiBox,
  FiGlobe
} from "react-icons/fi";
import { Coins, Clock, MapPin, Eye, Package, Gavel } from "lucide-react";
import chapelImagePath from "@assets/Hayle-Foundry-Chapel_1771883333378.jpg";
import auctionHeroBg from "@assets/Downstairs_Auction_1774377787346.png";
import AuctionCountdown from "@/components/auction/AuctionCountdown";
import { getAllShippingBands } from "@shared/shipping-bands";
import { FindUsModal } from "@/components/location/FindUsModal";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type AuctionCatalogue = {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate?: string | null; // Optional - end time varies during live auction
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  imageUrl: string | null;
  location: string | null;
  viewingStartDate: string | null;
  viewingEndDate: string | null;
  auctionType: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuctionLot = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  lotNumber: number;
  catalogId: string;
  status: string | null;
  era: string | null;
  condition: string | null;
  provenance: string | null;
  estimatedValueLow: string | null;
  estimatedValueHigh: string | null;
};

type AuctionHighlight = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ctaUrl: string;
  auctionDate: string;
  auctionTime: string | null;
  viewingInfo: string | null;
  badgeText: string | null;
  displayOrder: number | null;
  isActive: boolean | null;
};

export default function AuctionsPage() {
  const [location, setLocationNav] = useLocation();
  
  // Read tab from URL parameter on mount
  const getInitialAuctionTab = (): 'upcoming' | 'previous' => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'previous') return 'previous';
    return 'upcoming';
  };

  const getInitialSellerTab = (): 'commission' | 'selling' | 'shipping' => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'selling' || tab === 'commission' || tab === 'shipping') return tab;
    return 'commission';
  };

  const [auctionTab, setAuctionTab] = useState<'upcoming' | 'previous'>(getInitialAuctionTab());
  const [sellerTab, setSellerTab] = useState<'commission' | 'selling' | 'shipping'>(getInitialSellerTab());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'previous') setAuctionTab('previous');
    else if (tab === 'upcoming' || tab === null) setAuctionTab('upcoming');
    if (tab === 'selling' || tab === 'commission' || tab === 'shipping') setSellerTab(tab);
  }, [location]);

  // Fetch all active catalogues
  const { data: catalogues = [], isLoading } = useQuery<AuctionCatalogue[]>({
    queryKey: ['/api/auction-catalogues'],
    staleTime: 10000,
  });

  const { data: upcomingHighlights = [], isLoading: highlightsLoading } = useQuery<AuctionHighlight[]>({
    queryKey: ['/api/auction-highlights', 'upcoming'],
    queryFn: () => fetch('/api/auction-highlights?type=upcoming').then(r => r.json()),
    staleTime: 10000,
  });

  const { data: previousHighlights = [], isLoading: previousLoading } = useQuery<AuctionHighlight[]>({
    queryKey: ['/api/auction-highlights', 'previous'],
    queryFn: () => fetch('/api/auction-highlights?type=previous').then(r => r.json()),
    staleTime: 10000,
  });

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Sort all catalogues by date (most recent first)
  const sortedCatalogues = [...catalogues].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateB - dateA; // Most recent first
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white" data-testid={`badge-status-active`}>Live Now</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" data-testid={`badge-status-scheduled`}>Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline" data-testid={`badge-status-completed`}>Completed</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
    }
  };

  const CatalogueCard = ({ catalogue }: { catalogue: AuctionCatalogue }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300" data-testid={`card-catalogue-${catalogue.id}`}>
      <div className="aspect-video w-full bg-neutral-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
          <Gavel className="w-12 h-12 text-primary/25" />
          <p className="text-primary/30 text-xs font-medium">Lanora House Auctions</p>
        </div>
        {catalogue.imageUrl && (
          <img
            src={catalogue.imageUrl}
            alt={catalogue.name}
            className="absolute inset-0 w-full h-full object-cover"
            data-testid={`img-catalogue-${catalogue.id}`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div className="absolute top-4 right-4">
          {getStatusBadge(catalogue.status)}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-2xl font-display" data-testid={`text-catalogue-name-${catalogue.id}`}>
          {catalogue.name}
        </CardTitle>
        <CardDescription data-testid={`text-catalogue-desc-${catalogue.id}`}>
          {catalogue.description || 'No description available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {catalogue.status === 'scheduled' ? (
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Auction starts in:
              </div>
              <AuctionCountdown startDate={catalogue.startDate} showIcon={false} auctionLink={`/auctions/${catalogue.id}`} />
            </div>
          ) : catalogue.status === 'active' ? (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-semibold">
              <FiClock className="mr-2 animate-pulse" />
              <span data-testid={`text-date-${catalogue.id}`}>
                LIVE NOW - Started {formatDate(catalogue.startDate)}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              <FiCalendar className="mr-2" />
              <span data-testid={`text-date-${catalogue.id}`}>
                {catalogue.status === 'completed' ? 'Completed' : 'Starts'}: {formatDate(catalogue.startDate)}
              </span>
            </div>
          )}
          {catalogue.location && (
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              <FiPackage className="mr-2" />
              <span data-testid={`text-location-${catalogue.id}`}>{catalogue.location}</span>
            </div>
          )}
          {catalogue.viewingStartDate && catalogue.viewingEndDate && (
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
              <FiClock className="mr-2" />
              <span data-testid={`text-viewing-${catalogue.id}`}>
                Viewing: {formatDate(catalogue.viewingStartDate)} - {formatDate(catalogue.viewingEndDate)}
              </span>
            </div>
          )}
          <Separator className="my-4" />
          <Button 
            className="w-full" 
            onClick={() => setLocationNav(`/auctions/${catalogue.id}`)}
            data-testid={`button-view-catalogue-${catalogue.id}`}
          >
            View Catalogue <FiArrowRight className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEOHead
        title="Auctions - Browse Catalogues & Bid Online"
        description="Browse our auction catalogues featuring fine antiques, collectibles, and more. Participate in live auctions and discover unique treasures at Lanora House."
        path="/auctions"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Event",
          "name": "Lanora House Auctions",
          "description": "Browse our auction catalogues featuring fine antiques, collectibles, and more. Participate in live auctions and discover unique treasures at Lanora House.",
          "organizer": {
            "@type": "Organization",
            "name": "Lanora House"
          },
          "location": {
            "@type": "Place",
            "name": "The Old Foundry Chapel, Hayle, Cornwall"
          },
          "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
          "eventStatus": "https://schema.org/EventScheduled"
        }}
      />

      <div className="bg-neutral-ivory dark:bg-neutral-900 min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[calc(100vh-5rem)] overflow-hidden flex items-center justify-center text-center px-4">
          <div className="absolute inset-0 bg-center bg-cover blur-[3px] scale-105 grayscale" style={{ backgroundImage: `url(${auctionHeroBg})` }} />
          <div className="absolute inset-0 bg-[#111138]/90" />
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="inline-flex items-center gap-1.5 mb-4 bg-secondary/20 text-secondary border border-secondary/60 text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
              <FiMapPin className="w-3.5 h-3.5" />
              First Wednesday Monthly &middot; Hayle, Cornwall
            </span>
            <h1 className="font-display text-3xl md:text-[3rem] leading-tight text-white mb-4 drop-shadow-lg" data-testid="text-page-title">
              Auction <span className="text-secondary">&amp; Fine Collectibles</span>
            </h1>
            <p className="text-neutral-200 text-base md:text-lg mb-3 font-light max-w-lg mx-auto leading-relaxed" data-testid="text-page-description">
              Discover exceptional antiques, art, and treasures at The Old Foundry Chapel, Hayle — or consign your items with us for our next sale.
            </p>
            <p className="text-white/50 text-xs md:text-sm mb-8 tracking-wide">
              Bid online or in person &middot; Furniture, art, silver, jewellery &amp; everyday treasures
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
              <a
                href="/contact"
                className="bg-white hover:bg-neutral-100 text-primary py-2.5 px-7 rounded-md transition-colors font-semibold text-center text-base shadow-md"
              >
                Get Free Valuation
              </a>
              <a
                href="#auction-tabs"
                className="border border-white/50 hover:bg-white/10 text-white/90 py-2.5 px-7 rounded-md transition-colors font-medium text-center text-base"
              >
                Browse Auctions
              </a>
            </div>
          </div>
          <button
            onClick={() => { const el = document.getElementById('auction-tabs'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll to auctions"
          >
            <span className="text-xs tracking-widest uppercase">View Auctions</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </section>

        {/* Auctions Tab Group */}
        <section id="auction-tabs" className="py-12">
          <div className="container mx-auto px-4">
            <Tabs value={auctionTab} onValueChange={(v) => setAuctionTab(v as 'upcoming' | 'previous')} className="w-full">
              <TabsList className="grid w-full max-w-xl mx-auto mb-12 h-14 grid-cols-2 bg-neutral-100 p-1 rounded-xl" data-testid="tabslist-auctions">
                <TabsTrigger value="upcoming" className="text-base md:text-lg font-semibold py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all" data-testid="tab-upcoming">
                  Upcoming Auctions
                </TabsTrigger>
                <TabsTrigger value="previous" className="text-base md:text-lg font-semibold py-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all" data-testid="tab-previous">
                  Previous Auctions
                </TabsTrigger>
              </TabsList>

              {/* Upcoming Auctions Tab */}
              <TabsContent value="upcoming" className="mt-0">
                <div className="py-4">
                  {highlightsLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <div className="aspect-video bg-neutral-200 dark:bg-neutral-800"></div>
                          <CardContent className="p-6">
                            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : upcomingHighlights.length === 0 ? (
                    <div className="space-y-8">
                      <a
                        href="https://www.easyliveauction.com/catalogue/4659b5315cc528191cf8220eebc60549/0af8d24542e81eb9357e7ef448a6646f/general-auction-to-include-jewellery-gold-silver-antiques/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40 cursor-pointer">
                          <div className="flex flex-col md:flex-row md:h-[320px]">
                            <div className="md:w-2/5 flex-shrink-0 h-[200px] md:h-full">
                              <img
                                src="https://d2zofuu73zurgl.cloudfront.net/lanora/auctionsImages/250_v1.jpg"
                                alt="General Auction — Jewellery, Gold, Silver, Antiques, Artwork & More"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <CardContent className="p-6 flex flex-col justify-center md:w-3/5">
                              <div className="flex items-center gap-2 mb-3">
                                <FiCalendar className="w-6 h-6 text-primary" />
                                <span className="font-display text-2xl md:text-3xl text-primary font-bold">
                                  6th May 2026
                                </span>
                              </div>
                              <Badge className="bg-amber-500 text-white mb-3 w-fit">
                                Coming Soon
                              </Badge>
                              <h2 className="font-display text-lg md:text-xl text-neutral-800 dark:text-neutral-200 mb-3">
                                General Auction — Jewellery, Gold, Silver, Antiques, Artwork, Studio Pottery, Vintage Electronics, Furniture &amp; More
                              </h2>
                              <p className="text-base text-neutral-700 dark:text-neutral-300 mb-4">
                                Browse the full catalogue and register to bid at our upcoming general auction. Lots include jewellery, gold, silver, antiques, artwork, studio pottery, vintage electronics and furniture.
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-neutral-600 dark:text-neutral-400">
                                <div className="flex items-center gap-2">
                                  <FiClock className="w-5 h-5" />
                                  <span className="font-medium text-sm">5:00 PM — The Old Foundry Chapel, Hayle, Cornwall</span>
                                </div>
                                <span className="text-primary text-sm font-semibold underline underline-offset-2">View Full Catalogue →</span>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {upcomingHighlights.map((highlight) => {
                        let formattedDate = '';
                        try {
                          const date = new Date(highlight.auctionDate);
                          if (!isNaN(date.getTime())) {
                            formattedDate = format(date, 'do MMMM yyyy');
                          }
                        } catch {
                          formattedDate = '';
                        }
                        
                        return (
                          <a 
                            key={highlight.id}
                            href={highlight.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                            data-testid={`link-auction-highlight-${highlight.id}`}
                          >
                            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40">
                              <div className="flex flex-col md:flex-row md:h-[320px]">
                                <div className="md:w-2/5 flex-shrink-0 h-[200px] md:h-full relative overflow-hidden bg-neutral-100">
                                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                    <Gavel className="w-14 h-14 text-primary/25" />
                                    <p className="text-primary/30 text-xs font-medium">Lanora House Auctions</p>
                                  </div>
                                  {highlight.imageUrl && (
                                    <img
                                      src={highlight.imageUrl}
                                      alt={highlight.title}
                                      className="absolute inset-0 w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  )}
                                </div>
                                <CardContent className="p-6 flex flex-col justify-center md:w-3/5">
                                  {formattedDate && (
                                    <div className="flex items-center gap-2 mb-3">
                                      <FiCalendar className="w-6 h-6 text-primary" />
                                      <span className="font-display text-2xl md:text-3xl text-primary font-bold">
                                        {formattedDate}
                                        {highlight.auctionTime && ` at ${highlight.auctionTime}`}
                                      </span>
                                    </div>
                                  )}
                                  <Badge className="bg-primary text-white mb-3 w-fit">
                                    {highlight.badgeText || "Featured Auction"}
                                  </Badge>
                                  <h2 className="font-display text-lg md:text-xl text-neutral-800 dark:text-neutral-200 mb-3">
                                    {highlight.title}
                                  </h2>
                                  {highlight.description && (
                                    <p className="text-base text-neutral-700 dark:text-neutral-300 mb-4">
                                      {highlight.description}
                                    </p>
                                  )}
                                  {highlight.viewingInfo && (
                                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                      <FiClock className="w-5 h-5" />
                                      <span className="font-medium text-sm">
                                        Viewing: {highlight.viewingInfo}
                                      </span>
                                    </div>
                                  )}
                                </CardContent>
                              </div>
                            </Card>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Previous Auctions Tab */}
              <TabsContent value="previous" className="mt-0">
                <div className="py-4">
                  {previousLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <div className="aspect-video bg-neutral-200 dark:bg-neutral-800"></div>
                          <CardContent className="p-6">
                            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : previousHighlights.length > 0 ? (
                    <div className="space-y-8">
                      {previousHighlights.map((highlight) => {
                        let formattedDate = '';
                        try {
                          const date = new Date(highlight.auctionDate);
                          if (!isNaN(date.getTime())) {
                            formattedDate = format(date, 'do MMMM yyyy');
                          }
                        } catch {
                          formattedDate = '';
                        }
                        
                        return (
                          <a 
                            key={highlight.id}
                            href={highlight.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-neutral-200 hover:border-primary/40">
                              <div className="flex flex-col md:flex-row md:h-[320px]">
                                <div className="md:w-2/5 flex-shrink-0 h-[200px] md:h-full relative overflow-hidden bg-neutral-100">
                                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                    <Gavel className="w-14 h-14 text-primary/25" />
                                    <p className="text-primary/30 text-xs font-medium">Lanora House Auctions</p>
                                  </div>
                                  {highlight.imageUrl && (
                                    <img
                                      src={highlight.imageUrl}
                                      alt={highlight.title}
                                      className="absolute inset-0 w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  )}
                                </div>
                                <CardContent className="p-6 flex flex-col justify-center md:w-3/5">
                                  {formattedDate && (
                                    <div className="flex items-center gap-2 mb-3">
                                      <FiCalendar className="w-6 h-6 text-neutral-500" />
                                      <span className="font-display text-2xl md:text-3xl text-neutral-600 font-bold">
                                        {formattedDate}
                                      </span>
                                    </div>
                                  )}
                                  <Badge variant="outline" className="mb-3 w-fit">
                                    Completed
                                  </Badge>
                                  <h2 className="font-display text-lg md:text-xl text-neutral-800 dark:text-neutral-200 mb-3">
                                    {highlight.title}
                                  </h2>
                                  {highlight.description && (
                                    <p className="text-base text-neutral-700 dark:text-neutral-300 mb-4">
                                      {highlight.description}
                                    </p>
                                  )}
                                  <Button variant="outline" className="w-fit">
                                    View Results <FiArrowRight className="ml-2" />
                                  </Button>
                                </CardContent>
                              </div>
                            </Card>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}

                  <div className="max-w-2xl mx-auto text-center mt-8">
                    <a
                      href="https://auctions.lanorahouse.com/past-auctions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/40">
                        <CardContent className="p-8">
                          <FiCalendar className="w-16 h-16 mx-auto text-primary mb-4" />
                          <h3 className="font-display text-2xl text-primary mb-3">View All Past Auction Results</h3>
                          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            See hammer prices, sold lots, and full results from all our completed auctions.
                          </p>
                          <Button className="text-lg px-8">
                            View Previous Auctions <FiArrowRight className="ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </a>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Separator between tab groups */}
        <div className="container mx-auto px-4">
          <Separator className="my-0" />
        </div>

        {/* Sellers Tab Group */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl text-primary">Auction Information</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">Everything you need to know about buying, selling, and shipping at Lanora House</p>
            </div>
            <Tabs value={sellerTab} onValueChange={(v) => setSellerTab(v as 'selling' | 'commission' | 'shipping')} className="w-full">
              <TabsList className="grid w-full max-w-lg mx-auto mb-12 h-14 grid-cols-3 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-xl gap-1" data-testid="tabslist-sellers">
                <TabsTrigger value="commission" className="text-sm md:text-base font-semibold py-3 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-neutral-500 data-[state=inactive]:hover:text-primary" data-testid="tab-commission">
                  Buying
                </TabsTrigger>
                <TabsTrigger value="selling" className="text-sm md:text-base font-semibold py-3 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-neutral-500 data-[state=inactive]:hover:text-primary" data-testid="tab-selling">
                  Selling
                </TabsTrigger>
                <TabsTrigger value="shipping" className="text-sm md:text-base font-semibold py-3 rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-neutral-500 data-[state=inactive]:hover:text-primary" data-testid="tab-shipping">
                  Shipping
                </TabsTrigger>
              </TabsList>

              {/* Selling With Lanora House Tab */}
              <TabsContent value="selling" className="mt-0">
                <div className="max-w-5xl mx-auto">

                  {/* Introduction */}
                  <div className="text-center mb-12">
                    <h2 className="font-display text-4xl md:text-5xl text-primary mb-5" data-testid="text-selling-title">
                      Selling With Lanora House
                    </h2>
                    <p className="text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                      Competitive rates, expert appraisals, and a trusted buyer network — everything you need to achieve the best possible price.
                    </p>
                  </div>

                  <div className="space-y-10">

                    {/* 1. Commission Structure — moved to top */}
                    <Card className="bg-secondary/10 border-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                          <Coins className="w-8 h-8" />
                          Tiered Seller's Commission
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          You keep more as your hammer price rises
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Tier 1 */}
                          <div className="bg-primary rounded-xl px-4 py-8 flex flex-col items-center text-center shadow-md">
                            <div className="font-display text-5xl font-bold text-white leading-none">11%</div>
                            <div className="text-secondary/90 text-base font-semibold mt-3 leading-tight">Up to £500</div>
                          </div>
                          {/* Tier 2 */}
                          <div className="bg-primary rounded-xl px-4 py-8 flex flex-col items-center text-center shadow-md">
                            <div className="font-display text-5xl font-bold text-white leading-none">9%</div>
                            <div className="text-secondary/90 text-base font-semibold mt-3 leading-tight">£500 – £1,000</div>
                          </div>
                          {/* Tier 3 */}
                          <div className="bg-primary rounded-xl px-4 py-8 flex flex-col items-center text-center shadow-md">
                            <div className="font-display text-5xl font-bold text-white leading-none">6.5%</div>
                            <div className="text-secondary/90 text-base font-semibold mt-3 leading-tight">£1,000 – £3,000</div>
                          </div>
                          {/* Tier 4 */}
                          <div className="bg-primary rounded-xl px-4 py-8 flex flex-col items-center text-center shadow-md">
                            <div className="font-display text-5xl font-bold text-white leading-none">4.5%</div>
                            <div className="text-secondary/90 text-base font-semibold mt-3 leading-tight">Over £3,000</div>
                          </div>
                        </div>

                        <div className="bg-primary/10 rounded-lg p-5 border border-primary/20">
                          <h4 className="font-semibold text-base text-primary mb-3">Additional Fees</h4>
                          <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 text-base">
                            <li className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span><strong>£2 lotting fee</strong> per item — only charged if your item sells</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span><strong>£5 lotting fee</strong> for large or bulky items requiring a two-man lift</span>
                            </li>
                          </ul>
                          <p className="text-neutral-600 dark:text-neutral-400 text-base mt-4">
                            No hidden fees. All charges are itemised in your post-sale statement.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. Why Choose Lanora House */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-3xl font-display text-primary">
                          Why Choose Lanora House?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiSearch className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base text-primary mb-1">Expert Knowledge</h4>
                              <p className="text-neutral-700 dark:text-neutral-300 text-base">
                                Decades of combined expertise in antiques and collectibles — accurate valuations you can trust.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiPackage className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base text-primary mb-1">Wide Reach</h4>
                              <p className="text-neutral-700 dark:text-neutral-300 text-base">
                                A strong online presence and established buyer network give your items maximum visibility.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiCamera className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base text-primary mb-1">Professional Presentation</h4>
                              <p className="text-neutral-700 dark:text-neutral-300 text-base">
                                High-quality photography and thorough cataloguing showcase every item at its best.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                              <Coins className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base text-primary mb-1">Best Prices</h4>
                              <p className="text-neutral-700 dark:text-neutral-300 text-base">
                                Targeted marketing and a committed buyer base drive competitive hammer prices.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 3. Three Step Process */}
                    <div>
                      <h3 className="font-display text-2xl text-primary text-center mb-8">How It Works</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                          <CardHeader>
                            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-3 mx-auto">
                              <FiSearch className="w-7 h-7 text-white" />
                            </div>
                            <CardTitle className="text-xl font-display text-center text-primary">
                              1. Valuation
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <p className="text-neutral-700 dark:text-neutral-300 text-base">
                              Submit photos via our online form or WhatsApp. Our specialists provide a free estimated auction value.
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                          <CardHeader>
                            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-3 mx-auto">
                              <FiCamera className="w-7 h-7 text-white" />
                            </div>
                            <CardTitle className="text-xl font-display text-center text-primary">
                              2. Tailored Sale
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <p className="text-neutral-700 dark:text-neutral-300 text-base">
                              We research, photograph, and catalogue your item, then place it in the next appropriate sale with a confirmed estimate.
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                          <CardHeader>
                            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-3 mx-auto">
                              <Coins className="w-7 h-7 text-white" />
                            </div>
                            <CardTitle className="text-xl font-display text-center text-primary">
                              3. Payment
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <p className="text-neutral-700 dark:text-neutral-300 text-base">
                              Within fourteen working days of the sale you receive a post-sale statement and payment by bank transfer.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* 4. Free Valuation */}
                    <Card className="bg-secondary/10 border-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                          <FiSearch className="w-8 h-8" />
                          Free Appraisal Service
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <p className="text-neutral-700 dark:text-neutral-300 text-base">
                          Submit details and photos via our online valuation form or WhatsApp — we'll come back with an honest estimated auction value at no charge.
                        </p>

                        <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-primary/20">
                          <h3 className="text-lg font-semibold text-primary mb-3">
                            Prefer a Face-to-Face Valuation?
                          </h3>
                          <p className="text-neutral-700 dark:text-neutral-300 text-base mb-4">
                            We offer complimentary appointments at our location or, for larger collections, at your home.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <a
                              href="tel:+447843930927"
                              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                              data-testid="link-phone-valuation"
                            >
                              <FiPhone className="w-5 h-5" />
                              <span className="font-medium text-base">+44 7843 930927</span>
                            </a>
                            <a
                              href="mailto:info@lanorahouse.com"
                              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                              data-testid="link-email-valuation"
                            >
                              <FiMail className="w-5 h-5" />
                              <span className="font-medium text-base">info@lanorahouse.com</span>
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 5. Tailoring the Sale */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                          <FiCamera className="w-8 h-8" />
                          Tailoring the Sale
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-neutral-700 dark:text-neutral-300 text-base">
                          Once consigned, our team researches, catalogues, and photographs your items before placing them in the right sale. You'll receive a pre-sale confirmation with the auction date and estimated value range.
                        </p>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-primary/20">
                            <h3 className="text-base font-semibold text-primary mb-2">Targeted Marketing</h3>
                            <p className="text-neutral-700 dark:text-neutral-300 text-base">
                              Tailored ads, social posts, and promotions reach a global audience of serious buyers.
                            </p>
                          </div>

                          <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-primary/20">
                            <h3 className="text-base font-semibold text-primary mb-2">Reserve Price Protection</h3>
                            <p className="text-neutral-700 dark:text-neutral-300 text-base">
                              Set a minimum price — your item only sells if bidding meets or exceeds the reserve.
                            </p>
                          </div>

                          <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-primary/20">
                            <h3 className="text-base font-semibold text-primary mb-2">Shop Listing Option</h3>
                            <p className="text-neutral-700 dark:text-neutral-300 text-base">
                              If unsold after two cycles, we can list it in our shop — stored, photographed, and marketed on your behalf.
                            </p>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
                              Note: a 10% withdrawal penalty applies if you later request removal from the shop.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 6. Clearance Fee Callout — more prominent */}
                    <div className="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded-r-xl p-6 dark:border-amber-500">
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiBox className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-display text-xl font-semibold text-amber-800 dark:text-amber-300 mb-2">
                            Selling Items from a House Clearance?
                          </h4>
                          <p className="text-amber-900 dark:text-amber-200 text-base leading-relaxed mb-3">
                            Clearance-sourced lots carry different commission rates — packing, transport, and on-site discovery involve additional work not present in standard consignments.
                          </p>
                          <Link href="/clearance" className="inline-flex items-center gap-1.5 text-base font-semibold text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:no-underline transition-all">
                            View clearance fee breakdown
                            <FiArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* 7. Post-Sale & Payment */}
                    <Card className="bg-secondary/10 border-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                          <Coins className="w-8 h-8" />
                          Post-Sale & Payment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-700 dark:text-neutral-300 text-base">
                          Within fourteen working days of the auction you'll receive a post-sale statement detailing the prices achieved, followed by a bank transfer for the full amount due.
                        </p>
                      </CardContent>
                    </Card>

                    {/* CTA Section */}
                    <div className="bg-primary text-white rounded-xl p-8 md:p-12 text-center">
                      <h3 className="font-display text-3xl md:text-4xl mb-4">
                        Ready to Sell Your Items?
                      </h3>
                      <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                        Get started with a free valuation today.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                          size="lg"
                          className="text-lg px-8 bg-white text-primary hover:bg-white/90"
                          onClick={() => setLocationNav('/contact')}
                          data-testid="button-contact-selling"
                        >
                          Get Free Valuation <FiArrowRight className="ml-2" />
                        </Button>
                        <a
                          href="tel:+447843930927"
                          className="text-white/80 hover:text-white text-base underline underline-offset-2 transition-colors"
                          data-testid="button-call-selling"
                        >
                          <FiPhone className="inline mr-1.5" />+44 7843 930 927
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Buying Tab */}
              <TabsContent value="commission" className="mt-0">
                <div className="max-w-5xl mx-auto">
                  {/* Introduction */}
                  <div className="text-center mb-12">
                    <h2 className="font-display text-4xl md:text-5xl text-primary mb-5">
                      Buying at Lanora House
                    </h2>
                    <p className="text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                      Everything you need to know about bidding, attending, and collecting from our monthly auctions
                    </p>
                  </div>

                  <div className="space-y-10">

                  {/* Auction Schedule + Chapel Photo */}
                  <Card className="bg-primary/5 border-primary/20 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div>
                        <img
                          src={chapelImagePath}
                          alt="The Old Foundry Chapel, Hayle — Lanora House auction venue"
                          className="w-full h-64 md:h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-8">
                        <CardTitle className="text-3xl font-display text-primary flex items-center gap-3 mb-4">
                          <FiCalendar className="w-8 h-8" />
                          Auction Schedule
                        </CardTitle>
                        <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                          <div className="flex items-start gap-3">
                            <FiCalendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-primary">First Wednesday — Every Month at 5pm</p>
                              <p className="text-sm">Online & In-Person</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">The Old Foundry Chapel</p>
                              <p className="text-sm">First Floor (rear of building)</p>
                              <p className="text-sm">11–13 Chapel Terrace, Hayle TR27 4AB</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Eye className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">Viewing Days</p>
                              <p className="text-sm">Monday & Tuesday before each auction</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">Collection Days</p>
                              <p className="text-sm">Thursday & Friday after each auction</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-primary/10">
                          <FindUsModal />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Opening Times */}
                  <Card className="bg-white dark:bg-neutral-900 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                        <Clock className="w-8 h-8" />
                        Opening Times
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { day: "Monday", hours: "11:00 – 18:00" },
                          { day: "Tuesday", hours: "11:00 – 18:00" },
                          { day: "Wednesday", hours: "Auction Day – 17:00" },
                          { day: "Thursday", hours: "11:00 – 18:00" },
                          { day: "Friday", hours: "11:00 – 18:00" },
                          { day: "Saturday", hours: "Closed" },
                          { day: "Sunday", hours: "Closed" },
                        ].map(({ day, hours }) => (
                          <div key={day} className={`flex justify-between items-center px-4 py-3 rounded-lg ${hours === "Closed" ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400" : "bg-primary/5 border border-primary/15"}`}>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{day}</span>
                            <span className={hours === "Closed" ? "text-neutral-400 italic" : "text-primary font-medium"}>{hours}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                        Wednesday hours are on auction days. Viewings take place on the Monday &amp; Tuesday before each auction.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Buyer's Premium */}
                  <Card className="bg-secondary/10 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                        <Coins className="w-8 h-8" />
                        Buyer's Premium
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Added to the hammer price on every lot
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-primary rounded-xl px-4 py-8 flex flex-col items-center text-center shadow-md">
                          <div className="font-display text-5xl font-bold text-white leading-none">15%</div>
                          <div className="text-secondary/90 text-base font-semibold mt-3 leading-tight">Up to £500</div>
                        </div>
                        <div className="bg-primary rounded-xl px-4 py-8 flex flex-col items-center text-center shadow-md">
                          <div className="font-display text-5xl font-bold text-white leading-none">12.5%</div>
                          <div className="text-secondary/90 text-base font-semibold mt-3 leading-tight">£501 – £2,500</div>
                        </div>
                        <div className="bg-primary rounded-xl px-4 py-8 flex flex-col items-center text-center shadow-md">
                          <div className="font-display text-5xl font-bold text-white leading-none">10%</div>
                          <div className="text-secondary/90 text-base font-semibold mt-3 leading-tight">Over £2,500</div>
                        </div>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-5 border border-primary/20">
                        <p className="text-neutral-700 dark:text-neutral-300 text-base">
                          The premium is applied to the hammer price and is payable at settlement. Full details are in our <a href="/buyers-terms" className="text-primary underline hover:no-underline font-medium">Buyer's Terms</a>.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact + CTA */}
                  <div className="bg-primary text-white rounded-xl p-8 md:p-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="font-display text-3xl md:text-4xl mb-4">Get in Touch</h3>
                        <p className="text-xl opacity-90 mb-6">
                          Questions about bidding, viewing, or collecting? We're happy to help.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <FiMail className="w-5 h-5 flex-shrink-0" />
                            <span>info@lanorahouse.com</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <FiPhone className="w-5 h-5 flex-shrink-0" />
                            <span>+44 7843 930927</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <FiGlobe className="w-5 h-5 flex-shrink-0" />
                            <span>www.lanorahouse.com</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <FiMapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>First Floor (rear of building), The Old Foundry Chapel, 11–13 Chapel Terrace, Hayle TR27 4AB</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4 items-start">
                        <Button
                          size="lg"
                          className="text-lg px-8 w-full bg-white text-primary hover:bg-white/90"
                          onClick={() => setLocationNav('/contact')}
                          data-testid="button-contact-commission"
                        >
                          <FiMail className="mr-2" /> Get Free Valuation
                        </Button>
                        <a
                          href="tel:+447843930927"
                          className="text-white/80 hover:text-white text-base underline underline-offset-2 transition-colors w-full text-center"
                          data-testid="button-call-commission"
                        >
                          <FiPhone className="inline mr-1.5" />+44 7843 930 927
                        </a>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </TabsContent>

              {/* Packaging & Shipping Tab */}
              <TabsContent value="shipping" className="mt-0">
                <div className="max-w-6xl mx-auto">
                  {/* Introduction */}
                  <div className="text-center mb-12">
                    <h2 className="font-display text-4xl md:text-5xl text-primary mb-5" data-testid="text-shipping-title">
                      Shipping Information & Prices
                    </h2>
                  </div>

                  <div className="space-y-10">

                  {/* How We Ship */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                        <FiPackage className="w-8 h-8" />
                        How We Ship
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-700 dark:text-neutral-300 text-base mb-3">
                        We use Royal Mail for most orders. Our standard service is <strong>Royal Mail Tracked 48</strong> — included automatically on your post-auction invoice.
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 text-base mb-3">
                        Need faster shipping? Request Tracked 24 or Special Delivery before paying and we'll amend the invoice. Special Delivery may also be selected automatically for higher-value items.
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 text-base">
                        Prices are a guide and may vary by item size, weight, value, and packaging needs.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Packing & Handling Charges */}
                  <Card className="bg-secondary/10 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                        <FiBox className="w-8 h-8" />
                        Packing & Handling Charges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 text-base mb-4">
                        <li className="flex items-center gap-2">
                          <span className="font-bold text-primary">£2.00 per order</span> – covers labour and packing materials
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="font-bold text-primary">£1.00 per additional item</span> – if multiple items can be packed safely into one box
                        </li>
                      </ul>
                      <p className="text-neutral-700 dark:text-neutral-300 text-base mb-3">
                        Large, heavy, or fragile items may require a custom packing and shipping quote.
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 text-base">
                        We reuse and recycle packaging materials wherever possible, ensuring items are packed safely and securely.
                      </p>
                    </CardContent>
                  </Card>

                  {/* UK Shipping Prices */}
                  <Card className="bg-white dark:bg-neutral-900 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                        <FiTruck className="w-8 h-8" />
                        UK Shipping Prices
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-primary/10">
                              <th className="border border-primary/20 px-3 py-2 text-left font-semibold text-primary">Weight</th>
                              <th className="border border-primary/20 px-3 py-2 text-left font-semibold text-primary">Parcel Type</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">Tracked 48</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">Tracked 24</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">SD £750</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">SD £1,000</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">SD £2,500</th>
                            </tr>
                          </thead>
                          <tbody className="text-neutral-700 dark:text-neutral-300">
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 100g</td>
                              <td className="border border-primary/20 px-3 py-2">Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£2.95</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£3.85</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£9.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£12.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£19.25</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 250g</td>
                              <td className="border border-primary/20 px-3 py-2">Large Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£4.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£5.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£10.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£13.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£20.25</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 500g</td>
                              <td className="border border-primary/20 px-3 py-2">Large Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£4.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£5.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£10.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£13.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£20.25</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 750g</td>
                              <td className="border border-primary/20 px-3 py-2">Large Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£4.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£5.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£10.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£13.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£20.25</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 1kg</td>
                              <td className="border border-primary/20 px-3 py-2">Large Letter / Small Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£4.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£5.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£11.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£14.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£21.25</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 2kg</td>
                              <td className="border border-primary/20 px-3 py-2">Small Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£4.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£5.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£14.75</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£17.75</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£24.75</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 10kg</td>
                              <td className="border border-primary/20 px-3 py-2">Medium Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£8.60</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£9.70</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£20.75</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£23.75</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£30.75</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 20kg</td>
                              <td className="border border-primary/20 px-3 py-2">Medium Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£12.85</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£14.65</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£24.75</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£27.75</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£34.75</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">20-30kg</td>
                              <td className="border border-primary/20 px-3 py-2">Large Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£22.00 (2-Day)</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£25.15 (Next-Day)</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">-</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">-</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">-</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      {/* UK Notes */}
                      <div className="mt-6 bg-primary/5 rounded-lg p-4">
                        <h4 className="font-semibold text-primary mb-2">UK Notes</h4>
                        <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                          <li>Tracked 48 is our default service</li>
                          <li>Special Delivery may be selected automatically for higher-value items</li>
                          <li>Insurance level always matches the item value</li>
                          <li>Any upgrade will be shown clearly on your invoice</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* International Shipping Prices */}
                  <Card className="bg-white dark:bg-neutral-900 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-3xl font-display text-primary flex items-center gap-3">
                        <FiGlobe className="w-8 h-8" />
                        International Shipping Prices (All Parcels)
                      </CardTitle>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                        International shipping is based on packed weight, parcel size, and destination country. Royal Mail is used where possible. Parcelforce Worldwide is used automatically for larger or heavier parcels. Royal Mail Special Delivery is not available for international shipments.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-primary/10">
                              <th className="border border-primary/20 px-3 py-2 text-left font-semibold text-primary">Weight</th>
                              <th className="border border-primary/20 px-3 py-2 text-left font-semibold text-primary">Parcel Type</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">Europe</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">World Zone 1</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">World Zone 2</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">Zone 3 (USA)</th>
                              <th className="border border-primary/20 px-3 py-2 text-center font-semibold text-primary">Zones 4-13</th>
                            </tr>
                          </thead>
                          <tbody className="text-neutral-700 dark:text-neutral-300">
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 100g</td>
                              <td className="border border-primary/20 px-3 py-2">Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£3.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£3.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£3.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£3.40</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£3.40</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 250g</td>
                              <td className="border border-primary/20 px-3 py-2">Large Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£5.80</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£7.70</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£9.00</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£8.00</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£9-£11</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 500g</td>
                              <td className="border border-primary/20 px-3 py-2">Large Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£7.20</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£10.80</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£13.10</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£11.50</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£13-£16</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 750g</td>
                              <td className="border border-primary/20 px-3 py-2">Large Letter</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£9.55</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£16.00</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£20.10</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£17.10</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£19-£24</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 1kg</td>
                              <td className="border border-primary/20 px-3 py-2">Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£13.55</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£26.20</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£29.15</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£30.05</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£32-£40</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">Up to 2kg</td>
                              <td className="border border-primary/20 px-3 py-2">Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£16.25</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£33.55</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£38.85</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£35.70</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£40-£55</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">2-5kg</td>
                              <td className="border border-primary/20 px-3 py-2">Large Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£16-£30</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£25-£55</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£30-£75</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£30-£70</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£40-£100</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">5-10kg</td>
                              <td className="border border-primary/20 px-3 py-2">Large Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£25-£45</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£40-£80</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£50-£120</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£45-£110</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£70-£180</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">10-20kg</td>
                              <td className="border border-primary/20 px-3 py-2">Large Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£35-£70</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£60-£140</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£80-£200</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£75-£180</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£120-£300</td>
                            </tr>
                            <tr className="hover:bg-primary/5">
                              <td className="border border-primary/20 px-3 py-2">20-30kg</td>
                              <td className="border border-primary/20 px-3 py-2">Large Parcel</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£45-£90</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£80-£180</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£100-£300</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£95-£280</td>
                              <td className="border border-primary/20 px-3 py-2 text-center">£180-£450+</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* International Zones */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-3xl font-display text-primary">
                        International Zones - Country Coverage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Europe (Zones 1-3)</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          All EU countries plus Albania, Andorra, Armenia, Azerbaijan, Belarus, Bosnia & Herzegovina, Faroe Islands, Georgia, Gibraltar, Greenland, Iceland, Kazakhstan, Kosovo, Liechtenstein, Moldova, Monaco, Montenegro, North Macedonia, Norway, Russia, San Marino, Serbia, Switzerland, Turkey, Ukraine, Vatican City.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">World Zone 1</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          Canada, Hong Kong, Japan, New Zealand, Singapore, South Africa.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">World Zone 2</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          Australia, China, Israel, Malaysia, Saudi Arabia, Thailand.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">World Zone 3</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          United States of America.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-2">World Zones 4-13</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          All remaining countries across South America, Central America, Africa, the Middle East, Asia, and island territories. Pricing is country dependent.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* International Notes */}
                  <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-display text-primary">
                        International Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-base text-neutral-700 dark:text-neutral-300">
                        <li>Customs fees, VAT, or import duties are not included</li>
                        <li>These charges are the buyer's responsibility</li>
                        <li>Tracking is included where available</li>
                        <li>Final shipping cost is confirmed on your invoice</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* CTA Section */}
                  <div className="bg-primary text-white rounded-xl p-8 md:p-12 text-center">
                    <h3 className="font-display text-3xl md:text-4xl mb-4">
                      Questions About Shipping?
                    </h3>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                      Contact us for bespoke shipping quotes or any questions about delivery.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button 
                        size="lg" 
                        className="text-lg px-8 bg-white text-primary hover:bg-white/90"
                        onClick={() => setLocationNav('/contact')}
                        data-testid="button-contact-shipping"
                      >
                        Contact Us <FiArrowRight className="ml-2" />
                      </Button>
                      <a
                        href="tel:+447843930927"
                        className="text-white/80 hover:text-white text-base underline underline-offset-2 transition-colors"
                        data-testid="button-call-shipping"
                      >
                        <FiPhone className="inline mr-1.5" />+44 7843 930 927
                      </a>
                    </div>
                  </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </>
  );
}
