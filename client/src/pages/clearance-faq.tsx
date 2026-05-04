import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { ChevronDown, ChevronUp, Home, Package, Coins, Truck, Clock, FileText, Recycle, Heart, Gavel, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How does your house clearance service work?",
    answer: "We arrive at the agreed time and clear everything listed in your quote. If you can't attend, we can collect keys in advance. Anything with resale value will be identified and can be sold at auction to reduce your clearance cost. Items that may have sentimental value are set aside for you to review.",
    icon: <Home className="w-6 h-6" />,
    highlight: "Simple Process",
    color: "bg-blue-400"
  },
  {
    question: "How can selling items at auction reduce my clearance costs?",
    answer: "We identify valuable items during your clearance and offer them for sale at our auctions. The proceeds from any sold items go directly toward reducing your clearance bill - potentially covering the entire cost. We handle everything from cataloguing to selling, with no commission taken from you.",
    icon: <Gavel className="w-6 h-6" />,
    highlight: "Reduce Your Bill",
    color: "bg-emerald-400"
  },
  {
    question: "How much does a house clearance cost?",
    answer: "Your quote is based on: the volume and weight of items (which determines disposal fees), the time and labour required, and any resale value we can recover through auctions. If we identify items for auction, we'll reduce your price accordingly. Contact us for a free, no-obligation quote.",
    icon: <Coins className="w-6 h-6" />,
    highlight: "Fair Pricing",
    color: "bg-green-400"
  },
  {
    question: "What happens to items I want to sell at auction?",
    answer: "We photograph, catalogue, and include your items in our regular auctions held at The Old Foundry Chapel in Hayle. You can watch the auction online or attend in person. Once items sell, the proceeds are applied to your clearance invoice or paid to you directly if the clearance is already settled.",
    icon: <Package className="w-6 h-6" />,
    highlight: "Full Auction Service",
    color: "bg-purple-400"
  },
  {
    question: "Can I sell items to you without a clearance?",
    answer: "Absolutely! We buy individual items, collections, and estates. Simply contact us with photos and descriptions, and we'll provide a valuation. You can sell directly to us or consign items for auction - whichever gives you the best return.",
    icon: <ShoppingBag className="w-6 h-6" />,
    highlight: "We Buy Items",
    color: "bg-yellow-400"
  },
  {
    question: "What types of items do you accept for auction?",
    answer: "We auction antiques, furniture, collectibles, vintage items, household goods, tools, garden equipment, and more. If you're unsure whether something has auction value, just ask - we're happy to assess items and provide honest advice on the best way to sell.",
    icon: <FileText className="w-6 h-6" />,
    highlight: "Wide Range",
    color: "bg-indigo-400"
  },
  {
    question: "How environmentally friendly is your clearance service?",
    answer: "We manually sort everything ourselves - separating items for reuse, resale through auction, recycling, and only sending what's necessary to disposal. This approach significantly reduces landfill waste while supporting local charities and the circular economy. Sustainability isn't just marketing for us - it's how we operate.",
    icon: <Recycle className="w-6 h-6" />,
    highlight: "Eco-Friendly",
    color: "bg-cyan-400"
  },
  {
    question: "Do you take everything?",
    answer: "We handle furniture, household goods, appliances, garden items, garage contents, sheds, and more. If there's something unusual (like hazardous waste), just ask and we'll let you know your options. Most items can either be cleared, sold at auction, or responsibly recycled.",
    icon: <Truck className="w-6 h-6" />,
    highlight: "Comprehensive Service",
    color: "bg-teal-400"
  },
  {
    question: "How long does a clearance take?",
    answer: "Most clearances take 1-2 days, depending on the property size and volume of items. We'll give you a clear timeline after our initial assessment. If items are going to auction, we can hold them until the next available sale date.",
    icon: <Clock className="w-6 h-6" />,
    highlight: "Quick Turnaround",
    color: "bg-orange-400"
  },
  {
    question: "Can you help with probate or bereavement clearances?",
    answer: "Yes, we handle probate clearances with sensitivity and care. We understand this is a difficult time, and we work at your pace with full transparency. We'll identify items suitable for auction to maximize the estate value, set aside personal effects, and handle everything with respect and professionalism.",
    icon: <Heart className="w-6 h-6" />,
    highlight: "Compassionate Service",
    color: "bg-pink-400"
  },
  {
    question: "Where are your auctions held?",
    answer: "Our auctions take place at The Old Foundry Chapel, 11-13 Chapel Terrace, Hayle, Cornwall TR27 4AB. You can bid in person, online through our website, or leave commission bids. We also offer shipping and local delivery for items you win at auction.",
    icon: <Home className="w-6 h-6" />,
    highlight: "Hayle Auction House",
    color: "bg-blue-500"
  },
  {
    question: "How do I get started?",
    answer: "Simply contact us by phone (07843 930927) or email (info@lanorahouse.com) with details of what you need cleared or want to sell. We can arrange a site visit for larger clearances or provide valuations from photos for individual items. All quotes are free and there's no obligation.",
    icon: <FileText className="w-6 h-6" />,
    highlight: "Easy Start",
    color: "bg-green-500"
  }
];

export default function ClearanceFAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <SEOHead
        title="Clearance & Auction FAQ - Common Questions"
        description="Frequently asked questions about Lanora House clearance services and auctions. Learn how selling items at auction can reduce your clearance costs."
        path="/clearance-faq"
      />

      {/* Hero Section */}
      <div className="bg-primary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl md:text-6xl mb-6" data-testid="text-faq-title">
              Frequently Asked Questions
            </h1>
            <p className="text-xl mb-4 opacity-90">
              Everything you need to know about our clearance services and auctions
            </p>
            <p className="text-lg opacity-80">
              Have a question not covered here? <a href="tel:+447843930927" className="text-white hover:text-secondary underline">Call us on 07843 930927</a>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary/30 dark:hover:border-primary/30 overflow-hidden transition-all duration-300 hover:shadow-xl"
                data-testid={`faq-item-${index}`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all duration-300"
                  data-testid={`faq-button-${index}`}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`p-3 rounded-lg ${faq.color} text-white shadow-md`}
                    >
                      {faq.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 mb-1">
                        {faq.question}
                      </h3>
                      <span className="text-sm font-medium text-primary">
                        {faq.highlight}
                      </span>
                    </div>
                  </div>
                  <div className="text-primary">
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </button>
                
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5"
                    data-testid={`faq-answer-${index}`}
                  >
                    <div className="pl-16 text-neutral-700 dark:text-neutral-300 leading-relaxed border-l-4 border-primary/20">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Call to Action Section */}
          <div className="text-center mt-16 bg-primary/10 dark:bg-primary/20 rounded-2xl p-8 border border-primary/20">
            <h2 className="font-display text-3xl text-primary mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6 text-lg max-w-2xl mx-auto">
              Contact us today for a free, no-obligation quote for your clearance or to discuss selling items at auction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/clearance"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-lg"
                data-testid="button-clearance-services"
              >
                <Home className="w-5 h-5 mr-2" />
                Clearance Services
              </a>
              <a
                href="/auctions"
                className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark transition-colors shadow-lg"
                data-testid="button-view-auctions"
              >
                <Gavel className="w-5 h-5 mr-2" />
                View Auctions
              </a>
              <a
                href="tel:+447843930927"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-neutral-800 text-primary border-2 border-primary font-semibold rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors shadow-lg"
                data-testid="button-call-now"
              >
                Call: 07843 930927
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
