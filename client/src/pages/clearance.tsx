import React, { useState } from "react";
import clearanceBgImage from "@assets/Clearance_side_by_side-100_1774376686481.jpg";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { 
  Recycle, 
  Coins, 
  TreePine, 
  Laptop, 
  ShoppingCart,
  TrendingUp,
  Leaf,
  Home,
  ArrowRight,
  CheckCircle,
  Phone,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";
import DifferenceWeMake from "@/components/home/DifferenceWeMake";

const ClearancePage = () => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    clearanceType: "",
    timeframe: "",
    additionalInfo: "",
    images: [] as File[]
  });

  const { toast } = useToast();

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/clearance-stories/quotes", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit quote request");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Submitted",
        description: "We'll contact you within 24 hours with your free quote.",
      });
      setIsQuoteDialogOpen(false);
      setQuoteForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        propertyType: "",
        clearanceType: "",
        timeframe: "",
        additionalInfo: "",
        images: []
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Add text fields
    Object.entries(quoteForm).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value as string);
      }
    });
    
    // Add image files
    quoteForm.images.forEach((file, index) => {
      formData.append(`images`, file);
    });
    
    submitQuoteMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setQuoteForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setQuoteForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newFiles].slice(0, 5) // Max 5 images
      }));
    }
  };

  const removeImage = (index: number) => {
    setQuoteForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const services = [
    {
      icon: <Coins className="w-8 h-8 text-primary" />,
      title: "Charity Donations",
      description: "Give items a second life. Usable furniture, clothing, toys, and household items are identified during clearance and donated to local charities and community organisations, helping support those in need while reducing landfill.",
      highlight: "Supporting local communities"
    },
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      title: "Smart Sorting",
      description: "Hand-sorted items for maximum reuse and recycling. Less waste to landfill means lower costs for you.",
      highlight: "Sustainable waste management"
    },
    {
      icon: <Home className="w-8 h-8 text-primary" />,
      title: "Material Reuse",
      description: "Partner with local contractors to repurpose materials like glass and ceramics as aggregate for construction.",
      highlight: "Half a tonne of rubble saved from landfill"
    },
    {
      icon: <TreePine className="w-8 h-8 text-primary" />,
      title: "Wood to Energy",
      description: "All wood waste is chipped and sent to generate renewable energy at green power stations.",
      highlight: "Supporting the circular economy"
    },
    {
      icon: <Laptop className="w-8 h-8 text-primary" />,
      title: "Cardboard & Packaging",
      description: "Support local, reduce waste. We sort and separate clean cardboard and packaging during clearance. Where possible, these are donated to small business owners, crafters, and local traders who reuse them for shipping, storage, or display.",
      highlight: "Supporting small businesses"
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary" />,
      title: "Food Bank Donations",
      description: "Usable, in-date food and household essentials are donated to local food banks.",
      highlight: "Nothing useful goes to waste"
    }
  ];


  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Sustainable House Clearances Cornwall & Devon"
        description="Professional house clearances across Cornwall and Devon. Sustainable property clearances for homeowners, landlords, and estates. We donate, recycle and reuse."
        path="/clearance"
      />
      
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-5rem)] overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-center bg-cover blur-[3px] scale-105 grayscale" style={{ backgroundImage: `url(${clearanceBgImage})` }} />
        <div className="absolute inset-0 bg-[#111138]/90" />
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 mb-4 bg-secondary/20 text-secondary border border-secondary/60 text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
            <MapPin className="w-3.5 h-3.5" />
            Cornwall &amp; Devon Specialists
          </span>
          <h1 className="font-display text-3xl md:text-[3rem] leading-tight text-white mb-4 drop-shadow-lg">
            Sustainable <span className="text-secondary">House Clearances</span>
          </h1>
          <p className="text-neutral-200 text-base md:text-lg mb-3 font-light max-w-lg mx-auto leading-relaxed">
            Lanora House provides professional, reliable &amp; affordable house clearances across Cornwall and Devon. If it's not urgent, we'll happily travel further to help!
          </p>
          <p className="text-white/50 text-xs md:text-sm mb-8 tracking-wide">
            We give unwanted items a second life &middot; Saving you money &amp; supporting local communities
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-primary py-2.5 px-7 rounded-md transition-colors font-semibold text-base shadow-md whitespace-nowrap"
                  disabled={submitQuoteMutation.isPending}
                >
                  {submitQuoteMutation.isPending ? (
                    <>
                      <SustainableLoader variant="grow" size="sm" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Get Free Valuation
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    </>
                  )}
                </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Get Your Free Clearance Quote</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleQuoteSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={quoteForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={quoteForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={quoteForm.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+44 7XXX XXX XXX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select value={quoteForm.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="flat">Flat/Apartment</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="commercial">Commercial Property</SelectItem>
                            <SelectItem value="storage">Storage Unit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Property Address *</Label>
                      <Input
                        id="address"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full property address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clearanceType">Clearance Type</Label>
                        <Select value={quoteForm.clearanceType} onValueChange={(value) => handleInputChange("clearanceType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clearance type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-house">Full House Clearance</SelectItem>
                            <SelectItem value="partial">Partial Clearance</SelectItem>
                            <SelectItem value="single-room">Single Room</SelectItem>
                            <SelectItem value="garage-shed">Garage/Shed</SelectItem>
                            <SelectItem value="garden">Garden Clearance</SelectItem>
                            <SelectItem value="office">Office Clearance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeframe">Preferred Timeframe</Label>
                        <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="When do you need this done?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent (Within 1 week)</SelectItem>
                            <SelectItem value="flexible">Flexible (1-4 weeks)</SelectItem>
                            <SelectItem value="planned">Planned (1-3 months)</SelectItem>
                            <SelectItem value="no-rush">No Rush</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Tell us more about your clearance requirements, access issues, valuable items, etc."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="images">Photos (Optional)</Label>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mb-2"
                      />
                      <p className="text-sm text-gray-600 mb-3">
                        Upload photos of the areas to be cleared (max 5 images, 5MB each)
                      </p>
                      
                      {quoteForm.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {quoteForm.images.map((file, index) => (
                            <div key={index} className="relative">
                              <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600 p-2">
                                {file.name}
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark"
                        disabled={submitQuoteMutation.isPending}
                      >
                        {submitQuoteMutation.isPending ? "Submitting..." : "Submit Quote Request"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <a
                href="tel:+447843930927"
                className="inline-flex items-center justify-center border border-white/50 hover:bg-white/10 text-white/90 py-2.5 px-7 rounded-md transition-colors font-medium text-base whitespace-nowrap"
              >
                Call Now: +44 7843 930 927
              </a>
            </div>
          </div>
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll down"
          >
            <span className="text-xs tracking-widest uppercase">Learn More</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </section>

      {/* Environmental Impact Stat Callout */}
      <section className="py-16 px-4 bg-secondary-light">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <Badge className="mb-4 bg-secondary text-primary border-secondary-dark">
                <Leaf className="w-4 h-4 mr-1" />
                Our Environmental Impact
              </Badge>
              <p className="text-2xl md:text-3xl font-bold text-primary max-w-3xl mx-auto">
                On average, 2/3 van loads of contents are saved from landfill on every clearance we carry out.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Difference We Make — full-width before/after sliders */}
      <DifferenceWeMake />

      {/* Who Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Who Benefits from Lanora House Clearances?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              At Lanora House, our house and property clearance services are perfect for anyone across Cornwall & Devon who values quick, eco-friendly clearances with a focus on reuse, recycling, and charitable donation.
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Homeowners & Families",
                description: "Moving, downsizing, or decluttering across Cornwall & Devon. Bereavement clearances handled sensitively and respectfully.",
                icon: <Home className="w-8 h-8 text-primary" />,
                benefits: ["Free upfront valuations", "Sensitive service", "Cost-effective solutions"]
              },
              {
                title: "Landlords & Letting Agents", 
                description: "Fast, reliable clearances between tenants. Professional service that gets properties ready quickly.",
                icon: <TrendingUp className="w-8 h-8 text-primary" />,
                benefits: ["Quick turnaround", "Professional service", "Damage-free clearances"]
              },
              {
                title: "Estate Executors & Solicitors",
                description: "Sensitive, efficient probate clearances across Cornwall and Devon. We understand the emotional challenges.",
                icon: <CheckCircle className="w-8 h-8 text-primary" />,
                benefits: ["Probate expertise", "Respectful approach", "Full documentation"]
              },
              {
                title: "Businesses & Offices",
                description: "Relocating, closing, or clearing surplus stock sustainably. Commercial clearances with environmental focus.",
                icon: <Laptop className="w-8 h-8 text-primary" />,
                benefits: ["Sustainable disposal", "Asset recovery", "Flexible scheduling"]
              },
              {
                title: "Community Projects",
                description: "Supporting local charities and community initiatives through our donation programs across the South West.",
                icon: <ShoppingCart className="w-8 h-8 text-primary" />,
                benefits: ["Charity partnerships", "Community support", "Social impact"]
              },
              {
                title: "Eco-Conscious Customers",
                description: "Anyone prioritizing environmental responsibility. Maximum reuse, minimal landfill waste.",
                icon: <TreePine className="w-8 h-8 text-primary" />,
                benefits: ["85% waste diverted", "Renewable energy", "Carbon footprint reduction"]
              }
            ].map((service, index) => (
              <StaggeredItem key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 p-3 bg-secondary/10 rounded-lg">
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {service.description}
                        </p>
                        <div className="space-y-2">
                          {service.benefits.map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredContainer>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                Get Free Valuation
              </Button>
            </Link>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447843930927" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Choose Lanora House for Your Clearance?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Local expertise, sustainable solutions, and cost-effective service across Cornwall and Devon. <a href="tel:+447843930927" className="text-primary hover:underline">Speak to our team</a> about your specific requirements.
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Cornwall & Devon Specialists",
                description: "We regularly cover all parts of Cornwall and Devon, from coastal towns to rural villages. We're local experts ready to assist promptly.",
                icon: <MapPin className="w-8 h-8 text-primary" />,
                highlight: "Local knowledge, prompt service"
              },
              {
                title: "Wider Coverage Available", 
                description: "For less urgent clearances or unique circumstances, we are flexible and can cover areas beyond Cornwall and Devon. Simply ask—we always try to help.",
                icon: <ArrowRight className="w-8 h-8 text-primary" />,
                highlight: "Flexible service area"
              },
              {
                title: "Cost-Effective, Sustainable Solutions",
                description: "By recycling and donating usable items, we minimise waste disposal costs and pass the savings directly back to you.",
                icon: <Coins className="w-8 h-8 text-primary" />,
                highlight: "On average 2/3 van loads saved from landfill on every clearance"
              },
              {
                title: "Supporting Local Communities",
                description: "Unwanted yet usable items like furniture, appliances, electronics, and food essentials are donated to local charities and community projects.",
                icon: <ShoppingCart className="w-8 h-8 text-primary" />,
                highlight: "30% electronics profits to charity"
              },
              {
                title: "Environmentally Conscious",
                description: "We follow a strict, eco-friendly process ensuring minimal landfill waste. Wood becomes renewable energy, electronics are recycled responsibly.",
                icon: <TreePine className="w-8 h-8 text-primary" />,
                highlight: "85% waste diverted from landfill"
              },
              {
                title: "Professional & Reliable",
                description: "Fully insured, experienced team providing courteous service. We handle everything from sensitive bereavement clearances to large commercial projects.",
                icon: <CheckCircle className="w-8 h-8 text-primary" />,
                highlight: "Fully insured & experienced"
              }
            ].map((feature, index) => (
              <StaggeredItem key={index}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">
                          ✅ {feature.title}
                        </h3>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="bg-primary/10 px-3 py-2 rounded-lg">
                          <span className="text-primary font-semibold text-sm">
                            {feature.highlight}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredContainer>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                Get Free Valuation
              </Button>
            </Link>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447843930927" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Comprehensive Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From cash-for-goods assessments to renewable energy conversion - we maximize value recovery and minimize environmental impact across Cornwall & Devon
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      {service.icon}
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {service.highlight}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                Get Free Valuation
              </Button>
            </Link>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447843930927" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl text-primary font-bold mb-4">
              Our Sustainable Clearance Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every clearance across Cornwall &amp; Devon follows our proven 6-step sustainability framework
            </p>
          </div>

          {(() => {
            const steps = [
              {
                title: "Responsible Rehoming",
                description: "Suitable items are donated, resold, or recycled through a range of channels. We always aim to keep items out of landfill."
              },
              {
                title: "Detailed Hand Sorting",
                description: "Everything is sorted by hand to maximise reuse and minimise landfill at every stage."
              },
              {
                title: "Local Material Reuse",
                description: "Glass, ceramics, and building materials are passed to trusted local contractors for reuse."
              },
              {
                title: "Certified Recycling Streams",
                description: "Paper, plastics, metals, and electronics go to certified recycling facilities nearby."
              },
              {
                title: "Community Donations",
                description: "Usable goods are donated directly to food banks and charities across the South West."
              },
              {
                title: "Renewable Energy Recovery",
                description: "Wood waste is chipped and converted into renewable energy, supporting the local green economy."
              }
            ];

            return (
              <>
                {/* Desktop: horizontal stepper */}
                <div className="hidden md:flex items-start">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="flex-1 flex flex-col items-center relative px-2"
                    >
                      {/* Left connector */}
                      {index > 0 && (
                        <div className="absolute top-6 right-1/2 left-0 h-0.5 bg-primary/20" />
                      )}
                      {/* Right connector */}
                      {index < steps.length - 1 && (
                        <div className="absolute top-6 left-1/2 right-0 h-0.5 bg-primary/20" />
                      )}
                      {/* Circle */}
                      <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md mb-4 flex-shrink-0">
                        {index + 1}
                      </div>
                      <h3 className="font-bold text-primary text-center text-sm leading-snug mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm text-center leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile: vertical stepper */}
                <div className="md:hidden flex flex-col">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className="flex gap-4"
                    >
                      {/* Circle + vertical line */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shadow-md">
                          {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                          <div className="w-0.5 bg-primary/20 flex-1 my-1" style={{ minHeight: "2rem" }} />
                        )}
                      </div>
                      {/* Text */}
                      <div className="pb-8 pt-1.5">
                        <h3 className="font-bold text-primary text-base leading-snug mb-1">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            );
          })()}
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                Get Free Valuation
              </Button>
            </Link>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447843930927" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Coverage Area Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Serving Cornwall, Devon & Beyond
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              House clearance Cornwall, property clearance Devon, sustainable clearances South West - we're your local specialists
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Cornwall Coverage</h3>
                <p className="text-gray-600 mb-4">
                  House clearances across all Cornwall regions - from Penzance to Bodmin, St. Ives to Falmouth
                </p>
                <div className="text-sm text-gray-600">
                  Declutter home Cornwall • Probate clearances Cornwall • Landlord clearances Cornwall
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Devon Coverage</h3>
                <p className="text-gray-600 mb-4">
                  Property clearances throughout Devon - Plymouth to Exeter, Torquay to Barnstaple
                </p>
                <div className="text-sm text-gray-600">
                  Downsizing clearance Devon • Commercial clearances Devon • Bereavement clearances Devon
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Contact Us Today</h3>
                <p className="text-gray-600 mb-4">
                  Ready for eco-friendly clearances? Call now for your free quote
                </p>
                <a 
                  href="tel:+447843930927" 
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +44 7843 930 927
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Cornwall & Devon's Most Sustainable Clearance Service?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Get your free quote today and discover how much you can save while supporting local communities and protecting the environment
          </p>
          <div className="flex justify-center">
            <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-xl px-12 py-6 h-auto">
                  Get Free Valuation
                  <ArrowRight className="w-6 h-6 ml-4" />
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClearancePage;