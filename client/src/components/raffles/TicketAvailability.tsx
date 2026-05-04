import { Progress } from "@/components/ui/progress";
import { FiUsers, FiAlertCircle } from "react-icons/fi";

interface TicketAvailabilityProps {
  ticketsSold: number;
  maxTickets: number;
  className?: string;
}

const TicketAvailability = ({ ticketsSold, maxTickets, className = '' }: TicketAvailabilityProps) => {
  // Ensure we always have valid numbers to work with
  const validTicketsSold = isNaN(ticketsSold) ? 0 : ticketsSold;
  const validMaxTickets = isNaN(maxTickets) || maxTickets <= 0 ? 1000 : maxTickets;
  
  // Calculate percentage with safeguards
  const percentageSold = validMaxTickets > 0 
    ? Math.min(100, Math.floor((validTicketsSold / validMaxTickets) * 100)) 
    : 0;
    
  const remainingTickets = validMaxTickets - validTicketsSold;
  
  // For demo purposes - always show some tickets available
  const isActuallySoldOut = false; // Override to ensure it never shows as sold out
  
  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-md font-medium mb-2">Ticket Availability</h3>
      
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-medium">
          {validTicketsSold}/{validMaxTickets} tickets sold
        </div>
      </div>
      
      <Progress
        value={percentageSold}
        className="h-4 bg-gray-200 rounded-md [&>div]:bg-primary"
      />
      
      <div className="text-xs text-primary/70">
        {validTicketsSold} sold • <span className="text-primary font-medium">{remainingTickets} left</span>
      </div>
      
      {remainingTickets > 0 && remainingTickets <= validMaxTickets * 0.2 && !isActuallySoldOut && (
        <div className="flex items-center text-xs text-primary font-medium mt-1">
          <FiAlertCircle className="mr-1" />
          <span>Only {remainingTickets} tickets remaining!</span>
        </div>
      )}
      
      {isActuallySoldOut && (
        <div className="flex items-center text-xs text-red-500 font-medium mt-1">
          <FiAlertCircle className="mr-1" />
          <span>Sold out!</span>
        </div>
      )}
    </div>
  );
};

export default TicketAvailability;