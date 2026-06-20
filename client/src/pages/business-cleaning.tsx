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
  Building,
  Clock,
  CheckCircle,
  Phone,
  ArrowRight,
  Users,
  Truck,
  Home,
  Sparkles,
  Target,
  Award,
  FileCheck,
  ClipboardCheck,
  Store,
  Factory,
  School,
  Heart,
  Package,
  Calendar,
  Zap,
  Camera,
  Coffee
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";

const BusinessCleaningPage = () => {
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
    
    formData.append('serviceType', 'business-cleaning');
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
      title: "Cleaning Specialists",
      description: "Professional cleaning, sanitation and hygiene"
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "Minimal Disruption",
      description: "Out-of-hours and weekend options"
    },
    {
      icon: <Award className="w-8 h-8 text-indigo-600" />,
      title: "Consistent Quality",
      description: "Bespoke scope, checklists & photo reports"
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: "Safe & Compliant",
      description: "Risk assessments, COSHH, method statements"
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      title: "Local & Responsive",
      description: "Rapid coverage in Cornwall & South West"
    }
  ];

  const commercialServices = [
    {
      icon: <Building className="w-6 h-6 text-blue-600" />,
      title: "Offices & Studios",
      description: "Desks, IT touchpoints, phones, kitchens, fridges, meeting rooms"
    },
    {
      icon: <Store className="w-6 h-6 text-green-600" />,
      title: "Retail & Hospitality",
      description: "Front-of-house detail, back-of-house hygiene, high-touch disinfection"
    },
    {
      icon: <Factory className="w-6 h-6 text-purple-600" />,
      title: "Warehouses & Light Industrial",
      description: "Floors, welfare areas, staff kitchens, lockers, break rooms"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "Washrooms & Shower Blocks",
      description: "Deep sanitisation, consumable top-ups, odour control"
    },
    {
      icon: <School className="w-6 h-6 text-indigo-600" />,
      title: "Education & Community Spaces",
      description: "Classrooms, halls, receptions, safe touchpoint routines"
    },
    {
      icon: <Home className="w-6 h-6 text-orange-600" />,
      title: "Managed Portfolios",
      description: "Communal areas, lobbies, bin stores, stairwells, lifts"
    }
  ];

  const serviceOptions = [
    {
      title: "Contract Cleaning (Daily/Weekly/Fortnightly)",
      icon: <Calendar className="w-8 h-8 text-primary" />,
      features: [
        "Tailored task lists for your site",
        "Supervisor checks and issue logging",
        "Supplies management (by agreement)"
      ]
    },
    {
      title: "One-Off Deep Cleans",
      icon: <Sparkles className="w-8 h-8 text-green-600" />,
      features: [
        "Detail clean of kitchens, washrooms, fixtures & fittings",
        "High-level dusting (reachable without specialist access)",
        "Floor care: machine mopping, scrub & buff where suitable"
      ]
    },
    {
      title: "Insurance, Fire & Flood After-Clean",
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      features: [
        "Soot/smoke surface cleaning, odour neutralisation",
        "Post-flood sanitisation and drying support guidance",
        "Liaison with insurer or loss adjuster on cleaning scope"
      ]
    },
    {
      title: "Toilets & Shower Blocks",
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
      features: [
        "Scheduled sanitisation routines",
        "Seasonal contracts for holiday parks and sites",
        "Out-of-hours attendance to avoid queues and downtime"
      ]
    },
    {
      title: "Carpet & Upholstery Cleaning",
      icon: <Home className="w-8 h-8 text-purple-600" />,
      features: [
        "Hot water extraction for offices, stairs, receptions",
        "Hand tools for upholstery and chairs",
        "Allergy-friendly or scented detergents available",
        "Generator-ready if power is limited during works"
      ]
    },
    {
      title: "End-of-Tenancy (Lettings & Portfolios)",
      icon: <FileCheck className="w-8 h-8 text-indigo-600" />,
      features: [
        "Inventory-standard deep cleans to speed up re-lets",
        "Optional before/after photos and video walkthrough",
        "Fast turnaround across Cornwall"
      ]
    },
    {
      title: "Cleaning Audits & Reports",
      icon: <ClipboardCheck className="w-8 h-8 text-cyan-600" />,
      features: [
        "On-site cleanliness assessment with plain-English report",
        "Bespoke cleaning rotas for your in-house team",
        "Mid-tenancy or mid-contract health-check"
      ]
    }
  ];

  const cleaningProcess = [
    {
      number: "1",
      title: "Site Survey",
      description: "Quick visit (or plan via photos/video)"
    },
    {
      number: "2",
      title: "Scope & Quote",
      description: "Clear tasks, frequencies and checklists"
    },
    {
      number: "3",
      title: "Mobilise",
      description: "Trained operatives, PPE, products and plan"
    },
    {
      number: "4",
      title: "Deliver",
      description: "On-schedule cleaning with minimal disruption"
    },
    {
      number: "5",
      title: "Review",
      description: "Optional photo reports, feedback loop and tweaks"
    }
  ];

  const sectors = [
    { icon: <Building className="w-6 h-6 text-blue-600" />, title: "Offices" },
    { icon: <Store className="w-6 h-6 text-green-600" />, title: "Retail" },
    { icon: <Coffee className="w-6 h-6 text-purple-600" />, title: "Hospitality" },
    { icon: <Home className="w-6 h-6 text-primary" />, title: "Holiday Parks" },
    { icon: <School className="w-6 h-6 text-indigo-600" />, title: "Education" },
    { icon: <Heart className="w-6 h-6 text-red-600" />, title: "Healthcare" },
    { icon: <Factory className="w-6 h-6 text-orange-600" />, title: "Light Industrial" },
    { icon: <Home className="w-6 h-6 text-cyan-600" />, title: "Managed Residential" },
    { icon: <Users className="w-6 h-6 text-pink-600" />, title: "Public Buildings" }
  ];

  const faqs = [
    {
      question: "Can you work outside office hours?",
      answer: "Yes—evenings, early mornings and weekends to minimise disruption."
    },
    {
      question: "Do you supply materials and consumables?",
      answer: "We can supply cleaning products and can manage washroom consumables by agreement."
    },
    {
      question: "Do you provide waste or house clearances?",
      answer: "No—we're cleaning specialists. If you arrange third-party services, we'll schedule our clean around them."
    },
    {
      question: "Are you insured and compliant?",
      answer: "Yes—appropriate cover, risk assessments and COSHH where required."
    },
    {
      question: "Can you attend urgently?",
      answer: "We prioritise time-critical cases and will offer the earliest available slot across South West Cornwall and beyond."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Business Cleaning Cornwall - Commercial & Workplace Cleaning | Lanora House</title>
        <meta name="description" content="Lanora House provides commercial cleaning services across Cornwall. Offices, retail, hospitality, warehouses. Out-of-hours service. Hayle, Truro, Falmouth & South West Cornwall." />
        <meta name="keywords" content="business cleaning Cornwall, commercial cleaning, office cleaning, retail cleaning, warehouse cleaning, workplace cleaning, Hayle, Truro, Falmouth" />
        <meta property="og:title" content="Business Cleaning Cornwall | Lanora House" />
        <meta property="og:description" content="Lanora House provides commercial and workplace cleaning services across Cornwall. If it's grim, it's ours." />
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
              <Building className="w-4 h-4 mr-1" />
              Business Cleaning Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Commercial & Workplace Cleaning
              <br />
              <span className="text-3xl md:text-5xl">in Cornwall</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Keep your workplace safe, spotless and client-ready with Lanora House. We deliver reliable, out-of-hours commercial cleaning for offices, shops, hospitality, education, healthcare waiting areas, warehouses and managed properties. We work around your schedule—evenings, early mornings and weekends—so productivity never stops.
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Serving Hayle, Truro, Falmouth & South West Cornwall (and across Cornwall)
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
                        <Label htmlFor="propertyType">Business Type *</Label>
                        <Select 
                          value={quoteForm.propertyType} 
                          onValueChange={(value) => handleInputChange('propertyType', value)}
                        >
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="hospitality">Hospitality</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="holiday-park">Holiday Park</SelectItem>
                            <SelectItem value="managed-residential">Managed Residential</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address *</Label>
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
                          <SelectItem value="contract">Contract Cleaning</SelectItem>
                          <SelectItem value="one-off">One-Off Deep Clean</SelectItem>
                          <SelectItem value="insurance">Insurance/Fire/Flood</SelectItem>
                          <SelectItem value="washrooms">Toilets & Shower Blocks</SelectItem>
                          <SelectItem value="carpet">Carpet & Upholstery</SelectItem>
                          <SelectItem value="end-tenancy">End-of-Tenancy</SelectItem>
                          <SelectItem value="audit">Cleaning Audit</SelectItem>
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
                          <SelectItem value="ongoing">Ongoing Contract</SelectItem>
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
                        placeholder="Please describe your cleaning requirements, frequency needed, out-of-hours preferences, or special circumstances..."
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

      {/* Why Businesses Choose Us */}
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
              Why Businesses Choose Lanora House
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What We Clean (Commercial)
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {commercialServices.map((service, index) => (
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

          <div className="text-center">
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

      {/* Service Options */}
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
              Service Options
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {serviceOptions.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {service.icon}
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {service.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 text-sm">{feature}</p>
                        </div>
                      ))}
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

      {/* Commercial Cleaning Process */}
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
              Our Commercial Cleaning Process
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            {cleaningProcess.map((step, index) => (
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

      {/* Sectors We Support */}
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
              Sectors We Support
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            {sectors.map((sector, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6 pb-6">
                    <div className="mx-auto mb-3">{sector.icon}</div>
                    <p className="font-medium text-sm">{sector.title}</p>
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
              data-testid="button-get-quote-section5"
            >
              Request Your Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Local Expertise */}
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
              Local Expertise: Hayle • Truro • Falmouth • South West Cornwall
            </h2>
            <p className="text-lg text-gray-600">
              We cover all of Cornwall—from South West Cornwall to the north coast
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Hayle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Holiday-letting changeovers, waterfront retail, light industrial units.
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
                <p className="text-gray-600 text-sm">
                  City-centre offices, clinics, serviced apartments, managed buildings.
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
                <p className="text-gray-600 text-sm">
                  Hospitality venues, student HMOs, marine-adjacent sites.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  South West Cornwall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Penwith, Lizard & Roseland—coastal settings, seasonal sites, remote premises.
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
              <a href="tel:+447456809049" className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Call: 07456 809049
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
              FAQs (Business)
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
              Ready for a Cleaner Workspace?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contact Lanora House for commercial cleaning in Hayle, Truro, Falmouth & South West Cornwall.
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

export default BusinessCleaningPage;
