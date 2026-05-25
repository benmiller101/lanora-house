import { useState, useEffect } from "react";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface AuctionCountdownProps {
  startDate: string;
  className?: string;
  showIcon?: boolean;
  auctionLink?: string;
  light?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
  hasStarted: boolean;
}

function calculateTimeRemaining(startDate: string): TimeRemaining {
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const difference = start - now;

  if (difference < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: true,
      hasStarted: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isLive: false,
    hasStarted: false,
  };
}

export default function AuctionCountdown({ startDate, className = "", showIcon = true, auctionLink, light = false }: AuctionCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(startDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(startDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  if (timeRemaining.isLive) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2">
          {showIcon && <Clock className="w-4 h-4 text-green-600 animate-pulse" />}
          <span className="text-green-600 font-semibold">LIVE NOW</span>
        </div>
        {auctionLink && (
          <Link href={auctionLink}>
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white gap-1.5">
              View Live Auction <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeRemaining;

  const tileClass = light
    ? "flex flex-col items-center bg-white/20 px-2 py-1 rounded"
    : "flex flex-col items-center bg-primary/10 px-2 py-1 rounded";
  const valueClass = light ? "font-bold text-white" : "font-bold text-primary";
  const labelClass = light ? "text-xs text-white/70" : "text-xs text-muted-foreground";
  const sepClass = light ? "text-white/50" : "text-muted-foreground";
  const iconClass = light ? "w-4 h-4 text-white/80" : "w-4 h-4 text-primary";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        {showIcon && <Clock className={iconClass} />}
        <div className="flex items-center gap-1 font-mono text-sm">
          {days > 0 && (
            <>
              <div className={tileClass}>
                <span className={valueClass}>{days}</span>
                <span className={labelClass}>day{days !== 1 ? 's' : ''}</span>
              </div>
              <span className={sepClass}>:</span>
            </>
          )}
          <div className={tileClass}>
            <span className={valueClass}>{String(hours).padStart(2, '0')}</span>
            <span className={labelClass}>hrs</span>
          </div>
          <span className={sepClass}>:</span>
          <div className={tileClass}>
            <span className={valueClass}>{String(minutes).padStart(2, '0')}</span>
            <span className={labelClass}>min</span>
          </div>
          <span className={sepClass}>:</span>
          <div className={tileClass}>
            <span className={valueClass}>{String(seconds).padStart(2, '0')}</span>
            <span className={labelClass}>sec</span>
          </div>
        </div>
      </div>
      {auctionLink && (
        <Link href={auctionLink}>
          <Button size="sm" className="w-full gap-1.5" variant="default">
            View Auction <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}
