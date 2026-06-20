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
  Building,
  Bed,
  Monitor,
  Lightbulb,
  Home,
  Shield,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Leaf,
  Users,
  Truck,
  Recycle,
  Settings,
  Coffee,
  Utensils
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const HotelClearancePage = () => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    hotelName: "",
    address: "",
    hotelSize: "",
    clearanceReason: "",
    clearanceScope: "",
    timeframe: "",
    workingHours: "",
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
        title: "Quote Request Submitted",
        description: "We'll contact you within 24 hours with your free quote.",
      });
      setIsQuoteDialogOpen(false);
      setQuoteForm({
        name: "",
        email: "",
        phone: "",
        hotelName: "",
        address: "",
        hotelSize: "",
        clearanceReason: "",
        clearanceScope: "",
        timeframe: "",
        workingHours: "",
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
    formData.append('serviceType', 'hotel-clearance');
    
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

  const clearanceItems = [
    {
      icon: <Bed className="w-8 h-8 text-blue-600" />,
      title: "Furniture",
      description: "Beds, wardrobes, chairs, sofas, desks, tables & more",
      highlight: "Complete furniture removal"
    },
    {
      icon: <Monitor className="w-8 h-8 text-purple-600" />,
      title: "Equipment",
      description: "Kitchen appliances, office tech, gym gear, and AV equipment",
      highlight: "All technical equipment"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-600" />,
      title: "Fixtures & Fittings",
      description: "Curtains, carpets, lighting, and built-in units",
      highlight: "Interior fittings & fixtures"
    },
    {
      icon: <Home className="w-8 h-8 text-green-600" />,
      title: "Complete Room Clearance",
      description: "Guest rooms, meeting spaces, restaurants, gyms, and common areas",
      highlight: "Full space transformation"
    }
  ];

  const whyChooseUs = [
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: "Tailored to Your Hotel",
      description: "Every hotel is different — we customise your clearance to your exact needs"
    },
    {
      icon: <Leaf className="w-6 h-6 text-green-600" />,
      title: "Eco-Conscious",
      description: "Low-to-landfill approach — repurposing, recycling, or donating items whenever possible"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "Minimal Disruption",
      description: "Schedule work during off-hours or quiet periods"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Experienced Team",
      description: "Staff trained to work professionally in hospitality environments"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-700" />,
      title: "Licensed & Insured",
      description: "Full compliance to health, safety, and environmental standards"
    }
  ];

  const process = [
    {
      step: 1,
      title: "Consultation",
      description: "We begin with a walkthrough or virtual consultation to assess your hotel and clearance goals"
    },
    {
      step: 2,
      title: "Planning",
      description: "You choose a schedule that works — including off-peak or overnight options to reduce disruption"
    },
    {
      step: 3,
      title: "Execution",
      description: "Our own team (no third-party subcontractors) arrives in branded vehicles to carry out the clearance"
    },
    {
      step: 4,
      title: "Recycling & Disposal",
      description: "All materials are sorted — reusable items are donated or resold, and the rest responsibly recycled"
    },
    {
      step: 5,
      title: "Final Clean-Up",
      description: "We leave the space clear, clean, and ready for renovation, new furniture, or repurposing"
    }
  ];

  const sustainableApproach = [
    {
      icon: <Coffee className="w-6 h-6 text-brown-600" />,
      title: "Donated to Charities",
      description: "Good-quality items given to charities or community groups"
    },
    {
      icon: <Utensils className="w-6 h-6 text-green-600" />,
      title: "Sold to Offset Costs",
      description: "Valuable items sold to reduce your clearance costs"
    },
    {
      icon: <Recycle className="w-6 h-6 text-blue-600" />,
      title: "Responsibly Recycled",
      description: "Detailed waste reporting available upon request"
    }
  ];

  const faqs = [
    {
      question: "What happens to the items you remove?",
      answer: "Items in good condition are reused, donated, or sold. The rest are recycled — we always aim to avoid landfill."
    },
    {
      question: "Can you work during off-hours?",
      answer: "Yes — we can carry out clearance early morning, late night, or overnight to minimise disruption to guests and staff."
    },
    {
      question: "Do you handle hazardous materials?",
      answer: "Yes — our team is trained and licensed to handle and dispose of hazardous waste safely and legally."
    },
    {
      question: "How long does a hotel clearance take?",
      answer: "It depends on the size and scope of the project. We'll give you a clear timeline during your consultation."
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Helmet>
        <title>Professional Hotel Clearance Services Cornwall & Devon - Efficient & Sustainable | Lanora House</title>
        <meta name="description" content="Efficient, sustainable hotel clearance services across Cornwall, Devon & South West. Professional clearance for hotel renovations, refurbishments & closures." />
        <meta name="keywords" content="hotel clearance Cornwall, hotel clearance Devon, hospitality clearance South West, hotel renovation clearance, hotel refurbishment clearance, commercial clearance" />
        <meta property="og:title" content="Professional Hotel Clearance Services Cornwall & Devon | Lanora House" />
        <meta property="og:description" content="Efficient, sustainable hotel clearance services. Minimal disruption clearances for hotels across Cornwall, Devon & South West." />
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
              <Building className="w-4 h-4 mr-1" />
              Hospitality Specialists
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              Efficient, Sustainable
              <br />
              <span className="text-3xl md:text-5xl">Hotel Clearances</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Transform your hotel space with Lanora House's professional hotel clearance services — trusted by hotels across Cornwall, Devon, and the wider South West.
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you're renovating, refurbishing, downsizing, or closing down, our team is here to handle every detail of your clearance with efficiency and care. <a href="tel:+447456809049" className="text-primary hover:underline">Speak to our hospitality specialists</a> for tailored solutions.
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Hotel Clearance Quote</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleQuoteSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Contact Name *</Label>
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
                        <Label htmlFor="hotelName">Hotel Name *</Label>
                        <Input
                          id="hotelName"
                          required
                          value={quoteForm.hotelName}
                          onChange={(e) => handleInputChange("hotelName", e.target.value)}
                          placeholder="Enter hotel name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Hotel Address *</Label>
                      <Input
                        id="address"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full hotel address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hotelSize">Hotel Size</Label>
                        <Select value={quoteForm.hotelSize} onValueChange={(value) => handleInputChange("hotelSize", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Number of rooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (1-20 rooms)</SelectItem>
                            <SelectItem value="medium">Medium (21-50 rooms)</SelectItem>
                            <SelectItem value="large">Large (51-100 rooms)</SelectItem>
                            <SelectItem value="very-large">Very Large (100+ rooms)</SelectItem>
                            <SelectItem value="boutique">Boutique Hotel</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="clearanceReason">Clearance Reason</Label>
                        <Select value={quoteForm.clearanceReason} onValueChange={(value) => handleInputChange("clearanceReason", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Why do you need clearance?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="renovation">Renovation</SelectItem>
                            <SelectItem value="refurbishment">Refurbishment</SelectItem>
                            <SelectItem value="closure">Hotel Closure</SelectItem>
                            <SelectItem value="downsizing">Downsizing</SelectItem>
                            <SelectItem value="change-of-ownership">Change of Ownership</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clearanceScope">Clearance Scope</Label>
                        <Select value={quoteForm.clearanceScope} onValueChange={(value) => handleInputChange("clearanceScope", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="What needs clearing?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="few-rooms">Few Rooms</SelectItem>
                            <SelectItem value="single-floor">Single Floor</SelectItem>
                            <SelectItem value="multiple-floors">Multiple Floors</SelectItem>
                            <SelectItem value="entire-hotel">Entire Hotel</SelectItem>
                            <SelectItem value="public-areas">Public Areas Only</SelectItem>
                            <SelectItem value="kitchen-restaurant">Kitchen/Restaurant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="workingHours">Preferred Working Hours</Label>
                        <Select value={quoteForm.workingHours} onValueChange={(value) => handleInputChange("workingHours", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="When can we work?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard Hours (9am-5pm)</SelectItem>
                            <SelectItem value="early-morning">Early Morning</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="overnight">Overnight</SelectItem>
                            <SelectItem value="off-season">Off-Season Only</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timeframe">Project Timeframe</Label>
                      <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need this completed?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent (Within 2 weeks)</SelectItem>
                          <SelectItem value="flexible">Flexible (1-2 months)</SelectItem>
                          <SelectItem value="planned">Planned (2-6 months)</SelectItem>
                          <SelectItem value="seasonal">Seasonal (Off-season)</SelectItem>
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
                        placeholder="Any specific needs regarding disruption minimization, hazardous materials, or guest considerations"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Please share any other details about your hotel clearance requirements"
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
                        Upload photos of areas to be cleared (max 5 images, 5MB each)
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
                <a href="tel:+447456809049" className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  Call: +44 7456 809049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Clear Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-300">
              <Building className="w-4 h-4 mr-1" />
              What We Clear
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Complete Hotel Clearance Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialise in the removal and responsible disposal of a wide range of hotel contents. Everything is sorted, cleared, and either reused, recycled, or disposed of responsibly.
            </p>
          </div>
          
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {clearanceItems.map((item, index) => (
              <StaggeredItem key={index}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                        <Badge className="bg-primary/10 text-primary">
                          {item.highlight}
                        </Badge>
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
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Why Choose Lanora House for Hotel Clearance?
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
              <a href="tel:+447456809049" className="flex items-center">
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
            <Badge className="mb-4 bg-indigo-100 text-indigo-800 border-indigo-300">
              <Settings className="w-4 h-4 mr-1" />
              Our Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Our Hotel Clearance Process
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
              <a href="tel:+447456809049" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Sustainable Approach Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
              <Recycle className="w-4 h-4 mr-1" />
              Sustainable Approach
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Sustainable Hotel Clearance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              At Lanora House, we're committed to responsible clearance. Good-quality items are:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sustainableApproach.map((approach, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 bg-white rounded-lg shadow-md"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gray-50 rounded-full">
                    {approach.icon}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  {approach.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {approach.description}
                </p>
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
                    <Building className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
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
              Get Your Free Hotel Clearance Quote Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Whether you're clearing a few rooms or an entire hotel, Lanora House is ready to help. Let us take the stress off your hands — quickly, carefully, and sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-auto" disabled={submitQuoteMutation.isPending}>
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
                    <DialogTitle className="text-2xl text-primary">Get Your Free Hotel Clearance Quote</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleQuoteSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name-bottom">Full Name *</Label>
                        <Input
                          id="name-bottom"
                          required
                          value={quoteForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email-bottom">Email Address *</Label>
                        <Input
                          id="email-bottom"
                          type="email"
                          required
                          value={quoteForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone-bottom">Phone Number *</Label>
                        <Input
                          id="phone-bottom"
                          type="tel"
                          required
                          value={quoteForm.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+44 7456 809049"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hotelName-bottom">Hotel Name *</Label>
                        <Input
                          id="hotelName-bottom"
                          required
                          value={quoteForm.hotelName}
                          onChange={(e) => handleInputChange("hotelName", e.target.value)}
                          placeholder="Enter the hotel name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address-bottom">Property Address *</Label>
                      <Textarea
                        id="address-bottom"
                        required
                        value={quoteForm.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter the full address where clearance is needed"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clearanceScope-bottom">Clearance Scope</Label>
                        <Select value={quoteForm.clearanceScope} onValueChange={(value) => handleInputChange("clearanceScope", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select clearance scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-hotel">Full Hotel Clearance</SelectItem>
                            <SelectItem value="multiple-rooms">Multiple Rooms</SelectItem>
                            <SelectItem value="single-room">Single Room</SelectItem>
                            <SelectItem value="common-areas">Common Areas Only</SelectItem>
                            <SelectItem value="restaurant-bar">Restaurant/Bar Area</SelectItem>
                            <SelectItem value="storage-areas">Storage Areas</SelectItem>
                            <SelectItem value="office-admin">Office/Admin Areas</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timeframe-bottom">Timeframe</Label>
                        <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgent">Urgent (Within 48 hours)</SelectItem>
                            <SelectItem value="within-week">Within a week</SelectItem>
                            <SelectItem value="within-month">Within a month</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="workingHours-bottom">Preferred Working Hours</Label>
                      <Textarea
                        id="workingHours-bottom"
                        value={quoteForm.workingHours}
                        onChange={(e) => handleInputChange("workingHours", e.target.value)}
                        placeholder="Any specific working hours or timing requirements"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="special-bottom">Special Requirements</Label>
                      <Textarea
                        id="special-bottom"
                        value={quoteForm.specialRequirements}
                        onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                        placeholder="Any hazardous materials, valuable items to separate, specific disposal requirements, etc."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="additional-bottom">Additional Information</Label>
                      <Textarea
                        id="additional-bottom"
                        value={quoteForm.additionalInfo}
                        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                        placeholder="Anything else you'd like us to know about the clearance"
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="images-bottom">Photos (Optional)</Label>
                      <Input
                        id="images-bottom"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Upload photos to help us provide a more accurate quote
                      </p>
                      {quoteForm.images.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Selected files:</p>
                          <ul className="text-sm text-gray-600">
                            {quoteForm.images.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button 
                        type="submit" 
                        disabled={submitQuoteMutation.isPending}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        {submitQuoteMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <SustainableLoader variant="grow" size="sm" />
                            Submitting...
                          </div>
                        ) : (
                          <>
                            Submit Quote Request
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
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
};

export default HotelClearancePage;