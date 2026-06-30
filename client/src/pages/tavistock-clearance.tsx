import React, { useState } from "react";
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
import { Helmet } from "react-helmet";
import { 
  MapPin,
  Home,
  TreePine,
  Heart,
  Building,
  Trash2,
  Monitor,
  Clock,
  Shield,
  CheckCircle,
  Phone,
  Mail,
  ArrowRight,
  Leaf,
  Users,
  Star,
  Truck,
  Anchor,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const TavistockClearancePage = () => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    clearanceType: "",
    timeframe: "",
    accessRestrictions: "",
    specialRequirements: "",
    additionalInfo: "",
    images: [] as File[]
  });

  const { toast } = useToast();

  const submitQuoteMutation = useMutation({
    mutationFn: (data: FormData) => {
      return fetch("/api/clearance-stories/quotes", {
        method: "POST",
        body: data,
        credentials: "include",
      }).then((res) => res.json());
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
        accessRestrictions: "",
        specialRequirements: "",
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
    
    // Add service type
    formData.append('serviceType', 'tavistock-clearance');
    formData.append('location', 'Tavistock');
    
    // Add image files
    quoteForm.images.forEach((file) => {
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
      icon: <Home className="w-8 h-8 text-blue-600" />,
      title: "Full & Partial Home Clearances",
      description: "Complete or selective residential clearances",
      highlight: "Most popular"
    },
    {
      icon: <Home className="w-8 h-8 text-green-600" />,
      title: "Furniture, Mattresses, White Goods & Bulky Items",
      description: "Large household item removal",
      highlight: "Heavy items"
    },
    {
      icon: <Building className="w-8 h-8 text-purple-600" />,
      title: "Lofts, Sheds, Garages & Garden Waste",
      description: "Storage spaces and outdoor clearances",
      highlight: "Space specialists"
    },
    {
      icon: <Home className="w-8 h-8 text-yellow-600" />,
      title: "Flats, Bungalows & Outbuildings",
      description: "All types of residential properties",
      highlight: "Property experts"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Probate & Deceased Estate Properties",
      description: "Sensitive support during difficult times",
      highlight: "Compassionate care"
    },
    {
      icon: <Shield className="w-8 h-8 text-pink-600" />,
      title: "Hoarded or High-Volume Waste Homes",
      description: "Professional support for challenging situations",
      highlight: "Expert help"
    },
    {
      icon: <Monitor className="w-8 h-8 text-indigo-600" />,
      title: "WEEE (Electronic Waste) & IT Equipment",
      description: "Safe disposal of electronic equipment",
      highlight: "WEEE certified"
    },
    {
      icon: <Building className="w-8 h-8 text-gray-600" />,
      title: "Offices, Shops & Commercial Clearances",
      description: "Business and commercial clearances",
      highlight: "Business focused"
    }
  ];

  const whyChooseUs = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "West Devon-Based Team",
      description: "Fast, local service"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Fully Licensed & Insured",
      description: "Waste carriers"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "Our Own Vans & Trained Staff",
      description: "No subcontractors"
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
      title: "Discreet & Respectful",
      description: "Especially for sensitive cases"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
      title: "Fair, Upfront Pricing",
      description: "No surprises"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Flexible Scheduling",
      description: "Including urgent callouts"
    }
  ];

  const clientTypes = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Homeowners & Families",
      description: "Personal clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      title: "Landlords & Letting Agents",
      description: "Property management"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Probate Solicitors & Legal Professionals",
      description: "Estate clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-purple-600" />,
      title: "Local Businesses & Office Managers",
      description: "Commercial clearances"
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-600" />,
      title: "Councils, Housing Trusts & Charities",
      description: "Support services"
    }
  ];

  const nearbyAreas = [
    "Gunnislake", "Yelverton", "Horrabridge", "Bere Alston", "Okehampton", "West Devon"
  ];

  const faqs = [
    {
      question: "Can you handle probate or sensitive clearances?",
      answer: "Yes – we work closely with families and professionals to manage probate and estate clearances with care and discretion."
    },
    {
      question: "Do you remove all items, including white goods and heavy furniture?",
      answer: "Absolutely – we take all standard household items, large or small."
    },
    {
      question: "What happens to cleared items?",
      answer: "We recycle, donate, or resell when possible – always prioritising sustainability."
    },
    {
      question: "Are you licensed for hazardous waste?",
      answer: "Yes – we are fully certified and trained to handle and dispose of hazardous materials responsibly."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>House Clearance Tavistock West Devon - Professional Property Clearance | Lanora House</title>
        <meta name="description" content="Efficient and respectful house clearance services in Tavistock and West Devon with a focus on recycling and care. Zero-to-landfill approach with no hidden charges." />
        <meta name="keywords" content="house clearance Tavistock, property clearance Tavistock Devon, probate clearance Tavistock, office clearance Tavistock, waste removal Tavistock" />
        <meta property="og:title" content="House Clearance Tavistock West Devon | Lanora House" />
        <meta property="og:description" content="Professional clearance services in Tavistock. Local team with eco-conscious approach and flexible scheduling including urgent callouts." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-blue-100/50" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Anchor className="w-4 h-4 mr-1" />
              Serving Tavistock
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Trusted Experts for
              <br />
              <span className="text-3xl md:text-5xl flex items-center justify-center gap-3 flex-wrap">
                House Clearance
                <span className="text-2xl md:text-3xl text-gray-600 font-normal">Tavistock</span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Whether you're managing a probate property, clearing a rental, or simply decluttering your space — Lanora House offers trusted house clearance in Tavistock, tailored to your needs. We're local, licensed, and fully committed to environmentally responsible waste disposal.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              From hoarded homes to light removals — our trained team is here to help, with a zero-to-landfill approach and no hidden charges. <a href="tel:+447843930927" className="text-primary hover:underline">Contact our trained team</a> for professional support.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                    disabled={submitQuoteMutation.isPending}
                  >
                    {submitQuoteMutation.isPending ? (
                      <div className="flex items-center gap-3">
                        <SustainableLoader variant="grow" size="sm" />
                        Submitting...
                      </div>
                    ) : (
                      <>
                        Get Free Quote
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Get Your Free Tavistock Clearance Quote</DialogTitle>
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
                          placeholder="+44 7843 930927"
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
                            <SelectItem value="bungalow">Bungalow</SelectItem>
                            <SelectItem value="cottage">Cottage</SelectItem>
                            <SelectItem value="terraced">Terraced House</SelectItem>
                            <SelectItem value="detached">Detached House</SelectItem>
                            <SelectItem value="dartmoor-property">Dartmoor Property</SelectItem>
                            <SelectItem value="west-devon-property">West Devon Property</SelectItem>
                            <SelectItem value="commercial">Commercial Property</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="retail">Retail Premises</SelectItem>
                            <SelectItem value="probate-estate">Probate Estate</SelectItem>
                            <SelectItem value="rental-property">Rental Property</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Property Address in Tavistock *</Label>
                      <Input
                        id="address"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full address in Tavistock area"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clearanceType">Clearance Type</Label>
                        <Select value={quoteForm.clearanceType} onValueChange={(value) => handleInputChange("clearanceType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="What needs clearing?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-partial-home">Full & Partial Home Clearances</SelectItem>
                            <SelectItem value="furniture-mattresses-white-goods">Furniture, Mattresses, White Goods & Bulky Items</SelectItem>
                            <SelectItem value="loft-shed-garage-garden">Lofts, Sheds, Garages & Garden Waste</SelectItem>
                            <SelectItem value="flats-bungalows-outbuildings">Flats, Bungalows & Outbuildings</SelectItem>
                            <SelectItem value="probate-deceased-estate">Probate & Deceased Estate Properties</SelectItem>
                            <SelectItem value="hoarded-high-volume">Hoarded or High-Volume Waste Homes</SelectItem>
                            <SelectItem value="electronic-weee-it">WEEE (Electronic Waste) & IT Equipment</SelectItem>
                            <SelectItem value="office-shop-commercial">Offices, Shops & Commercial Clearances</SelectItem>
                            <SelectItem value="hazardous-specialist">Hazardous or Specialist Waste</SelectItem>
                            <SelectItem value="wait-load">Wait & Load Services</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeframe">When do you need this done?</Label>
                        <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent-callouts">Urgent Callouts</SelectItem>
                            <SelectItem value="this-week">This Week</SelectItem>
                            <SelectItem value="next-week">Next Week</SelectItem>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accessRestrictions">Access Restrictions</Label>
                      <Textarea
                        id="accessRestrictions"
                        value={quoteForm.accessRestrictions}
                        onChange={(e) => handleInputChange("accessRestrictions", e.target.value)}
                        placeholder="Any parking restrictions, narrow country roads, stairs, or other access issues in Tavistock we should know about?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={quoteForm.specialRequirements}
                        onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                        placeholder="Any sensitive situations, probate clearances, hoarding support, urgent requirements, or need for discretion?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Tell us more about your clearance requirements in Tavistock"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="images">Property Photos (Optional)</Label>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mb-2"
                      />
                      <p className="text-sm text-gray-600 mb-3">
                        Upload photos of areas to be cleared (max 5 images, 5MB each)
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
                        {submitQuoteMutation.isPending ? "Submitting..." : "Get My Free Quote"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-secondary/20 text-lg px-8 py-4 h-auto">
                <a href="tel:+447843930927" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7843 930927
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tavistock Location Showcase Section */}
      <section className="py-16 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Location Info */}
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Anchor className="w-4 h-4 mr-1" />
                Proudly Serving Tavistock
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                West Devon's
                <br />
                <span className="text-2xl md:text-3xl text-gray-700">Historic Market Town</span>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg leading-relaxed">
                  <strong className="text-primary">South West specialists</strong> serving Tavistock and West Devon. We understand this historic market town and its unique clearance needs.
                </p>
                <p className="leading-relaxed">
                  Whether it's a cottage, flat, or large estate, we're equipped and ready to help throughout Tavistock and the surrounding area.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Fast Service</div>
                      <div className="text-sm text-gray-600">Local team coverage</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Zero-to-Landfill</div>
                      <div className="text-sm text-gray-600">Focus on recycling</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interactive Map */}
            <div className="relative">
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Find Us in Tavistock</h3>
                  <p className="text-gray-600">Historic Market Town, West Devon</p>
                </div>
                
                {/* Embedded Google Maps */}
                <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-200 h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20374.955049556546!2d-4.1450!3d50.5477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486c384c384c384c%3A0x4b9b8b4b0c5d0e!2sTavistock%2C%20UK!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                    title="Tavistock Location Map"
                  />
                </div>
                
                {/* Tavistock Fun Facts */}
                <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-gray-900">Did You Know?</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>⚓ <strong>Sir Francis Drake:</strong> Birthplace of the legendary sea captain</div>
                    <div>🌍 <strong>Global Explorer:</strong> Circumnavigated the globe in the 16th century</div>
                    <div>🏰 <strong>Historic Heritage:</strong> Rich history as ancient market town</div>
                    <div>🏔️ <strong>Dartmoor Gateway:</strong> Gateway to stunning Dartmoor National Park</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-300">
              <Truck className="w-4 h-4 mr-1" />
              What We Clear in Tavistock
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Complete Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From hoarded homes to light removals — our trained team is here to help.
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <StaggeredItem key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {service.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-gray-900">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {service.description}
                    </p>
                    <Badge className="bg-primary/10 text-primary text-xs">
                      {service.highlight}
                    </Badge>
                  </CardContent>
                </Card>
              </StaggeredItem>
            ))}
          </StaggeredContainer>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 h-auto">
              <Link href="/contact" data-testid="button-quote-services">No Obligation Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447843930927" className="flex items-center" data-testid="button-call-services" aria-label="Call Lanora House on +44 7843 930927">
                <Phone className="w-5 h-5 mr-3" aria-hidden="true" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Eco-Friendly Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
            <Leaf className="w-4 h-4 mr-1" />
            Responsible House Clearance in Tavistock
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            We Do More Than Clear Properties — We Reuse, Recycle, and Respect the Environment
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We work hard to ensure our clearances have minimal impact on the planet — and help reduce your costs when possible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Recycling & Proper Sorting</h3>
              <p className="text-gray-600 text-sm">Of all materials</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Donating Reusable Items</h3>
              <p className="text-gray-600 text-sm">To West Devon charities</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Valuation & Resale</h3>
              <p className="text-gray-600 text-sm">For items of value</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Licensed Disposal</h3>
              <p className="text-gray-600 text-sm">Of hazardous waste</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">All Legal Documentation</h3>
              <p className="text-gray-600 text-sm">Waste transfer provided</p>
            </div>
          </div>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 h-auto">
              <Link href="/contact" data-testid="button-quote-eco">No Obligation Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447843930927" className="flex items-center" data-testid="button-call-eco" aria-label="Call Lanora House on +44 7843 930927">
                <Phone className="w-5 h-5 mr-3" aria-hidden="true" />
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
              Why Choose Lanora House in Tavistock?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether it's a cottage, flat, or large estate — we're equipped and ready to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                  {reason.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    {reason.title}
                  </h3>
                  <p className="text-gray-600">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Types Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Who We Work With
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No matter the scale or complexity — we clear with care and precision.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {clientTypes.map((client, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {client.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {client.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {client.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Areas Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            Also Serving Nearby Areas
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {nearbyAreas.map((area, index) => (
              <Badge key={index} className="bg-white text-primary border-primary text-lg px-4 py-2">
                <MapPin className="w-4 h-4 mr-2" />
                {area}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-start gap-3">
                    <Anchor className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 pl-8">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Contact CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Book a House Clearance in Tavistock Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Let us take the stress out of your clearance. Get in touch for a free, no-obligation quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" disabled={submitQuoteMutation.isPending}>
                    {submitQuoteMutation.isPending ? (
                      <div className="flex items-center gap-3">
                        <SustainableLoader variant="grow" size="sm" />
                        Submitting...
                      </div>
                    ) : (
                      <>
                        Get Free Quote
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Get Your Free Tavistock Clearance Quote</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleQuoteSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name-bottom">Full Name *</Label>
                        <Input
                          id="name-bottom"
                          required
                          value={quoteForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-bottom">Email Address *</Label>
                        <Input
                          id="email-bottom"
                          type="email"
                          required
                          value={quoteForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone-bottom">Phone Number *</Label>
                        <Input
                          id="phone-bottom"
                          type="tel"
                          required
                          value={quoteForm.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+44 7843 930927"
                        />
                      </div>
                      <div>
                        <Label htmlFor="propertyType-bottom">Property Type</Label>
                        <Select value={quoteForm.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="flat">Flat/Apartment</SelectItem>
                            <SelectItem value="bungalow">Bungalow</SelectItem>
                            <SelectItem value="terraced">Terraced House</SelectItem>
                            <SelectItem value="detached">Detached House</SelectItem>
                            <SelectItem value="student-property">Student Property</SelectItem>
                            <SelectItem value="commercial">Commercial Property</SelectItem>
                            <SelectItem value="garage">Garage/Storage</SelectItem>
                            <SelectItem value="garden">Garden/Outside Area</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address-bottom">Property Address *</Label>
                      <Textarea
                        id="address-bottom"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter the full address where clearance is needed"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clearanceType-bottom">Clearance Type</Label>
                        <Select value={quoteForm.clearanceType} onValueChange={(value) => handleInputChange("clearanceType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clearance type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-house">Full House Clearance</SelectItem>
                            <SelectItem value="partial">Partial House Clearance</SelectItem>
                            <SelectItem value="single-room">Single Room</SelectItem>
                            <SelectItem value="probate">Probate Clearance</SelectItem>
                            <SelectItem value="tenancy">End of Tenancy</SelectItem>
                            <SelectItem value="commercial">Commercial Clearance</SelectItem>
                            <SelectItem value="garage">Garage Clearance</SelectItem>
                            <SelectItem value="garden">Garden Clearance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeframe-bottom">Timeframe</Label>
                        <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent (Within 48 hours)</SelectItem>
                            <SelectItem value="within-week">Within a week</SelectItem>
                            <SelectItem value="within-month">Within a month</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="access-bottom">Access Restrictions</Label>
                      <Textarea
                        id="access-bottom"
                        value={quoteForm.accessRestrictions}
                        onChange={(e) => handleInputChange("accessRestrictions", e.target.value)}
                        placeholder="Any parking restrictions, stairs, narrow access, etc."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="special-bottom">Special Requirements</Label>
                      <Textarea
                        id="special-bottom"
                        value={quoteForm.specialRequirements}
                        onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                        placeholder="Any hazardous materials, valuable items to separate, specific disposal requirements, etc."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="additional-bottom">Additional Information</Label>
                      <Textarea
                        id="additional-bottom"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Anything else you'd like us to know about the clearance"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="images-bottom">Photos (Optional)</Label>
                      <Input
                        id="images-bottom"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Upload photos to help us provide a more accurate quote
                      </p>
                      {quoteForm.images.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Selected files:</p>
                          <ul className="text-sm text-gray-600">
                            {quoteForm.images.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button 
                        type="submit" 
                        disabled={submitQuoteMutation.isPending}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        {submitQuoteMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <SustainableLoader variant="grow" size="sm" />
                            Submitting...
                          </div>
                        ) : (
                          <>
                            Submit Quote Request
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447843930927" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7843 930927
                </a>
              </Button>
            </div>
            
            <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">House Clearance Tavistock – Cleared with Care, the Lanora Way</h3>
              <p className="text-lg opacity-90">
                Let us clear your space quickly, responsibly, and respectfully.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TavistockClearancePage;