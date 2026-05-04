import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

interface CountdownTimerProps {
  endDate: string;
  endTime?: string;
  startDate?: string;
  startTime?: string;
  onComplete?: () => void;
  className?: string;
}

const CountdownTimer = ({ 
  endDate, 
  endTime = '23:59', 
  startDate, 
  startTime = '00:00',
  onComplete, 
  className = '' 
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const [isComplete, setIsComplete] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);

  useEffect(() => {
    // Helper to parse date strings into valid Date objects
    const parseDate = (dateStr: string, timeStr: string = '00:00') => {
      try {
        // First, check if date is in ISO format
        if (dateStr && dateStr.includes('T')) {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
        
        // If not ISO format, try the yyyy-mm-dd format
        if (!dateStr) {
          return new Date();
        }
        
        let dateObj;
        
        // Try parsing with split method
        try {
          const dateParts = dateStr.split('-');
          if (dateParts.length === 3) {
            const [year, month, day] = dateParts.map(Number);
            
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              // Parse the time
              let hours = 0;
              let minutes = 0;
              
              if (timeStr) {
                const timeParts = timeStr.split(':');
                if (timeParts.length === 2) {
                  const parsedHours = Number(timeParts[0]);
                  const parsedMinutes = Number(timeParts[1]);
                  
                  if (!isNaN(parsedHours) && !isNaN(parsedMinutes)) {
                    hours = parsedHours;
                    minutes = parsedMinutes;
                  }
                }
              }
              
              dateObj = new Date(year, month - 1, day, hours, minutes);
            }
          }
        } catch (e) {
          console.error("Error parsing date parts:", e);
        }
        
        // If split method didn't work, try direct Date parsing as fallback
        if (!dateObj || isNaN(dateObj.getTime())) {
          dateObj = new Date(dateStr);
        }
        
        return dateObj;
      } catch (error) {
        console.error("Error parsing date:", error);
        return new Date();
      }
    };

    const calculateTimeLeft = () => {
      try {
        const now = new Date();
        const endDateTime = parseDate(endDate, endTime);
        
        // If we have a start date and the raffle hasn't started yet
        if (startDate) {
          const startDateTime = parseDate(startDate, startTime);
          
          // If current time is before start time, show "starts in" countdown
          if (now < startDateTime) {
            setIsUpcoming(true);
            const difference = startDateTime.getTime() - now.getTime();
            
            if (difference <= 0) {
              return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            return { 
              days: isNaN(days) ? 0 : days, 
              hours: isNaN(hours) ? 0 : hours, 
              minutes: isNaN(minutes) ? 0 : minutes, 
              seconds: isNaN(seconds) ? 0 : seconds 
            };
          } else {
            setIsUpcoming(false);
          }
        }
        
        // Default countdown to end date
        const difference = endDateTime.getTime() - now.getTime();
        
        if (difference <= 0) {
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        return { 
          days: isNaN(days) ? 0 : days, 
          hours: isNaN(hours) ? 0 : hours, 
          minutes: isNaN(minutes) ? 0 : minutes, 
          seconds: isNaN(seconds) ? 0 : seconds 
        };
      } catch (error) {
        console.error("Error calculating time left:", error);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };
    
    // Calculate time left immediately
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // Clear interval on unmount
    return () => clearInterval(timer);
  }, [endDate, endTime, onComplete]);
  
  // Format the display values with leading zeros
  const formatValue = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  if (isComplete) {
    return (
      <div className={`flex flex-col font-medium ${className}`}>
        <div className="text-center bg-red-600 text-white p-3 font-bold uppercase">
          RAFFLE ENDED
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center text-lg font-medium text-red-600">
            <FiClock className="mr-2" />
            This raffle has ended
          </div>
          <p className="text-sm text-neutral-wood mt-2">Check back soon for the winner announcement</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col font-medium ${className}`}>
      <div className="text-center bg-indigo-700 text-white p-3 font-bold uppercase">
        RAFFLE ENDS IN:
      </div>
      <div className="grid grid-cols-4 gap-2 text-center p-4">
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold bg-white rounded-lg shadow py-2 px-3 w-full">
            {isNaN(timeLeft.days) ? "00" : formatValue(timeLeft.days)}
          </div>
          <div className="text-xs uppercase mt-1">DAYS</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold bg-white rounded-lg shadow py-2 px-3 w-full">
            {isNaN(timeLeft.hours) ? "00" : formatValue(timeLeft.hours)}
          </div>
          <div className="text-xs uppercase mt-1">HOURS</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold bg-white rounded-lg shadow py-2 px-3 w-full">
            {isNaN(timeLeft.minutes) ? "00" : formatValue(timeLeft.minutes)}
          </div>
          <div className="text-xs uppercase mt-1">MINS</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xl font-bold bg-white rounded-lg shadow py-2 px-3 w-full">
            {isNaN(timeLeft.seconds) ? "00" : formatValue(timeLeft.seconds)}
          </div>
          <div className="text-xs uppercase mt-1">SECS</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;