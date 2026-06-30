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
  Wrench,
  Home,
  Recycle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
  Leaf,
  AlertTriangle,
  Hammer
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const ShedClearancePage = () => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    shedType: "",
    shedCondition: "",
    accessType: "",
    timeframe: "",
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
        shedType: "",
        shedCondition: "",
        accessType: "",
        timeframe: "",
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
    formData.append('serviceType', 'shed-clearance');
    
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
      icon: <Hammer className="w-8 h-8 text-blue-600" />,
      title: "Safe Dismantling",
      description: "Professional dismantling of wooden, metal, or plastic sheds — no matter the size or condition.",
      highlight: "All materials & structures"
    },
    {
      icon: <Recycle className="w-8 h-8 text-green-600" />,
      title: "Eco-Friendly Disposal",
      description: "Materials are sorted for recycling and disposed of responsibly, supporting our low-to-landfill promise.",
      highlight: "Sustainable approach"
    },
    {
      icon: <Home className="w-8 h-8 text-orange-600" />,
      title: "Full Site Clearance",
      description: "Once the shed's gone, we'll tidy the area so it's ready for your next garden project.",
      highlight: "Complete cleanup service"
    }
  ];

  const whyChooseUs = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Local & Reliable",
      description: "Based in Hayle, trusted across Cornwall, Devon & the South West"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Safe & Efficient",
      description: "Experienced team ensures smooth dismantling with zero mess"
    },
    {
      icon: <Leaf className="w-6 h-6 text-green-700" />,
      title: "Eco-Conscious",
      description: "Recycling, reusing, and avoiding landfill where possible"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
      title: "Fully Licensed & Insured",
      description: "Peace of mind from start to finish"
    },
    {
      icon: <Phone className="w-6 h-6 text-purple-600" />,
      title: "Transparent Pricing",
      description: "Fair, upfront quotes with no hidden fees"
    }
  ];

  const process = [
    {
      step: 1,
      title: "Assessment",
      description: "We take a look (or ask for a few pics), understand access, and your specific needs"
    },
    {
      step: 2,
      title: "Quote",
      description: "You'll get a clear, no-obligation quote"
    },
    {
      step: 3,
      title: "Booking",
      description: "Choose a time that suits you"
    },
    {
      step: 4,
      title: "Removal",
      description: "Our friendly team dismantles and removes the shed and debris"
    },
    {
      step: 5,
      title: "Cleanup",
      description: "We leave the site tidy and ready for your next plan"
    }
  ];

  const faqs = [
    {
      question: "Can you remove sheds from tight or restricted access areas?",
      answer: "Yes, we're used to awkward access and tight garden spaces. Just let us know in advance."
    },
    {
      question: "What happens to the shed once it's removed?",
      answer: "We recycle or responsibly dispose of all materials. If parts are reusable, we'll aim to donate or repurpose them."
    },
    {
      question: "How long does it take?",
      answer: "Most sheds are removed in under a day, but we'll give you a clear timescale after the initial assessment."
    },
    {
      question: "Do you handle old paint, chemicals, or hazardous materials?",
      answer: "We can advise on proper disposal of hazardous items, but some materials may need specialist handling. Let us know what's inside!"
    }
  ];

  return (
    <div className="min-h-screen bg-green-50">
      <Helmet>
        <title>Professional Shed Clearance Cornwall & Devon - Quick & Hassle-Free | Lanora House</title>
        <meta name="description" content="Quick, hassle-free shed clearance across Cornwall, Devon & the South West. Professional dismantling, eco-friendly disposal, and full site cleanup." />
        <meta name="keywords" content="shed clearance Cornwall, shed removal Devon, garden shed dismantling South West, workshop clearance, storage unit removal Cornwall Devon" />
        <meta property="og:title" content="Professional Shed Clearance Cornwall & Devon | Lanora House" />
        <meta property="og:description" content="Quick, hassle-free shed clearance across Cornwall, Devon & the South West. Professional dismantling and eco-friendly disposal." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-green-100/50" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <MapPin className="w-4 h-4 mr-1" />
              Cornwall, Devon & South West
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Quick, Hassle-Free
              <br />
              <span className="text-3xl md:text-5xl">Shed Clearance</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Is your old shed falling apart or simply no longer needed? Let Lanora House take care of the heavy lifting.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Our professional shed removal and disposal service covers everything — from safe dismantling to responsible recycling — leaving your space clean, clear, and ready for something new. <a href="tel:+447843930927" className="text-primary hover:underline">Call our experts</a> for a quick assessment.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Shed Clearance Quote</DialogTitle>
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
                          placeholder="0345 319 8000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shedType">Shed Type</Label>
                        <Select value={quoteForm.shedType} onValueChange={(value) => handleInputChange("shedType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shed type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="garden-shed">Garden Shed</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="storage-unit">Storage Unit</SelectItem>
                            <SelectItem value="greenhouse">Greenhouse</SelectItem>
                            <SelectItem value="garage">Garage</SelectItem>
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
                        <Label htmlFor="shedCondition">Shed Condition</Label>
                        <Select value={quoteForm.shedCondition} onValueChange={(value) => handleInputChange("shedCondition", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Current condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Good condition</SelectItem>
                            <SelectItem value="fair">Fair condition</SelectItem>
                            <SelectItem value="poor">Poor condition</SelectItem>
                            <SelectItem value="falling-apart">Falling apart</SelectItem>
                            <SelectItem value="collapsed">Collapsed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="accessType">Access Type</Label>
                        <Select value={quoteForm.accessType} onValueChange={(value) => handleInputChange("accessType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="How easy is access?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy access</SelectItem>
                            <SelectItem value="narrow">Narrow path/gate</SelectItem>
                            <SelectItem value="restricted">Restricted access</SelectItem>
                            <SelectItem value="very-tight">Very tight space</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timeframe">Preferred Timeframe</Label>
                      <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need this done?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (Within 1 week)</SelectItem>
                          <SelectItem value="flexible">Flexible (1-4 weeks)</SelectItem>
                          <SelectItem value="planned">Planned (1-3 months)</SelectItem>
                          <SelectItem value="no-rush">No Rush</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Tell us more about your shed, any hazardous materials inside, access challenges, etc."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="images">Photos (Optional)</Label>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mb-2"
                      />
                      <p className="text-sm text-gray-600 mb-3">
                        Upload photos of your shed and access route (max 5 images, 5MB each)
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
                  Call: +44 7843 930 927
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="w-4 h-4 mr-1" />
              What We Offer
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Comprehensive Shed Removal Service
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you've got a garden shed, workshop, or storage unit that's seen better days, we're ready to help. Our full-service approach includes:
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <StaggeredItem key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gray-50 rounded-full">
                        {service.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <Badge className="bg-primary/10 text-primary">
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

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Choose Lanora House for Shed Removal?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-md"
              >
                <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
                  {reason.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
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

      {/* Process Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-300">
              <Wrench className="w-4 h-4 mr-1" />
              Our Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Our Shed Clearance Process
            </h2>
          </div>
          
          <div className="space-y-8">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {step.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
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

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-green-50">
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
                    <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Book Your Shed Removal Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Ready to reclaim your garden or outdoor space? Get in touch for a free, no-obligation quote or book directly online.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Get Free Quote Online
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447843930927" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7843 930 927
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="mailto:hello@lanorahouse.co.uk" className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" />
                  Email Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ShedClearancePage;