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
  Heart,
  FileText,
  Home,
  Shield,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Leaf,
  Camera,
  Lock,
  Users,
  Truck,
  ClipboardList,
  Scale,
  Gem
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const ProbateClearancePage = () => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    relationshipToDeceased: "",
    timeframe: "",
    legalRepresentation: "",
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
        title: "Consultation Request Submitted",
        description: "We'll contact you within 24 hours to discuss your needs sensitively.",
      });
      setIsQuoteDialogOpen(false);
      setQuoteForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        propertyType: "",
        relationshipToDeceased: "",
        timeframe: "",
        legalRepresentation: "",
        specialRequirements: "",
        additionalInfo: "",
        images: []
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit consultation request. Please try again.",
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
    formData.append('serviceType', 'probate-clearance');
    
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

  const documentServices = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Wills & Title Deeds",
      description: "Safe location and handling of legal documents"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Share Certificates & Legal Papers",
      description: "Secure retrieval of financial and legal documentation"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Postal Correspondence & Bank Statements",
      description: "Organized collection of important correspondence"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Personal Effects & Sentimental Items",
      description: "Respectful handling of meaningful possessions"
    },
    {
      icon: <Gem className="w-6 h-6" />,
      title: "Valuables, Jewellery & Cash",
      description: "Secure identification and protection of valuable items"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Confidential Documents",
      description: "Secure shredding and disposal of sensitive materials"
    }
  ];

  const assetServices = [
    {
      icon: <Home className="w-8 h-8 text-blue-600" />,
      title: "Complete Property Clearance",
      description: "Full clearance of all contents with careful sorting and documentation"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Regular & Biohazard Cleaning",
      description: "Professional cleaning services including specialized biohazard cleaning when required"
    },
    {
      icon: <Leaf className="w-8 h-8 text-green-700" />,
      title: "Garden & External Clearance",
      description: "Complete outdoor space clearance including gardens, sheds, and outbuildings"
    },
    {
      icon: <Camera className="w-8 h-8 text-purple-600" />,
      title: "Full Documentation",
      description: "Comprehensive photo reports and itemized documentation for legal requirements"
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-600" />,
      title: "Secure Delivery & Storage",
      description: "Chattels delivered to family, securely stored, or sold at auction as required"
    }
  ];

  const whyChooseUs = [
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "Compassionate Service",
      description: "Respectful service during a difficult time"
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600" />,
      title: "Discreet & Fully Insured",
      description: "Professional, confidential handling with full insurance coverage"
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: "Trusted by Professionals",
      description: "Trusted by families and legal professionals across the region"
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-purple-600" />,
      title: "Transparent Reporting",
      description: "Detailed documentation and secure handling of all items"
    },
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: "Regional Coverage",
      description: "Serving all of Cornwall, Devon & the wider South West"
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Probate Estate Clearance Services Cornwall & Devon - Compassionate & Professional | Lanora House</title>
        <meta name="description" content="Compassionate probate estate clearance services across Cornwall, Devon & South West. Professional support for families, executors & legal professionals during difficult times." />
        <meta name="keywords" content="probate clearance Cornwall, estate clearance Devon, probate solicitors clearance, Court of Protection clearance, bereavement clearance South West, executor services" />
        <meta property="og:title" content="Probate Estate Clearance Services Cornwall & Devon | Lanora House" />
        <meta property="og:description" content="Compassionate, discreet probate clearance services. Professional support for families and legal professionals across Cornwall, Devon & South West." />
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
              <Heart className="w-4 h-4 mr-1" />
              Compassionate & Professional
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Probate Estate
              <br />
              <span className="text-3xl md:text-5xl">Clearance Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Dealing with the loss of a loved one is never easy — and managing a property during probate can be overwhelming.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              At Lanora House, we offer sensitive and professional probate clearance services throughout Cornwall, Devon, and the South West, working closely with families, executors, and legal professionals.
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
                        Book Consultation
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-primary">Book Your Probate Clearance Consultation</DialogTitle>
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
                          placeholder="+44 7456 809049"
                        />
                      </div>
                      <div>
                        <Label htmlFor="relationshipToDeceased">Your Relationship</Label>
                        <Select value={quoteForm.relationshipToDeceased} onValueChange={(value) => handleInputChange("relationshipToDeceased", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Relationship to deceased" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="executor">Executor</SelectItem>
                            <SelectItem value="family-member">Family Member</SelectItem>
                            <SelectItem value="solicitor">Solicitor</SelectItem>
                            <SelectItem value="court-of-protection">Court of Protection</SelectItem>
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
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select value={quoteForm.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="flat">Flat/Apartment</SelectItem>
                            <SelectItem value="bungalow">Bungalow</SelectItem>
                            <SelectItem value="cottage">Cottage</SelectItem>
                            <SelectItem value="care-home">Care Home</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="legalRepresentation">Legal Representation</Label>
                        <Select value={quoteForm.legalRepresentation} onValueChange={(value) => handleInputChange("legalRepresentation", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Do you have legal representation?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes-solicitor">Yes - Solicitor</SelectItem>
                            <SelectItem value="yes-court-appointed">Yes - Court Appointed</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timeframe">Preferred Timeframe</Label>
                      <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need this completed?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (Within 2 weeks)</SelectItem>
                          <SelectItem value="flexible">Flexible (1-2 months)</SelectItem>
                          <SelectItem value="planned">Planned (2-6 months)</SelectItem>
                          <SelectItem value="no-rush">No specific timeframe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="specialRequirements">Special Requirements</Label>
                      <Textarea
                        id="specialRequirements"
                        value={quoteForm.specialRequirements}
                        onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                        placeholder="Any specific needs regarding document retrieval, valuable items, or sensitive handling requirements"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Please share any other details that would help us provide the most appropriate service"
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
                        Upload photos if available (max 5 images, 5MB each)
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
                        {submitQuoteMutation.isPending ? "Submitting..." : "Request Consultation"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-secondary/20 text-lg px-8 py-4 h-auto">
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Document & Valuables Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-300">
              <FileText className="w-4 h-4 mr-1" />
              Document & Valuables Retrieval
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Secure Document & Valuables Handling
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team can assist in locating and safely handling key documents and valuable items during the clearance. We treat every item with the utmost care and confidentiality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {service.description}
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

      {/* Asset Management Services Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-300">
              <Home className="w-4 h-4 mr-1" />
              Full Probate Asset Management
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              End-to-End Property Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a complete solution for managing the contents and condition of the property. Our uniformed team and branded trucks ensure professional service throughout.
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {assetServices.map((service, index) => (
              <StaggeredItem key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>
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

      {/* Why Choose Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Choose Lanora House for Probate Clearance?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg">
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
              <a href="tel:+447456809049" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Service Highlights Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Our Comprehensive Service Includes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-lg text-gray-900">Waste Management</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  All waste is sorted, recycled, and reported with full documentation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-900">Utility Documentation</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  Gas & electric meter readings documented for legal requirements
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-lg text-gray-900">Full Documentation</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  Complete photo reports and itemized documentation provided
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-700" />
                  <h3 className="font-bold text-lg text-gray-900">Professional Team</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  Our own uniformed team and branded trucks - never third parties
                </p>
              </CardContent>
            </Card>
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


      {/* Contact CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Book a Probate Clearance Consultation
            </h2>
            <p className="text-xl mb-8 opacity-90">
              We're here to help you through a difficult time with sensitivity and professionalism. Contact us for a free, no-obligation consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto">
                    Book Consultation
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                <a href="mailto:info@lanorahouse.com" className="flex items-center">
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

export default ProbateClearancePage;