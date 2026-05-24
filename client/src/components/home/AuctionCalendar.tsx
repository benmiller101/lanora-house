import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Hammer, MapPin, Clock, Calendar } from "lucide-react";

interface AuctionSettings {
  nextAuctionDate: string;
  catalogueImageUrl: string | null;
  catalogueLink: string | null;
  auctionScheduleText: string;
  locationText: string;
}

export default function AuctionCalendar() {
  const { data: settings } = useQuery<AuctionSettings>({
    queryKey: ["/api/auction-homepage-settings"],
  });

  const scheduleText = settings?.auctionScheduleText || "Auctions Held Monthly On A Saturday at 10:00am Online";
  const locationText = settings?.locationText || "Online Only — Viewing Fridays 11am–4pm, Hayle";
  const nextDate = settings?.nextAuctionDate || "Saturday 24th May 2026";
  const catalogueLink = settings?.catalogueLink || "/auctions";
  const catalogueImage = settings?.catalogueImageUrl;

  const scheduleParts = scheduleText.split(/(?=On (?:A|The))/i);
  const line1 = scheduleParts[0]?.trim() || scheduleText;
  const line2 = scheduleParts[1]?.trim() || "";

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Hammer className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wide">Live Auctions</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-primary mb-6 uppercase tracking-wide leading-tight">
            {line2 ? (
              <>{line1}<br />{line2}</>
            ) : (
              scheduleText
            )}
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-neutral-600 dark:text-neutral-400 mb-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">{locationText}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-neutral-400" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium">Starts at 10:00 AM</span>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8 inline-flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-primary">
              Our Next Auction: {nextDate}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mt-4"
        >
          <a href={catalogueLink || "/auctions"}>
            <div className="group cursor-pointer relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 hover:border-primary/50">
              {catalogueImage ? (
                <img
                  src={catalogueImage}
                  alt="View Catalogue"
                  className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-64 md:h-80 bg-primary/20 flex items-center justify-center">
                  <Hammer className="w-20 h-20 text-primary/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-sm font-medium uppercase tracking-wide text-white/80 mb-1">
                  Click to View Catalogue
                </p>
                <h3 className="font-display text-2xl md:text-3xl">
                  Upcoming Auction
                </h3>
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
