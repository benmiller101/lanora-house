import { useState } from "react";
import { Link } from "wouter";
import { CartItem as CartItemType } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleRemove = () => {
    setIsRemoving(true);
    onRemove(item.id);
  };
  
  const isRaffleTicket = item.type === 'raffle' || item.type === 'raffle_ticket';
  const productLink = isRaffleTicket 
    ? (item.raffleId ? `/raffle/${item.raffleId}` : `/raffles`) 
    : (item.productId ? `/product/${item.productId}` : `/shop`);
  
  // Format the price with pound symbol
  const formattedPrice = `£${parseFloat(item.price?.toString() || '0').toFixed(2)}`;
  const formattedTotal = `£${((item.price || 0) * item.quantity).toFixed(2)}`;

  return (
    <div className="flex flex-col sm:flex-row border-b border-neutral-paper pb-6">
      <div className="w-full sm:w-24 h-24 flex-shrink-0 rounded-md overflow-hidden mb-4 sm:mb-0">
        <Link href={productLink}>
          <a>
            <img 
              src={item.imageUrl || '/placeholder-image.jpg'} 
              alt={item.name || 'Product'} 
              className="w-full h-full object-cover" 
            />
          </a>
        </Link>
      </div>
      
      <div className="flex-grow sm:ml-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <Link href={productLink}>
              <a className="font-display text-lg hover:text-primary transition-colors">
                {item.name || (isRaffleTicket ? 'Raffle Ticket' : 'Product')}
              </a>
            </Link>
            {!isRaffleTicket && (
              <div className="text-sm text-accent">Product</div>
            )}
            <div className="text-sm mt-2">{formattedPrice}</div>
          </div>
          
          <div className="flex items-center mt-4 sm:mt-0">
            {!isRaffleTicket && (
              <div className="flex items-center mr-6">
                <button 
                  onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center border border-neutral-paper rounded-l-md hover:bg-neutral-paper"
                  disabled={item.quantity <= 1}
                >
                  <i className="ri-subtract-line"></i>
                </button>
                <div className="w-10 h-8 flex items-center justify-center border-y border-neutral-paper">
                  {item.quantity}
                </div>
                <button 
                  onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-neutral-paper rounded-r-md hover:bg-neutral-paper"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
            )}
            
            {isRaffleTicket && (
              <div className="flex items-center mr-6">
                <div className="text-sm">
                  <span className="font-medium">{item.quantity}</span> {item.quantity === 1 ? 'ticket' : 'tickets'}
                </div>
              </div>
            )}
            
            <div className="font-medium">{formattedTotal}</div>
          </div>
        </div>
        
        <div className="flex justify-end mt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-sm text-neutral-wood hover:text-primary"
          >
            <i className="ri-delete-bin-line mr-1"></i>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
