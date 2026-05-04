import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface TransitionWrapperProps {
  children: ReactNode;
  variant?: "fadeIn" | "slideUp" | "grow" | "leaf" | "sustainable";
  className?: string;
  delay?: number;
}

export function TransitionWrapper({ 
  children, 
  variant = "fadeIn", 
  className = "",
  delay = 0 
}: TransitionWrapperProps) {
  const variants = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.6, delay }
    },
    slideUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 },
      transition: { duration: 0.6, delay, ease: "easeOut" }
    },
    grow: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { duration: 0.6, delay, ease: "easeOut" }
    },
    leaf: {
      initial: { opacity: 0, y: -20, rotate: -10 },
      animate: { opacity: 1, y: 0, rotate: 0 },
      exit: { opacity: 0, y: 20, rotate: 10 },
      transition: { duration: 0.8, delay, ease: "easeOut" }
    },
    sustainable: {
      initial: { opacity: 0, scale: 0.9, y: 20 },
      animate: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: {
          duration: 0.8,
          delay,
          ease: "easeOut"
        }
      },
      exit: { 
        opacity: 0, 
        scale: 0.9, 
        y: -20,
        transition: {
          duration: 0.4,
          ease: "easeIn"
        }
      }
    }
  };

  const selectedVariant = variants[variant];

  return (
    <motion.div
      className={className}
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={selectedVariant.transition}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered children animation
export function StaggeredContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: { 
  children: ReactNode; 
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ 
  children, 
  className = "",
  variant = "sustainable"
}: { 
  children: ReactNode; 
  className?: string;
  variant?: "sustainable" | "fadeUp" | "grow";
}) {
  const itemVariants = {
    sustainable: {
      hidden: { opacity: 0, y: 20, scale: 0.9 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.6,
          ease: "easeOut"
        }
      }
    },
    fadeUp: {
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      }
    },
    grow: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={itemVariants[variant]}
    >
      {children}
    </motion.div>
  );
}