import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animated Quantity Selector
export const AnimatedQuantitySelector: React.FC<{
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}> = ({ quantity, onQuantityChange, min = 1, max = 99, disabled = false }) => {
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = (newQuantity: number) => {
    if (newQuantity >= min && newQuantity <= max) {
      setIsChanging(true);
      onQuantityChange(newQuantity);
      setTimeout(() => setIsChanging(false), 200);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        className={`w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center ${
          disabled || quantity <= min ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled || quantity <= min}
        onClick={() => handleChange(quantity - 1)}
        whileHover={!disabled && quantity > min ? { scale: 1.1 } : {}}
        whileTap={!disabled && quantity > min ? { scale: 0.9 } : {}}
      >
        <Minus className="w-4 h-4" />
      </motion.button>

      <motion.div
        className="w-12 h-8 flex items-center justify-center font-medium"
        animate={isChanging ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        {quantity}
      </motion.div>

      <motion.button
        className={`w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center ${
          disabled || quantity >= max ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled || quantity >= max}
        onClick={() => handleChange(quantity + 1)}
        whileHover={!disabled && quantity < max ? { scale: 1.1 } : {}}
        whileTap={!disabled && quantity < max ? { scale: 0.9 } : {}}
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

// Cart Icon with Item Count Animation
export const AnimatedCartIcon: React.FC<{
  itemCount: number;
  onClick?: () => void;
}> = ({ itemCount, onClick }) => {
  const [previousCount, setPreviousCount] = useState(itemCount);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (itemCount > previousCount) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 600);
    }
    setPreviousCount(itemCount);
  }, [itemCount, previousCount]);

  return (
    <motion.button
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={showPulse ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <ShoppingCart className="w-6 h-6" />
      </motion.div>

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            <motion.span
              key={itemCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {showPulse && (
        <motion.div
          className="absolute inset-0 bg-primary/20 rounded-lg"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
};

// Remove Item Animation
export const RemoveItemButton: React.FC<{
  onRemove: () => void;
  disabled?: boolean;
}> = ({ onRemove, disabled = false }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove();
      setIsRemoving(false);
    }, 300);
  };

  return (
    <motion.button
      className={`p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      onClick={handleRemove}
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
    >
      <motion.div
        animate={isRemoving ? { rotate: 360, scale: 0.8 } : {}}
        transition={{ duration: 0.3 }}
      >
        <Trash2 className="w-4 h-4" />
      </motion.div>
    </motion.button>
  );
};

// Cart Total with Animation
export const AnimatedCartTotal: React.FC<{
  total: number;
  currency?: string;
}> = ({ total, currency = "£" }) => {
  const [previousTotal, setPreviousTotal] = useState(total);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (total !== previousTotal) {
      setIsChanging(true);
      setTimeout(() => setIsChanging(false), 500);
      setPreviousTotal(total);
    }
  }, [total, previousTotal]);

  return (
    <motion.div
      className="text-right"
      animate={isChanging ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="text-sm text-gray-600 mb-1">Total</div>
      <motion.div
        className="text-2xl font-bold text-primary"
        key={total}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {currency}{total.toFixed(2)}
      </motion.div>
    </motion.div>
  );
};

// Cart Item Card with Slide Animation
export const CartItemCard: React.FC<{
  children: React.ReactNode;
  isRemoving?: boolean;
  onRemove?: () => void;
}> = ({ children, isRemoving = false, onRemove }) => {
  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          layout
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-4 shadow-sm border"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add to Cart Success Notification
export const AddToCartNotification: React.FC<{
  show: boolean;
  productName: string;
  onClose: () => void;
}> = ({ show, productName, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              ✓
            </motion.div>
            <div>
              <div className="font-medium">Added to cart!</div>
              <div className="text-sm opacity-90">{productName}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Cart Empty State Animation
export const CartEmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-6"
      >
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Your cart is empty
      </h3>
      <p className="text-gray-500 mb-6">
        Add some beautiful antiques to get started
      </p>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button className="bg-primary hover:bg-primary-dark text-white">
          Browse Collection
        </Button>
      </motion.div>
    </motion.div>
  );
};