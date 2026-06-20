import SEOHead from "@/components/SEOHead";
import Hero from "@/components/home/Hero";
import ClearanceServices from "@/components/home/ClearanceServices";
import ReviewCarousel from "@/components/home/ReviewCarousel";
import AuctionShowcase from "@/components/home/AuctionShowcase";
import DifferenceWeMake from "@/components/home/DifferenceWeMake";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Lanora House: House Clearance & Auction Cornwall"
        description="Cornwall's sustainable house clearance specialists. We clear properties across Cornwall & Devon and run monthly in-person auctions in Hayle."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Lanora House",
          "url": "https://www.lanorahouse.com",
          "description": "Sustainable house clearance specialists based in Hayle, Cornwall. Monthly auctions at The Old Foundry Chapel.",
          "address": { "@type": "PostalAddress", "streetAddress": "Unit 12b, The Old Foundry Chapel, Chapel Terrace", "addressLocality": "Hayle", "addressRegion": "Cornwall", "postalCode": "TR27 4AB", "addressCountry": "GB" },
          "telephone": "+447456809049"
        }}
      />

      <Hero />

      <hr className="border-t border-gray-200 mx-auto max-w-6xl" />

      <DifferenceWeMake />

      <hr className="border-t border-gray-200 mx-auto max-w-6xl" />

      <ClearanceServices />

      <hr className="border-t border-gray-200 mx-auto max-w-6xl" />

      <ReviewCarousel />

      <hr className="border-t border-gray-200 mx-auto max-w-6xl" />

      <AuctionShowcase />
    </div>
  );
}
