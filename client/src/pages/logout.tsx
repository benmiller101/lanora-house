import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import SEOHead from "@/components/SEOHead";

export default function LogoutPage() {
  const { toast } = useToast();

  useEffect(() => {
    // Clear all localStorage items
    localStorage.clear();
    
    // Specifically remove authentication items
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminPassword');
    
    // Show toast
    toast({
      title: "Logging out...",
      description: "You will be redirected shortly"
    });
    
    // Call our custom logout endpoint
    fetch('/api/custom-logout', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    })
    .then(() => {
      // Force a hard refresh with cache invalidation
      setTimeout(() => {
        // Redirect using location.replace to avoid history
        window.location.replace('/?logged_out=true&t=' + new Date().getTime());
      }, 500);
    })
    .catch(error => {
      console.error('Logout error:', error);
      // Even if there's an error, force a reload with cache invalidation
      setTimeout(() => {
        window.location.replace('/?logged_out=true&t=' + new Date().getTime());
      }, 500);
    });
  }, [toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SEOHead
        title="Logout - Signing Out of Your Account"
        description="You are being securely logged out of your Lanora House account. Your session data is being cleared for your security and privacy."
        path="/logout"
        noindex={true}
      />
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Logging Out</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we log you out...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}