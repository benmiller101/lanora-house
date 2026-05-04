import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin/login", values);
      const userData = await response.json();
      
      // Store user data and credentials in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store admin credentials separately for authentication
      localStorage.setItem('adminEmail', values.email);
      localStorage.setItem('adminPassword', values.password);
      
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the admin dashboard",
      });
      
      // Client-side navigation — no page reload (avoids iframe reset to /)
      setLocation("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Login Failed", 
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-neutral-ivory">
      <SEOHead
        title="Admin Login - Secure Dashboard Access"
        description="Secure admin login portal for Lanora House dashboard. Authorised administrators only. Manage products, orders, auctions and site settings."
        path="/admin-login"
        noindex={true}
      />
      <div className="w-full max-w-md space-y-6 rounded-lg border border-neutral-paper bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Admin Login</h1>
          <p className="mt-2 text-sm text-neutral-wood">Access the admin dashboard</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="admin@example.com" 
                      className="border-neutral-paper focus:ring-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Your admin password" 
                      className="border-neutral-paper focus:ring-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-neutral-wood">
            This login page is for administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}