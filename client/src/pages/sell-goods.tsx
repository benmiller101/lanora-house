import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  FiUpload, 
  FiClock, 
  FiTruck, 
  FiDollarSign, 
  FiCheckCircle, 
  FiMapPin,
  FiPackage,
  FiUser,
  FiMail
} from "react-icons/fi";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/contexts/ModalContext";

export default function SellGoods() {
  const { isAuthenticated } = useAuth();
  const { openRegisterModal } = useModals();
  
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const buyCategories = [
    "Furniture (antique, vintage, retro, modern)",
    "Garden Items (ornaments, furniture, tools)",
    "Architectural Salvage & Reclaimed Materials",
    "Collectibles (vintage toys, comics, records, memorabilia)",
    "Antiques (curiosities, heirlooms, small items)",
    "Homeware (mirrors, lighting, décor, soft furnishings)",
    "Industrial Items (tools, equipment, storage)",
    "White Goods (modern and in working condition)",
    "Retro Electronics (hi-fi, audio, record players, radios)",
    "Art & Decorative Items (paintings, prints, ceramics)",
    "House Clearance Contents (mixed lots, job lots)",
    "Unusual or Hard-to-Find Items",
    "Shop or Business Stock (liquidations, clearances)"
  ];

  const benefits = [
    { icon: FiCheckCircle, text: "We Buy Almost Anything" },
    { icon: FiMapPin, text: "Based in Cornwall – Operating Across Devon" },
    { icon: FiPackage, text: "UK-Wide for Smaller Items" },
    { icon: FiClock, text: "Fast Offers & Hassle-Free Service" },
    { icon: FiCheckCircle, text: "Trusted & Professional" },
    { icon: FiDollarSign, text: "Fast, Secure Payment" }
  ];

  const process = [
    {
      step: 1,
      icon: FiUser,
      title: "Create a Free Account",
      description: "Register for your Members' Portal to upload items securely.",
      cta: "Create Account"
    },
    {
      step: 2,
      icon: FiUpload,
      title: "Upload Your Items",
      description: "Log in to submit photos, descriptions, and condition details. The more info you provide, the quicker your valuation.",
      cta: "Upload Items"
    },
    {
      step: 3,
      icon: FiClock,
      title: "Receive Your Offer",
      description: "We'll review your submission and provide a fast, fair, no-obligation offer within 24 working hours.",
      highlight: "Within 24 Hours"
    },
    {
      step: 4,
      icon: FiTruck,
      title: "Arrange Collection or Delivery",
      description: "Cornwall & Devon: We collect large furniture and bulk clearances. Nationwide: We arrange postage or couriers for smaller items.",
      areas: ["Cornwall & Devon Collection", "Nationwide Shipping"]
    },
    {
      step: 5,
      icon: FiDollarSign,
      title: "Get Paid Fast",
      description: "We pay by secure bank transfer within 24 hours of receiving your goods.",
      highlight: "24 Hour Payment"
    }
  ];

  return (
    <>
      <SEOHead
        title="Sell Your Goods - We Buy Anything Cornwall & Devon"
        description="Sell unwanted furniture, antiques, collectibles, and reclaimed goods fast in Cornwall and Devon. Quick valuations, fair prices, hassle-free collections."
        path="/sell-goods"
      />
      
      <div className="min-h-screen bg-neutral-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div {...fadeInUp}>
              <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
                We Buy <span className="text-primary">Anything & Everything</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-600 mb-4 max-w-4xl mx-auto">
                Sell to Lanora House Today
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="outline" className="text-base py-2 px-4">
                  <FiMapPin className="mr-2" />
                  Cornwall | Devon
                </Badge>
                <Badge variant="outline" className="text-base py-2 px-4">
                  <FiPackage className="mr-2" />
                  Nationwide (Smaller Items)
                </Badge>
              </div>
              <p className="text-lg text-neutral-700 mb-8 max-w-3xl mx-auto">
                We're fast, flexible, and always ready to help you turn unwanted items into cash. 
                If it's got value, we'll offer you a price.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link to="/members?tab=submissions">
                    <Button size="lg" className="text-lg px-8 py-6">
                      <FiUpload className="mr-2" />
                      Upload Your Items Now
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6"
                    onClick={openRegisterModal}
                  >
                    <FiUser className="mr-2" />
                    Create Your Free Account
                  </Button>
                )}
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    <FiMail className="mr-2" />
                    Got Questions?
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What We Buy Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                What Do We Buy? <span className="text-primary">Pretty Much Everything...</span>
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buyCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-neutral-700">{category}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Areas */}
        <section className="py-16 px-4 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <FiTruck className="text-primary text-2xl" />
                      <h3 className="text-2xl font-bold">Cornwall & Devon Collections</h3>
                    </div>
                    <p className="text-neutral-600 mb-4">
                      We collect large items locally, including furniture, bulk clearances, and awkward items. 
                      Based in Cornwall and operating across Devon.
                    </p>
                    <ul className="space-y-2 text-neutral-700">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" />
                        Large furniture collections
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" />
                        House clearance contents
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" />
                        Bulk and awkward items
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <FiPackage className="text-primary text-2xl" />
                      <h3 className="text-2xl font-bold">UK-Wide for Smaller Items</h3>
                    </div>
                    <p className="text-neutral-600 mb-4">
                      If it fits in a box or can be shipped safely, we're interested — no matter where you are in the UK.
                    </p>
                    <ul className="space-y-2 text-neutral-700">
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" />
                        Antiques and collectibles
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" />
                        Homeware and décor
                      </li>
                      <li className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" />
                        Postable and shippable goods
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Our Process – <span className="text-primary">Fast, Simple, Fair</span>
              </h2>
            </motion.div>
            
            <div className="space-y-8">
              {process.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">{step.step}</span>
                          </div>
                          <step.icon className="text-2xl text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                          <p className="text-neutral-600 mb-4">{step.description}</p>
                          
                          {step.highlight && (
                            <Badge variant="secondary" className="mb-4">
                              {step.highlight}
                            </Badge>
                          )}
                          
                          {step.areas && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {step.areas.map((area, i) => (
                                <Badge key={i} variant="outline">{area}</Badge>
                              ))}
                            </div>
                          )}
                          
                          {step.cta && (
                            <>
                              {step.step === 1 ? (
                                <Button 
                                  variant="outline"
                                  onClick={openRegisterModal}
                                >
                                  {step.cta}
                                </Button>
                              ) : (
                                <Link to="/members?tab=submissions">
                                  <Button variant="outline">
                                    {step.cta}
                                  </Button>
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Why Sell to <span className="text-primary">Lanora House?</span>
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <benefit.icon className="text-3xl text-primary mx-auto mb-3" />
                      <p className="font-medium text-neutral-800">{benefit.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Turn Unwanted Goods into Cash?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Fast valuations, direct offers, and secure payment. No endless haggling. No strangers visiting your house. No commission fees.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link to="/members?tab=submissions">
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                      <FiUpload className="mr-2" />
                      Get a Fast Valuation – Upload Your Items Now
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="text-lg px-8 py-6"
                    onClick={openRegisterModal}
                  >
                    <FiUser className="mr-2" />
                    Create Your Free Seller Account Today
                  </Button>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-lg opacity-90 mb-2">
                  <strong>We Buy Anything Cornwall & Devon – And We Buy Nationwide for Smaller Items.</strong>
                </p>
                <p className="opacity-75">
                  If it's got value, we're interested. Simple.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}