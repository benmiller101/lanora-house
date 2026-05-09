import { useState } from "react";
import { MapPin, Car, Package, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoSectionProps {
  src: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  badge: string;
  badgeVariant: "primary" | "amber";
}

function VideoSection({ src, title, icon, description, badge, badgeVariant }: VideoSectionProps) {
  const [hasError, setHasError] = useState(false);

  const badgeClass =
    badgeVariant === "primary"
      ? "bg-primary/10 text-primary border border-primary/20"
      : "bg-amber-50 text-amber-700 border border-amber-200";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-xl text-neutral-900">{title}</h3>
      </div>
      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
        {badge}
      </span>
      <div className="rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
        {hasError ? (
          <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 text-neutral-400 bg-neutral-50">
            <VideoOff className="w-10 h-10" />
            <p className="text-sm text-center px-4">
              Video coming soon — check back after we've uploaded the walkthrough.
            </p>
          </div>
        ) : (
          <video
            src={src}
            controls
            muted
            playsInline
            preload="metadata"
            className="w-full aspect-square object-cover"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
    </div>
  );
}

export function FindUsModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full border-primary/30 text-primary hover:bg-primary/5"
        onClick={() => setOpen(true)}
      >
        <MapPin className="w-4 h-4 mr-2" />
        How to Find Us
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-8 pt-8 pb-6 border-b border-neutral-100">
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              How to Find Us
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500 mt-1">
              Unit 12b, The Old Foundry Chapel, Chapel Terrace, Hayle, Cornwall TR27 4AB
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <VideoSection
              src="/videos/car-park-entrance.mp4"
              title="Arriving from the Car Park"
              icon={<Car className="w-5 h-5" />}
              badge="For all visitors & general enquiries"
              badgeVariant="primary"
              description="Walk with us from the public (paid) car park to our front entrance. This is the route for all general visitors — whether you're coming in for a viewing, a valuation appointment, or to speak with our team."
            />

            <VideoSection
              src="/videos/collections-entrance.mp4"
              title="Collecting Your Auction Wins"
              icon={<Package className="w-5 h-5" />}
              badge="Collections & deliveries only"
              badgeVariant="amber"
              description="This rear entrance is for auction winners collecting their items and for deliveries. Please phone us first to arrange a collection date and time before coming — we need to have your items ready and available. All other visitors should use the front entrance from the car park."
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
