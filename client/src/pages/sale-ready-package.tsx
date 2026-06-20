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
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { 
  Home,
  Sparkles,
  Wrench,
  TreePine,
  Leaf,
  FileText,
  Truck,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Users,
  Star,
  Building
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const SaleReadyPackagePage = () => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    timeframe: "",
    additionalInfo: "",
    images: [] as File[],
    services: {
      clearance: false,
      cleaning: false,
      handyman: false,
      refurbishment: false,
      treeSurgery: false,
      gardening: false,
      documentation: false,
      logistics: false
    }
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
        description: "We'll contact you within 24 hours with your comprehensive package quote.",
      });
      setIsQuoteDialogOpen(false);
      setQuoteForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        propertyType: "",
        timeframe: "",
        additionalInfo: "",
        images: [],
        services: {
          clearance: false,
          cleaning: false,
          handyman: false,
          refurbishment: false,
          treeSurgery: false,
          gardening: false,
          documentation: false,
          logistics: false
        }
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
      if (key !== 'images' && key !== 'services') {
        formData.append(key, value as string);
      }
    });
    
    // Add selected services
    const selectedServices = Object.entries(quoteForm.services)
      .filter(([_, selected]) => selected)
      .map(([service, _]) => service);
    formData.append('selectedServices', JSON.stringify(selectedServices));
    
    // Add service type
    formData.append('serviceType', 'sale-ready-package');
    formData.append('location', 'Cornwall & Devon');
    
    // Add image files
    quoteForm.images.forEach((file) => {
      formData.append(`images`, file);
    });
    
    submitQuoteMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setQuoteForm(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setQuoteForm(prev => ({ 
      ...prev, 
      services: { ...prev.services, [service]: checked }
    }));
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

  return (
    <TransitionWrapper>
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>End-of-Tenancy & Sale-Ready Package | Lanora House + A. Nevitt Construction</title>
          <meta name="description" content="One team to clear, clean, repair and refresh probate or end-of-tenancy properties across Cornwall, Devon & the South West. Tree surgery, gardening, handyman, refurbishment, project-managed by RICS-qualified professionals." />
          <meta property="og:title" content="End-of-Tenancy & Sale-Ready Package | Lanora House + A. Nevitt Construction" />
          <meta property="og:description" content="One team to clear, clean, repair and refresh probate or end-of-tenancy properties across Cornwall, Devon & the South West." />
          <meta property="og:type" content="website" />
        </Helmet>

        {/* Hero Section */}
        <section className="relative bg-blue-50 py-24 overflow-hidden">
          <div className="absolute inset-0 "></div>
          <div className="container mx-auto px-6 relative">
            <StaggeredContainer className="text-center">
              <StaggeredItem>
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg font-medium bg-primary/10 text-primary border-primary/20 rounded-full">
                  Complete Property Solution
                </Badge>
              </StaggeredItem>
              <StaggeredItem>
                <h1 className="text-5xl md:text-6xl font-bold text-neutral-800 mb-6 leading-tight">
                  Sale-Ready & End-of-Tenancy <span className="text-primary">Package</span>
                </h1>
              </StaggeredItem>
              <StaggeredItem>
                <p className="text-xl text-neutral-600 max-w-4xl mx-auto mb-8 leading-relaxed">
                  Deal direct with one trusted team to clear, clean, fix and refresh your property—ready to let or list. 
                  Serving probate solicitors, landlords, agents, and homeowners across Cornwall, Devon & the South West.
                </p>
              </StaggeredItem>
              <StaggeredItem>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto">
                  <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto w-full sm:w-auto"
                        disabled={submitQuoteMutation.isPending}
                        data-testid="button-quote-hero"
                      >
                        {submitQuoteMutation.isPending ? (
                          <div className="flex items-center gap-3">
                            <SustainableLoader variant="grow" size="sm" />
                            Submitting...
                          </div>
                        ) : (
                          <>
                            Get Package Quote
                            <ArrowRight className="w-5 h-5 ml-3" />
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-primary">Get Your Sale-Ready Package Quote</DialogTitle>
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
                              data-testid="input-name"
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
                              data-testid="input-email"
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
                              placeholder="07123 456789"
                              data-testid="input-phone"
                            />
                          </div>
                          <div>
                            <Label htmlFor="propertyType">Property Type *</Label>
                            <Select value={quoteForm.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                              <SelectTrigger data-testid="select-property-type">
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="flat">Flat/Apartment</SelectItem>
                                <SelectItem value="terraced">Terraced House</SelectItem>
                                <SelectItem value="semi-detached">Semi-Detached House</SelectItem>
                                <SelectItem value="detached">Detached House</SelectItem>
                                <SelectItem value="bungalow">Bungalow</SelectItem>
                                <SelectItem value="commercial">Commercial Property</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Property Address *</Label>
                          <Textarea
                            id="address"
                            required
                            value={quoteForm.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            placeholder="Enter the full property address including postcode"
                            rows={3}
                            data-testid="textarea-address"
                          />
                        </div>

                        <div>
                          <Label htmlFor="timeframe">Required Timeframe *</Label>
                          <Select value={quoteForm.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                            <SelectTrigger data-testid="select-timeframe">
                              <SelectValue placeholder="When do you need this completed?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asap">ASAP (Within 1 week)</SelectItem>
                              <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                              <SelectItem value="1-month">Within 1 month</SelectItem>
                              <SelectItem value="2-months">Within 2 months</SelectItem>
                              <SelectItem value="flexible">Flexible timing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Services Selection */}
                        <div className="space-y-4">
                          <Label className="text-lg font-semibold">What services do you require? *</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="clearance"
                                checked={quoteForm.services.clearance}
                                onCheckedChange={(checked) => handleServiceChange("clearance", checked as boolean)}
                                data-testid="checkbox-clearance"
                              />
                              <label htmlFor="clearance" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <Home className="mr-2 h-4 w-4 text-primary" />
                                  Clearance (House, loft, garage, garden)
                                </div>
                              </label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="cleaning"
                                checked={quoteForm.services.cleaning}
                                onCheckedChange={(checked) => handleServiceChange("cleaning", checked as boolean)}
                                data-testid="checkbox-cleaning"
                              />
                              <label htmlFor="cleaning" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                  Deep Cleaning (End-of-tenancy standard)
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="handyman"
                                checked={quoteForm.services.handyman}
                                onCheckedChange={(checked) => handleServiceChange("handyman", checked as boolean)}
                                data-testid="checkbox-handyman"
                              />
                              <label htmlFor="handyman" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <Wrench className="mr-2 h-4 w-4 text-primary" />
                                  Handyman & Repairs (Snagging, painting, fixes)
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="refurbishment"
                                checked={quoteForm.services.refurbishment}
                                onCheckedChange={(checked) => handleServiceChange("refurbishment", checked as boolean)}
                                data-testid="checkbox-refurbishment"
                              />
                              <label htmlFor="refurbishment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <Building className="mr-2 h-4 w-4 text-primary" />
                                  Refurbishment (Kitchens, bathrooms, decorating)
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="treeSurgery"
                                checked={quoteForm.services.treeSurgery}
                                onCheckedChange={(checked) => handleServiceChange("treeSurgery", checked as boolean)}
                                data-testid="checkbox-tree-surgery"
                              />
                              <label htmlFor="treeSurgery" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <TreePine className="mr-2 h-4 w-4 text-primary" />
                                  Tree Surgery (Pruning, removals, TPO advice)
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="gardening"
                                checked={quoteForm.services.gardening}
                                onCheckedChange={(checked) => handleServiceChange("gardening", checked as boolean)}
                                data-testid="checkbox-gardening"
                              />
                              <label htmlFor="gardening" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <Leaf className="mr-2 h-4 w-4 text-primary" />
                                  Gardening & External Works (Pressure washing, fencing)
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="documentation"
                                checked={quoteForm.services.documentation}
                                onCheckedChange={(checked) => handleServiceChange("documentation", checked as boolean)}
                                data-testid="checkbox-documentation"
                              />
                              <label htmlFor="documentation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <FileText className="mr-2 h-4 w-4 text-primary" />
                                  Documentation (Photo reports, certificates)
                                </div>
                              </label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="logistics"
                                checked={quoteForm.services.logistics}
                                onCheckedChange={(checked) => handleServiceChange("logistics", checked as boolean)}
                                data-testid="checkbox-logistics"
                              />
                              <label htmlFor="logistics" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <div className="flex items-center">
                                  <Truck className="mr-2 h-4 w-4 text-primary" />
                                  Logistics (Key holding, deliveries, storage)
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="additionalInfo">Additional Information</Label>
                          <Textarea
                            id="additionalInfo"
                            value={quoteForm.additionalInfo}
                            onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                            placeholder="Tell us about any specific requirements, special access needs, or other details that would help us provide an accurate quote..."
                            rows={4}
                            data-testid="textarea-additional-info"
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
                            className="mt-2"
                            data-testid="input-images"
                          />
                          {quoteForm.images.length > 0 && (
                            <div className="mt-2 space-y-2">
                              <p className="text-sm text-neutral-600">Selected images:</p>
                              {quoteForm.images.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <span className="text-sm truncate">{file.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                    data-testid={`button-remove-image-${index}`}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button 
                            type="submit" 
                            className="flex-1 bg-primary hover:bg-primary-dark"
                            disabled={submitQuoteMutation.isPending}
                            data-testid="button-submit-quote"
                          >
                            {submitQuoteMutation.isPending ? (
                              <div className="flex items-center gap-3">
                                <SustainableLoader variant="grow" size="sm" />
                                Submitting Quote Request...
                              </div>
                            ) : (
                              "Get My Package Quote"
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsQuoteDialogOpen(false)} data-testid="button-cancel">
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-secondary/20 text-lg px-8 py-4 h-auto w-full sm:w-auto" data-testid="button-call">
                    <a href="tel:+447456809049" className="flex items-center">
                      <Phone className="w-5 h-5 mr-3" />
                      Call: +44 7456 809049
                    </a>
                  </Button>
                </div>
              </StaggeredItem>
            </StaggeredContainer>
          </div>
        </section>

        {/* Who This Is For Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <StaggeredContainer className="text-center mb-16">
              <StaggeredItem>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Who This Package Is For</h2>
              </StaggeredItem>
            </StaggeredContainer>
            <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StaggeredItem>
                <Card className="p-6 h-full text-center border-2 hover:border-primary/30 transition-colors duration-300">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Probate Solicitors & Executors</h3>
                  <p className="text-neutral-600">
                    A discreet, compliant, end-to-end solution for probate properties requiring full clearance and preparation for sale.
                  </p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full text-center border-2 hover:border-primary/30 transition-colors duration-300">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Landlords & Agents</h3>
                  <p className="text-neutral-600">
                    End of tenancy solutions with rapid turnaround to get properties back on the market quickly and professionally.
                  </p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full text-center border-2 hover:border-primary/30 transition-colors duration-300">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Home className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Homeowners Preparing to Sell</h3>
                  <p className="text-neutral-600">
                    Comprehensive property preparation to maximise market value and ensure your home makes the best first impression.
                  </p>
                </Card>
              </StaggeredItem>
            </StaggeredContainer>
          </div>
        </section>

        {/* What's Included Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-6">
            <StaggeredContainer className="text-center mb-16">
              <StaggeredItem>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">What's Included in Your Package</h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  One comprehensive package, tailored to your specific scope and requirements. Single point of contact. One plan. One invoice.
                </p>
              </StaggeredItem>
            </StaggeredContainer>
            <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <Home className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Clearance</h3>
                  </div>
                  <p className="text-neutral-600">Full house, loft, garage & garden clearance, itemised and documented</p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <Sparkles className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Deep Cleaning</h3>
                  </div>
                  <p className="text-neutral-600">End-of-tenancy standard; ovens, appliances, carpets; biohazard where required</p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <Wrench className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Handyman & Repairs</h3>
                  </div>
                  <p className="text-neutral-600">Snagging, fixtures/fittings, painting touch-ups, safety fixes</p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <Building className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Refurbishment</h3>
                  </div>
                  <p className="text-neutral-600">Kitchens/bathrooms, flooring, plastering, decorating, roofing & more</p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <TreePine className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Tree Surgery</h3>
                  </div>
                  <p className="text-neutral-600">Pruning, removals, crown lifts, TPO-aware advice by in-house team</p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <Leaf className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Gardening & External</h3>
                  </div>
                  <p className="text-neutral-600">Tidy-ups, pressure washing, fencing, sheds, waste removal</p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <FileText className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Documentation</h3>
                  </div>
                  <p className="text-neutral-600">Photo reports, waste transfer notes, certificates, meter readings</p>
                </Card>
              </StaggeredItem>
              <StaggeredItem>
                <Card className="p-6 h-full">
                  <div className="mb-4">
                    <Truck className="w-8 h-8 text-primary mb-2" />
                    <h3 className="text-lg font-semibold">Logistics</h3>
                  </div>
                  <p className="text-neutral-600">Key holding with chain-of-custody; deliveries; auction/storage of chattels if needed</p>
                </Card>
              </StaggeredItem>
            </StaggeredContainer>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <StaggeredContainer className="text-center mb-16">
              <StaggeredItem>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Why Choose Lanora House</h2>
              </StaggeredItem>
            </StaggeredContainer>
            <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <StaggeredItem>
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">End-to-End Under One Roof</h3>
                  <p className="text-neutral-600">No chasing multiple trades—we handle everything from clearance to completion</p>
                </div>
              </StaggeredItem>
              <StaggeredItem>
                <div className="text-center">
                  <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">RICS-Trained Project Managers</h3>
                  <p className="text-neutral-600">Timelines, budgets and risk managed properly by qualified professionals</p>
                </div>
              </StaggeredItem>
              <StaggeredItem>
                <div className="text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">A. Nevitt Construction Partnership</h3>
                  <p className="text-neutral-600">33+ years' experience in build & refurbishment—our trusted partners at <a href="https://www.haylebuilders.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark underline">www.haylebuilders.com</a></p>
                </div>
              </StaggeredItem>
              <StaggeredItem>
                <div className="text-center">
                  <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">In-House Specialists</h3>
                  <p className="text-neutral-600">Tree surgeons & uniformed teams—faster scheduling, consistent quality</p>
                </div>
              </StaggeredItem>
              <StaggeredItem>
                <div className="text-center">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Compliance & Care</h3>
                  <p className="text-neutral-600">Licensed waste carrier, fully insured, DBS-checked staff</p>
                </div>
              </StaggeredItem>
              <StaggeredItem>
                <div className="text-center">
                  <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Sustainability-Minded</h3>
                  <p className="text-neutral-600">Reuse/donate where possible; recycle with full audit trail</p>
                </div>
              </StaggeredItem>
            </StaggeredContainer>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-6">
            <StaggeredContainer className="text-center mb-16">
              <StaggeredItem>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">How It Works</h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  Simple 3-step process from initial consultation to project completion
                </p>
              </StaggeredItem>
            </StaggeredContainer>
            <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StaggeredItem>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
                  <h3 className="text-xl font-semibold mb-4">Survey & Scope</h3>
                  <p className="text-neutral-600">Free consultation, photos, and a clear, fixed quote tailored to your requirements</p>
                </div>
              </StaggeredItem>
              <StaggeredItem>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
                  <h3 className="text-xl font-semibold mb-4">Project Delivery</h3>
                  <p className="text-neutral-600">Clearance → cleaning → repairs/refurb → grounds work, all project-managed</p>
                </div>
              </StaggeredItem>
              <StaggeredItem>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
                  <h3 className="text-xl font-semibold mb-4">Handover</h3>
                  <p className="text-neutral-600">Keys back, photo pack, certificates and invoices ready for your file</p>
                </div>
              </StaggeredItem>
            </StaggeredContainer>
          </div>
        </section>

        {/* Trust & Compliance Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-6">
            <StaggeredContainer className="text-center">
              <StaggeredItem>
                <h3 className="text-2xl font-bold mb-8">Trust & Compliance</h3>
              </StaggeredItem>
              <StaggeredItem>
                <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Licensed Waste Carrier
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Fully Insured
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    DBS-Checked Teams
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    RICS PM Expertise
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    In-House Tree Surgeons
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    33+ Years Build Experience
                  </div>
                </div>
              </StaggeredItem>
            </StaggeredContainer>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 "></div>
          <div className="container mx-auto px-6 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Property?
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                One team to clear, clean, repair and refresh your property across Cornwall, Devon & the South West. 
                Project-managed by RICS-qualified professionals with <a href="https://www.haylebuilders.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 underline">A. Nevitt Construction</a> partnership.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto">
                <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto w-full sm:w-auto"
                      data-testid="button-quote-cta"
                    >
                      Get Package Quote
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <a href="tel:+447456809049" className="inline-block w-full sm:w-auto" data-testid="button-call-cta">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white text-lg px-8 py-4 h-auto w-full">
                    <Phone className="w-5 h-5 mr-3" />
                    Call: +44 7456 809049
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </TransitionWrapper>
  );
};

export default SaleReadyPackagePage;