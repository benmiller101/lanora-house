import React, { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { 
  ArrowRight, 
  Phone, 
  CheckCircle, 
  X,
  Clock,
  MapPin,
  Truck,
  Home,
  Building,
  Hammer,
  Recycle,
  Shield,
  Calendar,
  Users,
  Zap,
  FileCheck,
  Trash2,
  Package,
  Wrench
} from "lucide-react";
import { motion } from "framer-motion";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

export function WaitAndLoadServicePage() {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      customerType: '',
      wasteType: '',
      location: '',
      timePreference: '',
      estimatedVolume: '',
      description: '',
      services: [] as string[]
    }
  });

  const submitQuoteMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await fetch('/api/clearance-stories/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quote request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Request Submitted",
        description: "We'll contact you within 24 hours with your free quote.",
      });
      setIsQuoteDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: any) => {
    // Map wait-and-load form fields to clearance quote schema fields
    const additionalInfo = [
      `Customer Type: ${data.customerType}`,
      `Waste Type: ${data.wasteType}`,
      `Time Preference: ${data.timePreference}`,
      `Estimated Volume: ${data.estimatedVolume}`,
      `Services: ${selectedServices.join(', ')}`,
      `Description: ${data.description}`
    ].filter(item => !item.includes('null') && !item.includes('undefined')).join('\n\n');
    
    const formData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.location,
      propertyType: data.customerType,
      clearanceType: 'wait-and-load-service',
      timeframe: data.timePreference,
      additionalInfo: additionalInfo,
      requestType: 'clearance'
    };
    
    submitQuoteMutation.mutate(formData);
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const services = [
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: "Same-Day Collection",
      description: "Our truck arrives at your scheduled time - load up and we're gone within the hour",
      highlight: "Fast Turnaround"
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "No Permits Required",
      description: "Skip the council paperwork - our truck doesn't stay on public roads or require permits",
      highlight: "Hassle-Free"
    },
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      title: "Zero-to-Landfill Disposal",
      description: "Everything collected is recycled, donated to charity, or responsibly disposed of",
      highlight: "Eco-Friendly"
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary" />,
      title: "Flexible Scheduling",
      description: "Book same-day or next-day slots to fit around your timeline and availability",
      highlight: "When You Need It"
    },
    {
      icon: <Package className="w-8 h-8 text-primary" />,
      title: "Mixed Waste Collection",
      description: "Household, garden, furniture, construction debris - we take most non-hazardous waste",
      highlight: "All-in-One Solution"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Optional Labour Assistance",
      description: "Need help with the heavy lifting? We offer labour-assisted loading services too",
      highlight: "Extra Help Available"
    }
  ];

  const comparison = [
    {
      feature: "Permit Required",
      traditional: { icon: <CheckCircle className="w-5 h-5 text-red-500" />, text: "Yes (for public roads)" },
      waitAndLoad: { icon: <X className="w-5 h-5 text-green-600" />, text: "No" }
    },
    {
      feature: "Risk of Fly-Tipping",
      traditional: { icon: <CheckCircle className="w-5 h-5 text-red-500" />, text: "Yes" },
      waitAndLoad: { icon: <X className="w-5 h-5 text-green-600" />, text: "No" }
    },
    {
      feature: "Time Sitting Outside",
      traditional: { icon: <Clock className="w-5 h-5 text-red-500" />, text: "Days" },
      waitAndLoad: { icon: <Zap className="w-5 h-5 text-green-600" />, text: "30-60 Minutes" }
    },
    {
      feature: "Same-Day Collection",
      traditional: { icon: <X className="w-5 h-5 text-red-500" />, text: "Rare" },
      waitAndLoad: { icon: <CheckCircle className="w-5 h-5 text-green-600" />, text: "Often Available" }
    },
    {
      feature: "Eco-Friendly Disposal",
      traditional: { icon: <Clock className="w-5 h-5 text-yellow-500" />, text: "Varies" },
      waitAndLoad: { icon: <CheckCircle className="w-5 h-5 text-green-600" />, text: "Zero-to-Landfill" }
    }
  ];

  const wasteTypes = [
    "Household & garden waste",
    "Furniture & white goods", 
    "Builder's rubble & plasterboard",
    "DIY & renovation debris",
    "Office & commercial waste",
    "WEEE (electrical items)",
    "Mixed general waste",
    "Non-hazardous construction waste"
  ];

  const customerTypes = [
    "Homeowner - renovation/decluttering",
    "Landlord - property clearance", 
    "Builder/contractor - construction waste",
    "Office/retail - commercial clearance",
    "Housing association - maintenance",
    "DIY enthusiast - project waste"
  ];

  const timePreferences = [
    "Same day if possible",
    "Tomorrow", 
    "Within 2-3 days",
    "Within a week",
    "Flexible - when convenient"
  ];

  const volumeEstimates = [
    "Small van load (1-2 cubic metres)",
    "Medium load (3-5 cubic metres)", 
    "Large load (6-8 cubic metres)",
    "Extra large (9+ cubic metres)",
    "Not sure - need assessment"
  ];

  const whyChooseUs = [
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Fast & Flexible Service",
      description: "Same-day and next-day slots available with no lengthy booking process"
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "No Permits or Paperwork", 
      description: "Skip the council bureaucracy - our service requires no permits or permissions"
    },
    {
      icon: <Recycle className="w-6 h-6 text-primary" />,
      title: "Environmental Responsibility",
      description: "Zero-to-landfill policy with charity donations and maximum recycling"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Professional Team",
      description: "Uniformed, friendly staff with optional labour assistance available"
    },
    {
      icon: <FileCheck className="w-6 h-6 text-primary" />,
      title: "Transparent Pricing",
      description: "Fixed, fair costs with no hidden extras or surprise charges"
    },
    {
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "Clean & Efficient",
      description: "No messy skips left outside - we arrive, load, and leave the same day"
    }
  ];

  const clientTypes = [
    {
      icon: <Home className="w-6 h-6 text-primary" />,
      title: "Homeowners",
      description: "Perfect for renovations, decluttering, and garden clearances"
    },
    {
      icon: <Building className="w-6 h-6 text-primary" />,
      title: "Landlords",
      description: "Quick property turnaround between tenancies and void clearances"
    },
    {
      icon: <Hammer className="w-6 h-6 text-primary" />,
      title: "Builders & Contractors",
      description: "Flexible waste removal for construction sites and projects"
    },
    {
      icon: <Package className="w-6 h-6 text-primary" />,
      title: "Commercial Properties",
      description: "Offices, shops, and businesses needing efficient waste clearance"
    },
    {
      icon: <Wrench className="w-6 h-6 text-primary" />,
      title: "DIY Enthusiasts",
      description: "Project waste removal for home improvers and garden landscapers"
    }
  ];

  const serviceAreas = [
    "Truro", "Exeter", "Plymouth", "Falmouth", "Newquay", "Bude", 
    "Redruth", "Camborne", "Barnstaple", "Torquay", "All Cornwall & Devon"
  ];

  const faqs = [
    {
      question: "Do I need to load the van myself?",
      answer: "Yes - this service is self-load, but we also offer labour-assisted clearances if you'd like us to do the heavy lifting. Just let us know when booking."
    },
    {
      question: "Can I use Wait and Load for business waste?",
      answer: "Absolutely. It's ideal for offices, shops, builders, and landlords needing fast and flexible waste removal without the hassle of skip permits."
    },
    {
      question: "Do I need a permit?",
      answer: "No. Since the truck doesn't stay on-site and we collect immediately, there's no need for a council permit or road closure."
    },
    {
      question: "How long do I have to load the truck?",
      answer: "Typically 30-60 minutes. If you need more time or have a large amount to load, let us know when booking and we'll accommodate your needs."
    },
    {
      question: "What happens if others try to use my skip?",
      answer: "This isn't an issue with our service since there's no skip left unattended. We arrive, you load, and we leave - no risk of fly-tipping or unauthorized use."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Wait and Load Service Cornwall Devon - Skip Hire Alternative | Lanora House</title>
        <meta name="description" content="Flexible wait and load waste removal across Cornwall & Devon. Smart alternative to skip hire with same-day collection, no permits required, and zero-to-landfill disposal." />
        <meta name="keywords" content="wait and load, skip hire alternative, waste removal, same day collection, Cornwall Devon, no permits" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-blue-100/50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Truck className="w-4 h-4 mr-1" />
              Skip Hire Alternative
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Wait and Load Service
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              The smarter alternative to skip hire - flexible, fast, and zero-to-landfill waste removal. 
              We arrive, you load, we leave. No permits, no mess, no waiting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                  >
                    Book Collection Today
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Book Your Wait and Load Collection</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <Input 
                          {...form.register('name', { required: true })}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <Input 
                          {...form.register('phone', { required: true })}
                          placeholder="Your contact number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input 
                        {...form.register('email', { required: true })}
                        type="email"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">You Are</label>
                      <Select onValueChange={(value: string) => form.setValue('customerType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="What describes you best?" />
                        </SelectTrigger>
                        <SelectContent>
                          {customerTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Waste Type</label>
                        <Select onValueChange={(value: string) => form.setValue('wasteType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="What needs collecting?" />
                          </SelectTrigger>
                          <SelectContent>
                            {wasteTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Estimated Volume</label>
                        <Select onValueChange={(value: string) => form.setValue('estimatedVolume', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Roughly how much?" />
                          </SelectTrigger>
                          <SelectContent>
                            {volumeEstimates.map(volume => (
                              <SelectItem key={volume} value={volume}>{volume}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Location *</label>
                      <Input 
                        {...form.register('location', { required: true })}
                        placeholder="Collection address or postcode"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">When Do You Need This?</label>
                      <Select onValueChange={(value: string) => form.setValue('timePreference', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Preferred timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          {timePreferences.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Services</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Labour Assistance (Heavy Lifting)', 'Same Day Collection', 'Weekend/Evening Slot', 'Charity Donation Sorting', 'Site Cleaning After'].map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={selectedServices.includes(service)}
                              onCheckedChange={() => handleServiceToggle(service)}
                            />
                            <label className="text-sm">{service}</label>
                            {selectedServices.includes(service) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleServiceToggle(service)}
                                className="ml-auto h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Details</label>
                      <Textarea 
                        {...form.register('description')}
                        placeholder="Any specific requirements, access issues, or other details we should know about..."
                        rows={3}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark"
                        disabled={submitQuoteMutation.isPending}
                      >
                        {submitQuoteMutation.isPending ? "Submitting..." : "Book My Collection"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-secondary/20 text-lg px-8 py-4 h-auto">
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-primary font-semibold">
                <Clock className="w-5 h-5 inline mr-2" />
                Same-day collection available - No permits required - Zero-to-landfill guarantee
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
              <Zap className="w-4 h-4 mr-1" />
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Simple, Fast, and Flexible Waste Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Skip the hassle of traditional skip hire - our wait and load service is the smart alternative.
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <StaggeredItem key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
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
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                No Obligation Quote
              </Button>
            </Link>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447456809049" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <FileCheck className="w-4 h-4 mr-1" />
              Skip Hire vs Wait and Load
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              Why Wait and Load Beats Traditional Skip Hire
            </h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-primary text-white p-4 font-bold text-center">
              <div>Feature</div>
              <div>Traditional Skip</div>
              <div>Wait and Load</div>
            </div>
            
            {comparison.map((item, index) => (
              <div key={index} className={`grid grid-cols-3 p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="font-medium text-gray-900">{item.feature}</div>
                <div className="flex items-center justify-center gap-2">
                  {item.traditional.icon}
                  <span className="text-sm">{item.traditional.text}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  {item.waitAndLoad.icon}
                  <span className="text-sm">{item.waitAndLoad.text}</span>
                </div>
              </div>
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
              <a href="tel:+447456809049" className="flex items-center">
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
              Perfect for All Types of Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From home renovations to commercial clearances - our flexible service adapts to your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {clientTypes.map((client, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
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
              <a href="tel:+447456809049" className="flex items-center">
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
              More than just waste collection - we're committed to service excellence and environmental responsibility.
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
              <a href="tel:+447456809049" className="flex items-center">
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
            Coverage Areas
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Wait and load service available across Cornwall, Devon, and the South West.
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
                    <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Ready to Skip the Skip?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Book your wait and load collection today and experience the smarter, 
              faster alternative to traditional skip hire across Cornwall and Devon.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Book Collection Now
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}