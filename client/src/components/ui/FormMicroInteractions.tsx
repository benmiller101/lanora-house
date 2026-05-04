import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Animated Input with Validation States
export const AnimatedInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
}> = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  label, 
  error, 
  success = false, 
  required = false,
  disabled = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          className={`block text-sm font-medium transition-colors ${
            error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-700'
          }`}
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        <motion.div
          animate={{
            scale: isFocused ? 1.01 : 1,
            borderColor: error ? '#ef4444' : success ? '#10b981' : isFocused ? '#3b82f6' : '#d1d5db'
          }}
          transition={{ duration: 0.2 }}
        >
          <Input
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={`pr-10 transition-all duration-200 ${
              error ? 'border-red-500 focus:border-red-500' : 
              success ? 'border-green-500 focus:border-green-500' : 
              'focus:border-blue-500'
            }`}
          />
        </motion.div>

        {/* Status Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="text-red-500"
              >
                <X className="w-4 h-4" />
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="text-green-500"
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Animated Submit Button with States
export const AnimatedSubmitButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  success?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({ 
  children, 
  onClick, 
  isLoading = false, 
  success = false, 
  error = false, 
  disabled = false,
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

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        ${sizes[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${error ? 'bg-red-500 hover:bg-red-600 text-white' : 
          showSuccess ? 'bg-green-500 text-white' :
          'bg-primary hover:bg-primary-dark text-white'}
      `}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      animate={showSuccess ? { scale: [1, 1.05, 1] } : {}}
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
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Processing...</span>
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
              <Check className="w-5 h-5" />
            </motion.div>
            <span>Success!</span>
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

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={showSuccess ? { scale: 3, opacity: [0, 0.5, 0] } : {}}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

// Form Validation Progress
export const FormValidationProgress: React.FC<{
  fields: Array<{ name: string; isValid: boolean; isRequired: boolean }>;
}> = ({ fields }) => {
  const requiredFields = fields.filter(field => field.isRequired);
  const validFields = requiredFields.filter(field => field.isValid);
  const progress = (validFields.length / requiredFields.length) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Form Progress</span>
        <span className="text-sm text-gray-500">{validFields.length}/{requiredFields.length}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {requiredFields.map((field, index) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-2 ${
              field.isValid ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <motion.div
              animate={field.isValid ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {field.isValid ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-current" />
              )}
            </motion.div>
            <span className="capitalize">{field.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Success/Error Toast Notification
export const FormToast: React.FC<{
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}> = ({ show, type, message, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const variants = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white", 
    info: "bg-blue-500 text-white"
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 ${variants[type]} px-6 py-4 rounded-lg shadow-lg max-w-md`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              {icons[type]}
            </motion.div>
            <div>
              <div className="font-medium">{message}</div>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};