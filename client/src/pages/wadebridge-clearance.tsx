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
  Mountain,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const WadebridgeClearancePage = () => {
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
    formData.append('serviceType', 'wadebridge-clearance');
    formData.append('location', 'Wadebridge');
    
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
      icon: <Building className="w-8 h-8 text-purple-600" />,
      title: "Garden, Garage, Shed & Loft Clearouts",
      description: "Storage space and outdoor area clearances",
      highlight: "Space specialists"
    },
    {
      icon: <Home className="w-8 h-8 text-green-600" />,
      title: "White Goods, Furniture & Bulky Waste",
      description: "Large household item removal",
      highlight: "Heavy items"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Probate & Estate Property Clearance",
      description: "Sensitive support during difficult times",
      highlight: "Compassionate care"
    },
    {
      icon: <Shield className="w-8 h-8 text-pink-600" />,
      title: "Hoarded Homes & Deep Declutters",
      description: "Professional support for challenging situations",
      highlight: "Expert help"
    },
    {
      icon: <Monitor className="w-8 h-8 text-indigo-600" />,
      title: "Electronic Waste (WEEE)",
      description: "Safe disposal of electronic equipment",
      highlight: "WEEE certified"
    },
    {
      icon: <Building className="w-8 h-8 text-gray-600" />,
      title: "Office, Retail & Commercial Premises",
      description: "Business and commercial clearances",
      highlight: "Business focused"
    },
    {
      icon: <Truck className="w-8 h-8 text-yellow-600" />,
      title: "Wait & Load Services",
      description: "For urgent jobs and flexible collection",
      highlight: "Convenient timing"
    }
  ];

  const whyChooseUs = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Cornwall-Based Team",
      description: "No national call centres"
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "Our Own Trucks",
      description: "Uniformed team"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Fully Licensed & Insured",
      description: "Licensed waste carriers"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "Flexible Scheduling",
      description: "Including urgent & discreet services"
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
      title: "Friendly Service",
      description: "Respectful every step"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
      title: "Transparent Quotes",
      description: "No hidden costs, ever"
    }
  ];

  const clientTypes = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Homeowners & Tenants",
      description: "Personal clearances"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Families Managing Probate Estates",
      description: "Estate clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      title: "Landlords & Letting Agents",
      description: "Property management"
    },
    {
      icon: <Building className="w-6 h-6 text-purple-600" />,
      title: "Businesses & Retailers",
      description: "Commercial clearances"
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-600" />,
      title: "Social Services & Care Providers",
      description: "Support agencies"
    }
  ];

  const nearbyAreas = [
    "Egloshayle", "Sladesbridge", "St Mabyn", "St Breock", "Padstow", "Rock", "North Cornwall"
  ];

  const faqs = [
    {
      question: "How soon can you clear a house in Wadebridge?",
      answer: "Often within 24–48 hours. Contact us for current availability."
    },
    {
      question: "Do you help with probate property clearances?",
      answer: "Yes – we provide discreet, professional estate clearance services including documentation and inventory if required."
    },
    {
      question: "What happens to all the items you remove?",
      answer: "We sort for recycling, donate what we can, and resell any items of value. Landfill is always the last option."
    },
    {
      question: "Can you clear out sheds, garages and lofts too?",
      answer: "Absolutely – we clear indoor and outdoor spaces as part of our service."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>House Clearance Wadebridge North Cornwall - Professional Property Clearance | Lanora House</title>
        <meta name="description" content="Clear your home, business or rental property in Wadebridge with trusted experts. Respectful, efficient, and eco-conscious house clearance services." />
        <meta name="keywords" content="house clearance Wadebridge, property clearance Wadebridge Cornwall, probate clearance Wadebridge, office clearance Wadebridge, waste removal Wadebridge" />
        <meta property="og:title" content="House Clearance Wadebridge North Cornwall | Lanora House" />
        <meta property="og:description" content="Professional clearance services in Wadebridge. Cornwall-based team with 24-48 hour response times and zero-to-landfill practices." />
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
              <Mountain className="w-4 h-4 mr-1" />
              Serving Wadebridge
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Trusted Experts for
              <br />
              <span className="text-3xl md:text-5xl flex items-center justify-center gap-3 flex-wrap">
                House Clearance
                <span className="text-2xl md:text-3xl text-gray-600 font-normal">Wadebridge</span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Whether you're dealing with a move, a bereavement, a tenancy change, or years of clutter, Lanora House offers respectful, efficient, and eco-conscious house clearance in Wadebridge and surrounding areas.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're fully licensed, Cornwall-based, and committed to zero-to-landfill practices, giving you a professional service you can feel good about. <a href="tel:+447843930927" className="text-primary hover:underline">Contact us today</a> for professional service.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Wadebridge Clearance Quote</DialogTitle>
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
                            <SelectItem value="terraced">Terraced House</SelectItem>
                            <SelectItem value="detached">Detached House</SelectItem>
                            <SelectItem value="farmhouse">Farmhouse</SelectItem>
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
                      <Label htmlFor="address">Property Address in Wadebridge *</Label>
                      <Input
                        id="address"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full address in Wadebridge area"
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
                            <SelectItem value="garden-garage-shed">Garden, Garage, Shed & Loft Clearouts</SelectItem>
                            <SelectItem value="white-goods-furniture">White Goods, Furniture & Bulky Waste</SelectItem>
                            <SelectItem value="probate-estate">Probate & Estate Property Clearance</SelectItem>
                            <SelectItem value="hoarded-homes">Hoarded Homes & Deep Declutters</SelectItem>
                            <SelectItem value="electronic-waste">Electronic Waste (WEEE)</SelectItem>
                            <SelectItem value="office-commercial">Office, Retail & Commercial Premises</SelectItem>
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
                            <SelectItem value="within-24-hours">Within 24 Hours</SelectItem>
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
                        placeholder="Any parking restrictions, narrow access, stairs, or other access issues in Wadebridge we should know about?"
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
                        placeholder="Tell us more about your clearance requirements in Wadebridge"
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

      {/* Wadebridge Location Showcase Section */}
      <section className="py-16 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Location Info */}
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Mountain className="w-4 h-4 mr-1" />
                Proudly Serving Wadebridge
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                North Cornwall's
                <br />
                <span className="text-2xl md:text-3xl text-gray-700">Historic Bridge Town</span>
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="text-lg leading-relaxed">
                  <strong className="text-primary">Cornwall-based specialists</strong> serving Wadebridge and North Cornwall. We understand this historic market town and its unique clearance needs.
                </p>
                <p className="leading-relaxed">
                  From the town center to the surrounding villages, from traditional properties to modern developments, we provide trusted clearance services throughout Wadebridge and the surrounding area.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">24-48 Hour Service</div>
                      <div className="text-sm text-gray-600">Current availability</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Zero-to-Landfill</div>
                      <div className="text-sm text-gray-600">Eco-conscious practices</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interactive Map */}
            <div className="relative">
              <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Find Us in Wadebridge</h3>
                  <p className="text-gray-600">Historic Bridge Town, North Cornwall</p>
                </div>
                
                {/* Embedded Google Maps */}
                <div className="relative rounded-xl overflow-hidden shadow-md bg-gray-200 h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10187.477524778273!2d-4.8361!3d50.5154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486ab2e5e5e5e5e5%3A0x404c6d0fb97d9b!2sWadebridge%2C%20UK!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                    title="Wadebridge Location Map"
                  />
                </div>
                
                {/* Wadebridge Fun Facts */}
                <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-gray-900">Did You Know?</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>🌉 <strong>Historic Bridge:</strong> Famous 17-arch bridge built in the 15th century by wool merchant</div>
                    <div>🏛️ <strong>Medieval Legacy:</strong> One of the longest medieval bridges in England still in use</div>
                    <div>📍 <strong>Market Town:</strong> Traditional North Cornwall market town</div>
                    <div>🏘️ <strong>River Town:</strong> Beautiful town on the River Camel</div>
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
              What We Clear in Wadebridge
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Complete Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From simple removals to complex jobs, we're here to make it easy.
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
            Ethical Waste Disposal in Wadebridge
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            We Care About Where Your Items Go
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            At Lanora House, we don't just clear — we care about where your items go. We aim to minimise waste and maximise reuse — protecting your budget and the planet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Recycling</h3>
              <p className="text-gray-600 text-sm">All possible materials</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Donating</h3>
              <p className="text-gray-600 text-sm">Usable goods to local charities</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Valuing & Reselling</h3>
              <p className="text-gray-600 text-sm">Furniture or antiques on your behalf</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Trash2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Safe Handling</h3>
              <p className="text-gray-600 text-sm">Hazardous materials safely</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white rounded-lg shadow-md mb-4 mx-auto w-fit">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Legal Paperwork</h3>
              <p className="text-gray-600 text-sm">Waste transfer notes provided</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Choose Lanora House in Wadebridge?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether it's a studio flat or a 5-bed farmhouse — we handle every clearance with care.
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
              We're proud to serve the Wadebridge community with compassion and professionalism.
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
                    <Mountain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Book a Wadebridge House Clearance Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Need a reliable clearance team in Wadebridge? Let's get started.
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
                <a href="tel:+447843930927" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7843 930927
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
              <h3 className="text-2xl font-bold mb-4">House Clearance in Wadebridge – Done Properly</h3>
              <p className="text-lg opacity-90">
                Book with Cornwall's trusted local clearance team – Lanora House.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WadebridgeClearancePage;