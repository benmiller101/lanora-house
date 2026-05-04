import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, Bookmark, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Floating Action Button with Pulse Effect
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  variant?: "default" | "wishlist" | "cart" | "share";
  disabled?: boolean;
}> = ({ icon, onClick, isActive = false, variant = "default", disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    default: "bg-white/90 text-gray-700 hover:bg-white hover:text-primary",
    wishlist: isActive ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500",
    cart: "bg-primary text-white hover:bg-primary-dark",
    share: "bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-500"
  };

  return (
    <motion.button
      className={`
        relative p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200
        ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={isActive && variant === "wishlist" ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        animate={isPressed ? { scale: 0.8 } : { scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        {icon}
      </motion.div>
      
      {/* Ripple effect */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white/30"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      
      {/* Pulse effect for active wishlist */}
      {isActive && variant === "wishlist" && (
        <motion.div
          className="absolute inset-0 rounded-full bg-red-500/20"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

// Animated Badge Component
export const AnimatedBadge: React.FC<{
  children: React.ReactNode;
  variant?: "featured" | "sale" | "new" | "bestseller" | "authentic" | "vintage";
  className?: string;
}> = ({ children, variant = "featured", className = "" }) => {
  const variants = {
    featured: "bg-secondary text-white",
    sale: "bg-red-500 text-white",
    new: "bg-green-500 text-white",
    bestseller: "bg-primary text-white",
    authentic: "bg-blue-600 text-white",
    vintage: "bg-purple-600 text-white"
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -12 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
    >
      <Badge className={`${variants[variant]} shadow-lg`}>
        {children}
      </Badge>
    </motion.div>
  );
};

// Availability Indicator (for unique items)
export const AvailabilityIndicator: React.FC<{
  isAvailable: boolean;
  isReserved?: boolean;
}> = ({ isAvailable, isReserved = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2"
    >
      <motion.div
        className={`w-3 h-3 rounded-full ${
          !isAvailable ? 'bg-red-500' : 
          isReserved ? 'bg-orange-500' : 
          'bg-green-500'
        }`}
        animate={isAvailable && !isReserved ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className={`text-sm font-medium ${
        !isAvailable ? 'text-red-600' : 
        isReserved ? 'text-orange-600' : 
        'text-green-600'
      }`}>
        {!isAvailable ? 'Sold' : 
         isReserved ? 'Reserved' : 
         'Available'}
      </span>
    </motion.div>
  );
};

// Price Animation Component
export const AnimatedPrice: React.FC<{
  currentPrice: number;
  originalPrice?: number;
  currency?: string;
}> = ({ currentPrice, originalPrice, currency = "£" }) => {
  const isOnSale = originalPrice && originalPrice > currentPrice;
  const discount = isOnSale ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <motion.div
          className="text-2xl font-bold text-primary"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {currency}{currentPrice.toFixed(2)}
        </motion.div>
        
        {isOnSale && (
          <motion.div
            className="text-lg text-gray-500 line-through"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {currency}{originalPrice.toFixed(2)}
          </motion.div>
        )}
      </div>
      
      {isOnSale && (
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="inline-block"
        >
          <Badge className="bg-red-500 text-white">
            Save {discount}%
          </Badge>
        </motion.div>
      )}
    </div>
  );
};

// Interactive Rating Display
export const InteractiveRating: React.FC<{
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  interactive?: boolean;
}> = ({ rating, maxRating = 5, reviewCount, interactive = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartial = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <motion.button
              key={index}
              className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
              onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
              onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
              whileHover={interactive ? { scale: 1.2 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
              transition={{ duration: 0.1 }}
            >
              <Star
                className={`w-5 h-5 transition-colors duration-200 ${
                  isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
              {isPartial && (
                <Star
                  className="w-5 h-5 text-yellow-400 fill-yellow-400 absolute top-0 left-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - (displayRating % 1) * 100}% 0 0)` }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {reviewCount !== undefined && (
        <motion.span
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </motion.span>
      )}
    </div>
  );
};

// Loading Button with States
export const LoadingButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  success?: boolean;
  disabled?: boolean;
  variant?: "default" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}> = ({ 
  children, 
  onClick, 
  isLoading = false, 
  success = false, 
  disabled = false,
  variant = "primary",
  size = "md"
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const variants = {
    default: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-secondary-dark"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        ${variants[variant]} ${sizes[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Loading...</span>
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            >
              ✓
            </motion.div>
            <span>Added!</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};