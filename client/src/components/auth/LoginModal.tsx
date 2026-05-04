import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getAndClearLoginRedirect } from "@/lib/loginRedirect";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Simplified login schema - just email for guest login
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export default function LoginModal({ open, onClose, onRegisterClick }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
      console.log("🚀 Frontend login attempt:", values.email, "password length:", values.password.length);
      
      const requestData = {
        email: values.email.trim(),
        password: values.password.trim()
      };
      console.log("📤 Request payload:", requestData);
      
      // Use proper login with email and password
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData)
      });
      
      console.log("📥 Response status:", response.status, "ok:", response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Login failed" }));
        throw new Error(errorData.error || "Failed to login");
      }
      
      const userData = await response.json();
      console.log("Login response:", userData);
      
      // User data is now stored in secure session, no need for localStorage
      
      // Invalidate auth queries to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      
      toast({
        title: "Welcome back!",
        description: "You're now logged in and can access all features",
      });
      
      // Close modal
      onClose();
      
      // Small delay to ensure auth state updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }, 100);
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ForgotPasswordModal 
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
        }}
      />
      
      <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-ivory max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">Sign In</DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Access your account to view orders, sell items, pay for won lots, and save favorites
          </p>
        </DialogHeader>
        
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
                      placeholder="Enter your email" 
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
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Button 
                      variant="link" 
                      className="text-sm text-primary p-0 h-auto font-normal"
                      type="button"
                      onClick={() => {
                        onClose();
                        setTimeout(() => setShowForgotPassword(true), 150);
                      }}
                      data-testid="button-forgot-password"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
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
{isLoading ? "Signing you in..." : "Sign In"}
            </Button>
          </form>
        </Form>
        
        
        <div className="text-center mt-4">
          <p className="text-sm">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary hover:text-primary-dark font-medium"
              onClick={onRegisterClick}
            >
              Sign Up
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
