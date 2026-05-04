import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function SellTreasuresCTA() {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-4xl text-neutral-wood mb-4">
              Have Your Own Treasures to Sell?
            </h2>
            <p className="text-neutral-wood/80 text-lg max-w-2xl mx-auto">
              Turn your valuable antiques into cash with our expert valuation service. 
              We offer fair prices and professional assessment for all types of collectibles.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sell-goods">
              <Button 
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <i className="ri-treasure-map-line mr-2"></i>
                Sell Your Treasures Direct to Us
              </Button>
            </Link>
            
            <div className="flex items-center text-sm text-neutral-wood/60">
              <i className="ri-shield-check-line mr-2 text-accent"></i>
              <span>Free valuation • Fast payment • Trusted service</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-search-eye-line text-primary text-xl"></i>
              </div>
              <h3 className="font-semibold text-neutral-wood mb-2">Expert Valuation</h3>
              <p className="text-sm text-neutral-wood/70">Professional assessment by certified antique experts</p>
            </div>
            
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-hand-coin-line text-primary text-xl"></i>
              </div>
              <h3 className="font-semibold text-neutral-wood mb-2">Fair Pricing</h3>
              <p className="text-sm text-neutral-wood/70">Competitive market rates for all accepted items</p>
            </div>
            
            <div className="p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-time-line text-primary text-xl"></i>
              </div>
              <h3 className="font-semibold text-neutral-wood mb-2">Quick Process</h3>
              <p className="text-sm text-neutral-wood/70">Fast turnaround from valuation to payment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}