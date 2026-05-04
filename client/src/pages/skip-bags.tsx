import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { Calendar, Package, Truck, AlertTriangle, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skipBagBookingFormSchema, type SkipBagBookingFormData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

import rubbleImage from "@assets/generated_images/Rubble_skip_bag_product_69b75f17.png";
import soilImage from "@assets/generated_images/Soil_skip_bag_product_34deaa28.png";
import greenWasteImage from "@assets/generated_images/Green_waste_skip_bag_product_e97130c9.png";
import woodImage from "@assets/generated_images/Wood_skip_bag_product_6fd9941a.png";
import mixedHouseholdImage from "@assets/generated_images/Mixed_household_skip_bag_product_3792b283.png";
import plasterboardImage from "@assets/generated_images/Plasterboard_skip_bag_product_3bd2cf29.png";

const skipBagProducts = [
  {
    id: "rubble",
    name: "Rubble",
    price: 140,
    description: "Perfect for bricks, concrete, tiles, and construction debris",
    image: rubbleImage,
  },
  {
    id: "soil",
    name: "Soil",
    price: 150,
    description: "Clean soil and earth from gardening or landscaping projects",
    image: soilImage,
  },
  {
    id: "green_waste",
    name: "Green Waste",
    price: 150,
    description: "Garden waste including grass, leaves, branches, and plants",
    image: greenWasteImage,
  },
  {
    id: "wood",
    name: "Wood",
    price: 140,
    description: "Clean timber, wooden boards, and wood offcuts",
    image: woodImage,
  },
  {
    id: "mixed_household",
    name: "Mixed Household",
    price: 170,
    description: "General household waste, cardboard, plastic, and packaging",
    image: mixedHouseholdImage,
  },
  {
    id: "plasterboard",
    name: "Plasterboard",
    price: 260,
    description: "Plasterboard and drywall from construction or renovation",
    image: plasterboardImage,
  },
];

const prohibitedItems = [
  "Asbestos",
  "Oil",
  "Car Batteries",
  "Clinical or biological waste",
  "Fridges / Freezers",
  "Air Conditioning Units",
  "Chest Fridges",
  "Gas canisters",
  "Raw meat or meat unless in sealed packaging",
  "Liquid chemicals or solvents",
  "Fire extinguishers",
  "Mattresses",
  "Sofa",
  "Tree Root System",
  "Paint or paint cans (unless empty)",
  "Oils or Petrol",
  "Gas bottles",
  "Cushions & Upholstery",
  "Air con",
  "Pianos",
];

export default function SkipBags() {
  const [selectedProduct, setSelectedProduct] = useState<typeof skipBagProducts[0] | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SkipBagBookingFormData>({
    resolver: zodResolver(skipBagBookingFormSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
      postcode: "",
      wasteType: selectedProduct?.id as any || "rubble",
      dropOffTimeSlot: "morning",
      collectionTimeSlot: "morning",
      specialInstructions: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: SkipBagBookingFormData & { price: number }) => {
      const response = await apiRequest("POST", "/api/skip-bags/booking", data);
      return response.json();
    },
    onSuccess: async (data: any) => {
      if (data.clientSecret) {
        // Redirect to Stripe payment
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");
        if (stripe) {
          const { error } = await stripe.confirmPayment({
            clientSecret: data.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/skip-bags?booking_success=true&booking_id=${data.bookingId}`,
            },
          });
          
          if (error) {
            toast({
              title: "Payment Failed",
              description: error.message || "Payment could not be processed.",
              variant: "destructive",
            });
          }
        }
      } else {
        toast({
          title: "Booking Submitted",
          description: data.message || "We'll contact you shortly to confirm your collection.",
        });
        setIsBookingOpen(false);
        form.reset();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleBookNow = (product: typeof skipBagProducts[0]) => {
    setSelectedProduct(product);
    form.setValue("wasteType", product.id as any);
    setIsBookingOpen(true);
  };

  const onSubmit = (data: SkipBagBookingFormData) => {
    if (!selectedProduct) return;
    
    bookingMutation.mutate({
      ...data,
      price: selectedProduct.price,
    });
  };

  return (
    <>
      <SEOHead
        title="Skip Bag Collection Services Cornwall"
        description="Book affordable skip bag collection services in Cornwall. Rubble, soil, green waste, wood, mixed household, and plasterboard removal. Prices from £140."
        path="/skip-bags"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-white py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Package className="h-16 w-16 mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Skip Bag Collection Services
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Convenient, affordable waste removal for homes and businesses across Cornwall. 
                Book online and choose your collection date.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Flexible Collection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span>Easy Booking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Skip Bag Type
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select the right skip bag for your waste type. All prices include delivery and collection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {skipBagProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300" data-testid={`card-skipbag-${product.id}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={`${product.name} skip bag`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
                          £{product.price}
                        </span>
                        <span className="text-gray-500 ml-2">inc. VAT</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleBookNow(product)}
                      data-testid={`button-book-${product.id}`}
                    >
                      Book Collection
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Prohibited Items Warning */}
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="h-8 w-8 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Important: Items We Cannot Accept
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Please note: We cannot take these items through the online booking process. 
                    Please call or message us to see the available options.
                  </p>
                </div>
              </div>
              
              <Card className="bg-white border-amber-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prohibitedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                        data-testid={`text-prohibited-${index}`}
                      >
                        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <a href="tel:01234567890" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
                  <Phone className="h-5 w-5" />
                  Call us for alternatives
                </a>
                <a href="/contact" className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
                  <Mail className="h-5 w-5" />
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Simple 3-step process to get your waste collected
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Book Online</h3>
                <p className="text-gray-600">
                  Select your waste type and choose a convenient collection date
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">We Deliver</h3>
                <p className="text-gray-600">
                  We'll deliver your skip bag free of charge to your address
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">We Collect</h3>
                <p className="text-gray-600">
                  Fill it up and we'll collect on your chosen date
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Dialog */}
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Book {selectedProduct?.name} Collection
              </DialogTitle>
              <DialogDescription>
                Price: £{selectedProduct?.price} (includes delivery, collection, and disposal)
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} data-testid="input-customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="07123 456789" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode *</FormLabel>
                        <FormControl>
                          <Input placeholder="TR27 4HY" {...field} data-testid="input-postcode" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="123 High Street, Hayle, Cornwall" 
                          {...field} 
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-lg mb-3">Drop-off Details</h3>
                    <p className="text-sm text-gray-600 mb-4">When would you like us to deliver the skip bag?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dropOffDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Drop-off Date *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                data-testid="input-dropoff-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dropOffTimeSlot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Drop-off Time Slot *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-dropoff-time-slot">
                                  <SelectValue placeholder="Select time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (8am - 12pm)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                                <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-lg mb-3">Collection Details</h3>
                    <p className="text-sm text-gray-600 mb-4">When would you like us to collect the filled bag? (Can be the same day as drop-off)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="collectionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collection Date *</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                min={new Date().toISOString().split('T')[0]}
                                {...field}
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                                data-testid="input-collection-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="collectionTimeSlot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collection Time Slot *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-collection-time-slot">
                                  <SelectValue placeholder="Select time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (8am - 12pm)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                                <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any access issues or specific instructions for delivery/collection" 
                          {...field}
                          data-testid="input-special-instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBookingOpen(false)}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={bookingMutation.isPending}
                    data-testid="button-submit-booking"
                  >
                    {bookingMutation.isPending ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
