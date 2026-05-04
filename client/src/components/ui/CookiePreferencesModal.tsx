import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

interface CookiePreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (preferences: CookiePreferences) => void;
}

export interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  functionality: boolean;
  advertising: boolean;
}

export default function CookiePreferencesModal({ 
  open, 
  onClose, 
  onSave 
}: CookiePreferencesModalProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    performance: true,
    functionality: true,
    advertising: false,
  });

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      performance: true,
      functionality: true,
      advertising: true,
    };
    onSave(allAccepted);
    onClose();
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      performance: false,
      functionality: false,
      advertising: false,
    };
    onSave(essentialOnly);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can change these settings at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Essential Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900">Essential Cookies</h3>
              <p className="text-sm text-neutral-600 mt-1">
                These cookies are necessary for the website to function properly. They enable core features like login, checkout, and security.
              </p>
            </div>
            <Switch
              checked={true}
              disabled={true}
              className="opacity-50"
            />
          </div>

          {/* Performance Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900">Performance & Analytics</h3>
              <p className="text-sm text-neutral-600 mt-1">
                These cookies help us understand how visitors use our website through analytics platforms like Google Analytics.
              </p>
            </div>
            <Switch
              checked={preferences.performance}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, performance: checked })
              }
            />
          </div>

          {/* Functionality Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900">Functionality</h3>
              <p className="text-sm text-neutral-600 mt-1">
                These cookies remember your preferences and settings to provide a more personalized experience.
              </p>
            </div>
            <Switch
              checked={preferences.functionality}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, functionality: checked })
              }
            />
          </div>

          {/* Advertising Cookies */}
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900">Advertising & Targeting</h3>
              <p className="text-sm text-neutral-600 mt-1">
                These cookies are used to show you relevant advertisements and measure campaign effectiveness across platforms like Facebook, Google, and TikTok.
              </p>
            </div>
            <Switch
              checked={preferences.advertising}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, advertising: checked })
              }
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200">
          <p className="text-xs text-neutral-500 mb-4">
            For more information about our use of cookies, please read our{' '}
            <Link href="/cookie-policy" className="text-primary hover:underline">
              Cookie Policy
            </Link>
            .
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleAcceptAll}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Accept All
            </Button>
            
            <Button
              onClick={handleSave}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5"
            >
              Save Preferences
            </Button>
            
            <Button
              onClick={handleRejectAll}
              variant="outline"
            >
              Reject All (Essential Only)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}