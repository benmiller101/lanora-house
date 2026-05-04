import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AutoBidForm from "./AutoBidForm";

interface AutoBidDialogProps {
  children: React.ReactNode;
  auctionId?: string;
  catalogItemId?: string;
  startingBid: string;
  incrementAmount: string;
  title: string;
  description?: string;
}

export default function AutoBidDialog({
  children,
  auctionId,
  catalogItemId,
  startingBid,
  incrementAmount,
  title,
  description,
}: AutoBidDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <AutoBidForm
          auctionId={auctionId}
          catalogItemId={catalogItemId}
          startingBid={startingBid}
          incrementAmount={incrementAmount}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}