import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle,
  Box,
  Scale,
  Trash2,
  DollarSign,
  AlertTriangle,
  Info,
  Clock,
  Gift,
  Ticket,
  CreditCard,
  Sparkles,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SustainableLoader } from "@/components/ui/SustainableLoader";

export default function Pricing() {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Quote form submission
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
        title: "Quote Request Sent!",
        description: "We'll get back to you within 24 hours with your personalized quote.",
      });
      setIsQuoteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send quote request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleQuoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Map pricing form fields to clearance quote schema fields
    const additionalInfo = [
      `Service Type: ${formData.get('serviceType')}`,
      `Estimated Volume: ${formData.get('estimatedVolume')}`,
      `Urgency: ${formData.get('urgency')}`,
      `Description: ${formData.get('description')}`
    ].filter(item => !item.includes('null') && !item.includes('undefined')).join('\n\n');
    
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('location'),
      propertyType: null,
      clearanceType: formData.get('serviceType'),
      timeframe: formData.get('urgency'),
      additionalInfo: additionalInfo,
      requestType: 'clearance'
    };
    
    submitQuoteMutation.mutate(data);
  };

  const cubicYardSizes = [
    {
      volume: "1 Cubic Yard",
      price: "£90",
      description: "Roughly:",
      items: ["2 washing machines", "7-8 bin bags", "2 wheelie bins"],
      weightLimit: "100kg",
      color: "bg-blue-50 border-blue-200"
    },
    {
      volume: "2 Cubic Yards",
      price: "£130",
      description: "Roughly:",
      items: ["4 washing machines", "15 bin bags", "4 wheelie bins"],
      weightLimit: "200kg",
      color: "bg-green-50 border-green-200"
    },
    {
      volume: "5 Cubic Yards",
      price: "£175",
      description: "Roughly:",
      items: ["1 medium skip", "10 washing machines", "25 bin bags", "10 wheelie bins"],
      weightLimit: "300kg",
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      volume: "10 Cubic Yards",
      price: "£280",
      description: "Roughly:", 
      items: ["1 large skip", "20 washing machines", "50 bin bags", "20 wheelie bins"],
      weightLimit: "500kg",
      color: "bg-orange-50 border-orange-200"
    },
    {
      volume: "15 Cubic Yards",
      price: "£380",
      description: "Roughly:",
      items: ["2 builder's skips", "30 washing machines", "75 bin bags", "30 wheelie bins"],
      weightLimit: "750kg", 
      color: "bg-red-50 border-red-200"
    },
    {
      volume: "20 Cubic Yards",
      price: "£560",
      description: "Roughly:",
      items: ["2 large skips", "40 washing machines", "100 bin bags", "40 wheelie bins"],
      weightLimit: "1,000kg",
      color: "bg-purple-50 border-purple-200"
    }
  ];

  const addOnItems = [
    { item: "Mattress", price: "£30" },
    { item: "TV / Monitor", price: "£12" },
    { item: "Car Battery", price: "£10" },
    { item: "Paint Can", price: "£15 (each)" },
    { item: "Fluorescent Tube", price: "£2" },
    { item: "Gas Canister", price: "£10" },
    { item: "Fire Extinguisher", price: "£4" },
    { item: "Biohazard Bag", price: "£35" },
    { item: "Tyres", price: "£20 (each)" },
    { item: "Piano", price: "£160" },
    { item: "Commercial Fridge/Freezer", price: "£125" },
    { item: "Tall Fridge", price: "£40" },
    { item: "Under-Counter Fridge", price: "£30" }
  ];

  const popsItems = [
    { item: "Sofa", price: "£30" },
    { item: "Armchair", price: "£25" },
    { item: "Office Chair", price: "£20" },
    { item: "Mattress Base (Fabric)", price: "£60" },
    { item: "Pillows / Cushions", price: "£5 (each)" },
    { item: "Duvet", price: "£7" },
    { item: "Fabric Covers", price: "£5 (each)" }
  ];

  return (
    <>
      <SEOHead
        title="Pricing - Transparent House Clearance Costs"
        description="Simple, transparent, and fair pricing for house clearance services. We charge by volume with no hidden costs. Get your free quote today from Lanora House."
        path="/pricing"
      />

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
              <DollarSign className="w-4 h-4 mr-1" />
              Fair & Transparent
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-primary bg-clip-text text-transparent">
              How Our Pricing Works
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              At Lanora House, volume is just a quick guide to help you picture likely costs (labour + disposal included). We don't price by volume—your final quote is confirmed after a quick assessment. Ask early so we can plan cost-effectively. Simple, transparent, fair.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-lg mb-2 mx-auto w-fit">
                  <Trash2 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-gray-600">Loading & lifting</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-lg mb-2 mx-auto w-fit">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-gray-600">Responsible recycling</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-lg mb-2 mx-auto w-fit">
                  <Box className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-gray-600">Area sweep-up</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary/10 rounded-lg mb-2 mx-auto w-fit">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-gray-600">Labour & travel</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-8">
              There are no hidden charges — just clear pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-dark text-lg px-8 py-4 h-auto"
                  >
                    Get Free Quote
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Get Your Free Quote</DialogTitle>
                    <DialogDescription>
                      Tell us about your clearance needs and we'll provide a no-obligation estimate.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleQuoteSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" placeholder="e.g., Falmouth, Cornwall" required />
                    </div>
                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Select name="serviceType" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="house-clearance">Full House Clearance</SelectItem>
                          <SelectItem value="partial-clearance">Partial Clearance</SelectItem>
                          <SelectItem value="shed-garage">Shed/Garage Clearance</SelectItem>
                          <SelectItem value="commercial">Commercial Clearance</SelectItem>
                          <SelectItem value="probate">Probate Clearance</SelectItem>
                          <SelectItem value="hoarding">Hoarding Clearance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedVolume">Estimated Volume</Label>
                      <Select name="estimatedVolume">
                        <SelectTrigger>
                          <SelectValue placeholder="Approximate volume needed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2-cubic-yards">1-2 Cubic Yards</SelectItem>
                          <SelectItem value="3-5-cubic-yards">3-5 Cubic Yards</SelectItem>
                          <SelectItem value="6-10-cubic-yards">6-10 Cubic Yards</SelectItem>
                          <SelectItem value="11-15-cubic-yards">11-15 Cubic Yards</SelectItem>
                          <SelectItem value="16-20-cubic-yards">16-20 Cubic Yards</SelectItem>
                          <SelectItem value="20-plus-cubic-yards">20+ Cubic Yards</SelectItem>
                          <SelectItem value="unsure">I'm not sure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="urgency">Urgency</Label>
                      <Select name="urgency" required>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need this done?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency (within 24 hours)</SelectItem>
                          <SelectItem value="urgent">Urgent (within 3 days)</SelectItem>
                          <SelectItem value="soon">Soon (within 1 week)</SelectItem>
                          <SelectItem value="flexible">Flexible (within 2 weeks)</SelectItem>
                          <SelectItem value="planning">Just planning ahead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Additional Details</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="Describe what needs clearing, any challenges, special requirements..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitQuoteMutation.isPending}
                    >
                      {submitQuoteMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <SustainableLoader variant="grow" size="sm" />
                          Sending...
                        </div>
                      ) : (
                        'Send Quote Request'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 h-auto border-primary text-primary hover:bg-primary hover:text-white"
                asChild
              >
                <a href="tel:+447456809049">
                  <Phone className="w-5 h-5 mr-3" />
                  Call +44 7456 809 049
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <MapPin className="w-4 h-4 mr-1" />
            Service Coverage
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Based in Hayle, Covering Cornwall, Devon & Beyond
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you need a full house clearance in Falmouth, a shed emptied in Exeter, 
            or a hoarded property cleared in Torquay — we're here to help across the South West. 
            We also take on UK-wide projects by request.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Phone className="w-5 h-5" />
              <span>+44 7456 809 049</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Mail className="w-5 h-5" />
              <span>info@lanorahouse.com</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Photo Estimates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cubic Yard Visualization */}
      <section className="py-16 px-4 bg-neutral-ivory">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Box className="w-4 h-4 mr-1" />
              Volume Guide
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              What Does a Cubic Yard Look Like?
            </h2>
            <p className="text-lg text-gray-500">
              Here's how that looks in real-world terms:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cubicYardSizes.map((size, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full border-2 ${size.color} hover:shadow-lg transition-shadow duration-300`}>
                  <CardHeader>
                    <CardTitle className="text-xl text-primary flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {size.volume}
                      </div>
                      <Badge className="bg-primary text-primary-foreground text-lg font-bold">
                        {size.price}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-gray-700 mb-3">{size.description}</p>
                    <ul className="space-y-1 mb-4">
                      {size.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-600 text-sm">{item}</li>
                      ))}
                    </ul>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Scale className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Weight limit: {size.weightLimit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">
                Prices are estimates and other factors such as load, labour and weight will be considered when quotes are provided.
              </p>
            </div>
            <p className="text-lg text-gray-600 mb-4">Still unsure? Send us a photo or book a free site visit.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => setIsQuoteDialogOpen(true)}
              >
                <Info className="w-4 h-4 mr-2" />
                Get Site Visit
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                asChild
              >
                <a href="/clearance">
                  <Info className="w-4 h-4 mr-2" />
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Add-Ons & Extras */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <DollarSign className="w-4 h-4 mr-1" />
              Additional Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              Common Add-Ons & Extras
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sometimes there are extra items that require special handling. Here's what those cost:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Regular Add-Ons */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Standard Add-Ons</CardTitle>
                <CardDescription>Common extra items and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {addOnItems.map((addon, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-700">{addon.item}</span>
                      <span className="font-semibold text-primary">{addon.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">All prices exclude VAT</p>
              </CardContent>
            </Card>

            {/* POPs Waste */}
            <Card className="border-0 shadow-lg border-l-4 border-l-amber-400">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  POPs Waste (Estimates)
                </CardTitle>
                <CardDescription>
                  Persistent Organic Pollutants requiring strict disposal by law. 
                  We're fully licensed to manage it for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Our Approach:</strong> We try to auction or give away suitable items first. 
                    These estimates are for commercial disposal when needed (charged by kg).
                  </p>
                </div>
                <div className="space-y-3">
                  {popsItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-700">{item.item}</span>
                      <span className="font-semibold text-primary">{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>🧪 All POPs are processed legally</strong> with full waste documentation included.
                    Prices shown are typical estimates for commercial tipping when required.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Book or Get a Quote?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            We offer fast estimates by phone, email or photo — and free site visits locally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-4 h-auto bg-white text-primary hover:bg-gray-100"
              asChild
            >
              <a href="tel:+447456809049">
                <Phone className="w-5 h-5 mr-3" />
                Call: +44 7456 809 049
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-4 h-auto border-white text-white bg-transparent hover:bg-white hover:text-primary"
              asChild
            >
              <a href="mailto:info@lanorahouse.com">
                <Mail className="w-5 h-5 mr-3" />
                Email: info@lanorahouse.com
              </a>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm opacity-75">
            <MapPin className="w-4 h-4" />
            <span>Based in Hayle, Cornwall — Serving Devon, Cornwall & UK-wide</span>
          </div>
        </div>
      </section>
    </>
  );
}