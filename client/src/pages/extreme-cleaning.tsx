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
  Droplets,
  Bug,
  Flame,
  Package,
  Sparkles,
  Target,
  Award,
  FileCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const ExtremeCleaningPage = () => {
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
    
    Object.entries(quoteForm).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value as string);
      }
    });
    
    formData.append('serviceType', 'extreme-cleaning');
    formData.append('location', 'Cornwall & Devon');
    
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
      setQuoteForm(prev => ({ 
        ...prev, 
        images: Array.from(e.target.files || [])
      }));
    }
  };

  const whyTrustUs = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "No-Judgement, 100% Confidential Service",
      description: "Complete discretion guaranteed"
    },
    {
      icon: <Target className="w-8 h-8 text-green-600" />,
      title: "Bespoke Action Plans",
      description: "Every job is different"
    },
    {
      icon: <Award className="w-8 h-8 text-indigo-600" />,
      title: "Risk-Assessed, Safety-First Approach",
      description: "PPE, waste transfer, method statements"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: "Fast Response Across Cornwall",
      description: "Hayle • Truro • Falmouth"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
      title: "End-to-End Help",
      description: "Cleaning, sanitation, waste removal, trades"
    }
  ];

  const cleaningServices = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      title: "Biohazard & Trauma Cleaning",
      description: "Bloodborne pathogen cleans, sanitation, odour neutralisation"
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Needle & Sharps Sweeps",
      description: "Locate, remove, dispose; certify safe re-entry"
    },
    {
      icon: <Home className="w-6 h-6 text-blue-600" />,
      title: "Void / Squatter Property Cleans",
      description: "Waste removal, biohazards, deodorising, reset for let/sale"
    },
    {
      icon: <Bug className="w-6 h-6 text-green-600" />,
      title: "Pest Clean-up",
      description: "Rodents, birds, insects; droppings removal, disinfection"
    },
    {
      icon: <Package className="w-6 h-6 text-purple-600" />,
      title: "Hoarding & Deep Declutter",
      description: "Compassionate, staged plans with safe waste segregation"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-600" />,
      title: "End-of-Tenancy Extreme Cleans",
      description: "Student lets, HMOs, holiday cottages, caravans"
    },
    {
      icon: <Flame className="w-6 h-6 text-orange-600" />,
      title: "Fire & Flood Aftercare",
      description: "Soot/smoke cleaning, odour control; damp/mould sanitation"
    },
    {
      icon: <Droplets className="w-6 h-6 text-cyan-600" />,
      title: "Mould Remediation & Odour Control",
      description: "Source tracing, treatment, prevention guidance"
    },
    {
      icon: <Building className="w-6 h-6 text-indigo-600" />,
      title: "Commercial & Facilities",
      description: "Communal areas, stairwells, bin stores, car parks"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-600" />,
      title: "Kitchens & Food-Prep Areas",
      description: "Degrease, descale, high-touch sanitation"
    },
    {
      icon: <Trash2 className="w-6 h-6 text-gray-600" />,
      title: "Exterior Grime",
      description: "Bins/bin stores, garages, sheds, outbuildings, alleyways"
    }
  ];

  const fiveStepMethod = [
    {
      number: "1",
      title: "Assess",
      description: "Site visit or photo/video review; hazards identified"
    },
    {
      number: "2",
      title: "Plan",
      description: "Clear method statement and fixed quote"
    },
    {
      number: "3",
      title: "Make Safe",
      description: "Isolate hazards, remove sharps/biohazards, set safe access routes"
    },
    {
      number: "4",
      title: "Deep Clean & Sanitize",
      description: "Targeted chemistry, hot wash/steam, HEPA filtration, odour neutralisation"
    },
    {
      number: "5",
      title: "Restore & Report",
      description: "Waste transfer notes, before/after photos, re-entry guidance"
    }
  ];

  const clientTypes = [
    {
      icon: <Building className="w-6 h-6 text-blue-600" />,
      title: "Landlords & Letting Agents"
    },
    {
      icon: <Building className="w-6 h-6 text-green-600" />,
      title: "Housing Associations"
    },
    {
      icon: <Building className="w-6 h-6 text-purple-600" />,
      title: "Local Councils"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Facilities Managers"
    },
    {
      icon: <Home className="w-6 h-6 text-indigo-600" />,
      title: "Holiday-Let Owners"
    },
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "Homeowners"
    }
  ];

  const realWorldScenarios = [
    "Maggoty fridges and black-bag mountains after abandonments",
    "Needle-strewn voids needing safe certification before contractors enter",
    "Odour-heavy hoarding properties requiring phased, compassionate work",
    "Pigeon-damaged lofts & balconies; guano removal and sanitisation",
    "Flooded basements with silt, sewage ingress and mould risk",
    "Fire smoke-stained ceilings and stubborn protein odours in kitchens"
  ];

  const faqs = [
    {
      question: "Do you cover my area?",
      answer: "Yes—Hayle, Truro, Falmouth and all of Cornwall. Share your postcode for availability."
    },
    {
      question: "Can you come today?",
      answer: "We prioritise high-risk cases and do our best to attend same day where possible."
    },
    {
      question: "Do you remove needles and certify the area?",
      answer: "Yes—we locate, remove and dispose of sharps and provide confirmation the area is safe to re-enter."
    },
    {
      question: "Will you judge my situation?",
      answer: "Never. Discretion and respect are part of the job."
    },
    {
      question: "Do you do repairs after cleaning?",
      answer: "We can coordinate trusted local trades (locks, glazing, plaster, paint, flooring) if you want a full reset."
    },
    {
      question: "What about odours and pests?",
      answer: "We treat the source, sanitise and deodorise, and advise on proofing to prevent reoccurrence."
    },
    {
      question: "Are you insured?",
      answer: "Yes—we operate with appropriate cover and safety documentation."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Extreme Cleaning Cornwall - Biohazard, Trauma & Deep Cleaning | Lanora House</title>
        <meta name="description" content="Lanora House provides extreme cleaning services across Cornwall. Biohazard, trauma cleaning, hoarding, pest cleanup, fire & flood aftercare. Fast, discreet, professional." />
        <meta name="keywords" content="extreme cleaning Cornwall, biohazard cleaning, trauma cleaning, deep cleaning, hoarding cleanup, pest cleanup, fire cleaning, flood cleaning" />
        <meta property="og:title" content="Extreme Cleaning Cornwall | Lanora House" />
        <meta property="og:description" content="Lanora House provides extreme cleaning services across Cornwall. Biohazard, trauma cleaning, hoarding, pest cleanup. If it's grim, it's ours." />
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
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-service-type">
              <Droplets className="w-4 h-4 mr-1" />
              Extreme Cleaning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              If It's Grim,
              <br />
              <span className="text-3xl md:text-5xl">It's Ours</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              When a property's at its worst, that's our sweet spot. Lanora House tackles the jobs no one else wants—discreetly, safely, and fast. From biohazards and pests to voids, hoarding and odours, we restore spaces to clean, habitable, and healthy—without judgement and with full confidentiality.
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Serving Hayle, Truro, Falmouth and across Cornwall
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                    disabled={submitQuoteMutation.isPending}
                    data-testid="button-get-quote"
                  >
                    {submitQuoteMutation.isPending ? (
                      <div className="flex items-center gap-3">
                        <SustainableLoader variant="grow" size="sm" />
                        Submitting...
                      </div>
                    ) : (
                      <>
                        Get Free Quote
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Request Your Free Quote</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleQuoteSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={quoteForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          data-testid="input-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={quoteForm.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={quoteForm.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                          data-testid="input-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type *</Label>
                        <Select 
                          value={quoteForm.propertyType} 
                          onValueChange={(value) => handleInputChange('propertyType', value)}
                        >
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="void">Void Property</SelectItem>
                            <SelectItem value="hmo">HMO/Student Let</SelectItem>
                            <SelectItem value="holiday">Holiday Let</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Property Address *</Label>
                      <Input
                        id="address"
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        data-testid="input-address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clearanceType">Type of Cleaning Required</Label>
                      <Select 
                        value={quoteForm.clearanceType} 
                        onValueChange={(value) => handleInputChange('clearanceType', value)}
                      >
                        <SelectTrigger data-testid="select-cleaning-type">
                          <SelectValue placeholder="Select cleaning type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="biohazard">Biohazard & Trauma</SelectItem>
                          <SelectItem value="needles">Needle & Sharps Sweep</SelectItem>
                          <SelectItem value="void">Void Property Clean</SelectItem>
                          <SelectItem value="pest">Pest Clean-up</SelectItem>
                          <SelectItem value="hoarding">Hoarding & Declutter</SelectItem>
                          <SelectItem value="tenancy">End-of-Tenancy Deep Clean</SelectItem>
                          <SelectItem value="fire-flood">Fire & Flood Aftercare</SelectItem>
                          <SelectItem value="mould">Mould Remediation</SelectItem>
                          <SelectItem value="commercial">Commercial/Facilities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeframe">Timeframe</Label>
                      <Select 
                        value={quoteForm.timeframe} 
                        onValueChange={(value) => handleInputChange('timeframe', value)}
                      >
                        <SelectTrigger data-testid="select-timeframe">
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (Same Day)</SelectItem>
                          <SelectItem value="this-week">This Week</SelectItem>
                          <SelectItem value="next-week">Next Week</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                        rows={4}
                        placeholder="Please describe the cleaning required, any specific hazards, or special circumstances..."
                        data-testid="textarea-additional-info"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="images">Upload Photos (Optional)</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        data-testid="input-images"
                      />
                      <p className="text-sm text-gray-500">
                        Photos help us provide a more accurate quote
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={submitQuoteMutation.isPending}
                      data-testid="button-submit-quote"
                    >
                      {submitQuoteMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <SustainableLoader variant="grow" size="sm" />
                          Submitting...
                        </div>
                      ) : (
                        'Submit Quote Request'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 h-auto border-2"
                asChild
                data-testid="button-call-now"
              >
                <a href="tel:+447456809049" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call: 07456 809049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick CTA Section */}
      <section className="py-8 px-4 bg-primary text-white">
        <div className="container mx-auto text-center">
          <p className="text-xl font-semibold mb-2">Need urgent help?</p>
          <p className="text-lg">
            Call Lanora House for a same-day assessment in Hayle, Truro, Falmouth and wider Cornwall. 
            We'll give you a clear plan and a fixed, transparent quote.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="mt-4"
            asChild
            data-testid="button-urgent-call"
          >
            <a href="tel:+447456809049" className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Now: 07456 809049
            </a>
          </Button>
        </div>
      </section>

      {/* Why Cornwall Trusts Us */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Cornwall Trusts Lanora House
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional extreme cleaning with complete discretion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyTrustUs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">{item.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setIsQuoteDialogOpen(true)}
              data-testid="button-get-quote-section1"
            >
              Request Free Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* What We Clean */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Our Motto: If it's grim, it's ours
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What We Clean (and love)
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cleaningServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">{service.icon}</div>
                      <div>
                        <h3 className="font-semibold text-base mb-1">{service.title}</h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-700 mb-6">
              Ready to rescue your property?
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section2"
            >
              <a href="tel:+447456809049" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call: 07456 809049
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Local Coverage */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Local to Hayle, Truro & Falmouth
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We cover all of Cornwall—Penwith to the Roseland, north coast to the Lizard
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Hayle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Holiday lets, harbour homes, light industrial units—rapid turnarounds for changeovers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Truro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  City-centre retail, managed apartments, student blocks—discreet entry available.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Falmouth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Coastal properties, marine-adjacent sites, student HMOs—salt, damp & odour experts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setIsQuoteDialogOpen(true)}
              data-testid="button-get-quote-section3"
            >
              Get Your Free Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 5-Step Method */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our 5-Step Method
            </h2>
            <p className="text-lg text-gray-600">
              Professional, systematic approach to extreme cleaning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {fiveStepMethod.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section4"
            >
              <a href="tel:+447456809049" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call for Assessment: 07456 809049
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Health & Safety */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
              Your Peace of Mind
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Health & Safety
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Trained Operatives with PPE</h3>
                <p className="text-sm text-gray-600">Full protective equipment</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <FileCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Legally Handled Waste</h3>
                <p className="text-sm text-gray-600">Licensed carriers & documentation</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Risk Assessments</h3>
                <p className="text-sm text-gray-600">COSHH where required</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Eye className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Discreet Service</h3>
                <p className="text-sm text-gray-600">Unmarked vehicles available</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setIsQuoteDialogOpen(true)}
              data-testid="button-get-quote-section5"
            >
              Request Your Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Who We Help
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {clientTypes.map((client, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6 pb-6">
                    <div className="mx-auto mb-3">{client.icon}</div>
                    <p className="font-medium text-sm">{client.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section6"
            >
              <a href="tel:+447456809049" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Speak to Our Team: 07456 809049
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Real-World Scenarios */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Real-World Scenarios We Sort (Fast)
            </h2>
          </motion.div>

          <div className="space-y-4 mb-12">
            {realWorldScenarios.map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{scenario}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setIsQuoteDialogOpen(true)}
              data-testid="button-get-quote-section7"
            >
              Get Help Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What You Get with Lanora House
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Clear Pricing & Scope</h3>
                    <p className="text-gray-600 text-sm">Before we start - no surprises</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <FileCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Photos & Paperwork</h3>
                    <p className="text-gray-600 text-sm">For your records and insurance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Optional Re-stock</h3>
                    <p className="text-gray-600 text-sm">Bins, liners, fragrance blocks, sanitary supplies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Aftercare Tips</h3>
                    <p className="text-gray-600 text-sm">To keep it fresher for longer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section8"
            >
              <a href="tel:+447456809049" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Us: 07456 809049
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setIsQuoteDialogOpen(true)}
              data-testid="button-get-quote-final"
            >
              Get Your Free Quote Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Rescue Your Property?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contact Lanora House for extreme cleaning in Cornwall—especially Hayle, Truro & Falmouth. 
              We'll assess, quote, and get it sorted.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-4 h-auto"
                onClick={() => setIsQuoteDialogOpen(true)}
                data-testid="button-final-quote"
              >
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 h-auto border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary"
                asChild
                data-testid="button-final-call"
              >
                <a href="tel:+447456809049" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call: 07456 809049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ExtremeCleaningPage;
