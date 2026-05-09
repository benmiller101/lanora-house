import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Mail, Eye, Copy, Check, Package, Truck, Megaphone, Download, Printer, 
  Plus, Edit, Trash2, Send, Users, Clock, CheckCircle, AlertCircle, Image, Wand2, Loader2, Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { apiRequest } from "@/lib/queryClient";

const ADDRESS = "Unit 12b, The Old Foundry Chapel, Chapel Terrace, Hayle, Cornwall TR27 4AB";

interface MarketingTemplate {
  id: number;
  name: string;
  subject: string;
  preheader?: string;
  heroImageUrl?: string;
  contentHtml: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Dispatch {
  id: number;
  templateId: number;
  initiatedByEmail?: string;
  initiatedByFirstName?: string;
  sentAt: string;
  recipientCount: number;
  successfulCount: number;
  failedCount: number;
  status: string;
}

const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  preheader: z.string().optional(),
  heroImageUrl: z.string().optional(),
  contentHtml: z.string().min(1, "Content is required"),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const orderConfirmationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Lanora House</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: #2D317C; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: normal; font-family: 'Georgia', serif;">Lanora House</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: #4CAF50; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Order Confirmed</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Dear <strong>John Smith</strong>,</p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Thank you for your order! We're delighted to confirm that we've received your purchase and it's being prepared with care.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #2D317C; margin: 0 0 15px; font-size: 18px;">Order Details</h3>
                    <p style="color: #666; margin: 5px 0;"><strong>Order Number:</strong> ORD-2026-001234</p>
                    <p style="color: #666; margin: 5px 0;"><strong>Order Date:</strong> 4th January 2026</p>
                    <p style="color: #666; margin: 5px 0;"><strong>Payment Method:</strong> Credit Card</p>
                  </td>
                </tr>
              </table>
              <h3 style="color: #2D317C; margin: 30px 0 15px; font-size: 18px;">Items Ordered</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr style="background-color: #2D317C;">
                  <td style="padding: 12px; color: #fff; font-weight: bold;">Item</td>
                  <td style="padding: 12px; color: #fff; font-weight: bold; text-align: right;">Price</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px 12px; color: #333;">Victorian Mahogany Writing Desk</td>
                  <td style="padding: 15px 12px; color: #333; text-align: right;">£450.00</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px 12px; color: #333;">Antique Brass Candlesticks (Pair)</td>
                  <td style="padding: 15px 12px; color: #333; text-align: right;">£85.00</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 15px 12px; color: #333; font-weight: bold;">Subtotal</td>
                  <td style="padding: 15px 12px; color: #333; text-align: right;">£535.00</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 15px 12px; color: #333;">Shipping</td>
                  <td style="padding: 15px 12px; color: #333; text-align: right;">£28.95</td>
                </tr>
                <tr style="background-color: #2D317C;">
                  <td style="padding: 15px 12px; color: #fff; font-weight: bold; font-size: 18px;">Total</td>
                  <td style="padding: 15px 12px; color: #fff; text-align: right; font-weight: bold; font-size: 18px;">£563.95</td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #e8f4fd; border-left: 4px solid #2D317C; border-radius: 4px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h4 style="color: #2D317C; margin: 0 0 10px;">What Happens Next?</h4>
                    <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">We'll carefully package your antique items and send you a shipping confirmation email with tracking details once dispatched.</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://lanorahouse.com/members" style="display: inline-block; background-color: #2D317C; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Order</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #333; padding: 30px; text-align: center;">
              <h3 style="color: #fff; margin: 0 0 15px; font-size: 20px; font-family: 'Georgia', serif;">Lanora House</h3>
              <p style="color: #aaa; margin: 0 0 5px; font-size: 13px;">${ADDRESS}</p>
              <p style="color: #aaa; margin: 0 0 15px; font-size: 13px;">United Kingdom</p>
              <p style="color: #aaa; margin: 0 0 15px; font-size: 12px;">
                <a href="https://lanorahouse.com/privacy-policy" style="color: #A6C1E4; text-decoration: none;">Privacy Policy</a> | 
                <a href="https://lanorahouse.com/terms-of-service" style="color: #A6C1E4; text-decoration: none;">Terms of Service</a> | 
                <a href="mailto:info@lanorahouse.com" style="color: #A6C1E4; text-decoration: none;">Contact Us</a>
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #555; margin-top: 15px; padding-top: 15px;">
                <tr>
                  <td style="text-align: center; padding-top: 15px;">
                    <p style="margin: 0;">
                      <a href="https://lanorahouse.com/unsubscribe?email={{customer_email}}" style="color: #ff6b6b; text-decoration: underline; font-size: 14px; font-weight: bold;">Unsubscribe from marketing emails</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #666; margin: 15px 0 0; font-size: 11px;">&copy; 2026 Lanora House. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const shippingNotificationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped - Lanora House</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: #2D317C; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: normal; font-family: 'Georgia', serif;">Lanora House</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: #2196F3; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Your Order Has Shipped!</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Dear <strong>John Smith</strong>,</p>
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Great news! Your carefully packaged antiques are now on their way to you.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #333; padding: 30px; text-align: center;">
              <h3 style="color: #fff; margin: 0 0 15px; font-size: 20px; font-family: 'Georgia', serif;">Lanora House</h3>
              <p style="color: #aaa; margin: 0 0 5px; font-size: 13px;">${ADDRESS}</p>
              <p style="color: #aaa; margin: 0 0 15px; font-size: 13px;">United Kingdom</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #555; margin-top: 15px; padding-top: 15px;">
                <tr>
                  <td style="text-align: center; padding-top: 15px;">
                    <p style="margin: 0;">
                      <a href="https://lanorahouse.com/unsubscribe?email={{customer_email}}" style="color: #ff6b6b; text-decoration: underline; font-size: 14px; font-weight: bold;">Unsubscribe from marketing emails</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #666; margin: 15px 0 0; font-size: 11px;">&copy; 2026 Lanora House. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const staticTemplates = [
  {
    id: "order-confirmation",
    name: "Order Confirmation",
    description: "Sent when a customer places an order",
    type: "Transactional",
    icon: Package,
    color: "bg-green-500",
    html: orderConfirmationTemplate,
  },
  {
    id: "shipping-notification",
    name: "Shipping Notification",
    description: "Sent when an order is shipped with tracking",
    type: "Transactional",
    icon: Truck,
    color: "bg-blue-500",
    html: shippingNotificationTemplate,
  },
];

const contentSnippets = [
  {
    name: "Heading",
    html: `<h2 style="color: #2D317C; margin: 0 0 15px; font-size: 24px;">Your Heading Here</h2>`,
  },
  {
    name: "Paragraph",
    html: `<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Your paragraph text here. Describe your products, auction, or special offer.</p>`,
  },
  {
    name: "CTA Button",
    html: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="https://lanorahouse.com/shop" style="display: inline-block; background-color: #2D317C; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Now</a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "Product Card",
    html: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
  <tr>
    <td style="padding: 25px;">
      <h4 style="color: #2D317C; margin: 0 0 10px; font-size: 18px;">Product Name</h4>
      <p style="color: #666; margin: 0 0 15px; font-size: 14px; line-height: 1.5;">Brief description of the antique item, its era, and condition.</p>
      <p style="color: #8B4513; margin: 0; font-size: 22px; font-weight: bold;">£1,250</p>
    </td>
  </tr>
</table>`,
  },
  {
    name: "Auction Alert",
    html: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #8B4513; border-radius: 8px; margin: 20px 0;">
  <tr>
    <td style="padding: 30px; text-align: center;">
      <h3 style="color: #ffffff; margin: 0 0 10px; font-size: 22px;">Upcoming Auction</h3>
      <p style="color: #ffe4c4; margin: 0 0 15px; font-size: 16px;">Wednesday, May 6th at 5:00 PM</p>
      <a href="https://lanorahouse.com/auction" style="display: inline-block; background-color: #ffffff; color: #8B4513; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Catalog</a>
    </td>
  </tr>
</table>`,
  },
];

export default function AdminEmailTemplates() {
  const [previewTemplate, setPreviewTemplate] = useState<typeof staticTemplates[0] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [templateToSend, setTemplateToSend] = useState<MarketingTemplate | null>(null);
  const [showDispatches, setShowDispatches] = useState<MarketingTemplate | null>(null);
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showSubscriberForm, setShowSubscriberForm] = useState(false);
  const [subscriberListType, setSubscriberListType] = useState<'business' | 'customer'>('business');
  const [auctionForm, setAuctionForm] = useState({
    auctionTitle: "",
    bannerImageUrl: "",
    auctionDate: "",
    auctionTime: "",
    ctaText: "View Full Catalogue",
    ctaHref: "https://lanorahouse.com/auctions",
    viewingDates: [{ date: "", times: "" }, { date: "", times: "" }],
    lots: [
      { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
      { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
      { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
      { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
      { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
      { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
    ],
  });
  const [businessForm, setBusinessForm] = useState({
    templateTitle: "",
    ctaText: "Contact Us",
    ctaHref: "https://lanorahouse.com/contact",
    beforeAfterPhotos: [{ beforeUrl: "", afterUrl: "", caption: "" }],
    soldProducts: [{ name: "", imageUrl: "", soldPrice: "" }],
    storeHighlights: { title: "Our Services", description: "", bulletPoints: [""] },
    testimonials: [{ quote: "", author: "", company: "" }],
  });
  const [newSubscriber, setNewSubscriber] = useState({
    email: "",
    name: "",
    companyName: "",
    subscriberType: "business" as "business" | "customer",
    notes: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      subject: "",
      preheader: "",
      heroImageUrl: "",
      contentHtml: "",
    },
  });

  const { data: marketingTemplates = [], isLoading: loadingTemplates } = useQuery<MarketingTemplate[]>({
    queryKey: ["/api/admin/marketing-templates"],
  });

  const { data: subscriberCount } = useQuery<{ count: number }>({
    queryKey: ["/api/admin/marketing-templates/subscribers/count"],
  });

  const { data: dispatches = [] } = useQuery<Dispatch[]>({
    queryKey: ["/api/admin/marketing-templates", showDispatches?.id, "dispatches"],
    enabled: !!showDispatches,
  });

  const { data: subscriberCounts } = useQuery<{ business: number; customer: number }>({
    queryKey: ["/api/admin/marketing-subscribers/counts"],
  });

  const { data: subscribers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/marketing-subscribers", subscriberListType],
    enabled: showSubscriberForm,
  });

  const addSubscriberMutation = useMutation({
    mutationFn: async (data: typeof newSubscriber) => {
      return await apiRequest("POST", "/api/admin/marketing-subscribers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-subscribers/counts"] });
      toast({ title: "Subscriber added successfully" });
      setNewSubscriber({ email: "", name: "", companyName: "", subscriberType: subscriberListType, notes: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error adding subscriber", description: error.message, variant: "destructive" });
    },
  });

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/marketing-subscribers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-subscribers/counts"] });
      toast({ title: "Subscriber removed" });
    },
    onError: (error: any) => {
      toast({ title: "Error removing subscriber", description: error.message, variant: "destructive" });
    },
  });

  const businessTemplateMutation = useMutation({
    mutationFn: async (data: typeof businessForm) => {
      return await apiRequest("POST", "/api/admin/marketing-templates/business-template", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-templates"] });
      setShowBusinessForm(false);
      setBusinessForm({
        templateTitle: "",
        ctaText: "Contact Us",
        ctaHref: "https://lanorahouse.com/contact",
        beforeAfterPhotos: [{ beforeUrl: "", afterUrl: "", caption: "" }],
        soldProducts: [{ name: "", imageUrl: "", soldPrice: "" }],
        storeHighlights: { title: "Our Services", description: "", bulletPoints: [""] },
        testimonials: [{ quote: "", author: "", company: "" }],
      });
      if (data.savedTemplate) {
        setEditingTemplate(data.savedTemplate);
        form.reset({
          name: data.savedTemplate.name,
          subject: data.savedTemplate.subject,
          preheader: data.savedTemplate.preheader || "",
          heroImageUrl: data.savedTemplate.heroImageUrl || "",
          contentHtml: data.savedTemplate.contentHtml || "",
        });
        setShowEditor(true);
      }
      toast({ title: "Business template created!", description: "Your template has been saved as a draft" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating template", description: error.message, variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormValues) => {
      return await apiRequest("POST", "/api/admin/marketing-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-templates"] });
      toast({ title: "Template created successfully" });
      setShowEditor(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error creating template", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TemplateFormValues & { id: number }) => {
      return await apiRequest("PATCH", `/api/admin/marketing-templates/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-templates"] });
      toast({ title: "Template updated successfully" });
      setShowEditor(false);
      setEditingTemplate(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error updating template", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/marketing-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-templates"] });
      toast({ title: "Template deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting template", description: error.message, variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/admin/marketing-templates/${id}/send`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-templates"] });
      toast({ 
        title: "Email sent!", 
        description: `Successfully sent to ${data.successfulCount} subscribers` 
      });
      setShowSendConfirm(false);
      setTemplateToSend(null);
    },
    onError: (error: any) => {
      toast({ title: "Error sending email", description: error.message, variant: "destructive" });
    },
  });

  const autoGenerateMutation = useMutation({
    mutationFn: async (options: { theme?: string; productCount?: number; autoSave?: boolean }) => {
      return await apiRequest("POST", "/api/admin/marketing-templates/auto-generate", options);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-templates"] });
      
      // If we have a saved template, open it for editing
      if (data.savedTemplate) {
        setEditingTemplate(data.savedTemplate);
        form.reset({
          name: data.savedTemplate.name,
          subject: data.savedTemplate.subject,
          preheader: data.savedTemplate.preheader || "",
          heroImageUrl: data.savedTemplate.heroImageUrl || "",
          contentHtml: data.savedTemplate.contentHtml,
        });
      } else {
        setEditingTemplate(null);
        form.reset({
          name: data.name,
          subject: data.subject,
          preheader: data.preheader || "",
          heroImageUrl: data.heroImageUrl || "",
          contentHtml: data.contentHtml,
        });
      }
      setShowEditor(true);
      toast({ 
        title: "Template Generated & Saved!", 
        description: `Created using ${data.productsUsed?.length || 0} products. Ready to edit or send.` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error generating template", description: error.message, variant: "destructive" });
    },
  });

  const handleAutoGenerate = () => {
    autoGenerateMutation.mutate({ productCount: 4 });
  };

  const auctionTemplateMutation = useMutation({
    mutationFn: async (data: typeof auctionForm) => {
      return await apiRequest("POST", "/api/admin/marketing-templates/auction-template", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing-templates"] });
      setShowAuctionForm(false);
      
      // Reset auction form
      setAuctionForm({
        auctionTitle: "",
        bannerImageUrl: "",
        auctionDate: "",
        auctionTime: "",
        ctaText: "View Full Catalogue",
        ctaHref: "https://lanorahouse.com/auctions",
        viewingDates: [{ date: "", times: "" }, { date: "", times: "" }],
        lots: [
          { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
          { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
          { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
          { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
          { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
          { imageUrl: "", description: "", estimateLow: "", estimateHigh: "" },
        ],
      });
      
      // Open the saved template for editing
      if (data.savedTemplate) {
        setEditingTemplate(data.savedTemplate);
        form.reset({
          name: data.savedTemplate.name,
          subject: data.savedTemplate.subject,
          preheader: data.savedTemplate.preheader || "",
          heroImageUrl: data.savedTemplate.heroImageUrl || "",
          contentHtml: data.savedTemplate.contentHtml,
        });
        setShowEditor(true);
      }
      
      toast({ 
        title: "Auction Template Created!", 
        description: "Your auction email has been saved as a draft. Ready to edit or send." 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error creating auction template", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateAuctionTemplate = () => {
    if (!auctionForm.auctionTitle.trim()) {
      toast({ title: "Auction title is required", variant: "destructive" });
      return;
    }
    auctionTemplateMutation.mutate(auctionForm);
  };

  const handleCreateBusinessTemplate = () => {
    if (!businessForm.templateTitle.trim()) {
      toast({ title: "Template title is required", variant: "destructive" });
      return;
    }
    businessTemplateMutation.mutate(businessForm);
  };

  const handleAddSubscriber = () => {
    if (!newSubscriber.email.trim()) {
      toast({ title: "Email is required", variant: "destructive" });
      return;
    }
    addSubscriberMutation.mutate(newSubscriber);
  };

  const updateAuctionLot = (index: number, field: string, value: string) => {
    setAuctionForm(prev => ({
      ...prev,
      lots: prev.lots.map((lot, i) => 
        i === index ? { ...lot, [field]: value } : lot
      ),
    }));
  };

  const updateViewingDate = (index: number, field: string, value: string) => {
    setAuctionForm(prev => ({
      ...prev,
      viewingDates: prev.viewingDates.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const copyToClipboard = async (html: string, templateId: string) => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(templateId);
      toast({ title: "Copied!", description: "HTML template copied to clipboard" });
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", description: "Please try again", variant: "destructive" });
    }
  };

  const downloadHtml = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: `${filename}.html saved to your downloads` });
  };

  const handleEditTemplate = (template: MarketingTemplate) => {
    setEditingTemplate(template);
    form.reset({
      name: template.name,
      subject: template.subject,
      preheader: template.preheader || "",
      heroImageUrl: template.heroImageUrl || "",
      contentHtml: template.contentHtml,
    });
    setShowEditor(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    form.reset({
      name: "",
      subject: "",
      preheader: "",
      heroImageUrl: "",
      contentHtml: `<h2 style="color: #2D317C; margin: 0 0 15px; font-size: 24px;">New Arrivals This Week</h2>
<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Discover our latest collection of antique treasures.</p>`,
    });
    setShowEditor(true);
  };

  const insertSnippet = (html: string) => {
    const currentContent = form.getValues("contentHtml");
    form.setValue("contentHtml", currentContent + "\n\n" + html);
  };

  const onSubmit = (data: TemplateFormValues) => {
    if (editingTemplate) {
      updateMutation.mutate({ ...data, id: editingTemplate.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const generatePreviewHtml = (content: string, heroImage?: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: #2D317C; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: normal; font-family: 'Georgia', serif;">Lanora House</h1>
            </td>
          </tr>
          ${heroImage ? `
          <tr>
            <td style="padding: 0;">
              <img src="${heroImage}" alt="Featured Image" style="width: 100%; height: auto; display: block;" />
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #333; padding: 30px; text-align: center;">
              <h3 style="color: #fff; margin: 0 0 15px; font-size: 20px; font-family: 'Georgia', serif;">Lanora House</h3>
              <p style="color: #aaa; margin: 0 0 5px; font-size: 13px;">${ADDRESS}</p>
              <p style="color: #aaa; margin: 0 0 20px; font-size: 13px;">United Kingdom</p>
              <p style="margin: 0; padding: 15px; background-color: #444; border-radius: 5px;">
                <a href="#" style="color: #ff6b6b; text-decoration: underline; font-size: 14px; font-weight: bold;">Unsubscribe from marketing emails</a>
              </p>
              <p style="color: #666; margin: 20px 0 0; font-size: 11px;">&copy; 2026 Lanora House. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const contentHtml = form.watch("contentHtml");
  const heroImageUrl = form.watch("heroImageUrl");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage email templates and send marketing campaigns</p>
            </div>
          </div>
          {subscriberCount && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {subscriberCount.count} Subscribers
            </Badge>
          )}
        </div>

        <Tabs defaultValue="marketing" className="space-y-6">
          <TabsList>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Marketing Campaigns
            </TabsTrigger>
            <TabsTrigger value="transactional" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Transactional Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5 text-orange-500" />
                      Marketing Email Campaigns
                    </CardTitle>
                    <CardDescription>
                      Create and send promotional emails to customers who have opted in to marketing
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={handleAutoGenerate} 
                      variant="secondary"
                      disabled={autoGenerateMutation.isPending}
                      data-testid="button-auto-generate"
                    >
                      {autoGenerateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Auto-Generate
                    </Button>
                    <Button 
                      onClick={() => setShowAuctionForm(true)} 
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      data-testid="button-auction-template"
                    >
                      <Megaphone className="h-4 w-4 mr-2" />
                      Auction Template
                    </Button>
                    <Button 
                      onClick={() => setShowBusinessForm(true)} 
                      variant="outline"
                      className="border-purple-500 text-purple-600 hover:bg-purple-50"
                      data-testid="button-business-template"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Business Template
                    </Button>
                    <Button 
                      onClick={() => setShowSubscriberForm(true)} 
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      data-testid="button-manage-subscribers"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Subscribers ({(subscriberCounts?.business || 0) + (subscriberCounts?.customer || 0)})
                    </Button>
                    <Button onClick={handleNewTemplate} className="bg-primary hover:bg-primary/90" data-testid="button-create-template">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTemplates ? (
                  <div className="text-center py-8 text-gray-500">Loading templates...</div>
                ) : marketingTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No marketing templates yet</h3>
                    <p className="text-gray-500 mb-4">Create your first marketing email template to get started</p>
                    <Button onClick={handleNewTemplate} data-testid="button-create-first-template">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Template
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {marketingTemplates.map((template) => (
                      <Card key={template.id} className="overflow-hidden" data-testid={`card-marketing-template-${template.id}`}>
                        <div className={`h-2 ${template.status === 'sent' ? 'bg-green-500' : template.status === 'draft' ? 'bg-gray-400' : 'bg-orange-500'}`} />
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant={template.status === 'sent' ? 'default' : 'secondary'}>
                              {template.status === 'sent' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                              {template.status}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-1">{template.subject}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditTemplate(template)}
                              data-testid={`button-edit-${template.id}`}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setPreviewHtml(generatePreviewHtml(template.contentHtml, template.heroImageUrl));
                                setPreviewTemplate({ ...staticTemplates[0], name: template.name, html: generatePreviewHtml(template.contentHtml, template.heroImageUrl) });
                              }}
                              data-testid={`button-preview-marketing-${template.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 bg-orange-500 hover:bg-orange-600"
                              onClick={() => {
                                setTemplateToSend(template);
                                setShowSendConfirm(true);
                              }}
                              disabled={!subscriberCount || subscriberCount.count === 0}
                              data-testid={`button-send-${template.id}`}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDispatches(template)}
                              data-testid={`button-history-${template.id}`}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (confirm('Delete this template?')) {
                                  deleteMutation.mutate(template.id);
                                }
                              }}
                              data-testid={`button-delete-${template.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactional" className="space-y-6">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Transactional Email Templates</CardTitle>
                <CardDescription>
                  These templates are automatically sent for order confirmations and shipping notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">Included</Badge>
                    <span>Physical Address, Privacy Policy, Unsubscribe Link</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {staticTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-template-${template.id}`}>
                  <div className={`h-2 ${template.color}`} />
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${template.color} text-white`}>
                        <template.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{template.type}</Badge>
                      </div>
                    </div>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                        data-testid={`button-preview-${template.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyToClipboard(template.html, template.id)}
                        data-testid={`button-copy-${template.id}`}
                      >
                        {copied === template.id ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy HTML
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadHtml(template.html, template.id)}
                        data-testid={`button-download-${template.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(template.html);
                            printWindow.document.close();
                          }
                        }}
                        data-testid={`button-print-${template.id}`}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Save as PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Template Editor Dialog */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? `Edit Template: ${editingTemplate.name}` : "Create Marketing Template"}
              </DialogTitle>
              <DialogDescription>
                Design your email content. The Lanora House branding header and footer are automatically included.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                  {/* Left: Editor */}
                  <div className="space-y-4 overflow-y-auto pr-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., January Newsletter" {...field} />
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
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., New Arrivals This Week at Lanora House" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preheader"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preheader (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Preview text shown in inbox" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heroImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Hero Image URL (optional)
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label>Quick Insert</Label>
                      <div className="flex flex-wrap gap-2">
                        {contentSnippets.map((snippet) => (
                          <Button
                            key={snippet.name}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertSnippet(snippet.html)}
                          >
                            {snippet.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="contentHtml"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Content (HTML)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your email HTML content..."
                              className="font-mono text-sm min-h-[300px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right: Preview */}
                  <div className="overflow-hidden border rounded-lg">
                    <div className="bg-gray-100 px-3 py-2 border-b text-sm font-medium flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Live Preview
                    </div>
                    <iframe
                      srcDoc={generatePreviewHtml(contentHtml || "", heroImageUrl)}
                      className="w-full h-full border-0"
                      title="Email Preview"
                      style={{ minHeight: '500px' }}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowEditor(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewTemplate && (
                  <>
                    <Eye className="h-5 w-5" />
                    {previewTemplate.name} Preview
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[70vh] border rounded-lg">
              {previewTemplate && (
                <iframe
                  srcDoc={previewTemplate.html}
                  className="w-full h-[600px] border-0"
                  title={`${previewTemplate.name} Preview`}
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              {previewTemplate && (
                <Button onClick={() => copyToClipboard(previewTemplate.html, 'preview')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <Dialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-orange-500" />
                Confirm Send
              </DialogTitle>
              <DialogDescription>
                You are about to send this marketing email to all subscribed customers.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p><strong>Template:</strong> {templateToSend?.name}</p>
                <p><strong>Subject:</strong> {templateToSend?.subject}</p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <strong>Recipients:</strong> {subscriberCount?.count || 0} subscribed users
                </p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 rounded-lg">
                <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  This action cannot be undone. The email will be sent immediately.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendConfirm(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => templateToSend && sendMutation.mutate(templateToSend.id)}
                disabled={sendMutation.isPending}
              >
                {sendMutation.isPending ? "Sending..." : `Send to ${subscriberCount?.count || 0} Subscribers`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispatch History Dialog */}
        <Dialog open={!!showDispatches} onOpenChange={() => setShowDispatches(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Send History: {showDispatches?.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="max-h-[400px] overflow-y-auto">
              {dispatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No emails have been sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dispatches.map((dispatch) => (
                    <div key={dispatch.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={dispatch.status === 'completed' ? 'default' : dispatch.status === 'partial' ? 'secondary' : 'destructive'}>
                          {dispatch.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(dispatch.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Recipients</span>
                          <p className="font-medium">{dispatch.recipientCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Successful
                          </span>
                          <p className="font-medium text-green-600">{dispatch.successfulCount}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            Failed
                          </span>
                          <p className="font-medium text-red-600">{dispatch.failedCount}</p>
                        </div>
                      </div>
                      {dispatch.initiatedByEmail && (
                        <p className="text-xs text-gray-400 mt-2">
                          Sent by: {dispatch.initiatedByFirstName || dispatch.initiatedByEmail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDispatches(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auction Template Form Dialog */}
        <Dialog open={showAuctionForm} onOpenChange={setShowAuctionForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-orange-500" />
                Create Auction Email Template
              </DialogTitle>
              <DialogDescription>
                Fill in the auction details to generate a branded marketing email
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Auction Details Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Auction Details</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="auctionTitle">Auction Title *</Label>
                    <Input
                      id="auctionTitle"
                      placeholder="e.g., January Antiques & Collectables Sale"
                      value={auctionForm.auctionTitle}
                      onChange={(e) => setAuctionForm(prev => ({ ...prev, auctionTitle: e.target.value }))}
                      data-testid="input-auction-title"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
                    <Input
                      id="bannerImageUrl"
                      placeholder="Paste image URL for the auction banner"
                      value={auctionForm.bannerImageUrl}
                      onChange={(e) => setAuctionForm(prev => ({ ...prev, bannerImageUrl: e.target.value }))}
                      data-testid="input-banner-url"
                    />
                    {auctionForm.bannerImageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border">
                        <img src={auctionForm.bannerImageUrl} alt="Banner preview" className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="auctionDate">Auction Date</Label>
                    <Input
                      id="auctionDate"
                      type="date"
                      value={auctionForm.auctionDate}
                      onChange={(e) => setAuctionForm(prev => ({ ...prev, auctionDate: e.target.value }))}
                      data-testid="input-auction-date"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="auctionTime">Start Time</Label>
                    <Input
                      id="auctionTime"
                      type="time"
                      value={auctionForm.auctionTime}
                      onChange={(e) => setAuctionForm(prev => ({ ...prev, auctionTime: e.target.value }))}
                      data-testid="input-auction-time"
                    />
                  </div>
                </div>
              </div>
              
              {/* Call to Action Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Call to Action Button</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="ctaText">Button Text</Label>
                    <Input
                      id="ctaText"
                      placeholder="e.g., View Full Catalogue"
                      value={auctionForm.ctaText}
                      onChange={(e) => setAuctionForm(prev => ({ ...prev, ctaText: e.target.value }))}
                      data-testid="input-cta-text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaHref">Button Link URL</Label>
                    <Input
                      id="ctaHref"
                      placeholder="https://lanorahouse.com/auctions"
                      value={auctionForm.ctaHref}
                      onChange={(e) => setAuctionForm(prev => ({ ...prev, ctaHref: e.target.value }))}
                      data-testid="input-cta-href"
                    />
                  </div>
                </div>
              </div>
              
              {/* Viewing Days Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Viewing Days</h3>
                
                {auctionForm.viewingDates.map((viewing, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <Label>Viewing Day {index + 1} - Date</Label>
                      <Input
                        type="date"
                        value={viewing.date}
                        onChange={(e) => updateViewingDate(index, 'date', e.target.value)}
                        data-testid={`input-viewing-date-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Times</Label>
                      <Input
                        placeholder="e.g., 10am - 4pm"
                        value={viewing.times}
                        onChange={(e) => updateViewingDate(index, 'times', e.target.value)}
                        data-testid={`input-viewing-times-${index}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Featured Lots Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Featured Lots (up to 6)</h3>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {auctionForm.lots.map((lot, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Lot {index + 1}</Label>
                        {lot.imageUrl && (
                          <div className="w-12 h-12 rounded overflow-hidden">
                            <img src={lot.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Input
                          placeholder="Image URL"
                          value={lot.imageUrl}
                          onChange={(e) => updateAuctionLot(index, 'imageUrl', e.target.value)}
                          className="text-sm"
                          data-testid={`input-lot-image-${index}`}
                        />
                      </div>
                      
                      <div>
                        <Input
                          placeholder="Short description"
                          value={lot.description}
                          onChange={(e) => updateAuctionLot(index, 'description', e.target.value)}
                          className="text-sm"
                          data-testid={`input-lot-desc-${index}`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Low £"
                          value={lot.estimateLow}
                          onChange={(e) => updateAuctionLot(index, 'estimateLow', e.target.value)}
                          className="text-sm"
                          data-testid={`input-lot-low-${index}`}
                        />
                        <Input
                          placeholder="High £"
                          value={lot.estimateHigh}
                          onChange={(e) => updateAuctionLot(index, 'estimateHigh', e.target.value)}
                          className="text-sm"
                          data-testid={`input-lot-high-${index}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowAuctionForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAuctionTemplate}
                disabled={auctionTemplateMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
                data-testid="button-create-auction-email"
              >
                {auctionTemplateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Generate Auction Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Business Marketing Template Form Dialog */}
        <Dialog open={showBusinessForm} onOpenChange={setShowBusinessForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-500" />
                Create Business Marketing Template
              </DialogTitle>
              <DialogDescription>
                Build a marketing email showcasing your services to business contacts
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Template Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Template Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label>Template Title *</Label>
                    <Input
                      placeholder="e.g., Professional House Clearance Services"
                      value={businessForm.templateTitle}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, templateTitle: e.target.value }))}
                      data-testid="input-business-title"
                    />
                  </div>
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      placeholder="Contact Us"
                      value={businessForm.ctaText}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, ctaText: e.target.value }))}
                      data-testid="input-business-cta-text"
                    />
                  </div>
                  <div>
                    <Label>Button Link</Label>
                    <Input
                      placeholder="https://lanorahouse.com/contact"
                      value={businessForm.ctaHref}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, ctaHref: e.target.value }))}
                      data-testid="input-business-cta-href"
                    />
                  </div>
                </div>
              </div>
              
              {/* Before/After Photos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg border-b pb-2">Before & After Photos</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBusinessForm(prev => ({
                      ...prev,
                      beforeAfterPhotos: [...prev.beforeAfterPhotos, { beforeUrl: "", afterUrl: "", caption: "" }]
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {businessForm.beforeAfterPhotos.map((photo, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-xs">Before Image URL</Label>
                      <Input
                        placeholder="Before photo URL"
                        value={photo.beforeUrl}
                        onChange={(e) => {
                          const updated = [...businessForm.beforeAfterPhotos];
                          updated[index].beforeUrl = e.target.value;
                          setBusinessForm(prev => ({ ...prev, beforeAfterPhotos: updated }));
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">After Image URL</Label>
                      <Input
                        placeholder="After photo URL"
                        value={photo.afterUrl}
                        onChange={(e) => {
                          const updated = [...businessForm.beforeAfterPhotos];
                          updated[index].afterUrl = e.target.value;
                          setBusinessForm(prev => ({ ...prev, beforeAfterPhotos: updated }));
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Caption</Label>
                      <Input
                        placeholder="Optional caption"
                        value={photo.caption}
                        onChange={(e) => {
                          const updated = [...businessForm.beforeAfterPhotos];
                          updated[index].caption = e.target.value;
                          setBusinessForm(prev => ({ ...prev, beforeAfterPhotos: updated }));
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Sold Products */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg border-b pb-2">Recently Sold Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBusinessForm(prev => ({
                      ...prev,
                      soldProducts: [...prev.soldProducts, { name: "", imageUrl: "", soldPrice: "" }]
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {businessForm.soldProducts.map((product, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <Input
                        placeholder="Item name"
                        value={product.name}
                        onChange={(e) => {
                          const updated = [...businessForm.soldProducts];
                          updated[index].name = e.target.value;
                          setBusinessForm(prev => ({ ...prev, soldProducts: updated }));
                        }}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Image URL"
                        value={product.imageUrl}
                        onChange={(e) => {
                          const updated = [...businessForm.soldProducts];
                          updated[index].imageUrl = e.target.value;
                          setBusinessForm(prev => ({ ...prev, soldProducts: updated }));
                        }}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Sold price (e.g., 450)"
                        value={product.soldPrice}
                        onChange={(e) => {
                          const updated = [...businessForm.soldProducts];
                          updated[index].soldPrice = e.target.value;
                          setBusinessForm(prev => ({ ...prev, soldProducts: updated }));
                        }}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Store Highlights */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Services / Store Highlights</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      placeholder="Our Services"
                      value={businessForm.storeHighlights.title}
                      onChange={(e) => setBusinessForm(prev => ({
                        ...prev,
                        storeHighlights: { ...prev.storeHighlights, title: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your services..."
                      value={businessForm.storeHighlights.description}
                      onChange={(e) => setBusinessForm(prev => ({
                        ...prev,
                        storeHighlights: { ...prev.storeHighlights, description: e.target.value }
                      }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Bullet Points (one per line)</Label>
                    <Textarea
                      placeholder="Professional house clearance&#10;Free valuations&#10;Same-day collection"
                      value={businessForm.storeHighlights.bulletPoints.join('\n')}
                      onChange={(e) => setBusinessForm(prev => ({
                        ...prev,
                        storeHighlights: { ...prev.storeHighlights, bulletPoints: e.target.value.split('\n') }
                      }))}
                      rows={4}
                    />
                  </div>
                </div>
              </div>
              
              {/* Testimonials */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg border-b pb-2">Testimonials</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBusinessForm(prev => ({
                      ...prev,
                      testimonials: [...prev.testimonials, { quote: "", author: "", company: "" }]
                    }))}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                {businessForm.testimonials.map((testimonial, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                    <Textarea
                      placeholder="Customer testimonial quote..."
                      value={testimonial.quote}
                      onChange={(e) => {
                        const updated = [...businessForm.testimonials];
                        updated[index].quote = e.target.value;
                        setBusinessForm(prev => ({ ...prev, testimonials: updated }));
                      }}
                      rows={2}
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Author name"
                        value={testimonial.author}
                        onChange={(e) => {
                          const updated = [...businessForm.testimonials];
                          updated[index].author = e.target.value;
                          setBusinessForm(prev => ({ ...prev, testimonials: updated }));
                        }}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Company (optional)"
                        value={testimonial.company}
                        onChange={(e) => {
                          const updated = [...businessForm.testimonials];
                          updated[index].company = e.target.value;
                          setBusinessForm(prev => ({ ...prev, testimonials: updated }));
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowBusinessForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBusinessTemplate}
                disabled={businessTemplateMutation.isPending}
                className="bg-purple-500 hover:bg-purple-600"
                data-testid="button-create-business-email"
              >
                {businessTemplateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Generate Business Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Subscriber Management Dialog */}
        <Dialog open={showSubscriberForm} onOpenChange={setShowSubscriberForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Manage Subscriber Lists
              </DialogTitle>
              <DialogDescription>
                Add and manage business and customer email subscribers
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* List Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={subscriberListType === 'business' ? 'default' : 'outline'}
                  onClick={() => {
                    setSubscriberListType('business');
                    setNewSubscriber(prev => ({ ...prev, subscriberType: 'business' }));
                  }}
                  className={subscriberListType === 'business' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Business ({subscriberCounts?.business || 0})
                </Button>
                <Button
                  variant={subscriberListType === 'customer' ? 'default' : 'outline'}
                  onClick={() => {
                    setSubscriberListType('customer');
                    setNewSubscriber(prev => ({ ...prev, subscriberType: 'customer' }));
                  }}
                  className={subscriberListType === 'customer' ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Customer ({subscriberCounts?.customer || 0})
                </Button>
              </div>
              
              {/* Add Subscriber Form */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">Add New {subscriberListType === 'business' ? 'Business' : 'Customer'} Subscriber</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      value={newSubscriber.email}
                      onChange={(e) => setNewSubscriber(prev => ({ ...prev, email: e.target.value }))}
                      data-testid="input-subscriber-email"
                    />
                  </div>
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      placeholder="John Smith"
                      value={newSubscriber.name}
                      onChange={(e) => setNewSubscriber(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-subscriber-name"
                    />
                  </div>
                  {subscriberListType === 'business' && (
                    <div className="md:col-span-2">
                      <Label>Company Name</Label>
                      <Input
                        placeholder="Company Ltd"
                        value={newSubscriber.companyName}
                        onChange={(e) => setNewSubscriber(prev => ({ ...prev, companyName: e.target.value }))}
                        data-testid="input-subscriber-company"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Input
                      placeholder="Optional notes..."
                      value={newSubscriber.notes}
                      onChange={(e) => setNewSubscriber(prev => ({ ...prev, notes: e.target.value }))}
                      data-testid="input-subscriber-notes"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddSubscriber}
                  disabled={addSubscriberMutation.isPending}
                  className="w-full"
                  data-testid="button-add-subscriber"
                >
                  {addSubscriberMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Subscriber
                </Button>
              </div>
              
              {/* Subscriber List */}
              <div className="space-y-2">
                <h4 className="font-medium">{subscriberListType === 'business' ? 'Business' : 'Customer'} Subscribers</h4>
                {subscribers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No {subscriberListType} subscribers yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {subscribers.filter((s: any) => s.subscriberType === subscriberListType).map((subscriber: any) => (
                      <div key={subscriber.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{subscriber.email}</p>
                          <p className="text-sm text-gray-500">
                            {subscriber.name}{subscriber.companyName && ` - ${subscriber.companyName}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubscriberMutation.mutate(subscriber.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubscriberForm(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
