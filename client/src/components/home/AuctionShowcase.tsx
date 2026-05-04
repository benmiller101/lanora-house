import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hammer, ShoppingCart, TrendingUp, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AuctionShowcase() {
  return (
    <section id="auction-services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Hammer className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">Auction Services</span>
            </div>
            <h3 className="font-display text-4xl md:text-6xl text-primary mb-6">
              Foundry Chapel, Hayle Auctions
            </h3>
            <p className="text-xl text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              Whether it's a prized antique or something gathering dust, we make selling simple, friendly, and rewarding. Find the right buyer—and the right price.
            </p>
          </motion.div>

          {/* Two-Column CTA Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Sell with Us Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="relative overflow-hidden h-full bg-primary text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative p-8 md:p-10 flex flex-col h-full">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl mb-4">
                      Sell With Us
                    </h3>
                    <p className="text-white/90 text-lg mb-6 leading-relaxed">
                      Get expert valuations and reach serious buyers. Our commission structure rewards you with competitive rates and maximum returns.
                    </p>
                  </div>

                  {/* Key Benefits */}
                  <div className="space-y-3 mb-8 flex-grow">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-secondary" />
                      <span className="text-white/95">Expert valuations from specialists</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      <span className="text-white/95">Professional photography & cataloguing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                      <span className="text-white/95">Tiered commission (4.5% - 11%)</span>
                    </div>
                  </div>

                  <Link href="/contact" data-testid="link-auction-sell">
                    <Button 
                      size="lg" 
                      className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-lg py-6 group-hover:scale-105 transition-all duration-300"
                      data-testid="button-auction-valuation"
                    >
                      Get Free Valuation
                      <TrendingUp className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Buy with Us Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="relative overflow-hidden h-full bg-secondary text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative p-8 md:p-10 flex flex-col h-full">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Hammer className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-3xl md:text-4xl mb-4">
                      Buy at Auction
                    </h3>
                    <p className="text-white/90 text-lg mb-6 leading-relaxed">
                      Browse our expertly curated catalogues featuring antiques, collectibles, and unique treasures. Bid online or in person.
                    </p>
                  </div>

                  {/* Key Benefits */}
                  <div className="space-y-3 mb-8 flex-grow">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      <span className="text-white/95">Live & online bidding available</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-white/95">Authenticated items with estimates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="text-white/95">Tiered Buyer's Premium (10% - 15%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-white/95">Secure shipping & insurance</span>
                    </div>
                  </div>

                  <div className="text-center py-3 border-t border-white/20 mt-2">
                    <p className="text-white font-bold text-xl">Monthly Auctions</p>
                    <p className="text-white/90 text-lg">First Wednesdays · 5pm</p>
                  </div>

                  <Link href="/auctions" data-testid="link-auction-buy">
                    <Button 
                      size="lg" 
                      className="w-full bg-white text-secondary hover:bg-white/90 font-semibold text-lg py-6 group-hover:scale-105 transition-all duration-300"
                      data-testid="button-browse-auctions"
                    >
                      Browse Auctions
                      <ShoppingCart className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Trusted by collectors, dealers, and estates across the UK
            </p>
            <div className="flex flex-wrap justify-center gap-4 items-center">
              <div className="flex items-center gap-2 text-primary">
                <Award className="w-5 h-5" />
                <span className="font-medium">Expert Specialists</span>
              </div>
              <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Professional Service</span>
              </div>
              <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Best Prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
