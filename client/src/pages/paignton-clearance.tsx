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

const PaigntonClearancePage = () => {
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
    formData.append('serviceType', 'paignton-clearance');
    formData.append('location', 'Paignton');
    
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
      description: "Complete or selective residential clearances",
      highlight: "Most popular"
    },
    {
      icon: <Home className="w-8 h-8 text-green-600" />,
      title: "Furniture, Beds, Sofas, White Goods & Mattresses",
      description: "Large household item removal",
      highlight: "Heavy items"
    },
    {
      icon: <Building className="w-8 h-8 text-purple-600" />,
      title: "Lofts, Sheds, Basements & Garages",
      description: "Storage space and cellar clearances",
      highlight: "Space specialists"
    },
    {
      icon: <TreePine className="w-8 h-8 text-yellow-600" />,
      title: "Garden & Outdoor Waste Clearance",
      description: "Outdoor area and garden clearances",
      highlight: "Garden experts"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Probate & Estate Property Clearouts",
      description: "Sensitive support during difficult times",
      highlight: "Compassionate care"
    },
    {
      icon: <Shield className="w-8 h-8 text-pink-600" />,
      title: "Hoarded Homes",
      description: "Handled with compassion",
      highlight: "Expert help"
    },
    {
      icon: <Monitor className="w-8 h-8 text-indigo-600" />,
      title: "WEEE & Electronics Disposal",
      description: "Safe disposal of electronic equipment",
      highlight: "WEEE certified"
    },
    {
      icon: <Building className="w-8 h-8 text-gray-600" />,
      title: "Retail, Office & Commercial Premises",
      description: "Business and commercial clearances",
      highlight: "Business focused"
    }
  ];

  const whyChooseUs = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Local Team",
      description: "Fast coverage across South Devon"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Fully Licensed & Insured",
      description: "Licensed waste carriers"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "No Subcontractors",
      description: "Only our own trained staff"
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
      title: "Discreet, Respectful Service",
      description: "Especially for probate or hoarded homes"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
      title: "Transparent Pricing",
      description: "No hidden costs"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Bookings to Suit Your Schedule",
      description: "Even short notice"
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
      title: "Letting Agents & Landlords",
      description: "Property management"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Probate Solicitors & Estate Managers",
      description: "Estate clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-purple-600" />,
      title: "Local Businesses & Retailers",
      description: "Commercial clearances"
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-600" />,
      title: "Housing & Support Agencies",
      description: "Support services"
    }
  ];

  const nearbyAreas = [
    "Goodrington", "Preston", "Churston", "Brixham", "Torquay", "Torbay"
  ];

  const faqs = [
    {
      question: "Do you do probate clearances in Paignton?",
      answer: "Yes – we work with families and legal teams to respectfully manage estate clearances."
    },
    {
      question: "Do you take appliances and bulky furniture?",
      answer: "Absolutely – we remove all types of heavy, awkward items."
    },
    {
      question: "Can you handle hoarded homes or heavily cluttered properties?",
      answer: "Yes – our team is trained and non-judgmental. We're here to help."
    },
    {
      question: "Do you recycle everything?",
      answer: "We recycle and donate as much as possible – landfill is always a last resort."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>House Clearance Paignton South Devon Coast - Professional Property Clearance | Lanora House</title>
        <meta name="description" content="Trusted clearance services for homes and businesses across Paignton and the South Devon coast. Fast, respectful, eco-friendly property clearance with no hidden fees." />
        <meta name="keywords" content="house clearance Paignton, property clearance Paignton Devon, probate clearance Paignton, office clearance Paignton, waste removal Paignton" />
        <meta property="og:title" content="House Clearance Paignton South Devon Coast | Lanora House" />
        <meta property="og:description" content="Professional clearance services in Paignton. Local team with zero-to-landfill approach and transparent pricing." />
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
              Serving Paignton
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Trusted Experts for
              <br />
              <span className="text-3xl md:text-5xl flex items-center justify-center gap-3 flex-wrap">
                House Clearance
                <span className="text-2xl md:text-3xl text-gray-600 font-normal">Paignton</span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Need a reliable and affordable house clearance service in Paignton? Whether you're managing a property after a loved one passes, clearing out after a tenancy, downsizing, or just decluttering — Lanora House is your local, licensed clearance partner.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're committed to delivering fast, respectful, and eco-friendly property clearance services with no hidden fees and a zero-to-landfill approach. <a href="tel:+447456809049" className="text-primary hover:underline">Contact our team</a> for transparent pricing.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Paignton Clearance Quote</DialogTitle>
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
                          placeholder="+44 7456 809049"
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
                            <SelectItem value="terraced">Terraced House</SelectItem>
                            <SelectItem value="detached">Detached House</SelectItem>
                            <SelectItem value="beach-house">Beach House</SelectItem>
                            <SelectItem value="seaside-property">Seaside Property</SelectItem>
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
                      <Label htmlFor="address">Property Address in Paignton *</Label>
                      <Input
                        id="address"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full address in Paignton area"
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
                            <SelectItem value="furniture-white-goods">Furniture, Beds, Sofas, White Goods & Mattresses</SelectItem>
                            <SelectItem value="loft-shed-basement-garage">Lofts, Sheds, Basements & Garages</SelectItem>
                            <SelectItem value="garden-outdoor">Garden & Outdoor Waste Clearance</SelectItem>
                            <SelectItem value="probate-estate">Probate & Estate Property Clearouts</SelectItem>
                            <SelectItem value="hoarded-homes">Hoarded Homes</SelectItem>
                            <SelectItem value="electronic-disposal">WEEE & Electronics Disposal</SelectItem>
                            <SelectItem value="commercial-office">Retail, Office & Commercial Premises</SelectItem>
                            <SelectItem value="hazardous-bio">Hazardous & Biohazardous Waste</SelectItem>
                            <SelectItem value="wait-load">Wait & Load Clearance</SelectItem>
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
                            <SelectItem value="short-notice">Short Notice</SelectItem>
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
                        placeholder="Any parking restrictions, narrow coastal roads, stairs, or other access issues in Paignton we should know about?"
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
                        placeholder="Tell us more about your clearance requirements in Paignton"
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
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Paignton Location Showcase Section */}
      <section className="py-16 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Location Info */}
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Anchor className="w-4 h-4 mr-1" />
                Proudly Serving Paignton
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                South Devon Coast's
                <br />
                <span className="text-2xl md:text-3xl text-gray-700">Historic Seaside Town</span>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg leading-relaxed">
                  <strong className="text-primary">South West specialists</strong> serving Paignton and the South Devon coast. We understand this historic seaside town and its unique clearance needs.
                </p>
                <p className="leading-relaxed">
                  From the town center to the coastal properties, from bungalows to beach houses and beyond, we provide trusted clearance services throughout Paignton and the surrounding area.
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
                      <div className="text-sm text-gray-600">Eco-friendly approach</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interactive Map */}
            <div className="relative">
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Find Us in Paignton</h3>
                  <p className="text-gray-600">Historic Seaside Town, South Devon Coast</p>
                </div>
                
                {/* Embedded Google Maps */}
                <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-200 h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20374.955049556546!2d-3.5626!3d50.4357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486c3f8b5a8d5a5a%3A0x4b9b8b4b0c5d0e!2sPaignton%2C%20UK!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                    title="Paignton Location Map"
                  />
                </div>
                
                {/* Paignton Fun Facts */}
                <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-gray-900">Did You Know?</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>⚓ <strong>Historic Pier:</strong> Paignton Pier opened in 1879</div>
                    <div>🏛️ <strong>Best-Preserved:</strong> One of the UK's best-preserved piers</div>
                    <div>🎠 <strong>Seaside Fun:</strong> Home to amusements and food stalls year-round</div>
                    <div>🌊 <strong>Torbay Heritage:</strong> Part of the beautiful English Riviera</div>
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
              What We Clear in Paignton
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Complete Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We take care of the heavy lifting — you get your space back, stress-free.
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

      {/* Eco-Friendly Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
            <Leaf className="w-4 h-4 mr-1" />
            Responsible Waste Disposal in Paignton
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            We Don't Just Clear – We Sort, Reuse, Recycle, and Rehome
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            At Lanora House, we work hard to reduce waste and give back wherever possible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">All Suitable Items</h3>
              <p className="text-gray-600 text-sm">Recycled or donated</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Good Condition Items</h3>
              <p className="text-gray-600 text-sm">Given to local charities</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Valuables Appraised</h3>
              <p className="text-gray-600 text-sm">And sold at auction</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Hazardous Materials</h3>
              <p className="text-gray-600 text-sm">Safely handled & documented</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Waste Transfer Notes</h3>
              <p className="text-gray-600 text-sm">All necessary documentation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Paignton Chooses Lanora House
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help – from bungalows to beach houses and beyond.
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
              Who We Help
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No job is too big, too small, or too sensitive — we'll take care of it.
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
            Also Covering Nearby Areas
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
              Book Your Paignton House Clearance Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Clear your space the right way – quickly, affordably, and responsibly with Lanora House.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Paignton Clearance Quote</DialogTitle>
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
                          placeholder="+44 7456 809049"
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
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
            </div>
            
            <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">Paignton's Trusted Clearance Service – Lanora House</h3>
              <p className="text-lg opacity-90">
                Reclaim your space with fast, affordable and ethical property clearance.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PaigntonClearancePage;