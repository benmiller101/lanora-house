import { motion } from "framer-motion";
import { Check, Package, Truck, MapPin, Clock, X } from "lucide-react";

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

interface OrderStatusTimelineProps {
  currentStatus: string;
  orderDate: string;
  estimatedDelivery?: string;
}

export function OrderStatusTimeline({ currentStatus, orderDate, estimatedDelivery }: OrderStatusTimelineProps) {
  const getTimelineSteps = (status: string): TimelineStep[] => {
    // Handle cancelled orders with a special timeline
    if (status === 'cancelled') {
      return [
        {
          id: 'placed',
          title: 'Order Placed',
          description: 'Your order was received and confirmed',
          icon: Check,
          status: 'completed',
          timestamp: orderDate
        },
        {
          id: 'cancelled',
          title: 'Order Cancelled',
          description: 'This order has been cancelled',
          icon: X,
          status: 'current'
        }
      ];
    }

    const steps: TimelineStep[] = [
      {
        id: 'placed',
        title: 'Order Placed',
        description: 'Your order has been received and confirmed',
        icon: Check,
        status: 'completed',
        timestamp: orderDate
      },
      {
        id: 'processing',
        title: 'Processing',
        description: 'We are preparing your items for shipment',
        icon: Package,
        status: status === 'pending' || status === 'paid' ? 'current' : status === 'processing' || status === 'shipped' || status === 'delivered' ? 'completed' : 'pending'
      },
      {
        id: 'shipped',
        title: 'Shipped',
        description: 'Your order is on its way to you',
        icon: Truck,
        status: status === 'processing' ? 'current' : status === 'shipped' || status === 'delivered' ? 'completed' : 'pending'
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered successfully',
        icon: MapPin,
        status: status === 'shipped' ? 'current' : status === 'delivered' ? 'completed' : 'pending'
      }
    ];

    return steps;
  };

  const steps = getTimelineSteps(currentStatus);
  const currentStepIndex = steps.findIndex(step => step.status === 'current');
  
  let progressPercentage = 25;
  if (currentStatus === 'cancelled') {
    progressPercentage = 50; // Show partial progress for cancelled orders
  } else if (currentStepIndex >= 0) {
    progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  } else if (currentStatus === 'delivered') {
    progressPercentage = 100;
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
        {estimatedDelivery && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            Est. delivery: {new Date(estimatedDelivery).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Order Progress</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          
          return (
            <motion.div
              key={step.id}
              className="relative flex items-start mb-8 last:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <motion.div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.3 }}
                >
                  {step.status === 'current' && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <IconComponent className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    step.status === 'completed' || step.status === 'current'
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  {step.timestamp && (
                    <span className="text-sm text-gray-500">
                      {new Date(step.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${
                  step.status === 'completed' || step.status === 'current'
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
                
                {/* Animated status indicators */}
                {step.status === 'current' && (
                  <motion.div
                    className="flex items-center mt-2 text-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                  >
                    <motion.div
                      className="w-2 h-2 bg-blue-600 rounded-full mr-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium">In Progress</span>
                  </motion.div>
                )}
                
                {step.status === 'completed' && (
                  <motion.div
                    className="flex items-center mt-2 text-green-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Completed</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      {currentStatus === 'shipped' && (
        <motion.div
          className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center">
            <Truck className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Your order is on the way!</p>
              <p className="text-sm text-blue-700">Track your package for real-time updates.</p>
            </div>
          </div>
        </motion.div>
      )}

      {currentStatus === 'delivered' && (
        <motion.div
          className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Order delivered successfully!</p>
              <p className="text-sm text-green-700">Thank you for your purchase. We hope you love your items!</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}