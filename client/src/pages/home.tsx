import SEOHead from "@/components/SEOHead";
import Hero from "@/components/home/Hero";
import CountdownPopup from "@/components/home/CountdownPopup";
import ClearanceServices from "@/components/home/ClearanceServices";
import ReviewCarousel from "@/components/home/ReviewCarousel";
import AuctionShowcase from "@/components/home/AuctionShowcase";
import DifferenceWeMake from "@/components/home/DifferenceWeMake";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Lanora House: House Clearance & Auction Cornwall"
        description="Cornwall's trusted house clearance company. We clear, recycle and rehome sustainably across Cornwall & Devon. Auction services also available."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Lanora House",
          "url": "https://www.lanorahouse.com",
          "description": "Cornwall's trusted house clearance company. Sustainable clearances across Cornwall and Devon, with auction services also available.",
          "address": { "@type": "PostalAddress", "streetAddress": "Unit 6, The Old Foundry Chapel, Chapel Terrace", "addressLocality": "Hayle", "addressRegion": "Cornwall", "postalCode": "TR27 4AB", "addressCountry": "GB" },
          "telephone": "+44-1234-567890"
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

      <CountdownPopup />
    </div>
  );
}
