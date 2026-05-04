import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "wouter";
import CookiePreferencesModal, { CookiePreferences } from "./CookiePreferencesModal";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    // Enable all cookies/tracking here
    console.log('All cookies accepted');
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('cookieConsent', 'essential-only');
    setIsVisible(false);
    // Only enable essential cookies here
    console.log('Only essential cookies accepted');
  };

  const handleManagePreferences = () => {
    setShowPreferences(true);
  };

  const handleSavePreferences = (preferences: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setIsVisible(false);
    // Apply cookie preferences here
    console.log('Cookie preferences saved:', preferences);
  };

  const handleClose = () => {
    // If user closes without choosing, default to essential only
    localStorage.setItem('cookieConsent', 'essential-only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <CookiePreferencesModal
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePreferences}
      />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-neutral-700 leading-relaxed">
              We use cookies to improve your experience and show relevant advertising. By continuing, you accept our use of cookies. Read more in our{' '}
              <Link 
                href="/cookie-policy" 
                className="text-primary hover:underline font-medium"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0 sm:min-w-max">
            <Button
              onClick={handleAcceptAll}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 text-sm font-medium"
            >
              Accept All
            </Button>
            
            <Button
              onClick={handleRejectNonEssential}
              variant="outline"
              className="border-neutral-300 text-neutral-700 hover:bg-neutral-50 px-4 py-2 text-sm"
            >
              Reject Non-Essential
            </Button>
            
            <Button
              onClick={handleManagePreferences}
              variant="ghost"
              className="text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 px-4 py-2 text-sm"
            >
              Manage Preferences
            </Button>
            
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-neutral-600 p-1 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}