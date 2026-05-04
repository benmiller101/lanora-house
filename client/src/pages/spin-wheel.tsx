import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, RotateCw, Share2, Anchor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SpinWheelPage = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  // Wheel segments - 100 segments with colored wedges randomly distributed
  const createSegments = () => {
    const coloredSegments = [
      { color: "#FFD700", label: "50% OFF", discount: "50% OFF", textColor: "#2D317C" }, // 1 golden
      ...Array(5).fill({ color: "#ff69b4", label: "5% OFF", discount: "5% OFF", textColor: "#ffffff" }), // 5 pink
      ...Array(10).fill({ color: "#9932cc", label: "1% OFF", discount: "1% OFF", textColor: "#ffffff" }), // 10 purple
      ...Array(2).fill({ color: "#dc143c", label: "10% OFF", discount: "10% OFF", textColor: "#ffffff" }), // 2 red
      ...Array(6).fill({ color: "#1e90ff", label: "3% OFF", discount: "3% OFF", textColor: "#ffffff" }), // 6 blue
      ...Array(1).fill({ color: "#32cd32", label: "20% OFF", discount: "20% OFF", textColor: "#ffffff" }), // 1 green
    ];
    
    // Create 100 segments
    const allSegments = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      label: "",
      color: i % 2 === 0 ? "#ffffff" : "#f8fafc",
      textColor: "#2D317C"
    }));
    
    // Randomly place colored segments
    const shuffledIndices = Array.from({ length: 100 }, (_, i) => i).sort(() => Math.random() - 0.5);
    coloredSegments.forEach((coloredSegment, index) => {
      const randomIndex = shuffledIndices[index];
      allSegments[randomIndex] = { ...coloredSegment, id: randomIndex };
    });
    
    return allSegments;
  };
  
  const segments = createSegments();

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);
    
    // Random rotation between 1800-3600 degrees (5-10 full rotations)
    const randomRotation = 1800 + Math.random() * 1800;
    const finalRotation = rotation + randomRotation;
    
    // Calculate which segment we land on
    const segmentAngle = 360 / 100;
    const normalizedRotation = finalRotation % 360;
    const segmentIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % 100;
    
    setRotation(finalRotation);
    
    // Determine result after spin completes
    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      
      const landedSegment = segments[segmentIndex];
      if ('discount' in landedSegment && landedSegment.discount) {
        setResult(landedSegment.discount as string);
      } else {
        setResult("Better luck next time!");
      }
    }, 3000);
  };

  const resetWheel = () => {
    setRotation(0);
    setResult(null);
    setHasSpun(false);
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>50% Off Clearances | LANORA HOUSE</title>
        <meta name="description" content="Get 50% off your clearance service! Spin our special wheel for a chance to win half off your entire clearance bill across Cornwall & Devon." />
        <meta property="og:title" content="50% Off Clearances | LANORA HOUSE" />
        <meta property="og:description" content="Get 50% off your clearance service! Spin our special wheel for a chance to win half off your entire clearance bill." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-blue-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <h1 className="text-5xl md:text-7xl font-black text-primary mb-2">
                50% Off Clearances
              </h1>
              <p className="text-xl text-primary/80 font-medium">Cornwall</p>
            </div>
            
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6 leading-relaxed">
              Get a chance to win 50% off your entire clearance bill! Complete your house clearance service 
              and spin our special wheel for incredible savings — with care, discretion, and professionalism.
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
                href="tel:+447843930927"
                className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105 text-lg"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call: +44 7843 930927
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wheel Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white shadow-2xl border-2 border-secondary">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-8">
                <Anchor className="w-6 h-6 text-primary mr-2" />
                <h2 className="text-2xl font-bold text-primary">The Sailor's Fortune Wheel</h2>
                <Anchor className="w-6 h-6 text-primary ml-2" />
              </div>

              {/* Wheel Container */}
              <div className="relative mx-auto mb-8" style={{ width: "300px", height: "300px" }}>
                {/* Wheel Pointer */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-20">
                  <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-primary"></div>
                </div>

                {/* Wheel */}
                <motion.div
                  className="relative w-full h-full rounded-full border-4 border-primary shadow-lg overflow-hidden"
                  style={{
                    background: `conic-gradient(${segments.map((segment, index) => 
                      `${segment.color} ${(index * 3.6)}deg ${((index + 1) * 3.6)}deg`
                    ).join(', ')})`
                  }}
                  animate={{ rotate: rotation }}
                  transition={{
                    duration: isSpinning ? 3 : 0,
                    ease: isSpinning ? "easeOut" : "linear"
                  }}
                >
                  {/* Center Hub */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                    <Anchor className="w-8 h-8 text-white" />
                  </div>

                  {/* Golden 50% OFF Segment Indicator */}
                  <div 
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      top: "10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />

                  {/* Segment Lines */}
                  {segments.map((_, index) => (
                    <div
                      key={index}
                      className="absolute bg-primary opacity-30"
                      style={{
                        width: "1px",
                        height: "150px",
                        top: "0",
                        left: "50%",
                        transformOrigin: "bottom",
                        transform: `translateX(-50%) rotate(${index * 3.6}deg)`,
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Spin Button */}
              <div className="mb-8">
                <Button
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  <Anchor className="w-5 h-5 mr-2" />
                  {isSpinning ? "SPINNING..." : "SPIN THE WHEEL!"}
                </Button>
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="mb-6"
                  >
                    {result && result.includes("OFF") ? (
                      <div className="bg-yellow-500 text-primary p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-bold mb-2">🎉 CONGRATULATIONS! 🎉</h3>
                        <p className="text-xl">You won {result} your entire clearance bill!</p>
                      </div>
                    ) : (
                      <div className="bg-neutral-paper text-primary p-6 rounded-lg shadow-lg border border-secondary">
                        <h3 className="text-xl font-semibold mb-2">Thanks for spinning!</h3>
                        <p>Better luck next time - but remember, this is just a preview!</p>
                        <Button
                          onClick={resetWheel}
                          variant="outline"
                          className="mt-4"
                        >
                          <RotateCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Discount Table */}
              <div className="mt-8">
                <div className="flex items-center justify-center mb-6">
                  <Anchor className="w-5 h-5 text-primary mr-2" />
                  <h3 className="text-xl font-bold text-primary">Prize Guide</h3>
                  <Anchor className="w-5 h-5 text-primary ml-2" />
                </div>
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-primary/20">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#FFD700" }}></div>
                      <div>
                        <div className="font-bold text-primary">Golden</div>
                        <div className="text-sm text-gray-600">50% OFF</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#32cd32" }}></div>
                      <div>
                        <div className="font-bold text-primary">Green</div>
                        <div className="text-sm text-gray-600">20% OFF</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#dc143c" }}></div>
                      <div>
                        <div className="font-bold text-primary">Red</div>
                        <div className="text-sm text-gray-600">10% OFF</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#ff69b4" }}></div>
                      <div>
                        <div className="font-bold text-primary">Pink</div>
                        <div className="text-sm text-gray-600">5% OFF</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#1e90ff" }}></div>
                      <div>
                        <div className="font-bold text-primary">Blue</div>
                        <div className="text-sm text-gray-600">3% OFF</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#9932cc" }}></div>
                      <div>
                        <div className="font-bold text-primary">Purple</div>
                        <div className="text-sm text-gray-600">1% OFF</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      <strong className="text-primary">Cornwall's Local Clearance Service</strong> • Professional • Discrete • Reliable
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            How The Sailor's Wheel Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Complete Your Clearance</h3>
              <p className="text-neutral-wood">
                After we finish your house clearance service, you get access to spin our special wheel!
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <RotateCw className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Spin & Win</h3>
              <p className="text-neutral-wood">
                Land on the golden "50% OFF" segment (1 in 100 chance) to win half off your entire clearance bill!
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-foreground rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-4">Tag & Share</h3>
              <p className="text-neutral-wood">
                Tag and share your result - let us know how you did and whether you think you'll get it on the day!
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <Card className="bg-primary text-white p-8">
              <CardContent>
                <h3 className="text-2xl font-bold mb-4">Ready for Your Real Clearance?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Book your house clearance service today and get your chance to spin the real wheel!
                </p>
                <Button
                  className="bg-white text-primary hover:bg-neutral-paper px-8 py-3 text-lg font-semibold"
                  onClick={() => window.location.href = '/clearance'}
                >
                  Book Your Clearance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Important Disclaimer */}
      <div className="py-8 bg-neutral-50 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
            <strong className="text-primary">Important:</strong> All discounts apply exclusively to the removal and clearance of waste materials only. 
            These offers do not include other services such as cleaning, handyman work, refurbishment, tree surgery, or any additional services beyond waste clearance and removal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpinWheelPage;