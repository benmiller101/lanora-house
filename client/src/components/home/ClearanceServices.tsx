import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowRight,
  Leaf,
  Heart,
  RotateCcw,
  Hammer,
  Zap,
  Gavel,
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableCardSkeleton } from "@/components/ui/SustainableLoader";

const WasteCollectionTracker = () => {
  const { data: wasteData, isLoading } = useQuery({
    queryKey: ["/api/environmental-impact"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/environmental-impact");
      return response.json();
    },
  });

  if (isLoading) {
    return <SustainableCardSkeleton />;
  }

  const totalTonnes = Number(wasteData?.totalTonnesDiverted || 0);
  const yearlyTarget = Number(wasteData?.yearlyTarget || 150);
  const progressPercentage = yearlyTarget > 0 ? Math.round((totalTonnes / yearlyTarget) * 100) : 0;
  
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
        Waste Collection Impact
      </h3>
      
      <div className="text-center mb-6">
        <div className="text-5xl md:text-6xl font-bold text-primary mb-1 tabular-nums">
          {totalTonnes.toFixed(1)}
        </div>
        <div className="text-sm text-gray-500 uppercase tracking-wide">
          tonnes collected
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
        <div 
          className="bg-primary h-3 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>{progressPercentage}% of target</span>
        <span>{yearlyTarget} tonnes</span>
      </div>
    </div>
  );
};

const ClearanceServices = () => {
  const services = [
    {
      icon: <Heart className="w-5 h-5 text-red-600" />,
      title: "Charity Donations",
      description: "Usable items and in-date food go to local charities and food banks.",
      highlight: "Supporting communities"
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-blue-600" />,
      title: "Smart Sorting",
      description: "Hand-sorted for maximum recycling and minimum landfill.",
      highlight: "Less waste, lower cost"
    },
    {
      icon: <Hammer className="w-5 h-5 text-orange-600" />,
      title: "Material Reuse",
      description: "Rubble, glass, cardboard and packaging reused by local contractors and makers.",
      highlight: "Waste into resource"
    },
    {
      icon: <Zap className="w-5 h-5 text-green-600" />,
      title: "Wood to Energy",
      description: "All wood waste is chipped and sent to renewable energy facilities.",
      highlight: "Fueling green power"
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-12 max-w-3xl mx-auto">
          <div>
            <Badge className="mb-5 bg-secondary/20 text-primary border-primary/20">
              <Leaf className="w-4 h-4 mr-1" />
              Sustainable Clearances
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              House Clearances That 
              <span className="text-primary"> Save Money</span>
            </h2>
            
            <div className="space-y-4 mb-10 text-gray-600 leading-relaxed">
              <p>
                We clear properties of all sizes across Cornwall and Devon, handling everything from single rooms to full estate clearances.
              </p>
              <p>
                Valuable items found during clearances are resold through our specialist network — helping to reduce or even eliminate your clearance bill.
              </p>
              <p>
                Everything else is recycled, reused or donated wherever possible. Nothing goes to landfill that doesn't have to.
              </p>
            </div>

            <p className="text-sm text-gray-400 mb-10">
              Also looking for our auction services?{" "}
              <a href="#auction-services" className="text-primary hover:underline font-medium">
                Find out more here
              </a>
            </p>

            <div className="bg-primary/5 border border-primary/15 rounded-xl p-6 mb-10">
              <div className="flex items-start gap-3">
                <Gavel className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Valuable Items Found During Clearance</h3>
                  <p className="text-base text-gray-600 leading-relaxed mb-2">
                    Selected antiques and collectables found during clearances are resold through our specialist network, helping to reduce or even eliminate your clearance cost.
                  </p>
                  <Link href="/auctions" className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                    Our Resale & Auction Services
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg border border-neutral-200"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm mb-1">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/clearance">
                <Button size="lg" className="bg-primary hover:bg-primary-dark">
                  Book a Clearance
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="tel:+447843930927">
                <Button size="lg" variant="outline" className="border-neutral-300 text-gray-600 hover:bg-neutral-50">
                  Call: 07843 930 927
                </Button>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ClearanceServices;
