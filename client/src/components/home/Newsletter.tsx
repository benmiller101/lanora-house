import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been added to our newsletter subscription.",
        });
        setEmail("");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to subscribe");
      }
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-accent text-accent-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl mb-3">Insider Access: Draws & Discoveries</h2>
          <p className="opacity-80 mb-6 md:mb-8 text-base">
            Subscribe for early access to prize draws, clearance finds, and exclusive offers from Lanora House.
          </p>
          
          {/* Mobile: Stack form vertically */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-lg mx-auto md:hidden">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-3 px-4 rounded-md text-neutral-wood bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              className="bg-secondary hover:bg-secondary-dark text-white py-3 px-6 rounded-md transition-colors font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          
          {/* Desktop: Horizontal form */}
          <form onSubmit={handleSubmit} className="hidden md:flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow py-3 px-4 rounded-md text-neutral-wood bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              className="bg-secondary hover:bg-secondary-dark text-white py-3 px-6 rounded-md transition-colors font-medium whitespace-nowrap"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe Now"}
            </Button>
          </form>
          
          <p className="mt-4 text-sm opacity-60">We respect your privacy and will never share your information.</p>
        </div>
      </div>
    </section>
  );
}
