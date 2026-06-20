import React from "react";
import SEOHead from "@/components/SEOHead";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Recycle, TreePine, Zap, Target, Clock, Refrigerator, Monitor, Trash2, TreePine as WoodIcon, FileText, Package, Hammer, Shirt } from "lucide-react";

interface WasteData {
  id: number;
  totalItemsCollected: number;
  totalTonnesDiverted: number;
  treesEquivalentSaved: number;
  yearlyTarget: number;
  currentProgress: number;
  progressPercentage: number;
  wasteBreakdown: {
    fridgeCollected: number;
    tvElectronics: number;
    mixedWaste: number;
    woodMaterials: number;
    paperWaste: number;
    cardboard: number;
    ceramicRubble: number;
    textiles: number;
  };
  created_at: string;
  updated_at: string;
}

export default function EnvironmentalImpact() {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const { data: wasteData, isLoading } = useQuery<WasteData>({
    queryKey: ['/api/environmental-impact']
  });

  // Countdown timer effect
  React.useEffect(() => {
    const targetDate = new Date('2025-12-31T23:59:59');
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Environmental Impact & Waste Tracker"
        description="Track the real environmental impact we're making across Cornwall and Devon through sustainable waste management and eco-friendly clearance services."
        path="/environmental-impact"
      />

      {/* Hero Section */}
      <div className="bg-blue-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-black text-primary mb-2">
              Waste Tracker
            </h1>
            <p className="text-xl text-primary/80 font-medium">Cornwall</p>
          </div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6 leading-relaxed">
            Track the real environmental impact we're making across Cornwall & Devon through 
            sustainable waste management and professional clearance services — with care, discretion, and professionalism.
          </p>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            We're based right here in Cornwall, so we know the area well and can offer fast response 
            times, flexible bookings, and a truly local touch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              Get Free Quote
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="tel:+447456809049"
              className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 text-lg"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call: +44 7456 809049
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Waste Collection Impact Tracker */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Waste Collection Impact Tracker
              </h2>
              <p className="text-neutral-wood">
                Tracking our environmental impact since grand opening
              </p>
            </div>

            {/* New Year Challenge */}
            <div className="bg-neutral-paper rounded-lg p-6 mb-8 border border-secondary">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-primary">
                  <Target className="w-5 h-5 text-primary mr-2" />
                  <span className="font-semibold text-primary">New Year 2025 Challenge</span>
                </div>
                <div className="flex items-center ml-6 bg-white rounded-full px-4 py-2 shadow-sm border border-secondary">
                  <Clock className="w-5 h-5 text-secondary-foreground mr-2" />
                  <span className="text-sm text-neutral-wood">Race to reach {wasteData?.yearlyTarget || 150} tonnes by year-end!</span>
                </div>
              </div>

              {/* Progress Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary text-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{timeLeft.days}</div>
                  <div className="text-sm opacity-90">DAYS</div>
                </div>
                <div className="bg-secondary text-primary rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{timeLeft.hours}</div>
                  <div className="text-sm opacity-90">HOURS</div>
                </div>
                <div className="bg-neutral-wood text-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-sm opacity-90">MINS</div>
                </div>
                <div className="bg-secondary-light text-primary rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-sm opacity-90">SECS</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-neutral-wood mb-2">
                  <span>Progress to {wasteData?.yearlyTarget || 150} tonnes</span>
                  <span className="bg-primary text-white px-2 py-1 rounded text-xs">
                    {wasteData?.yearlyTarget && wasteData?.totalTonnesDiverted ? Math.round((parseFloat(wasteData.totalTonnesDiverted) / parseFloat(wasteData.yearlyTarget)) * 100) : 0}% of {wasteData?.yearlyTarget || 150} tonnes
                  </span>
                </div>
                <div className="w-full bg-secondary-light rounded-full h-4">
                  <div 
                    className="bg-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${wasteData?.yearlyTarget && wasteData?.totalTonnesDiverted ? Math.min(Math.round((parseFloat(wasteData.totalTonnesDiverted) / parseFloat(wasteData.yearlyTarget)) * 100), 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center text-sm text-neutral-wood">
                <div className="text-2xl font-bold text-primary mb-2">
                  {Number(wasteData?.totalTonnesDiverted || 0).toFixed(1)} tonnes collected
                </div>
                Only {wasteData?.yearlyTarget && wasteData?.totalTonnesDiverted ? (parseFloat(wasteData.yearlyTarget) - parseFloat(wasteData.totalTonnesDiverted)).toFixed(1) : 150} tonnes to go!<br />
                At {wasteData?.yearlyTarget && wasteData?.totalTonnesDiverted ? Math.round((parseFloat(wasteData.totalTonnesDiverted) / parseFloat(wasteData.yearlyTarget)) * 100) : 0}%: Every clearance brings us closer to our environmental goal
              </div>
            </div>

            {/* Waste Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-primary text-white p-2 rounded">
                  <Refrigerator className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Fridges Collected</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.fridgeCollected || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">units</div>
                <div className="text-xs text-neutral-wood opacity-80">Large appliances rescued from landfill</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-secondary text-primary p-2 rounded">
                  <Monitor className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">TVs & Electronics</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.tvElectronics || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">units</div>
                <div className="text-xs text-neutral-wood opacity-80">Electronic waste properly recycled</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-neutral-wood text-white p-2 rounded">
                  <Trash2 className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Mixed Waste</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.mixedWaste || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">tonnes</div>
                <div className="text-xs text-neutral-wood opacity-80">General household items diverted</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-secondary-light text-primary p-2 rounded">
                  <WoodIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Wood Materials</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.woodMaterials || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">tonnes</div>
                <div className="text-xs text-neutral-wood opacity-80">Timber and wooden furniture</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-primary-light text-white p-2 rounded">
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Paper Waste</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.paperWaste || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">tonnes</div>
                <div className="text-xs text-neutral-wood opacity-80">Documents and paper materials</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-secondary text-primary p-2 rounded">
                  <Package className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Cardboard</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.cardboard || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">tonnes</div>
                <div className="text-xs text-neutral-wood opacity-80">Packaging and cardboard boxes</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-neutral-wood text-white p-2 rounded">
                  <Hammer className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Ceramic & Rubble</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.ceramicRubble || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">tonnes</div>
                <div className="text-xs text-neutral-wood opacity-80">Building materials and ceramics</div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-secondary shadow-sm">
                <div className="flex items-center mb-3 bg-secondary-light text-primary p-2 rounded">
                  <Shirt className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Textiles</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-1">{wasteData?.wasteBreakdown?.textiles || 0}</div>
                <div className="text-sm text-neutral-wood mb-2">tonnes</div>
                <div className="text-xs text-neutral-wood opacity-80">Clothing and fabric materials</div>
              </div>
            </div>
          </div>

          {/* Why Sustainable Clearances Matter */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-12">
              Why Sustainable Clearances Matter
            </h2>
            <p className="text-lg text-neutral-charcoal text-center mb-12 max-w-4xl mx-auto">
              Traditional clearance services often send everything to landfill. We take a different approach, carefully sorting and 
              redirecting items to give them new life.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-lg border border-neutral-stone">
                <div className="flex items-center mb-4">
                  <Recycle className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-semibold text-neutral-charcoal">Waste Diversion</h3>
                </div>
                <p className="text-neutral-stone">
                  Items are sorted for recycling, donation, or resale rather than going straight to landfill.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-lg border border-neutral-stone">
                <div className="flex items-center mb-4">
                  <TreePine className="w-6 h-6 text-secondary mr-3" />
                  <h3 className="text-xl font-semibold text-neutral-charcoal">Community Benefit</h3>
                </div>
                <p className="text-neutral-stone">
                  Usable items find new homes through local charities and community organizations.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-lg border border-neutral-stone">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-accent mr-3" />
                  <h3 className="text-xl font-semibold text-neutral-charcoal">Carbon Reduction</h3>
                </div>
                <p className="text-neutral-stone">
                  Every tonne diverted from landfill significantly reduces carbon emissions and environmental impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}