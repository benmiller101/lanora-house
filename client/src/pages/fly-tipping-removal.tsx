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
  Camera,
  FileText,
  Recycle,
  Building,
  Home,
  Factory,
  School,
  Users,
  Zap,
  Truck,
  Eye,
  TreePine,
  Droplets,
  Paintbrush
} from "lucide-react";
import { motion } from "framer-motion";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

export function FlyTippingRemovalPage() {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      propertyType: '',
      wasteType: '',
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
      icon: <Trash2 className="w-8 h-8 text-primary" />,
      title: "Household Waste Removal",
      description: "Black bags, rubbish, and general household items illegally dumped on your property",
      highlight: "From £70"
    },
    {
      icon: <Building className="w-8 h-8 text-primary" />,
      title: "Bulky Item Clearance",
      description: "Mattresses, sofas, furniture, and large items fly-tipped by irresponsible individuals",
      highlight: "Same Day Available"
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-primary" />,
      title: "Hazardous Waste Removal",
      description: "Chemicals, oils, paint, and dangerous materials requiring certified disposal methods",
      highlight: "Licensed Disposal"
    },
    {
      icon: <Factory className="w-8 h-8 text-primary" />,
      title: "Builder's Waste Clearance",
      description: "Construction debris, bricks, plasterboard, and rubble illegally dumped on land",
      highlight: "Documented Removal"
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "WEEE & Electrical Items",
      description: "Electrical appliances and electronic waste requiring environmentally safe disposal",
      highlight: "Eco-Compliant"
    },
    {
      icon: <Camera className="w-8 h-8 text-primary" />,
      title: "Evidence Collection",
      description: "Professional documentation and photography to support legal enforcement action",
      highlight: "Court-Ready Evidence"
    }
  ];

  const legalRisks = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Legal Responsibility",
      description: "Landowners are legally liable for removing fly-tipped waste from their property"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Council Fines",
      description: "Local authorities can issue fines for failing to remove dumped waste promptly"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Health Hazards",
      description: "Dumped waste can contain hazardous materials posing serious health risks"
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      title: "Environmental Damage",
      description: "Illegal dumping can contaminate soil, waterways, and local ecosystems"
    }
  ];

  const wasteTypes = [
    "Household rubbish & black bags",
    "Bulky furniture & mattresses", 
    "Builder's waste & rubble",
    "Hazardous chemicals & paint",
    "WEEE & electrical items",
    "Tyres & automotive waste",
    "Garden waste & green waste",
    "Mixed commercial waste"
  ];

  const propertyTypes = [
    "Private Land & Gardens",
    "Commercial Property", 
    "Retail Parks & Car Parks",
    "Construction Sites",
    "Agricultural Land & Farms",
    "Housing Association Property",
    "School & Educational Grounds",
    "Industrial Sites"
  ];

  const whyChooseUs = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Fully Licensed & Compliant",
      description: "Registered waste carriers with full UK regulatory compliance and insurance"
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Rapid Response Service", 
      description: "Same-day and next-day availability for urgent fly tipping clearance needs"
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Complete Documentation",
      description: "RAMS, waste transfer notes, and compliance documentation for legal protection"
    },
    {
      icon: <Camera className="w-6 h-6 text-primary" />,
      title: "Evidence Collection Support",
      description: "Professional photography and documentation to assist with enforcement action"
    },
    {
      icon: <Recycle className="w-6 h-6 text-primary" />,
      title: "Zero-to-Landfill Policy",
      description: "Environmental responsibility with 100% landfill diversion wherever possible"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-primary" />,
      title: "Transparent Fixed Pricing",
      description: "Clear, upfront costs from £70 with no hidden fees or surprise charges"
    }
  ];

  const clientTypes = [
    {
      icon: <Home className="w-6 h-6 text-primary" />,
      title: "Private Landowners",
      description: "Homeowners dealing with illegal dumping on their property"
    },
    {
      icon: <Building className="w-6 h-6 text-primary" />,
      title: "Commercial Landlords",
      description: "Business property owners managing fly tipping incidents"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Housing Associations",
      description: "Social housing providers maintaining clean, safe environments"
    },
    {
      icon: <Factory className="w-6 h-6 text-primary" />,
      title: "Construction Companies",
      description: "Site managers dealing with unauthorized waste dumping"
    },
    {
      icon: <School className="w-6 h-6 text-primary" />,
      title: "Educational Facilities",
      description: "Schools and colleges maintaining safe premises"
    }
  ];

  const serviceAreas = [
    "Truro", "Plymouth", "Exeter", "Barnstaple", "Newquay", "Falmouth", 
    "St Austell", "Bude", "Redruth", "Penzance", "Wadebridge", "All South West"
  ];

  const faqs = [
    {
      question: "Is it really my responsibility to clear dumped waste?",
      answer: "Yes. Even if you didn't dump it, you're legally responsible for removing fly-tipped waste from your private property. Failure to do so can result in council fines."
    },
    {
      question: "Can I be fined if I don't act quickly enough?",
      answer: "Yes. Local authorities have powers to fine landowners who fail to remove waste or allow ongoing environmental hazards on their property."
    },
    {
      question: "Do you help with enforcement action?",
      answer: "Yes. We collect evidence on-site including photos, packaging details, and serial numbers to help identify offenders and support any legal action."
    },
    {
      question: "What documentation do you provide?",
      answer: "We provide complete waste transfer documentation, RAMS (Risk Assessment & Method Statement), compliance certificates, and carbon audit reports."
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Fly Tipping Removal Cornwall Devon - Legal Compliance from £70 | Lanora House</title>
        <meta name="description" content="Professional fly tipping removal across Cornwall & Devon from £70. Licensed clearance of illegally dumped waste with legal compliance and evidence collection." />
        <meta name="keywords" content="fly tipping removal, illegal dumping clearance, waste removal, legal compliance, Cornwall Devon, licensed waste carrier" />
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
              <Shield className="w-4 h-4 mr-1" />
              Licensed Waste Removal
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Fly Tipping Removal Services
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Illegally dumped waste on your land? We'll clear it quickly, safely, and with full legal compliance. 
              Licensed removal across Cornwall, Devon, and the South West.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                  >
                    Get Emergency Quote
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Get Your Fly Tipping Clearance Quote</DialogTitle>
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
                        <label className="block text-sm font-medium mb-2">Waste Type</label>
                        <Select onValueChange={(value: string) => form.setValue('wasteType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Type of dumped waste" />
                          </SelectTrigger>
                          <SelectContent>
                            {wasteTypes.map(type => (
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
                        placeholder="Property address or postcode"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Urgency Level</label>
                      <Select onValueChange={(value: string) => form.setValue('urgency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="How urgent is removal?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency - Same day needed</SelectItem>
                          <SelectItem value="urgent">Urgent - Within 24 hours</SelectItem>
                          <SelectItem value="standard">Standard - Within 48 hours</SelectItem>
                          <SelectItem value="scheduled">Scheduled - Plan ahead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Services</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Evidence Collection & Photography', 'Legal Documentation Support', 'Site Cleaning & Jet Washing', 'Deodorising Treatment', 'Preventive Signage Installation'].map((service) => (
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
                        placeholder="Describe the fly tipped waste, quantity, location details, any access issues..."
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark"
                        disabled={submitQuoteMutation.isPending}
                      >
                        {submitQuoteMutation.isPending ? "Submitting..." : "Get My Clearance Quote"}
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
                  Emergency: +44 7456 809049
                </a>
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-primary font-semibold">
                <Clock className="w-5 h-5 inline mr-2" />
                Starting from £70 - Rapid response across Cornwall & Devon with legal compliance
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
              <Trash2 className="w-4 h-4 mr-1" />
              What We Remove
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Professional Fly Tipping Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Licensed removal of all types of illegally dumped waste with complete documentation and legal compliance. <a href="tel:+447456809049" className="text-primary hover:underline">Contact our team</a> for immediate response.
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

      {/* Legal Risks Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Legal Responsibilities
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              Why Professional Removal is Essential
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Landowners are legally responsible for clearing fly-tipped waste from their property. Failure to act can result in fines and legal consequences. <Link href="/contact" className="text-primary hover:underline">Speak to our experts</Link> about your legal obligations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {legalRisks.map((risk, index) => (
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
          
          <div className="text-center p-6 bg-white rounded-lg border border-primary/30">
            <p className="text-lg text-gray-700">
              <strong className="text-primary">Lanora House takes the legal burden off your shoulders</strong> with fully compliant removal, documentation, and evidence collection to support enforcement action.
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

      {/* Client Types Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Who We Help
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional fly tipping removal services for all types of property owners and land managers.
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
              Licensed waste carriers with the expertise to handle fly tipping removal legally and responsibly.
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
            Professional fly tipping removal across Cornwall, Devon, and the wider South West region.
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
              Need Professional Fly Tipping Removal?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Don't let illegal dumping become your legal liability. Let our licensed professionals clear it quickly, 
              safely, and with full documentation for compliance and enforcement.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Get Legal Clearance Quote
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Emergency: +44 7456 809049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}