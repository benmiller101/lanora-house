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
import { Helmet } from "react-helmet";
import { 
  ArrowRight, 
  Phone, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Shield, 
  Clock,
  MapPin,
  Heart,
  Skull,
  Bird,
  Home,
  Building2,
  Leaf,
  Users,
  FileCheck,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

export function DeadAnimalRemovalPage() {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      propertyType: '',
      animalType: '',
      location: '',
      urgency: '',
      description: '',
      services: [] as string[]
    }
  });

  const submitQuoteMutation = {
    isPending: false,
    mutate: (data: any) => {
      console.log('Quote submitted:', data);
      setIsQuoteDialogOpen(false);
    }
  };

  const onSubmit = (data: any) => {
    const formData = { ...data, services: selectedServices };
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
      icon: <Skull className="w-8 h-8 text-primary" />,
      title: "Small Animal Removal",
      description: "Safe removal of rodents, cats, dogs, rabbits, foxes, badgers, and other small wildlife",
      highlight: "From £70"
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Large Animal Removal",
      description: "Professional handling of horses, livestock, deer following ABPR regulations",
      highlight: "Licensed Disposal"
    },
    {
      icon: <Bird className="w-8 h-8 text-primary" />,
      title: "Bird Removal",
      description: "Hygienic removal of deceased pigeons, seagulls, and other bird species",
      highlight: "Same Day Service"
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Site Sanitisation",
      description: "Full decontamination and deodorisation of affected areas with professional disinfectants",
      highlight: "Biohazard Safe"
    },
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "Eco-Friendly Disposal",
      description: "Zero-to-landfill policy with environmentally responsible disposal methods",
      highlight: "Government Compliant"
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Emergency Response",
      description: "24/7 availability for urgent situations requiring immediate professional intervention",
      highlight: "24/7 Available"
    }
  ];

  const risks = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Disease Transmission",
      description: "Hepatitis, Leptospirosis, and other serious infections from improper handling"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Airborne Contamination",
      description: "Dangerous bacteria and viruses spread through decomposition gases"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Pest Infestation",
      description: "Flies, maggots, and vermin attraction causing additional health hazards"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Legal Violations",
      description: "Breaches of Animal By-Products Regulations requiring licensed disposal"
    }
  ];

  const animalTypes = [
    "Small Animals (rodents, cats, dogs, rabbits)",
    "Large Animals (horses, livestock, deer)", 
    "Birds (pigeons, seagulls, wildlife)",
    "Wild Animals (foxes, badgers, bats)",
    "Unknown/Other"
  ];

  const propertyTypes = [
    "Private Home & Garden",
    "Farm & Agricultural Land", 
    "Holiday Home & Rental Property",
    "Care Home & Housing Provider",
    "Business & Commercial Space",
    "School & Public Space"
  ];

  const whyChooseUs = [
    {
      icon: <FileCheck className="w-6 h-6 text-primary" />,
      title: "Fully Licensed Waste Carriers",
      description: "Government-approved for controlled waste disposal with full compliance certification"
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Biohazard-Trained Staff", 
      description: "Professional team equipped with PPE and industry-standard safety protocols"
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: "Fast Response Times",
      description: "Same-day appointments available with flexible booking to meet urgent needs"
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: "Discreet & Respectful Service",
      description: "Unbranded vehicles and sensitive approach during difficult situations"
    },
    {
      icon: <Leaf className="w-6 h-6 text-primary" />,
      title: "Environmental Responsibility",
      description: "Zero-to-landfill policy with sustainable disposal methods protecting nature"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "Transparent Pricing",
      description: "Clear, upfront costs from £70 with no hidden fees or surprise charges"
    }
  ];

  const serviceAreas = [
    "Truro", "Exeter", "Plymouth", "Falmouth", "Barnstaple", "Torquay", 
    "Newquay", "Bude", "Redruth", "Camborne", "Wadebridge", "All Cornwall & Devon"
  ];

  const faqs = [
    {
      question: "Can I put a dead animal in my bin?",
      answer: "For small animals like mice or rats, yes - but it's not advised due to hygiene risks. For anything larger (e.g. fox, cat, badger), it must be handled by a licensed waste carrier like us."
    },
    {
      question: "Will the council remove a dead animal from private land?",
      answer: "No - it's your responsibility. Councils only remove animals from public roads and spaces. Private property requires professional licensed disposal."
    },
    {
      question: "Do you clean and disinfect the area after removal?",
      answer: "Yes - we provide a full sanitisation service, including deodorisation, to ensure the site is safe and hygienic for continued use."
    },
    {
      question: "Is this service discreet?",
      answer: "Absolutely - our vehicles are unbranded and our team is trained to work respectfully and without drawing attention to the situation."
    },
    {
      question: "What are the legal requirements for animal disposal?",
      answer: "Dead animals are classified as controlled waste. Large animals like foxes, badgers, and livestock must be disposed of by licensed carriers following ABPR regulations."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Dead Animal Removal Cornwall Devon - Professional Disposal from £70 | Lanora House</title>
        <meta name="description" content="Professional dead animal removal across Cornwall & Devon from £70. Licensed disposal of deceased pets, wildlife & livestock. Same-day service with full sanitisation." />
        <meta name="keywords" content="dead animal removal, animal disposal, carcass removal, biohazard cleanup, Cornwall Devon, licensed waste carrier" />
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
              <Heart className="w-4 h-4 mr-1" />
              Professional Animal Removal
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Dead Animal Removal Services
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Safe, hygienic, and respectful removal of deceased animals across Cornwall, Devon, and the South West. 
              Licensed disposal with environmental responsibility. <a href="tel:+447456809049" className="text-primary hover:underline">Call our licensed specialists</a> for immediate assistance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                  >
                    Get Your Quote Now
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Get Your Dead Animal Removal Quote</DialogTitle>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Property Type</label>
                        <Select onValueChange={(value: string) => form.setValue('propertyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Animal Type</label>
                        <Select onValueChange={(value: string) => form.setValue('animalType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select animal type" />
                          </SelectTrigger>
                          <SelectContent>
                            {animalTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Location *</label>
                      <Input 
                        {...form.register('location', { required: true })}
                        placeholder="Property location or postcode"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Urgency Level</label>
                      <Select onValueChange={(value: string) => form.setValue('urgency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="How urgent is this?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency - Same day needed</SelectItem>
                          <SelectItem value="urgent">Urgent - Within 24 hours</SelectItem>
                          <SelectItem value="standard">Standard - Within 48 hours</SelectItem>
                          <SelectItem value="flexible">Flexible - Next available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Services</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Site Sanitisation', 'Deodorisation', 'Full Area Disinfection', 'Pest Prevention Treatment'].map((service) => (
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
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea 
                        {...form.register('description')}
                        placeholder="Please describe the situation, location of animal, any access issues..."
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark"
                        disabled={submitQuoteMutation.isPending}
                      >
                        {submitQuoteMutation.isPending ? "Submitting..." : "Get My Quote"}
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
                Starting from £70 - Same day service available across Cornwall & Devon
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
              What We Remove
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Professional Dead Animal Removal Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trained professionals equipped to safely handle all types of animal remains with discretion and respect.
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
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447456809049" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Health Risks Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Why Professional Removal is Essential
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              Serious Health Risks from DIY Removal
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Dead animals are classified as controlled waste requiring licensed disposal to prevent serious health hazards.
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
              <strong className="text-primary">Our licensed team follows ABPR regulations</strong> and uses professional-grade PPE and disinfectants to protect both people and property.
            </p>
          </div>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4 h-auto">
                No Obligation Quote
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
              <a href="tel:+447456809049" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Where We Work
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional dead animal removal across all property types with discretion and environmental responsibility.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyTypes.map((property, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {index < 2 ? <Home className="w-6 h-6 text-primary" /> : <Building2 className="w-6 h-6 text-primary" />}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {property}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Professional service with unbranded vehicles and discreet approach
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
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
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
              Specialist team combining professional expertise with compassionate service during difficult situations.
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
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 h-auto">
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
            Service Coverage Area
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We provide professional dead animal removal across Cornwall, Devon, and the wider South West region.
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
                    <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Need Professional Dead Animal Removal?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Don't risk your health or break the law. Let our licensed professionals handle deceased animals safely, 
              respectfully, and with full environmental responsibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Get Professional Quote
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