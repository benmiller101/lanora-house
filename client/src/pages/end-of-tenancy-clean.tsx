import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { 
  Sparkles, 
  Home, 
  Clock, 
  Shield, 
  CheckCircle,
  Phone,
  Mail,
  ArrowRight,
  Leaf,
  Users,
  Star,
  Truck,
  Droplets,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { SustainableLoader } from "@/components/ui/SustainableLoader";
import { TransitionWrapper, StaggeredContainer, StaggeredItem } from "@/components/ui/TransitionWrapper";

const EndOfTenancyCleanPage = () => {
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
    
    // Add text fields
    Object.entries(quoteForm).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value as string);
      }
    });
    
    // Add service type
    formData.append('serviceType', 'end-of-tenancy-clean');
    formData.append('location', 'Cornwall & Devon');
    
    // Add image files
    quoteForm.images.forEach((file) => {
      formData.append(`images`, file);
    });
    
    submitQuoteMutation.mutate(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + quoteForm.images.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }
    setQuoteForm(prev => ({ ...prev, images: [...prev.images, ...files] }));
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
          <title>Property Sale Cleaning Services | LANORA HOUSE</title>
          <meta name="description" content="Professional property cleaning services for estate agents, probate lawyers & house sales across Cornwall & Devon. Complete post-clearance cleaning for property viewings and sales." />
          <meta property="og:title" content="Property Sale Cleaning Services | LANORA HOUSE" />
          <meta property="og:description" content="Professional property cleaning services for estate agents, probate lawyers & house sales across Cornwall & Devon. Complete post-clearance cleaning." />
          <meta property="og:type" content="website" />
        </Helmet>

        {/* Hero Section */}
        <section className="relative bg-blue-50 py-24 overflow-hidden">
          <div className="absolute inset-0 "></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-200/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Complete Cleaning Service
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-neutral-800 mb-6 leading-tight">
                Property Sale <span className="text-primary">Cleaning</span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Professional deep cleaning services for property sales, estate agents, and probate lawyers. Complete post-clearance cleaning to prepare properties for viewings and sales across Cornwall and Devon.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                      data-testid="button-get-quote"
                    >
                      Get Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
                  <a href="tel:+447456809049" data-testid="button-call-now">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now: 07456 809049
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Service Overview */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <StaggeredContainer>
              <div className="max-w-4xl mx-auto text-center mb-16">
                <StaggeredItem>
                  <h2 className="text-4xl font-bold text-neutral-800 mb-6">Complete Post-Clearance Cleaning</h2>
                  <p className="text-xl text-neutral-600 leading-relaxed">
                    After we complete your house clearance, we offer comprehensive property cleaning to ensure your property is presentation-ready for estate agents, probate proceedings, and potential buyers.
                  </p>
                </StaggeredItem>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <StaggeredItem>
                  <div className="bg-blue-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4 text-center">Deep Clean Service</h3>
                    <p className="text-neutral-600 text-center leading-relaxed">
                      Professional deep cleaning of all rooms, including kitchens, bathrooms, and living areas to inspection standards.
                    </p>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="bg-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4 text-center">Sale Ready Standard</h3>
                    <p className="text-neutral-600 text-center leading-relaxed">
                      Our cleaning meets professional standards to help properties make the best impression for viewings and estate agent presentations.
                    </p>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="bg-amber-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4 text-center">Quick Turnaround</h3>
                    <p className="text-neutral-600 text-center leading-relaxed">
                      Available immediately after clearance completion. Fast turnaround to get properties market-ready quickly.
                    </p>
                  </div>
                </StaggeredItem>
              </div>
            </StaggeredContainer>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-4">
            <StaggeredContainer>
              <div className="max-w-4xl mx-auto text-center mb-16">
                <StaggeredItem>
                  <h2 className="text-4xl font-bold text-neutral-800 mb-6">What's Included in Our Service</h2>
                  <p className="text-xl text-neutral-600">
                    Comprehensive cleaning service covering every detail for successful property presentation and sales
                  </p>
                </StaggeredItem>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <StaggeredItem>
                  <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-semibold text-neutral-800 mb-6 flex items-center">
                      <Home className="h-6 w-6 text-primary mr-3" />
                      Kitchen & Bathroom Deep Clean
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Oven, hob, and extractor fan degreasing</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Inside fridges, freezers, and all appliances</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Bathroom descaling and mould removal</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Toilet, shower, and bath deep sanitisation</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Tile and grout intensive cleaning</span>
                      </li>
                    </ul>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-semibold text-neutral-800 mb-6 flex items-center">
                      <Droplets className="h-6 w-6 text-primary mr-3" />
                      Whole Property Cleaning
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">All rooms vacuumed and mopped</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Windows cleaned inside and out (ground floor)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Skirting boards, switches, and door frames</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Light fittings and ceiling fans</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">Cupboards and wardrobes inside and out</span>
                      </li>
                    </ul>
                  </div>
                </StaggeredItem>
              </div>
            </StaggeredContainer>
          </div>
        </section>

        {/* Why Choose Our Cleaning Service */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <StaggeredContainer>
              <div className="max-w-4xl mx-auto text-center mb-16">
                <StaggeredItem>
                  <h2 className="text-4xl font-bold text-neutral-800 mb-6">Why Estate Agents & Probate Lawyers Choose Us</h2>
                  <p className="text-xl text-neutral-600">
                    The perfect follow-up to our clearance service with professional cleaning standards for property sales
                  </p>
                </StaggeredItem>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <StaggeredItem>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                      <Truck className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">One Contractor</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      No need for multiple companies. We handle clearance and cleaning as one seamless service.
                    </p>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Professional Standard</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Cleaning that meets estate agent and buyer expectations for property viewings and sales.
                    </p>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                      <Zap className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Time Efficient</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Immediate availability after clearance completion. No waiting for separate appointments.
                    </p>
                  </div>
                </StaggeredItem>

                <StaggeredItem>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-4">Local Team</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      Cornwall-based team who understand local property market standards and estate agent requirements.
                    </p>
                  </div>
                </StaggeredItem>
              </div>
            </StaggeredContainer>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-4">
            <StaggeredContainer>
              <div className="max-w-4xl mx-auto">
                <StaggeredItem>
                  <h2 className="text-4xl font-bold text-neutral-800 mb-16 text-center">Frequently Asked Questions</h2>
                </StaggeredItem>
                
                <div className="space-y-8">
                  <StaggeredItem>
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Can you clean immediately after clearance?</h3>
                      <p className="text-neutral-600 leading-relaxed">
                        Yes! We can begin cleaning the same day as clearance completion. This saves time and ensures properties are quickly ready for estate agent viewings and buyer inspections.
                      </p>
                    </div>
                  </StaggeredItem>

                  <StaggeredItem>
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Do you work with estate agents and probate lawyers?</h3>
                      <p className="text-neutral-600 leading-relaxed">
                        Absolutely! We regularly work with estate agents, probate lawyers, and property professionals across Cornwall and Devon to ensure properties are presentation-ready for the market.
                      </p>
                    </div>
                  </StaggeredItem>

                  <StaggeredItem>
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">What areas do you cover?</h3>
                      <p className="text-neutral-600 leading-relaxed">
                        We provide end of tenancy cleaning across Cornwall and Devon, serving the same areas as our clearance services. Contact us to confirm coverage for your location.
                      </p>
                    </div>
                  </StaggeredItem>

                  <StaggeredItem>
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Do you bring your own cleaning supplies?</h3>
                      <p className="text-neutral-600 leading-relaxed">
                        Yes, we bring all professional-grade cleaning supplies and equipment. You don't need to provide anything for the cleaning service.
                      </p>
                    </div>
                  </StaggeredItem>
                </div>
              </div>
            </StaggeredContainer>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/90"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Get Your Property Ready for Sale
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                Professional property cleaning that ensures your property makes the best impression for viewings and sales. 
                Book as an add-on to our clearance service for the complete solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold"
                      data-testid="button-get-quote-cta"
                    >
                      Get Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button asChild variant="outline" size="lg" className="border-white text-white bg-transparent hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto">
                  <a href="tel:+447456809049" data-testid="button-call-now-cta">
                    <Phone className="mr-2 h-5 w-5" />
                    Call: 07456 809049
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quote Dialog */}
        <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-4">Get Your Free Cleaning Quote</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuoteSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Your phone number"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={quoteForm.email}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  data-testid="input-email"
                />
              </div>

              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  required
                  value={quoteForm.address}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address including postcode"
                  data-testid="input-address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select 
                    value={quoteForm.propertyType} 
                    onValueChange={(value) => setQuoteForm(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger data-testid="select-property-type">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat/Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="room">Single Room</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeframe">Required By</Label>
                  <Select 
                    value={quoteForm.timeframe} 
                    onValueChange={(value) => setQuoteForm(prev => ({ ...prev, timeframe: value }))}
                  >
                    <SelectTrigger data-testid="select-timeframe">
                      <SelectValue placeholder="When do you need this?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP</SelectItem>
                      <SelectItem value="within-week">Within a week</SelectItem>
                      <SelectItem value="within-month">Within a month</SelectItem>
                      <SelectItem value="flexible">I'm flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={quoteForm.additionalInfo}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Any specific cleaning requirements or details about the property..."
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
                  onChange={handleImageUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                  data-testid="input-images"
                />
                <p className="text-sm text-gray-600 mt-1">Upload up to 5 images (JPG, PNG, WebP)</p>
                {quoteForm.images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {quoteForm.images.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={submitQuoteMutation.isPending}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3"
                data-testid="button-submit-quote"
              >
                {submitQuoteMutation.isPending ? (
                  <SustainableLoader size="sm" />
                ) : (
                  "Submit Quote Request"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TransitionWrapper>
  );
};

export default EndOfTenancyCleanPage;