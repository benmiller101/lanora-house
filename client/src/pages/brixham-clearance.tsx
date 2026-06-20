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
  Fish,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const BrixhamClearancePage = () => {
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
    formData.append('serviceType', 'brixham-clearance');
    formData.append('location', 'Brixham');
    
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
      title: "Full & Partial House & Flat Clearances",
      description: "Complete or selective residential clearances",
      highlight: "Most popular"
    },
    {
      icon: <Home className="w-8 h-8 text-green-600" />,
      title: "Furniture, White Goods, Mattresses & Bulky Items",
      description: "Large household item removal",
      highlight: "Heavy items"
    },
    {
      icon: <Building className="w-8 h-8 text-purple-600" />,
      title: "Sheds, Lofts, Attics, Garages & Outbuildings",
      description: "Storage space and building clearances",
      highlight: "Space specialists"
    },
    {
      icon: <TreePine className="w-8 h-8 text-yellow-600" />,
      title: "Garden Waste & Green Clearance",
      description: "Outdoor area and garden clearances",
      highlight: "Garden experts"
    },
    {
      icon: <Shield className="w-8 h-8 text-pink-600" />,
      title: "Hoarded Homes & Cluttered Properties",
      description: "Professional support for challenging situations",
      highlight: "Expert help"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Probate Estate Clearances",
      description: "Sensitive support during difficult times",
      highlight: "Compassionate care"
    },
    {
      icon: <Building className="w-8 h-8 text-indigo-600" />,
      title: "Retail & Office Premises",
      description: "Business and commercial clearances",
      highlight: "Business focused"
    },
    {
      icon: <Monitor className="w-8 h-8 text-gray-600" />,
      title: "WEEE (Electronic Waste)",
      description: "Safe disposal of electronic equipment",
      highlight: "WEEE certified"
    }
  ];

  const whyChooseUs = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Based in the South West",
      description: "We know the area"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Fully Licensed & Insured",
      description: "Waste carriers"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "No Subcontractors",
      description: "Just our own vetted team"
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
      title: "Friendly, Judgment-Free Service",
      description: "For all situations"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
      title: "Competitive Quotes",
      description: "No hidden charges"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Book at Your Convenience",
      description: "Urgent slots available"
    }
  ];

  const clientTypes = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Private Homeowners & Families",
      description: "Personal clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      title: "Landlords, Estate Agents & Tenants",
      description: "Property management"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Probate Solicitors & Executors",
      description: "Estate clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-purple-600" />,
      title: "Local Businesses & Shops",
      description: "Commercial clearances"
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-600" />,
      title: "Housing Associations & Care Providers",
      description: "Support services"
    }
  ];

  const nearbyAreas = [
    "Churston", "Galmpton", "Kingswear", "Paignton", "Torquay", "Torbay", "English Riviera"
  ];

  const faqs = [
    {
      question: "Can you handle sensitive clearances like probate or hoarding?",
      answer: "Yes — we offer discreet, compassionate service tailored to your circumstances."
    },
    {
      question: "Will items be recycled or donated?",
      answer: "Wherever possible — we work hard to keep usable items out of landfill."
    },
    {
      question: "Do you remove appliances and large furniture?",
      answer: "Absolutely. We remove all bulky waste, including white goods, wardrobes, and more."
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes – Lanora House is fully compliant with waste carrier regulations and insured for all jobs."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>House Clearance Brixham South Devon Coast - Professional Property Clearance | Lanora House</title>
        <meta name="description" content="Fast, discreet, and eco-conscious house clearance services in Brixham and across the South Devon coast. Expert clearance tailored to your needs and schedule." />
        <meta name="keywords" content="house clearance Brixham, property clearance Brixham Devon, probate clearance Brixham, office clearance Brixham, waste removal Brixham" />
        <meta property="og:title" content="House Clearance Brixham South Devon Coast | Lanora House" />
        <meta property="og:description" content="Professional clearance services in Brixham. Local team with zero-to-landfill solutions and competitive quotes." />
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
              <Fish className="w-4 h-4 mr-1" />
              Serving Brixham
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Trusted Experts for
              <br />
              <span className="text-3xl md:text-5xl flex items-center justify-center gap-3 flex-wrap">
                House Clearance
                <span className="text-2xl md:text-3xl text-gray-600 font-normal">Brixham</span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Whether you're clearing a home after bereavement, handling a rental changeover, dealing with clutter, or managing a probate estate — Lanora House provides expert house clearance in Brixham, tailored to your needs and schedule.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're trusted across Devon for our friendly, fully licensed team and our commitment to zero-to-landfill clearance solutions.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Brixham Clearance Quote</DialogTitle>
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
                            <SelectItem value="coastal-property">Coastal Property</SelectItem>
                            <SelectItem value="fishing-cottage">Fishing Cottage</SelectItem>
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
                      <Label htmlFor="address">Property Address in Brixham *</Label>
                      <Input
                        id="address"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full address in Brixham area"
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
                            <SelectItem value="full-partial-house-flat">Full & Partial House & Flat Clearances</SelectItem>
                            <SelectItem value="furniture-white-goods-bulky">Furniture, White Goods, Mattresses & Bulky Items</SelectItem>
                            <SelectItem value="shed-loft-attic-garage">Sheds, Lofts, Attics, Garages & Outbuildings</SelectItem>
                            <SelectItem value="garden-green">Garden Waste & Green Clearance</SelectItem>
                            <SelectItem value="hoarded-cluttered">Hoarded Homes & Cluttered Properties</SelectItem>
                            <SelectItem value="probate-estate">Probate Estate Clearances</SelectItem>
                            <SelectItem value="retail-office">Retail & Office Premises</SelectItem>
                            <SelectItem value="electronic-weee">WEEE (Electronic Waste)</SelectItem>
                            <SelectItem value="hazardous-specialist">Hazardous or Specialist Waste</SelectItem>
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
                            <SelectItem value="urgent-slots">Urgent Slots Available</SelectItem>
                            <SelectItem value="this-week">This Week</SelectItem>
                            <SelectItem value="next-week">Next Week</SelectItem>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="convenient">At Your Convenience</SelectItem>
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
                        placeholder="Any parking restrictions, narrow coastal roads, stairs, or other access issues in Brixham we should know about?"
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
                        placeholder="Tell us more about your clearance requirements in Brixham"
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

      {/* Brixham Location Showcase Section */}
      <section className="py-16 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Location Info */}
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Fish className="w-4 h-4 mr-1" />
                Proudly Serving Brixham
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                South Devon's
                <br />
                <span className="text-2xl md:text-3xl text-gray-700">Bustling Fishing Port</span>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg leading-relaxed">
                  <strong className="text-primary">South West specialists</strong> serving Brixham and the South Devon coast. We understand this bustling fishing port and its unique clearance needs.
                </p>
                <p className="leading-relaxed">
                  From single items to full house clear-outs, we treat every job — and every customer — with respect and care throughout Brixham and the surrounding area.
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
                      <div className="text-sm text-gray-600">Solutions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interactive Map */}
            <div className="relative">
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Find Us in Brixham</h3>
                  <p className="text-gray-600">Bustling Fishing Port, South Devon Coast</p>
                </div>
                
                {/* Embedded Google Maps */}
                <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-200 h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20374.955049556546!2d-3.5157!3d50.3947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486c3e3e3e3e3e3e%3A0x4b9b8b4b0c5d0e!2sBrixham%2C%20UK!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                    title="Brixham Location Map"
                  />
                </div>
                
                {/* Brixham Fun Facts */}
                <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-gray-900">Did You Know?</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>🐟 <strong>Busiest Fishing Port:</strong> One of the UK's busiest fishing ports</div>
                    <div>💰 <strong>£40 Million Value:</strong> Landing over £40 million worth of fish annually</div>
                    <div>🎣 <strong>Famous Fish Market:</strong> Inspired the town's famous Fish Market Tours</div>
                    <div>🌊 <strong>Maritime Heritage:</strong> Rich fishing and maritime history</div>
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
              What We Clear in Brixham
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Complete Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to make clearance simple — so you can move forward. <a href="tel:+447456809049" className="text-primary hover:underline">Call our team</a> for expert guidance.
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
            Responsible House Clearance in Brixham
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            We Don't Just Remove Items — We Manage Waste with Integrity
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We keep your conscience clear while clearing your space.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Recycling First</h3>
              <p className="text-gray-600 text-sm">Materials sorted & diverted from landfill</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Usable Items Donated</h3>
              <p className="text-gray-600 text-sm">To local South Devon charities</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Resale & Valuation</h3>
              <p className="text-gray-600 text-sm">Of valuable goods (optional)</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Safe, Certified Disposal</h3>
              <p className="text-gray-600 text-sm">Of hazardous items</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Full Waste Transfer Paperwork</h3>
              <p className="text-gray-600 text-sm">Provided for your records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Brixham Residents Choose Lanora House
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We treat every job — and every customer — with respect and care. <Link href="/contact" className="text-primary hover:underline">Get in touch</Link> to experience the difference.
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
              Who We Help in Brixham
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From single items to full house clear-outs, we've got you covered. <a href="mailto:info@lanorahouse.co.uk" className="text-primary hover:underline">Email us</a> to discuss your needs.
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
            Nearby Areas We Also Cover
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
                    <Fish className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Book Your House Clearance in Brixham Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Let's clear your space — the right way. Contact us now for a free, no-obligation quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Get Free Quote
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="mailto:info@lanorahouse.com" className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" />
                  Email Us
                </a>
              </Button>
            </div>
            
            <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">House Clearance in Brixham – Ethical, Efficient, Local</h3>
              <p className="text-lg opacity-90">
                Clear your property with confidence — choose Lanora House for reliable service that puts people and the planet first.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BrixhamClearancePage;