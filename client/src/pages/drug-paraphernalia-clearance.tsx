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
  Shield,
  AlertTriangle,
  Heart,
  Building,
  Trash2,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  ArrowRight,
  Users,
  Star,
  Truck,
  Eye,
  Home,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const DrugParaphernaliaClearancePage = () => {
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
    formData.append('serviceType', 'drug-paraphernalia-clearance');
    formData.append('location', 'Cornwall & Devon');
    
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
      icon: <Trash2 className="w-8 h-8 text-primary" />,
      title: "Safe Removal of Needles, Syringes & Sharps",
      description: "Professional handling and disposal",
      highlight: "Safety critical"
    },
    {
      icon: <Trash2 className="w-8 h-8 text-orange-600" />,
      title: "Clearance of Pipes, Bongs, Foil, Baggies & Wraps",
      description: "Complete paraphernalia removal",
      highlight: "Comprehensive"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Decontamination of Surfaces & Biohazard Zones",
      description: "Professional deep cleaning and sanitisation",
      highlight: "Deep clean"
    },
    {
      icon: <Star className="w-8 h-8 text-blue-600" />,
      title: "Odour Removal & Deep Cleaning",
      description: "Complete restoration and neutralisation",
      highlight: "Odour control"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      title: "Waste Categorised, Removed & Disposed of Legally",
      description: "Full compliance and documentation",
      highlight: "Legal disposal"
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Full PPE, Risk Assessments & Method Statements",
      description: "Professional safety protocols",
      highlight: "Safety first"
    }
  ];

  const risks = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Hepatitis B & C",
      description: "Blood-borne pathogens"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "HIV",
      description: "Serious viral infection"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      title: "Skin Infections",
      description: "Contact contamination"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      title: "Airborne Contaminants",
      description: "Chemical residue exposure"
    }
  ];

  const commonLocations = [
    {
      icon: <Home className="w-6 h-6 text-blue-600" />,
      title: "Abandoned Homes & Flats",
      description: "Residential properties"
    },
    {
      icon: <Building className="w-6 h-6 text-purple-600" />,
      title: "Squats & Void Properties",
      description: "Unoccupied buildings"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      title: "Rental Properties",
      description: "With problematic tenants"
    },
    {
      icon: <Building className="w-6 h-6 text-gray-600" />,
      title: "Derelict Commercial Units",
      description: "Business premises"
    },
    {
      icon: <Home className="w-6 h-6 text-yellow-600" />,
      title: "Garages, Sheds & Outbuildings",
      description: "Storage spaces"
    },
    {
      icon: <Building className="w-6 h-6 text-primary" />,
      title: "Holiday Lets & Hotels",
      description: "Affected by anti-social behaviour"
    }
  ];

  const whyChooseUs = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Specialist Biohazard & Paraphernalia Clearance Team",
      description: "Trained professionals"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "Fully Licensed & Insured Hazardous Waste Carriers",
      description: "Legal compliance"
    },
    {
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      title: "Discreet, Respectful & Non-Judgmental Service",
      description: "Privacy focused"
    },
    {
      icon: <Star className="w-6 h-6 text-purple-600" />,
      title: "Deep Cleaning & Odour Neutralisation Available",
      description: "Complete restoration"
    },
    {
      icon: <MapPin className="w-6 h-6 text-indigo-600" />,
      title: "Based in Hayle – Covering Cornwall, Devon & Beyond",
      description: "Regional coverage"
    },
    {
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      title: "Fast Response & Emergency Clean-Up Options Available",
      description: "Urgent service"
    }
  ];

  const clientTypes = [
    {
      icon: <Building className="w-6 h-6 text-blue-600" />,
      title: "Landlords & Letting Agents",
      description: "Property management"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      title: "Housing Associations",
      description: "Social housing"
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Local Councils",
      description: "Public sector"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Private Property Owners",
      description: "Individual clients"
    },
    {
      icon: <Building className="w-6 h-6 text-indigo-600" />,
      title: "Commercial Property Managers",
      description: "Business premises"
    }
  ];

  const serviceAreas = [
    "Truro", "Plymouth", "Exeter", "Newquay", "Barnstaple", "Falmouth", "Torquay", "Penzance"
  ];

  const faqs = [
    {
      question: "Do you remove needles and syringes?",
      answer: "Yes – we're trained and certified to safely remove sharps, syringes, and other drug waste."
    },
    {
      question: "Can you clear and clean an entire flat or room?",
      answer: "Absolutely – we offer full deep cleaning and decontamination of all affected spaces."
    },
    {
      question: "Is the service discreet?",
      answer: "Yes – all our vehicles are unbranded and our staff are professional and respectful at all times."
    },
    {
      question: "Can you provide documentation for councils or landlords?",
      answer: "Yes – we supply full documentation including waste transfer notes and risk assessments if required."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Drug Paraphernalia Clearance Cornwall Devon - Biohazardous Cleanup from £120 | Lanora House</title>
        <meta name="description" content="Professional drug paraphernalia clearance and biohazardous cleanup from £120. Safe removal of needles, sharps, and contamination across Cornwall, Devon, and South West." />
        <meta name="keywords" content="drug paraphernalia clearance, needle clearance, biohazardous cleanup, sharps removal, contamination cleaning, Cornwall Devon" />
        <meta property="og:title" content="Drug Paraphernalia Clearance Cornwall Devon | Lanora House" />
        <meta property="og:description" content="Professional biohazardous cleanup and drug paraphernalia clearance. Trained team, discreet service, legal disposal from £120." />
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
              <Shield className="w-4 h-4 mr-1" />
              Specialist Service
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Professional
              <br />
              <span className="text-3xl md:text-5xl flex items-center justify-center gap-3 flex-wrap">
                Drug Paraphernalia
                <span className="text-2xl md:text-3xl text-gray-700 font-normal">Clearance</span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              At Lanora House, we provide specialist drug paraphernalia clearance and deep-clean services for properties that have been exposed to drug use or illegal drug activity. Our trained, discreet team works quickly and safely to restore spaces for safe and legal use.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We support landlords, letting agents, housing associations, local councils, and private property owners across Cornwall, Devon, and the wider South West. <a href="tel:+447843930927" className="text-primary hover:underline">Call for discreet consultation</a>.
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
                        Get Emergency Quote
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Get Your Drug Paraphernalia Clearance Quote</DialogTitle>
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
                            <SelectItem value="abandoned-home">Abandoned Home/Flat</SelectItem>
                            <SelectItem value="squat-void">Squat/Void Property</SelectItem>
                            <SelectItem value="rental-property">Rental Property</SelectItem>
                            <SelectItem value="commercial-unit">Derelict Commercial Unit</SelectItem>
                            <SelectItem value="garage-shed">Garage/Shed/Outbuilding</SelectItem>
                            <SelectItem value="holiday-let">Holiday Let/Hotel</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="flat">Flat/Apartment</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="retail">Retail Premises</SelectItem>
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
                            <SelectValue placeholder="What needs clearing?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="needles-syringes-sharps">Safe Removal of Needles, Syringes & Sharps</SelectItem>
                            <SelectItem value="pipes-bongs-foil">Clearance of Pipes, Bongs, Foil, Baggies & Wraps</SelectItem>
                            <SelectItem value="decontamination">Decontamination of Surfaces & Biohazard Zones</SelectItem>
                            <SelectItem value="odour-removal">Odour Removal & Deep Cleaning</SelectItem>
                            <SelectItem value="complete-clearance">Complete Property Clearance & Decontamination</SelectItem>
                            <SelectItem value="emergency-cleanup">Emergency Clean-Up</SelectItem>
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
                            <SelectItem value="emergency">Emergency Response</SelectItem>
                            <SelectItem value="urgent">Urgent (Within 24 Hours)</SelectItem>
                            <SelectItem value="this-week">This Week</SelectItem>
                            <SelectItem value="next-week">Next Week</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="accessRestrictions">Access & Safety Concerns</Label>
                      <Textarea
                        id="accessRestrictions"
                        value={quoteForm.accessRestrictions}
                        onChange={(e) => handleInputChange("accessRestrictions", e.target.value)}
                        placeholder="Any access restrictions, safety concerns, or specific contamination areas we should know about?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={quoteForm.specialRequirements}
                        onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                        placeholder="Any specific biohazard concerns, discretion requirements, or documentation needed for councils/landlords?"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Tell us more about the contamination or clearance requirements"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="images">Property Photos (Optional but Helpful)</Label>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mb-2"
                      />
                      <p className="text-sm text-gray-600 mb-3">
                        Upload photos of contaminated areas (max 5 images, 5MB each) - helps us prepare properly
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
                        {submitQuoteMutation.isPending ? "Submitting..." : "Get My Emergency Quote"}
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
                  Emergency: +44 7843 930927
                </a>
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-primary font-semibold">
                <AlertTriangle className="w-5 h-5 inline mr-2" />
                Starting from £120 - Fair pricing with no hidden charges
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Shield className="w-4 h-4 mr-1" />
              What We Do
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Professional Biohazardous Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trained, discreet team working quickly and safely to restore contaminated spaces.
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Risks Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Why Professional Clearance is Essential
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              Serious Health Risks from Improper Handling
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Attempting to clear contaminated properties without proper equipment and training is dangerous and illegal.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {risks.map((risk, index) => (
              <Card key={index} className="text-center border-primary/20 bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {risk.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {risk.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {risk.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-primary/20">
            <p className="text-lg text-gray-700">
              <strong className="text-primary">Our team is fully trained</strong> in biohazardous waste handling and uses professional-grade PPE and disinfectants to protect both people and property. <Link href="/contact" className="text-primary hover:underline">Contact us</Link> to discuss your specific safety requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Common Locations Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Where We Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We handle clearances discreetly and sensitively, respecting privacy while restoring safety.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commonLocations.map((location, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {location.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {location.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {location.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                No Obligation Quote
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Choose Lanora House?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specialist team with professional training and discretion.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-white rounded-lg border"
              >
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg shadow-sm">
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
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                No Obligation Quote
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

      {/* Client Types Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Who We Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional services across Cornwall, Devon, and the wider South West.
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
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                No Obligation Quote
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

      {/* Service Areas Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            Service Area
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We cover all of Cornwall and Devon, with nationwide support available for larger projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {serviceAreas.map((area, index) => (
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
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Need Emergency Drug Paraphernalia Clearance?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              If you're dealing with drug contamination or sharps on a property, don't take the risk. Let us handle it safely, legally, and professionally.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Get Emergency Quote
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447843930927" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Emergency: +44 7843 930927
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
              <h3 className="text-2xl font-bold mb-4">Drug Paraphernalia Clearance by Lanora House</h3>
              <p className="text-lg opacity-90">
                Protect your property, your tenants, and your peace of mind – with safe, legal, and fast clearance services.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DrugParaphernaliaClearancePage;