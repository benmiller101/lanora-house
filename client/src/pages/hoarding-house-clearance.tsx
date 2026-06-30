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
  Shield, 
  Clock,
  MapPin,
  Heart,
  Home,
  Building,
  Users,
  Recycle,
  Camera,
  FileText,
  UserCheck,
  Droplets,
  Leaf,
  Brain,
  Sparkles,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

export function HoardingHouseClearancePage() {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      relationshipToProperty: '',
      propertyType: '',
      severityLevel: '',
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
      icon: <Home className="w-8 h-8 text-primary" />,
      title: "Complete Property Clearance",
      description: "Comprehensive removal of accumulated items with careful sorting and categorisation",
      highlight: "Whole House Service"
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Sentimental Item Recovery",
      description: "Careful identification and preservation of valuable, personal, and sentimental belongings",
      highlight: "Nothing Important Lost"
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Biohazard & Trauma Cleaning",
      description: "Safe removal of hazardous materials including bodily fluids, animal waste, and mould",
      highlight: "Certified Safe Removal"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Deep Decontamination",
      description: "Professional cleaning and sanitisation to restore property to habitable condition",
      highlight: "Full Property Restoration"
    },
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      title: "Ethical Waste Disposal",
      description: "Zero-to-landfill approach with donations to charity and responsible recycling",
      highlight: "Environmentally Conscious"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Family Support Coordination",
      description: "Working alongside relatives, care workers, and mental health professionals",
      highlight: "Collaborative Approach"
    }
  ];

  const mentalHealthConditions = [
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "Depression",
      description: "Often leads to difficulty maintaining living spaces and self-care"
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "Anxiety Disorders",
      description: "Can cause fear of disposing items and decision-making paralysis"
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "OCD",
      description: "Obsessive compulsive behaviours around collecting and keeping items"
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "PTSD & Trauma",
      description: "Past experiences can trigger hoarding as a coping mechanism"
    }
  ];

  const relationshipTypes = [
    "Family member seeking help",
    "Social worker or care professional", 
    "Mental health professional",
    "Court-appointed deputy or solicitor",
    "Executor handling probate",
    "Property owner or landlord",
    "The individual themselves"
  ];

  const propertyTypes = [
    "Single room",
    "Multiple rooms",
    "Entire house",
    "Flat or apartment",
    "Rental property",
    "Inherited property"
  ];

  const severityLevels = [
    "Level 1 - Mild clutter, pathways clear",
    "Level 2 - Moderate clutter, some blocked areas", 
    "Level 3 - Heavy clutter, limited access",
    "Level 4 - Severe hoarding, safety concerns",
    "Level 5 - Extreme hoarding, uninhabitable"
  ];

  const whyChooseUs = [
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: "Compassionate & Non-Judgmental",
      description: "We understand hoarding is a mental health condition requiring sensitivity and respect"
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Trained Biohazard Specialists", 
      description: "Certified in trauma cleaning and hazardous material removal for safety"
    },
    {
      icon: <UserCheck className="w-6 h-6 text-primary" />,
      title: "Discreet Professional Service",
      description: "Unbranded vehicles and confidential approach to protect privacy and dignity"
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Multi-Agency Collaboration",
      description: "Experience working with social services, mental health teams, and legal professionals"
    },
    {
      icon: <Camera className="w-6 h-6 text-primary" />,
      title: "Documentation & Reporting",
      description: "Before/after photos and detailed reports for families and agencies when needed"
    },
    {
      icon: <Recycle className="w-6 h-6 text-primary" />,
      title: "Zero-to-Landfill Promise",
      description: "Ethical disposal with charity donations and maximum recycling to reduce waste"
    }
  ];

  const clientTypes = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Families Supporting Loved Ones",
      description: "Family members seeking compassionate help for hoarding relatives"
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Social Workers & Authorities",
      description: "Local authority professionals managing vulnerable person cases"
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "Mental Health Professionals",
      description: "Therapists and support workers coordinating treatment plans"
    },
    {
      icon: <Building className="w-6 h-6 text-primary" />,
      title: "Legal Representatives",
      description: "Court-appointed deputies, solicitors, and executors handling estates"
    },
    {
      icon: <Home className="w-6 h-6 text-primary" />,
      title: "Property Managers",
      description: "Landlords and housing associations dealing with void properties"
    }
  ];

  const serviceAreas = [
    "Truro", "Plymouth", "Barnstaple", "Falmouth", "Newquay", "Penzance", 
    "Redruth", "Camborne", "Exeter", "Torquay", "All Cornwall & Devon"
  ];

  const faqs = [
    {
      question: "Is hoarding a recognised mental illness?",
      answer: "Yes. Hoarding is now classified as a mental health disorder and should be treated with compassion and care, not judgment. We approach every situation with understanding and respect."
    },
    {
      question: "Can you work alongside family or support workers?",
      answer: "Absolutely. We frequently work with families, NHS staff, mental health teams, and local councils to ensure a smooth and supported process for everyone involved."
    },
    {
      question: "What happens to sentimental or valuable items?",
      answer: "We carefully separate and return any personal items of value or importance. We never discard anything without checking with you first and take great care with precious belongings."
    },
    {
      question: "Do you handle biohazards like bodily fluids or mould?",
      answer: "Yes. We're trained in biohazard remediation and can safely clean up hazardous or contaminated areas including bodily fluids, animal waste, and mould contamination."
    },
    {
      question: "How do you maintain confidentiality and discretion?",
      answer: "We use unbranded vehicles when requested, work sensitively around neighbours, and maintain complete confidentiality about all personal situations we encounter."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Hoarding House Clearance Cornwall Devon - Compassionate Support | Lanora House</title>
        <meta name="description" content="Compassionate hoarding house clearance across Cornwall & Devon. Professional, non-judgmental service working with families, social workers, and mental health professionals." />
        <meta name="keywords" content="hoarding clearance, house clearance, mental health support, biohazard cleaning, Cornwall Devon, compassionate service" />
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
              Compassionate Care
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Hoarding House Clearance
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Professional, compassionate hoarding clearance services across Cornwall and Devon. 
              We understand this is more than clutter - it's about dignity, care, and moving forward. <a href="tel:+447843930927" className="text-primary hover:underline">Call us confidentially</a> to start the conversation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                  >
                    Get Confidential Quote
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Confidential Hoarding Clearance Quote</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <Input 
                          {...form.register('name', { required: true })}
                          placeholder="Your name (kept confidential)"
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
                      <label className="block text-sm font-medium mb-2">Your Relationship to Property</label>
                      <Select onValueChange={(value: string) => form.setValue('relationshipToProperty', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="How are you connected to this situation?" />
                        </SelectTrigger>
                        <SelectContent>
                          {relationshipTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Property Type</label>
                        <Select onValueChange={(value: string) => form.setValue('propertyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="What needs clearing?" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Severity Level</label>
                        <Select onValueChange={(value: string) => form.setValue('severityLevel', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Level of hoarding" />
                          </SelectTrigger>
                          <SelectContent>
                            {severityLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
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
                      <label className="block text-sm font-medium mb-2">Timeframe</label>
                      <Select onValueChange={(value: string) => form.setValue('urgency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="How soon do you need this completed?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                          <SelectItem value="soon">Soon - Within 2 weeks</SelectItem>
                          <SelectItem value="planned">Planned - Within a month</SelectItem>
                          <SelectItem value="flexible">Flexible - When convenient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Services</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Deep Cleaning & Sanitisation', 'Biohazard Removal', 'Sentimental Item Recovery', 'Before/After Photography', 'Multi-Agency Coordination'].map((service) => (
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
                      <label className="block text-sm font-medium mb-2">Situation Details</label>
                      <Textarea 
                        {...form.register('description')}
                        placeholder="Please share any details that would help us understand the situation and provide the best support. All information is kept strictly confidential."
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark"
                        disabled={submitQuoteMutation.isPending}
                      >
                        {submitQuoteMutation.isPending ? "Submitting..." : "Get Confidential Quote"}
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
                  Confidential: +44 7843 930927
                </a>
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-primary font-semibold">
                <Heart className="w-5 h-5 inline mr-2" />
                Compassionate, non-judgmental service - We're here to help, not judge
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
              Our Approach
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Compassionate Hoarding Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every situation is unique. We tailor our approach to meet your specific needs with dignity and respect.
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
              <a href="tel:+447843930927" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Understanding Hoarding Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Brain className="w-4 h-4 mr-1" />
              Understanding Hoarding
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              Hoarding is a Recognised Mental Health Condition
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Hoarding often stems from underlying mental health conditions and should be approached with compassion, not judgment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mentalHealthConditions.map((condition, index) => (
              <Card key={index} className="text-center border-primary/20 bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {condition.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {condition.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {condition.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-primary/30">
            <p className="text-lg text-gray-700">
              <strong className="text-primary">Our team is trained to work sensitively</strong> with individuals experiencing hoarding challenges, always maintaining dignity and respect throughout the process.
            </p>
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
              We work with families, professionals, and agencies to provide comprehensive hoarding clearance support.
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
              Specialist expertise in hoarding situations combined with genuine compassion and understanding.
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

      {/* Service Areas Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            Where We Provide Support
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Compassionate hoarding clearance services across Cornwall, Devon, and the South West.
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


      {/* Recent Work — Hoarder Clean St Just */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Star className="w-4 h-4 mr-1" />
              Real Transformation
            </Badge>
            <h2 className="text-3xl font-bold text-primary mb-3">Hoarder Clean — St Just, Cornwall</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A severe hoarder clean carried out in St Just, West Cornwall. Every room cleared, cleaned and restored — including a heavily neglected bathroom, kitchen and mould-damaged bedrooms.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "/uploads/before-after/image-1779711862205-8120fa8c1da8.jpg",
              "/uploads/before-after/image-1779711866344-6aa4646ccf4e.jpg",
              "/uploads/before-after/image-1779711862215-af3294fa4bc2.jpg",
              "/uploads/before-after/image-1779711866347-1c4f2cfb2ded.jpg",
              "/uploads/before-after/image-1779711862221-c4159688643a.jpg",
              "/uploads/before-after/image-1779711866349-1cbf6690e783.jpg",
            ].map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-md relative">
                <img src={src} alt="Hoarder house clean St Just Cornwall" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${i % 2 === 0 ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
                  {i % 2 === 0 ? "Before" : "After"}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <Link href="/before-after">See the Full Gallery</Link>
            </Button>
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
              Ready to Take the First Step?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              No matter how overwhelming the situation feels, we're here to help with compassion, 
              dignity, and complete confidentiality. You don't have to face this alone.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Get Confidential Support
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447843930927" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Confidential: +44 7843 930927
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}