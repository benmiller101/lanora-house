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
  Compass,
  Waves
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const PenzanceClearancePage = () => {
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
    formData.append('serviceType', 'penzance-clearance');
    formData.append('location', 'Penzance');
    
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
      title: "Full & Partial House Clearances",
      description: "Complete or selective property clearances",
      highlight: "Flexible options"
    },
    {
      icon: <TreePine className="w-8 h-8 text-green-600" />,
      title: "Garden & Shed Clearance",
      description: "Outdoor spaces and storage clearances",
      highlight: "Garden specialists"
    },
    {
      icon: <Building className="w-8 h-8 text-indigo-600" />,
      title: "Garage, Loft & Basement",
      description: "Storage space and basement clearouts",
      highlight: "Space experts"
    },
    {
      icon: <Building className="w-8 h-8 text-purple-600" />,
      title: "Office, Shop & Commercial",
      description: "Business premises clearances",
      highlight: "Commercial focus"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Probate & Estate Clearance",
      description: "Sensitive support during difficult times",
      highlight: "Compassionate care"
    },
    {
      icon: <Building className="w-8 h-8 text-pink-600" />,
      title: "Hoarded Property Support",
      description: "Discreet and compassionate hoarder clearances",
      highlight: "Expert support"
    },
    {
      icon: <Monitor className="w-8 h-8 text-yellow-600" />,
      title: "WEEE & Electronic Waste",
      description: "Safe disposal of electronic items",
      highlight: "WEEE certified"
    },
    {
      icon: <Trash2 className="w-8 h-8 text-gray-600" />,
      title: "Wait & Load Services",
      description: "Flexible timing and collection options",
      highlight: "Convenient service"
    }
  ];

  const whyChooseUs = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Local Team",
      description: "Fast response times in West Cornwall"
    },
    {
      icon: <Leaf className="w-6 h-6 text-green-600" />,
      title: "Sustainable Practices",
      description: "Minimal environmental impact approach"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "No Third-Party Contractors",
      description: "Our own trucks and trained staff"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Licensed & Insured",
      description: "Fully licensed waste carriers"
    },
    {
      icon: <Users className="w-6 h-6 text-green-700" />,
      title: "Discreet & Compassionate",
      description: "Experienced and understanding approach"
    }
  ];

  const clientTypes = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Homeowners & Tenants",
      description: "Residential clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      title: "Estate Agents & Solicitors",
      description: "Property professionals"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Councils & Landlords",
      description: "Official organizations"
    },
    {
      icon: <Building className="w-6 h-6 text-indigo-600" />,
      title: "Retail & Hospitality",
      description: "Business clearances"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Vulnerable Individuals",
      description: "Supportive care"
    }
  ];

  const nearbyAreas = [
    "Newlyn", "Marazion", "Mousehole", "St Just", "St Buryan", "Land's End", "West Penwith"
  ];

  const faqs = [
    {
      question: "How quickly can you clear a property in Penzance?",
      answer: "Often within 24–48 hours. Same-day service may be available — just ask!"
    },
    {
      question: "What happens to everything you remove?",
      answer: "Items are recycled, donated, or responsibly disposed of. We aim to avoid landfill wherever possible."
    },
    {
      question: "Can you handle probate and sensitive situations?",
      answer: "Yes – we're experienced in discreet, respectful clearances for estate and probate cases."
    },
    {
      question: "Do you take everything, including carpets and fridges?",
      answer: "Yes — we can remove most items, including furniture, appliances, and fixtures."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Property Clearance Penzance West Cornwall - Trusted Clearance Experts | Lanora House</title>
        <meta name="description" content="Trusted property clearance experts serving Penzance and West Cornwall with care and professionalism. Eco-conscious clearance for homes, gardens, commercial units." />
        <meta name="keywords" content="house clearance Penzance, property clearance Penzance Cornwall, probate clearance Penzance, commercial clearance Penzance, waste removal Penzance" />
        <meta property="og:title" content="Property Clearance Penzance West Cornwall | Lanora House" />
        <meta property="og:description" content="Trusted property clearance in Penzance. Local team with fast response times and sustainable practices." />
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
              <Compass className="w-4 h-4 mr-1" />
              Serving Penzance
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Trusted
              <br />
              <span className="text-3xl md:text-5xl flex items-center justify-center gap-3 flex-wrap">
                Clearance Experts
                <span className="text-2xl md:text-3xl text-gray-600 font-normal">Penzance</span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Looking for a reliable house clearance service in Penzance? Whether you're moving, renovating, managing a bereavement, or helping a relative with hoarded items, Lanora House is here to make the process easy.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're based locally in Cornwall, fully licensed, and offer eco-conscious property clearance for homes, gardens, sheds, commercial units, and more — always with compassion and respect. <a href="tel:+447843930927" className="text-primary hover:underline">Call us today</a> for compassionate service.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Penzance Clearance Quote</DialogTitle>
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
                            <SelectItem value="commercial">Commercial Property</SelectItem>
                            <SelectItem value="shop">Shop/Retail</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="estate-property">Estate Property</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Property Address in Penzance *</Label>
                      <Input
                        id="address"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full address in Penzance area"
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
                            <SelectItem value="full-house">Full House Clearance</SelectItem>
                            <SelectItem value="partial-house">Partial House Clearance</SelectItem>
                            <SelectItem value="garden-shed">Garden & Shed Clearance</SelectItem>
                            <SelectItem value="garage-loft-basement">Garage, Loft & Basement</SelectItem>
                            <SelectItem value="office-shop-commercial">Office, Shop & Commercial</SelectItem>
                            <SelectItem value="probate-estate">Probate & Estate Clearance</SelectItem>
                            <SelectItem value="hoarded-property">Hoarded Property Support</SelectItem>
                            <SelectItem value="weee-electronic">WEEE & Electronic Waste</SelectItem>
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
                            <SelectItem value="same-day">Same Day (if available)</SelectItem>
                            <SelectItem value="24-48-hours">24-48 Hours</SelectItem>
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
                        placeholder="Any parking restrictions, narrow access, stairs, or other access issues in Penzance we should know about?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={quoteForm.specialRequirements}
                        onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                        placeholder="Any valuable items for appraisal, hazardous materials, sensitive situation requirements?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Tell us more about your clearance requirements in Penzance"
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

      {/* Penzance Location Showcase Section */}
      <section className="py-16 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Location Info */}
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Compass className="w-4 h-4 mr-1" />
                Proudly Serving Penzance
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                West Cornwall's
                <br />
                <span className="text-2xl md:text-3xl text-gray-700">Most Westerly Service</span>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg leading-relaxed">
                  <strong className="text-primary">Cornwall-based specialists</strong> serving Penzance and West Penwith. We understand this unique coastal community and its clearance needs.
                </p>
                <p className="leading-relaxed">
                  From the historic town center to the coastal villages like Newlyn and Mousehole, from family homes to business premises, we provide trusted clearance services throughout the Land's End peninsula.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Fast Response</div>
                      <div className="text-sm text-gray-600">24-48 hour service</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Zero-to-Landfill</div>
                      <div className="text-sm text-gray-600">Sustainable practices</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interactive Map */}
            <div className="relative">
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Find Us in Penzance</h3>
                  <p className="text-gray-600">UK's Most Westerly Major Town</p>
                </div>
                
                {/* Embedded Google Maps */}
                <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-200 h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10147.477524778273!2d-5.5357!3d50.1188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486ab3e5e5e5e5e5%3A0x404c6d0fb97d9b!2sPenzance%2C%20UK!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                    title="Penzance Location Map"
                  />
                </div>
                
                {/* Penzance Fun Facts */}
                <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-gray-900">Did You Know?</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>🌊 <strong>Most Westerly:</strong> UK's most westerly major town in mainland Britain</div>
                    <div>🏊 <strong>Jubilee Pool:</strong> Only geothermal seawater lido in Cornwall</div>
                    <div>🎭 <strong>Pirates Connection:</strong> Setting for Gilbert & Sullivan's "Pirates of Penzance"</div>
                    <div>🌅 <strong>Land's End Gateway:</strong> Perfect base for exploring Cornwall's dramatic coast</div>
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
              What We Clear in Penzance
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Complete Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether it's a single room or a multi-floor property, we handle everything — responsibly.
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
        </div>
      </section>

      {/* Recent Work Near Penzance */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Star className="w-4 h-4 mr-1" />
              Real Jobs, Real Results
            </Badge>
            <h2 className="text-3xl font-bold text-primary mb-3">Recent Work Near Penzance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A large garden clearance carried out near Penzance — years of overgrowth cleared to give the client a blank canvas.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "/uploads/before-after/image-1779696508795-60443509bb52.jpg",
              "/uploads/before-after/image-1779696508795-c48d1a7e3008.jpg",
              "/uploads/before-after/image-1779696508833-8ead23e27cb7.jpg",
              "/uploads/before-after/image-1779696508828-4556da671514.jpg",
            ].map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md">
                <img src={src} alt="Garden clearance near Penzance, Cornwall" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/before-after">See All Our Work</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Eco-Friendly Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
            <Leaf className="w-4 h-4 mr-1" />
            Environmentally Friendly
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            House Clearance in Penzance
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We believe in clearance with a conscience. With our zero-to-landfill promise, you get peace of mind knowing your clearance is handled the right way.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Donate Items</h3>
              <p className="text-gray-600 text-sm">To local charities</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sort & Recycle</h3>
              <p className="text-gray-600 text-sm">As much as possible</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Appraise & Resell</h3>
              <p className="text-gray-600 text-sm">Valuable items</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Documentation</h3>
              <p className="text-gray-600 text-sm">Transfer notes provided</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Leaf className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="font-bold text-lg mb-2">Safe Disposal</h3>
              <p className="text-gray-600 text-sm">Hazardous waste handled legally</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Choose Lanora House in Penzance?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just here to "clear and dump" — we treat every property with respect and every item with care.
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
              Serving Families, Landlords & Businesses Across Penzance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're dealing with probate, managing a rental, running a business, or simply reclaiming your space — Lanora House is your trusted local clearance partner.
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
            Nearby Areas We Also Serve
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
                    <Compass className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Book a Local Clearance in Penzance Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us now for a free, no-obligation quote and let us take the stress out of clearing your space.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Penzance Clearance Quote</DialogTitle>
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
              <h3 className="text-2xl font-bold mb-4">Ethical House Clearance in Penzance – Done Right</h3>
              <p className="text-lg opacity-90">
                Clear space, reduce stress, and do it the responsible way with Lanora House.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PenzanceClearancePage;