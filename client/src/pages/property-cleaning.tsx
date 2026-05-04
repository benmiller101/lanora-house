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
  Heart,
  Building,
  Clock,
  CheckCircle,
  Phone,
  ArrowRight,
  Users,
  Truck,
  Eye,
  Home,
  Sparkles,
  Target,
  Award,
  FileCheck,
  Droplets,
  Wind,
  Package,
  ClipboardCheck,
  FlowerIcon as Flower,
  Camera,
  Video,
  Leaf,
  Brain,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";

const PropertyCleaningPage = () => {
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
    
    formData.append('serviceType', 'property-cleaning');
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

  const whyChooseUs = [
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Cleaning-First Specialists",
      description: "Focus on cleaning, sanitation and restoration"
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Fast Response in Cornwall",
      description: "Priority coverage for Hayle, Truro & Falmouth"
    },
    {
      icon: <Target className="w-8 h-8 text-indigo-600" />,
      title: "Bespoke Plans",
      description: "Scoped to your outcomes, timescales & budget"
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: "Safety & Documentation",
      description: "Risk assessments, method statements & photo reports"
    },
    {
      icon: <Eye className="w-8 h-8 text-purple-600" />,
      title: "Discreet & Respectful",
      description: "Unmarked attendance; zero judgement"
    }
  ];

  const moveReadyServices = [
    "Kitchen degrease & appliance fronts",
    "Bathrooms descaled & sanitised",
    "Internal windows, frames & sills",
    "Skirtings, switches, sockets & high-touch points",
    "Odour neutralisation & ventilation guidance",
    "Optional: pre-listing spruce for viewings"
  ];

  const tenancyServices = [
    "Full deep clean to inventory standards",
    "Limescale, grout lines, extractor hoods",
    "Oven exterior/interior on request",
    "Spot marks on walls, doors & frames",
    "Carpets machine-cleaned",
    "Work summary with before/after photos",
    "Optional: Video walkthrough for evidence"
  ];

  const bereavementServices = [
    "Room-by-room hygiene reset",
    "Careful handling of sentimental/fragile items",
    "Odour control and ventilation support",
    "Quiet, considerate presence",
    "Email or WhatsApp communication if preferred"
  ];

  const declutterServices = [
    "Guided declutter sessions (you decide what stays/goes)",
    "Sorted surfaces, cupboards and high-use areas",
    "Hygiene reset: kitchens, bathrooms, sleeping areas",
    "Practical maintenance tips to keep momentum"
  ];

  const mouldServices = [
    "Targeted mould treatment (cleaning + chemistry)",
    "Disinfection of high-risk areas & touchpoints",
    "Odour neutralisation (not masking)",
    "Source-tracing advice (ventilation/condensation)",
    "Coordination with trades if structural issues suspected"
  ];

  const smokeServices = [
    "Degrease & wash affected hard surfaces",
    "Treat walls, ceilings, joinery & cupboards",
    "Neutralise odours",
    "Advise on priming/painting sequence if needed"
  ];

  const carpetServices = [
    "Hot water extraction for carpets & rugs",
    "Hand tools for stairs and upholstery",
    "Allergy-friendly or scented detergents on request",
    "Generator-ready if there's no power on site"
  ];

  const fiveStepMethod = [
    {
      number: "1",
      title: "Assessment",
      description: "Quick call, photos or site visit"
    },
    {
      number: "2",
      title: "Plan & Quote",
      description: "Clear scope tailored to your deadline"
    },
    {
      number: "3",
      title: "Make Safe",
      description: "Isolate hazards, set a clean workflow"
    },
    {
      number: "4",
      title: "Deep Clean",
      description: "Detail-focused, room by room"
    },
    {
      number: "5",
      title: "Report",
      description: "Photos on request, aftercare tips, optional walkthrough video"
    }
  ];

  const clientTypes = [
    { icon: <Building className="w-6 h-6 text-blue-600" />, title: "Landlords" },
    { icon: <Building className="w-6 h-6 text-green-600" />, title: "Letting & Estate Agents" },
    { icon: <Building className="w-6 h-6 text-purple-600" />, title: "Housing Associations" },
    { icon: <FileCheck className="w-6 h-6 text-primary" />, title: "Executors & Solicitors" },
    { icon: <Users className="w-6 h-6 text-indigo-600" />, title: "Facilities Managers" },
    { icon: <Home className="w-6 h-6 text-orange-600" />, title: "Holiday-Let Owners" },
    { icon: <Users className="w-6 h-6 text-pink-600" />, title: "Students & HMOs" },
    { icon: <Home className="w-6 h-6 text-red-600" />, title: "Homeowners" },
    { icon: <Building className="w-6 h-6 text-cyan-600" />, title: "Retail & Hospitality" }
  ];

  const faqs = [
    {
      question: "Do you cover my area?",
      answer: "Yes—Hayle, Truro, Falmouth, and throughout Cornwall."
    },
    {
      question: "Can you attend urgently?",
      answer: "We prioritise time-critical jobs and will offer the earliest available slot."
    },
    {
      question: "Do you provide house clearances?",
      answer: "No—we are cleaning specialists. If you arrange a clearance, we'll schedule our clean to follow for best results."
    },
    {
      question: "Can you help me get my deposit back?",
      answer: "We work to inventory standards and provide evidence of the clean; final decisions rest with the landlord/agent."
    },
    {
      question: "Do you handle odours and mould?",
      answer: "Yes—source-led odour neutralisation and targeted mould treatments, with prevention guidance."
    },
    {
      question: "Are you insured?",
      answer: "Yes—appropriate cover and safety documentation available on request."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Property Cleaning Cornwall - Professional Cleaning Services | Lanora House</title>
        <meta name="description" content="Lanora House provides professional property cleaning services across Cornwall. Move-ready cleaning, tenancy cleans, bereavement services, mould treatment. Hayle, Truro & Falmouth." />
        <meta name="keywords" content="property cleaning Cornwall, tenancy cleaning, move-in cleaning, bereavement cleaning, mould treatment, smoke cleaning, carpet cleaning, Hayle, Truro, Falmouth" />
        <meta property="og:title" content="Property Cleaning Cornwall | Lanora House" />
        <meta property="og:description" content="Lanora House provides professional property cleaning services across Cornwall. If it's grim, it's ours." />
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
              <Sparkles className="w-4 h-4 mr-1" />
              Property Cleaning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Property Cleaning in Cornwall
              <br />
              <span className="text-3xl md:text-5xl">(Hayle, Truro & Falmouth)</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              When time is tight and standards matter, Lanora House delivers high-impact, no-judgement cleaning with full confidentiality. We help landlords, tenants, letting agencies, executors, businesses, and homeowners get properties hygienic, odour-free, and ready to live in, let, or sell—across Hayle, Truro, Falmouth and wider Cornwall.
            </p>
            <p className="text-lg font-semibold text-primary mb-8">
              If it's grim, it's ours.
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
                            <SelectItem value="hmo">HMO/Student Let</SelectItem>
                            <SelectItem value="holiday">Holiday Let</SelectItem>
                            <SelectItem value="estate">Estate/Probate</SelectItem>
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
                          <SelectItem value="move-ready">Move-Ready Cleaning</SelectItem>
                          <SelectItem value="tenancy">Start/End of Tenancy</SelectItem>
                          <SelectItem value="deep-clean">Deep Clean</SelectItem>
                          <SelectItem value="bereavement">Bereavement/Estate</SelectItem>
                          <SelectItem value="declutter">Decluttering Support</SelectItem>
                          <SelectItem value="mould">Mould Treatment</SelectItem>
                          <SelectItem value="smoke">Smoke/Nicotine Cleaning</SelectItem>
                          <SelectItem value="carpet">Carpet & Upholstery</SelectItem>
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
                        placeholder="Please describe the cleaning required, property condition, or special circumstances..."
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
                <a href="tel:+447843930927" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call: 07843 930927
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Lanora House */}
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
              Why Choose Lanora House?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {whyChooseUs.map((item, index) => (
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

          <div className="text-center">
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

      {/* Move-Ready Cleaning */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
              <Home className="w-4 h-4 mr-1" />
              Sales & Moves
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Move-Ready Cleaning for Sales & Moves
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Preparing to sell or moving in/out? We deliver thorough pre- and post-move cleans that showcase your property at its best.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {moveReadyServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{service}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 text-center">
              <strong>Need items removed?</strong> We don't provide clearance, but we'll coordinate our clean around your chosen provider so everything lands at the perfect time.
            </p>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section2"
            >
              <a href="tel:+447843930927" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call: 07843 930927
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Tenancy & Deep Cleans */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
              <ClipboardCheck className="w-4 h-4 mr-1" />
              Tenancy Standards
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Start/End of Tenancy & Deep Cleans
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tenancy standards that keep agents, landlords and tenants happy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {tenancyServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{service}</p>
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
              data-testid="button-get-quote-section3"
            >
              Get Your Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Bereavement Services */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              <Heart className="w-4 h-4 mr-1" />
              Sensitive & Discreet
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Bereavement / Deceased Estate Cleaning
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A gentle, respectful service to clean and sanitise properties after bereavement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {bereavementServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{service}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 text-center">
              We remain a cleaning service only. If clearance is needed, we'll schedule cleaning around your appointed provider.
            </p>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section4"
            >
              <a href="tel:+447843930927" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call: 07843 930927
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Decluttering & Other Services */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Decluttering Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-indigo-100 text-indigo-800 border-indigo-200">
                <Brain className="w-4 h-4 mr-1" />
                Support & Reset
              </Badge>
              <h3 className="text-2xl font-bold mb-4">Decluttering Support & Reset Cleans</h3>
              <p className="text-gray-600 mb-6">
                Overwhelmed? We help you regain control, then deep clean so it stays that way.
              </p>
              <div className="space-y-3">
                {declutterServices.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{service}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mould Treatment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                <Droplets className="w-4 h-4 mr-1" />
                Treatment & Prevention
              </Badge>
              <h3 className="text-2xl font-bold mb-4">Mould, Disinfection & Odour Treatment</h3>
              <p className="text-gray-600 mb-6">
                We assess, treat and help prevent recurrence.
              </p>
              <div className="space-y-3 mb-4">
                {mouldServices.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{service}</p>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm font-medium">
                  Paint doesn't fix mould. We treat the source, then advise on conditions to stop it returning.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Smoke Cleaning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
                <Wind className="w-4 h-4 mr-1" />
                Smoke Removal
              </Badge>
              <h3 className="text-2xl font-bold mb-4">Smoke & Nicotine Residue Cleaning</h3>
              <p className="text-gray-600 mb-6">
                Smoke residues cling to porous surfaces and carry odours. We:
              </p>
              <div className="space-y-3">
                {smokeServices.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{service}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Carpet Cleaning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Badge className="mb-4 bg-cyan-100 text-cyan-800 border-cyan-200">
                <Sparkles className="w-4 h-4 mr-1" />
                Deep Refresh
              </Badge>
              <h3 className="text-2xl font-bold mb-4">Carpet & Upholstery Cleaning</h3>
              <p className="text-gray-600 mb-6">
                Our professional machines refresh soft furnishings fast.
              </p>
              <div className="space-y-3">
                {carpetServices.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm">{service}</p>
                  </div>
                ))}
              </div>
            </motion.div>
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

      {/* Local Expertise */}
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
              Local Expertise: Hayle • Truro • Falmouth
            </h2>
            <p className="text-lg text-gray-600">
              We cover all of Cornwall—from the Lizard to the Roseland, Penwith to the north coast
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
                  Holiday lets & harbour homes—rapid changeover cleans that make reviews sparkle.
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
                  City apartments, HMOs & commercial units—discreet and standards-driven.
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
                  Student lets & coastal homes—salt, damp and odour know-how.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section6"
            >
              <a href="tel:+447843930927" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call: 07843 930927
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* 5-Step Method */}
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
              Our 5-Step Method
            </h2>
            <p className="text-lg text-gray-600">
              Professional, systematic approach to property cleaning
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
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

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setIsQuoteDialogOpen(true)}
              data-testid="button-get-quote-section7"
            >
              Get Your Free Quote
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
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

          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              asChild
              data-testid="button-call-section8"
            >
              <a href="tel:+447843930927" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Speak to Our Team: 07843 930927
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

      {/* Final CTA */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready for a Fresh Start?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contact Lanora House for property cleaning in Cornwall—especially Hayle, Truro & Falmouth.
              <br />
              If it's grim, it's ours.
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
                <a href="tel:+447843930927" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call: 07843 930927
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PropertyCleaningPage;
