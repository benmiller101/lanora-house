import { motion } from "framer-motion";
import { Leaf, Recycle, TreePine, Wind } from "lucide-react";

interface SustainableLoaderProps {
  variant?: "leaf" | "recycle" | "tree" | "wind" | "grow";
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function SustainableLoader({ 
  variant = "leaf", 
  size = "md", 
  message,
  className = "" 
}: SustainableLoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const containerSizes = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24"
  };

  // Leaf falling animation
  const LeafLoader = () => (
    <div className={`relative ${containerSizes[size]} ${className}`}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 left-1/2"
          animate={{
            y: [0, 60, 0],
            x: [0, Math.sin(i) * 20, 0],
            rotate: [0, 360],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Leaf className={`${sizeClasses[size]} text-green-600`} />
        </motion.div>
      ))}
    </div>
  );

  // Recycle spinning animation
  const RecycleLoader = () => (
    <motion.div
      className={`${sizeClasses[size]} text-blue-600 ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Recycle className="w-full h-full" />
    </motion.div>
  );

  // Tree growing animation
  const TreeLoader = () => (
    <motion.div
      className={`${sizeClasses[size]} text-green-700 ${className}`}
      animate={{
        scale: [0.8, 1.2, 0.8],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <TreePine className="w-full h-full" />
    </motion.div>
  );

  // Wind flowing animation
  const WindLoader = () => (
    <motion.div
      className={`${sizeClasses[size]} text-blue-500 ${className}`}
      animate={{
        x: [-10, 10, -10],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Wind className="w-full h-full" />
    </motion.div>
  );

  // Growing dots animation
  const GrowLoader = () => (
    <div className={`flex space-x-2 ${className}`}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-green-600 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            backgroundColor: ["#16a34a", "#22c55e", "#16a34a"]
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "leaf":
        return <LeafLoader />;
      case "recycle":
        return <RecycleLoader />;
      case "tree":
        return <TreeLoader />;
      case "wind":
        return <WindLoader />;
      case "grow":
        return <GrowLoader />;
      default:
        return <LeafLoader />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {message && (
        <motion.p
          className="text-sm text-gray-600 text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// Page-level loading component
export function PageLoader({ message = "Loading sustainably..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <SustainableLoader variant="leaf" size="lg" />
        <motion.h2
          className="text-xl font-semibold text-gray-800 mt-6 mb-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.h2>
        <p className="text-gray-600">Growing something beautiful...</p>
      </div>
    </div>
  );
}

// Button loading state
export function ButtonLoader({ variant = "grow", size = "sm" }: Pick<SustainableLoaderProps, "variant" | "size">) {
  return <SustainableLoader variant={variant} size={size} />;
}

// Card skeleton with sustainable theme
export function SustainableCardSkeleton() {
  return (
    <motion.div
      className="p-6 border rounded-lg bg-white shadow-sm"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="space-y-4">
        <motion.div
          className="h-4 bg-green-200 rounded w-3/4"
          animate={{ width: ["75%", "85%", "75%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="h-3 bg-green-100 rounded w-1/2"
          animate={{ width: ["50%", "60%", "50%"] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="h-3 bg-green-100 rounded w-2/3"
          animate={{ width: ["66%", "76%", "66%"] }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}