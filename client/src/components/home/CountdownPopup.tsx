import { useState, useEffect } from "react";

function firstWednesdayOfMonth(year: number, month: number): Date {
  const d = new Date(year, month, 1, 17, 0, 0); // 5 PM
  const daysUntilWed = (3 - d.getDay() + 7) % 7;
  d.setDate(1 + daysUntilWed);
  return d;
}

function getNextAuctionDate(): Date {
  const now = new Date();
  const earliest = new Date("2026-05-06T17:00:00");
  const reference = now >= earliest ? now : new Date(earliest.getTime() - 1);

  let year = reference.getFullYear();
  let month = reference.getMonth();

  const thisMonth = firstWednesdayOfMonth(year, month);
  if (thisMonth > reference) return thisMonth;

  month += 1;
  if (month > 11) { month = 0; year += 1; }
  return firstWednesdayOfMonth(year, month);
}

function formatAuctionDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownPopup() {
  const [nextAuction, setNextAuction] = useState(getNextAuctionDate());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(nextAuction));

  useEffect(() => {
    const interval = setInterval(() => {
      const auction = getNextAuctionDate();
      setNextAuction(auction);
      setTimeLeft(getTimeLeft(auction));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-left-4 fade-in duration-500">
      <a
        href="https://www.easyliveauction.com/catalogue/4659b5315cc528191cf8220eebc60549/0af8d24542e81eb9357e7ef448a6646f/general-auction-to-include-jewellery-gold-silver-antiques/"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-primary/90 backdrop-blur-sm text-white rounded-xl shadow-lg overflow-hidden max-w-[275px] hover:bg-primary transition-colors"
      >
        <div className="px-4 pt-3 pb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-white/60">
            Next Auction
          </span>
          <p className="text-sm font-semibold text-white mt-0.5">
            {formatAuctionDate(nextAuction)} · 5pm
          </p>
        </div>

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
      </a>
    </div>
  );
}
