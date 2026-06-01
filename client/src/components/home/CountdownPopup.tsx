import { useState, useEffect } from "react";
import { Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const NEXT_AUCTION = new Date("2026-05-30T10:00:00");
const AUCTION_END   = new Date("2026-05-30T20:00:00");
const CATALOGUE_URL = "https://auctions.lanorahouse.com/";
const STORAGE_KEY = "auction-countdown-minimised";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

function getTimeLeft(): TimeLeft {
  const diff = NEXT_AUCTION.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isLive: false,
  };
}

export default function CountdownPopup() {
  const [now, setNow] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [minimised, setMinimised] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (now >= AUCTION_END.getTime()) return null;

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !minimised;
    setMinimised(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  };

  if (minimised) {
    return (
      <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-left-4 fade-in duration-500">
        <button
          onClick={toggle}
          className="flex items-center gap-2 bg-primary text-white rounded-xl px-4 py-2.5 shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Show auction countdown"
        >
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">Next Auction</span>
          <ChevronUp className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-left-4 fade-in duration-500 w-[275px]">
      <div className="bg-primary text-white rounded-xl shadow-lg overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
              Next Auction
            </span>
            <p className="text-sm font-semibold text-white leading-tight">
              {timeLeft.isLive ? "Live Now!" : "30th May 2026 · 10:00am"}
            </p>
          </div>
          <button
            onClick={toggle}
            className="text-white/60 hover:text-white transition-colors p-1 rounded"
            aria-label="Minimise countdown"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Countdown tiles */}
        {timeLeft.isLive ? (
          <div className="px-4 pb-3">
            <span className="text-green-300 font-bold text-sm animate-pulse">LIVE NOW</span>
          </div>
        ) : (
          <div className="flex gap-1.5 px-4 pb-3">
            {[
              { value: timeLeft.days, label: "D" },
              { value: timeLeft.hours, label: "H" },
              { value: timeLeft.minutes, label: "M" },
              { value: timeLeft.seconds, label: "S" },
            ].map((unit) => (
              <div
                key={unit.label}
                className="bg-white/10 rounded-md px-2 py-1.5 text-center flex-1"
              >
                <div className="text-white text-lg font-bold tabular-nums leading-none">
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div className="text-white/50 text-[10px] mt-0.5 uppercase">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <a
          href={CATALOGUE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2.5 text-sm font-semibold text-white border-t border-white/10"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Full Catalogue
        </a>
      </div>
    </div>
  );
}
