import { useState } from "react";
import SEOHead from "@/components/SEOHead";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FiMail, FiPhone, FiMapPin, FiClock, FiUpload, FiX } from "react-icons/fi";
import { FindUsModal } from "@/components/location/FindUsModal";
import { FaWhatsapp } from "react-icons/fa";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, { message: "Please select an inquiry type." }),
  location: z.string().optional(),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      inquiryType: "",
      location: "",
      subject: "",
      message: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmitError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    toast({
      title: "Please check the form",
      description: firstError?.message || "Some required fields are missing or invalid.",
      variant: "destructive",
    });
  };

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("📞 Submitting contact form:", data);
      
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone || "");
      formData.append("inquiryType", data.inquiryType);
      formData.append("location", data.location || "");
      formData.append("subject", data.subject);
      formData.append("message", data.message);
      
      // Append images
      uploadedImages.forEach((image, index) => {
        formData.append(`images`, image);
      });
      
      // Submit to the backend API
      await fetch("/api/clearance-stories/contact-form", {
        method: "POST",
        body: formData,
      });
      
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible.",
      });
      
      form.reset();
      setUploadedImages([]);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Us - Get in Touch Today"
        description="Contact Lanora House for clearance services, auction enquiries, quotes, or general questions. Based in Hayle, Cornwall, serving the South West."
        path="/contact"
      />
      
      <div className="bg-neutral-ivory py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl md:text-5xl mb-4">Contact Us</h1>
              <p className="text-neutral-wood opacity-80 max-w-2xl mx-auto">
                Need a clearance quote or want to get in touch? We're here to help with all your inquiries.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-1">
                    <FiMapPin className="text-primary mr-2" />
                    <CardTitle className="text-lg">Address</CardTitle>
                  </div>
                  <CardDescription>Visit our location</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-wood font-semibold">Viewing Room & Office</p>
                  <p className="text-neutral-wood">First Floor (rear of building)</p>
                  <p className="text-neutral-wood">The Old Foundry Chapel</p>
                  <p className="text-neutral-wood">11–13 Chapel Terrace</p>
                  <p className="text-neutral-wood">Hayle TR27 4AB</p>
                  <FindUsModal />
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-1">
                    <FiMail className="text-primary mr-2" />
                    <CardTitle className="text-lg">Email</CardTitle>
                  </div>
                  <CardDescription>Send us a message</CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="mailto:info@lanorahouse.com" 
                    className="text-primary hover:text-primary-dark transition-colors"
                  >
                    info@lanorahouse.com
                  </a>
                  <p className="text-neutral-wood mt-2 text-sm">
                    Quote requests: Within 24 hours
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center mb-1">
                    <FiPhone className="text-primary mr-2" />
                    <CardTitle className="text-lg">Phone</CardTitle>
                  </div>
                  <CardDescription>Call us directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <a 
                    href="tel:+447843930927" 
                    className="text-primary hover:text-primary-dark transition-colors block mb-3"
                  >
                    +44 7843 930927
                  </a>
                  <a 
                    href="https://wa.me/447843930927" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    WhatsApp Us
                  </a>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="font-display text-2xl mb-4">Send Us a Message</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onSubmitError)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" type="email" {...field} />
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
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="inquiryType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type of Inquiry</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select inquiry type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="auction-valuation">Auction Valuation</SelectItem>
                                <SelectItem value="clearance-quote">Clearance Service Quote</SelectItem>
                                <SelectItem value="house-clearance">House Clearance</SelectItem>
                                <SelectItem value="probate-clearance">Probate Clearance</SelectItem>
                                <SelectItem value="commercial-clearance">Commercial Clearance</SelectItem>
                                <SelectItem value="specialized-clearance">Specialized Clearance</SelectItem>
                                <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                                <SelectItem value="feedback">Feedback</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Hayle, Truro, Plymouth, Exeter..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Message subject" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Your message"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Image Upload Section */}
                      <div className="space-y-3">
                        <FormLabel>Images (optional)</FormLabel>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Upload photos for auction valuations or clearance requests (max 10 images)
                        </p>
                        
                        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-6 hover:border-primary transition-colors">
                          <label 
                            htmlFor="image-upload" 
                            className="flex flex-col items-center justify-center cursor-pointer"
                          >
                            <FiUpload className="w-10 h-10 text-neutral-400 mb-2" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                              Click to upload images or drag and drop
                            </span>
                            <span className="text-xs text-neutral-500 mt-1">
                              PNG, JPG, JPEG up to 10MB each
                            </span>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploadedImages.length >= 10}
                              data-testid="input-image-upload"
                            />
                          </label>
                        </div>

                        {/* Image Previews */}
                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                            {uploadedImages.map((file, index) => (
                              <div 
                                key={index} 
                                className="relative group"
                                data-testid={`image-preview-${index}`}
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-neutral-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  data-testid={`button-remove-image-${index}`}
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                  {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {uploadedImages.length > 0 && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary-dark"
                        disabled={isSubmitting}
                        data-testid="button-submit-contact"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
              
              <div>
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <FiClock className="text-primary mr-2 text-lg" />
                    <h2 className="font-display text-2xl">Opening Hours</h2>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      { day: "Monday", hours: "11:00 – 18:00", closed: false },
                      { day: "Tuesday", hours: "11:00 – 18:00", closed: false },
                      { day: "Wednesday", hours: "Auction Day – 17:00", closed: false },
                      { day: "Thursday", hours: "11:00 – 18:00", closed: false },
                      { day: "Friday", hours: "11:00 – 18:00", closed: false },
                      { day: "Saturday", hours: "Closed", closed: true },
                      { day: "Sunday", hours: "Closed", closed: true },
                    ].map(({ day, hours, closed }) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="font-medium text-neutral-wood">{day}</span>
                        <span className={closed ? "text-neutral-400" : "text-primary"}>{hours}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-neutral-200">
                      <p className="text-sm text-neutral-600">
                        Monday &amp; Tuesday are viewing days. Thursday &amp; Friday are collection days.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 pt-4">
                    <h3 className="font-display text-xl mb-3">Response Times</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-primary">Quote Requests</span>
                      <p className="text-sm text-neutral-wood">Within 24 hours</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary">Emergency Clearance</span>
                      <p className="text-sm text-neutral-wood">Same day when possible</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary">General Questions</span>
                      <p className="text-sm text-neutral-wood">1-2 business days</p>
                    </div>
                  </div>

                </div>
                
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10283.475838994753!2d-5.4273285765012055!3d50.18494269379401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486acefed0d730af%3A0x39533f5108e60d51!2sTR27%204NQ%2C%20Hayle!5e0!3m2!1sen!2suk!4v1747384900281!5m2!1sen!2suk" 
                    width="100%" 
                    height="300" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="LANORA HOUSE location"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}