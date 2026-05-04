import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  targetDate: Date;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };
  
  useEffect(() => {
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };
  
  return (
    <div className="flex justify-center space-x-4 text-xl">
      <div className="flex flex-col items-center">
        <span className="font-display text-2xl">{formatTime(timeLeft.days)}</span>
        <span className="text-xs uppercase opacity-80">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-display text-2xl">{formatTime(timeLeft.hours)}</span>
        <span className="text-xs uppercase opacity-80">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-display text-2xl">{formatTime(timeLeft.minutes)}</span>
        <span className="text-xs uppercase opacity-80">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-display text-2xl">{formatTime(timeLeft.seconds)}</span>
        <span className="text-xs uppercase opacity-80">Seconds</span>
      </div>
    </div>
  );
}
